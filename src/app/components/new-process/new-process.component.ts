import { SocketProvider } from './../../services/socket.service';
import { Component, OnInit } from '@angular/core';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/components/common/selectitem';
import { FormBuilder } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MenuItem } from 'primeng/components/common/menuitem';
import { RapidflowService } from '../../services/rapidflow.service';
@Component({
  selector: 'app-new-process',
  templateUrl: './new-process.component.html',
  styleUrls: ['./new-process.component.css']
})
export class NewProcessComponent implements OnInit {
  allProcessesModel: any[];
  items: MenuItem[];
  msgs: any[] = [];
  text: string;
  organizations: any = [];
  processGeneralSettings: FormGroup;
  processFormGroup: FormGroup;
  DefaultRoles: FormGroup;
  submitted: boolean;
  uploadedFiles: any[] = [];
  selectedImage: string = "";
  Organization: SelectItem[];
  genders: SelectItem[];
  description: string;
  selectedCategories: string[] = ['WorkflowApproverAndVisiters', 'WorkflowControllers', 'WorkflowCreators'];
  activeIndex: number = 1;
  selectedFileString: string = "";
  allOrganizationsAndProcesses: any = [];
  selectedProcessForImport: number;
  newProcessImportConfigurationData: any = [];
  imageDimensions: any = {
    width: 0,
    height: 0
  }
  defaultPermissionsForProcess = {
    UserEmail: 'rfngtstuser1@gmail.com',
    ProcessAdminRoleID: 1,
    ProcessOwnerRoleID: 2
  }
  showLoading: boolean = false;
  constructor(private fb: FormBuilder, private rapidflowService: RapidflowService, private socket: SocketProvider) { }

  ngOnInit() {


    this.retrieveAndFillProcessesDropDown();
    this.setProcessFormGroup();

  }
  onSubmit(value: string) {

  }
  onImageSelect(image) {
    let imageFile = image.files[0];
    let imageReader = new FileReader();
    imageReader.onload = (e: any) => {
      this.selectedImage = e.target.result;
      let img = new Image;
      img.onload = () => {
        this.imageDimensions.width = img.width;
        this.imageDimensions.height = img.height;
        this.selectedFileString = imageFile.name + " (" + this.imageDimensions.width + "x" + this.imageDimensions.height + ")"

      };
      img.src = e.target.result;

    }
    imageReader.readAsDataURL(imageFile);

    let img = new Image;
    img.onload = function () {
      console.log("The width of the image is " + img.width + "px.");
    };
    img.src = imageReader.result;
  }
  retrieveAndFillProcessesDropDown() {
    this.showLoading = true;
    this.rapidflowService.retrieveDeveloperProcesses().subscribe((response) => {
      this.allOrganizationsAndProcesses = JSON.parse(response.json()).Processes;
      this.generateAllProcessesGroupedByOrganizationModel();
      this.setOrganizationsDropDownValues();
      this.selectedProcessForImport = this.allProcessesModel[0].items[0].value;
      this.getSelectedProcessForImport();
      this.showLoading = false;
    });

  }
  setOrganizationsDropDownValues() {
    let orgFlags = [];
    for (let i = 0; i < this.allOrganizationsAndProcesses.length; i++) {
      if (orgFlags.indexOf(this.allOrganizationsAndProcesses[i].OrganizationID) == -1) {
        let organizationObject = { label: this.allOrganizationsAndProcesses[i].OrganizationName, value: this.allOrganizationsAndProcesses[i].OrganizationID };
        this.organizations.push(organizationObject);
        orgFlags.push(this.allOrganizationsAndProcesses[i].OrganizationID)
      }
    }
    if (this.organizations[0] != undefined) {
      this.processFormGroup.patchValue({
        'Organization': this.organizations[0].value

      });
    }

  }

  generateAllProcessesGroupedByOrganizationModel() {
    let orgFlags = [];
    let allProcesses = [];
    for (let i = 0; i < this.allOrganizationsAndProcesses.length; i++) {
      if (orgFlags.indexOf(this.allOrganizationsAndProcesses[i].OrganizationID) == -1) {
        let organizationGroup = { label: this.allOrganizationsAndProcesses[i].OrganizationName, value: this.allOrganizationsAndProcesses[i].OrganizationID, items: [] };
        orgFlags.push(this.allOrganizationsAndProcesses[i].OrganizationID)
        for (let j = 0; j < this.allOrganizationsAndProcesses.length; j++) {
          if (this.allOrganizationsAndProcesses[i].OrganizationID == this.allOrganizationsAndProcesses[j].OrganizationID) {
            let processObject = { label: this.allOrganizationsAndProcesses[j].ProcessReference, value: this.allOrganizationsAndProcesses[j].ProcessID };
            organizationGroup.items.push(processObject);
          }
        }
        if (organizationGroup.items.length > 0) {
          allProcesses.push(organizationGroup);
        }

      }
    }

    this.allProcessesModel = allProcesses;


  }

  removeImage() {
    this.selectedFileString = "";
    this.selectedImage = "";
  }
  get diagnostic() { return JSON.stringify(this.processGeneralSettings.value); }

  getProcessItemValue(itemName) {
    for (let i = 0; i < this.newProcessImportConfigurationData.length; i++) {
      if (this.newProcessImportConfigurationData[i].Item == itemName) {
        return this.newProcessImportConfigurationData[i].Value
      }
    }
  }

  fillFormWithSelectedProcess() {
    this.processFormGroup.patchValue({
      'GlobalSettingsJSON': this.getProcessItemValue("GlobalSettingsJSON"),
      'ProcessImage': this.getProcessItemValue("ProcessImage"),
      'Organization': parseInt(this.getProcessItemValue("Organization"))

    });
    this.selectedImage = this.newProcessImportConfigurationData[1].Value
    let img = new Image;
    img.onload = () => {
      this.imageDimensions.width = img.width;
      this.imageDimensions.height = img.height;
      this.selectedFileString = this.newProcessImportConfigurationData[2].Value + " Icon Image (" + this.imageDimensions.width + "x" + this.imageDimensions.height + ")"

    };
    img.src = this.selectedImage;
  }

  setProcessFormGroup() {
    this.processFormGroup = this.fb.group({
      'Organization': new FormControl('', Validators.required),
      'Name': new FormControl('', Validators.required),
      'ProcessReference': new FormControl('', Validators.required),
      'ProcessImage': new FormControl('', Validators.required),
      'GlobalSettingsJSON': new FormControl('', Validators.required)

    });
  }


  getSelectedProcessForImport() {
    if (this.selectedProcessForImport != undefined) {
      this.showLoading = true;
      this.rapidflowService.retrieveConfigurationData("Process", this.selectedProcessForImport).subscribe((response) => {
        //set dropdown model for workflows
        this.newProcessImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
        this.showLoading = false;

      });
    }
  }

  addNewProcess() {
    if (this.imageDimensions.width != 50 || this.imageDimensions.width != 50) {
      alert("Image dimensions should be 50x50")
      return;
    }

    let currentSettingParsed = "GlobalSettingsJSON";

    try {

      JSON.parse(this.processFormGroup["_value"].GlobalSettingsJSON)


    }
    catch (ex) {
      alert(currentSettingParsed + " not valid json.\n" + ex.message);
      return;
    }
    let currentLoggedInUser = JSON.parse(window.localStorage["User"]);

    let newWorkflowValue = {
      ProcessReference: this.processFormGroup["_value"].ProcessReference,
      OrganizationID: this.processFormGroup["_value"].Organization.toString(),
      Name: this.processFormGroup["_value"].Name,
      Description: "",
      GlobalSettingsJSON: this.processFormGroup["_value"].GlobalSettingsJSON,
      ProcessImageID: "0",
      ObjectDescription: '{"Type":"ProcessImage"}',
      Value: this.processFormGroup["_value"].ProcessImage,
      OrganizationName: this.getSelectedOrganizationName(this.processFormGroup["_value"].Organization)

    }
    let settingObject: any = {
      userToken: currentLoggedInUser.AuthenticationToken.toString(),
      itemType: "Process",
      objectIdentity: "0",
      value: JSON.stringify(newWorkflowValue),
      operationType: 'DEV'
    };
    if (confirm("Are you sure you want to continue?")) {


      this.showLoading = true;
      let addNewWorkflowResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
      addNewWorkflowResult.then((result) => {

        if (result.Error != undefined) {
          alert(result.Error)
        }
        else if (result.Response == "true") {
          this.rapidflowService.editGroupsAndUsersInRole(result.ObjectIdentity, this.defaultPermissionsForProcess.ProcessAdminRoleID, this.defaultPermissionsForProcess.UserEmail, "", "", "").subscribe((response) => {
          }, (error) => {
            alert("Error while adding process admin. Please check console for error");
            console.log(error);
          }
          );
          this.rapidflowService.editGroupsAndUsersInRole(result.ObjectIdentity, this.defaultPermissionsForProcess.ProcessOwnerRoleID, this.defaultPermissionsForProcess.UserEmail, "", "", "").subscribe((response) => {
          }, (error) => {
            alert("Error while adding process owner. Please check console for error");
            console.log(error);
          });
          this.retrieveAndFillProcessesDropDown();

          this.showLoading = false;
          alert("Process added successfully");


        }
        else {
          alert("Error while adding process. Please check console for error");
        }






      }).catch((error) => {
        alert("Error while adding process. Please check console for error");
        console.log(error)
        this.showLoading = false;
      })
    }


    console.log(this);
  }

  getSelectedOrganizationName(selectedOrganizationID) {
    for (let i = 0; i < this.organizations.length; i++) {
      if (this.organizations[i].value == selectedOrganizationID) {
        return this.organizations[i].label;
      }
    }
    return '';
  }

}

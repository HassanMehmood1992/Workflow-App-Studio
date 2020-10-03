import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edit-workflows',
  templateUrl: './edit-workflows.component.html',
  styleUrls: ['./edit-workflows.component.css']
})
export class EditWorkflowsComponent implements OnInit {
  selectedProcess: number;
  selectedWorkflow: number;
  currentSettingVal: any;
  selectedSetting: any;
  processWorklowsConfigrationData: any=[];
  selectedSettingName: string;
  showWorkflowDisplay: boolean = false;
  newVersion: FormGroup;
  selectedVersion:number=1;
  currentLoggedInUser: any;
  allProcesses: any;
  showLoading: boolean = false;
  versions:any=[];
  itemToAdd:string="Workflow";
  @Output() loadingOutput = new EventEmitter();
  @Output() configValue = new EventEmitter();
  loadSubscription:any;

  @Input('selectedProcessInput')
  set selectedProcessInput(value: number) {
    if (value == undefined) {
      return;
    }
    
    if(this.loadSubscription!=undefined)
    {
      this.loadSubscription.unsubscribe();
    }
    this.currentSettingVal="";
    this.selectedProcess = value;
    
    this.loadWorkflowsForSelectedProcess();




  }
  settingTypes: any = [
    {
      Name: "FormHTML",
      Type: "text"
    },
    {
      Name: "FormController",
      Type: "text"
    },
    {
      Name: "WorkflowTasksJSON",
      Type: "json"
    },
    {
      Name: "DefaultValuesJSON",
      Type: "json"
    },
    {
      Name: "RepeatingTableJSON",
      Type: "json"
    },
    {
      Name: "WorkflowSettingsJSON",
      Type: "json"
    },
    {
      Name: "PdfCss",
      Type: "text"
    }


  ]
  workflows: any = [];
  configurationItems: any;
 
  constructor(private formBuilder: FormBuilder, private rapidflowService: RapidflowService, private socket: SocketProvider) {

    this.configurationItems = [
      { label: 'FormHTML', value: 'FormHTML' },
      { label: 'FormLogic', value: 'FormController' },
      { label: 'WorkflowTasksJSON', value: 'WorkflowTasksJSON' },
      { label: 'FormFieldOptionsJSON', value: 'DefaultValuesJSON' },
      { label: 'RepeatingTableJSON', value: 'RepeatingTableJSON' },
      { label: 'WorkflowSettingsJSON', value: 'WorkflowSettingsJSON' },
      { label: 'PdfCss', value: 'PdfCss' }
    ];
    this.versions = [
      { label: '1', value: '1' }
    ];
  }


  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.selectedSetting = this.settingTypes[0];
    this.setNewWorkflowFormGroup();
  }

  getVersionsForWorkflow(){
    this.versions=[];
    for(let i=0;i<this.processWorklowsConfigrationData.length;i++)
    {
      if(this.processWorklowsConfigrationData[i].WorkflowID==this.selectedWorkflow)
      {
        this.versions.push({
          label:this.processWorklowsConfigrationData[i].Version,
          value:this.processWorklowsConfigrationData[i].Version,
        });
      }
    }
    if(this.versions.length>0)
    {
      this.selectedVersion=this.versions[0].value;
    }
    this.getSelectedSettings();
  }

  loadWorkflowsForSelectedProcess() {
    this.selectedSetting = this.settingTypes[0];
    this.selectedSettingName = this.selectedSetting.Name;
    this.workflows = [];
    this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
    this.loadingOutput.emit({ name: "Workflows", val: true })

   this.loadSubscription=this.rapidflowService.retrieveConfigurationData("ProcessWorkflow", this.selectedProcess).subscribe((response) => {
      this.processWorklowsConfigrationData = JSON.parse(response.json()).ConfigurationData;
      this.loadingOutput.emit({ name: "Workflows", val: false })
      this.configValue.emit({
        name: "Workflows",
        val: this.processWorklowsConfigrationData
      });
      let workflowsAdded=[];
      for (let i = 0; i < this.processWorklowsConfigrationData.length; i++) {
        if(workflowsAdded.indexOf(this.processWorklowsConfigrationData[i].WorkflowID)==-1)
        {
          let workflowObject: any = {};
          workflowObject.label = this.processWorklowsConfigrationData[i].WorkflowName;
          workflowObject.value = this.processWorklowsConfigrationData[i].WorkflowID;
          this.workflows.push(workflowObject);
          workflowsAdded.push(this.processWorklowsConfigrationData[i].WorkflowID);
        }
        
      }
      this.selectedWorkflow = this.workflows[0].value;
      this.getVersionsForWorkflow();
    },
      (error) => {
        console.log(error);
      }
    );

  }

  getSelectedSettings() {
    let currentSelectedWorkflowData: any = {};
    for (let i = 0; i < this.processWorklowsConfigrationData.length; i++) {
      if (this.processWorklowsConfigrationData[i].WorkflowID == this.selectedWorkflow&&this.processWorklowsConfigrationData[i].Version == this.selectedVersion) {
        currentSelectedWorkflowData = this.processWorklowsConfigrationData[i];
        break;
      }
    }
    if (this.selectedSettingName == "FormHTML") {
      this.currentSettingVal = decodeURI(currentSelectedWorkflowData[this.selectedSettingName]);
    }
    else if (this.selectedSettingName == "FormController") {
      this.currentSettingVal = decodeURIComponent(currentSelectedWorkflowData[this.selectedSettingName]);

    }
    else {
      this.currentSettingVal = currentSelectedWorkflowData[this.selectedSettingName]
    }
    for (let i = 0; i < this.settingTypes.length; i++) {
      if (this.settingTypes[i].Name == this.selectedSettingName) {
        this.selectedSetting = this.settingTypes[i];
        break;
      }
    }

  }


  applySettings() {

    let itemIDJSON:any={};
    itemIDJSON.WorkflowID=this.selectedWorkflow.toString();
    itemIDJSON.Version=this.selectedVersion.toString();
    let tempSettingsVal = this.currentSettingVal.replace(/'/g, "''");
    let settingsJson: any = {};
    let settingObject: any = {
      userToken: this.currentLoggedInUser.AuthenticationToken,
      itemType: "ProcessWorkflow",
      itemId: JSON.stringify(itemIDJSON),
      settingsJson: "",
      operationType: 'DEV'
    };
    if (this.selectedSetting.Type == "json") {
      try {

        if (confirm("Are you sure you want to apply this settings?")) {

          settingsJson[this.selectedSettingName] = JSON.stringify(JSON.parse(tempSettingsVal));
          settingObject.settingsJson = JSON.stringify(settingsJson);
 
          let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
          this.showLoading = true;
          updateSettingsResult.then((result) => {
            

            if (result.Result == "Success") {
              alert("Setting Update Successfully!");
            }
            else {
              alert("Error while updating. Please check console for error");

            }
            console.log(result);
            this.showLoading = false;

          }).catch((error) => {
            alert("Error while updating. Please check console for error");
            this.showLoading = false
          })
        }
      }
      catch (ex) {
        alert("JSON not valid!\nError: " + ex.message)
        this.showLoading = false;
      }
    }
    else {

      if (confirm("Are you sure you want to apply this settings?")) {
        if (this.selectedSettingName == "FormHTML") {
          settingsJson[this.selectedSettingName] = encodeURI(tempSettingsVal);

        }

        else if (this.selectedSettingName == "FormController") {
          settingsJson[this.selectedSettingName] = encodeURIComponent(tempSettingsVal);
        }
        else if (this.selectedSettingName == "PdfCss") {
          settingsJson[this.selectedSettingName] = tempSettingsVal;
        }

        settingObject.settingsJson = JSON.stringify(settingsJson);
        this.showLoading = true;
        let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
        updateSettingsResult.then((result: any) => {
          if (result.Result == "Success") {
            alert("Setting Update Successfully!");
          }
          else {
            alert("Error while updating. Please check console for error");

          }
          console.log(result)
          this.showLoading = false;
        }).catch((error) => {
          alert("Error while updating. Please check console for error");
          console.log(error);
          this.showLoading = false;
        })
      }



    }
  }

  showNewWorkflowDialog() {
    this.itemToAdd="Workflow";
    this.versionUpdate=false;
    this.setNewWorkflowFormGroup();
    this.showWorkflowDisplay = true;
  }

  showNewVersionDialog() {
    this.itemToAdd="Version";
    this.versionUpdate=true;
    this.setNewWorkflowFormGroup();
    this.preFillNewVersionForm();
    this.showWorkflowDisplay = true;
  }

  //----------------------------------------------------------------------------->all add new workflow related functions and properties start here
  newWorkflowFormGroup: FormGroup;
  selectedProcessForNewWorkflow: number;
  newWorkflowImportConfigurationData: any = [];
  allWorkflowsOfProcessForImport: any = [];
  selectedWorkflowForImport: number;
  versionUpdate:boolean=false;

  setNewWorkflowFormGroup() {
    if(!this.versionUpdate)
    {
      this.newWorkflowFormGroup = this.formBuilder.group({
        'WorkflowSettingsJSON': new FormControl('', Validators.required),
        'FormHTML': new FormControl('', Validators.required),
        'FormController': new FormControl('', Validators.required),
        'WorkflowTasksJSON': new FormControl('', Validators.required),
        'DefaultValuesJSON': new FormControl('', Validators.required),
        'RepeatingTableJSON': new FormControl('', Validators.required),
        'PdfCss': new FormControl('', Validators.required)
      });
    }
    else{

      this.newVersion = this.formBuilder.group({
        'FormHTML': new FormControl('', Validators.required),
        'FormController': new FormControl('', Validators.required),
        'WokrlfowTasksJSON': new FormControl('', Validators.required),
        'DefaultValuesJSON': new FormControl('', Validators.required),
        'RepeatingTableJSON': new FormControl('', Validators.required),
        'PdfCss': new FormControl('', Validators.required)
  
      });
    }
   

  }
  getSelectedProcessForImportWorkflowData() {
    if (this.selectedProcessForNewWorkflow != undefined) {
      this.showLoading = true;
      this.rapidflowService.retrieveConfigurationData("ProcessWorkflow", this.selectedProcessForNewWorkflow).subscribe((response) => {
        //set dropdown model for workflows
        this.showLoading = false;
        this.newWorkflowImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
        this.allWorkflowsOfProcessForImport = [];
        for (let i = 0; i < this.newWorkflowImportConfigurationData.length; i++) {
          this.allWorkflowsOfProcessForImport.push(
            {
              label: this.newWorkflowImportConfigurationData[i].WorkflowName,
              value: this.newWorkflowImportConfigurationData[i].WorkflowID
            }
          );
        }
        if (this.allWorkflowsOfProcessForImport[0] != undefined) {
          this.selectedWorkflowForImport = this.allWorkflowsOfProcessForImport[0].value;
        }




      });
    }
  }
  fillNewWorkflowForm() {
    let selectedWorkflowImport: any = {}
    for (let i = 0; i < this.newWorkflowImportConfigurationData.length; i++) {
      if (this.newWorkflowImportConfigurationData[i].WorkflowID == this.selectedWorkflowForImport) {
        selectedWorkflowImport = this.newWorkflowImportConfigurationData[i];
        break;
      }
    }
    this.newWorkflowFormGroup.patchValue({
      'WorkflowSettingsJSON': selectedWorkflowImport["WorkflowSettingsJSON"],
      'FormHTML': decodeURI(selectedWorkflowImport["FormHTML"]),
      'FormController': decodeURIComponent(selectedWorkflowImport["FormController"]),
      'WorkflowTasksJSON': selectedWorkflowImport["WorkflowTasksJSON"],
      'DefaultValuesJSON': selectedWorkflowImport["DefaultValuesJSON"],
      'RepeatingTableJSON': selectedWorkflowImport["RepeatingTableJSON"],
      'PdfCss': selectedWorkflowImport["PdfCss"]
    });
  }

  addNewWorkflowOrVersion() {
    let currentSettingParsed = "WorkflowSettingsJSON";

    try {

      JSON.parse(this.newWorkflowFormGroup["_value"].WorkflowSettingsJSON)

      currentSettingParsed = "DefaultValuesJSON";
      JSON.parse(this.newWorkflowFormGroup["_value"].DefaultValuesJSON)

      currentSettingParsed = "RepeatingTableJSON";
      JSON.parse(this.newWorkflowFormGroup["_value"].RepeatingTableJSON)

      currentSettingParsed = "WorkflowTasksJSON";
      JSON.parse(this.newWorkflowFormGroup["_value"].WorkflowTasksJSON)
    }
    catch (ex) {
      alert(currentSettingParsed + " not valid json.\n" + ex.message);
      return;
    }

    let versionValue=1;
    let objectIdentity="0";
    if(this.versionUpdate)
    {
      versionValue=this.selectedVersion+1;
      objectIdentity=this.selectedWorkflow.toString();
    }
    let newWorkflowValue = {
      ProcessID: this.selectedProcess,
      IconImage: "",
      WorkflowSettingsJSON: this.newWorkflowFormGroup["_value"].WorkflowSettingsJSON,
      Version: versionValue,
      FormHTML: encodeURI(this.newWorkflowFormGroup["_value"].FormHTML),
      FormController: encodeURIComponent(this.newWorkflowFormGroup["_value"].FormController),
      WorkflowTasksJSON: this.newWorkflowFormGroup["_value"].WorkflowTasksJSON,
      DefaultValuesJSON: this.newWorkflowFormGroup["_value"].DefaultValuesJSON,
      RepeatingTableJSON: this.newWorkflowFormGroup["_value"].RepeatingTableJSON,
      LookupJSON: '[]',
      PdfCss: this.newWorkflowFormGroup["_value"].PdfCss,
      AddDefalutNotifications:"true"

    }
    
    let settingObject: any = {
      userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
      itemType: "ProcessWorkflow",
      objectIdentity: objectIdentity,
      value: JSON.stringify(newWorkflowValue),
      operationType: 'DEV'
    };
    if (confirm("Are you sure you want to apply this settings?")) {


      this.showLoading = true;
      let addNewWorkflowResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
      addNewWorkflowResult.then((result) => {
        this.showLoading = false;
        
        if (result.Response == "true") {
          alert("Setting Update Successfully!");
          this.loadWorkflowsForSelectedProcess();
          this.showWorkflowDisplay = false;
        }
        else{
          alert("Error while updating. Please check console for error");
        }
        console.log(result)
        

      }).catch((error) => {
        alert("Error while updating. Please check console for error");
        console.log(error)
        this.showLoading = false;
      })
    }
  }

  preFillNewVersionForm(){
    let currentSelectedWorkflowData: any = {};
    for (let i = 0; i < this.processWorklowsConfigrationData.length; i++) {
      if (this.processWorklowsConfigrationData[i].WorkflowID == this.selectedWorkflow&&this.processWorklowsConfigrationData[i].Version==this.selectedVersion) {
        currentSelectedWorkflowData = this.processWorklowsConfigrationData[i];
        break;
      }
    }
    this.newWorkflowFormGroup.patchValue({
      'WorkflowSettingsJSON': currentSelectedWorkflowData["WorkflowSettingsJSON"],
      'FormHTML': decodeURI(currentSelectedWorkflowData["FormHTML"]),
      'FormController': decodeURIComponent(currentSelectedWorkflowData["FormController"]),
      'WorkflowTasksJSON': currentSelectedWorkflowData["WorkflowTasksJSON"],
      'DefaultValuesJSON': currentSelectedWorkflowData["DefaultValuesJSON"],
      'RepeatingTableJSON': currentSelectedWorkflowData["RepeatingTableJSON"],
      'PdfCss': currentSelectedWorkflowData["PdfCss"]
    });
  }

  addNewVersion(){

  }

 
}


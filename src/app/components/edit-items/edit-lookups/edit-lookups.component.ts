import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RapidflowService } from '../../../services/rapidflow.service';
import { SocketProvider } from '../../../services/socket.service';

@Component({
  selector: 'app-edit-lookups',
  templateUrl: './edit-lookups.component.html',
  styleUrls: ['./edit-lookups.component.css']
})
export class EditLookupsComponent implements OnInit {
  public currentLoggedInUser: any;
  public selectedProcess: number;
  public processLookupConfigrationData: any;
  public lookups: any;
  public configurationItems: any;
  public selectedLookup: any;
  public showNewLookupSection: boolean;
  public selectedSettingName: string;
  public currentSettingVal: any;
  public selectedSetting: any;
  public importProcess: any;
  public importProcessOptions: any[];
  public importLookup: any;
  public importLookupOptions: any;
  public newLookupFormGroup: FormGroup;
  public selectedProcessForImportLookup: any;
  public showLoading:boolean=false;
  public loadSubscription:any;
  
  @Output() loadingOutput = new EventEmitter();
  @Output() configValue = new EventEmitter();
  
  
  @Input('selectedProcessInput')
  set selectedProcessInput(value: number) {
    if (value == undefined) {
      return;
    }
    if(this.loadSubscription!=undefined)
    {
      this.loadSubscription.unsubscribe();
    }
    this.selectedProcess = value;
    this.getSelectedProcess();
  }

  settingTypes: any = [
    {
      Name: "LookupHTML",
      Type: "text"
    },
    {
      Name: "LookupController",
      Type: "text"
    },
    {
      Name: "LookupDefinition",
      Type: "json"
    }
  ];

  constructor(private formBuilder: FormBuilder, private rapidflowService: RapidflowService, private socket: SocketProvider) {
    this.lookups = [];
    this.importLookupOptions = [];
    this.configurationItems = [
      { label: 'Lookup Definition', value: 'LookupDefinition' },
      { label: 'Lookup HTML', value: 'LookupHTML' },
      { label: 'Lookup Controller', value: 'LookupController' }
    ];
    this.selectedSettingName = this.configurationItems[0]["value"];
    this.showNewLookupSection = false;
  }

  ngOnInit() {
    this.lookups = [];
    this.importLookupOptions = [];
    this.selectedSetting = this.settingTypes[0];
    this.importProcessOptions = JSON.parse(window.localStorage["AllProcesses"]);
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.setNewLookupFormGroup();
  }

  showNewLookupDialog() {
    this.showNewLookupSection = true;
  }

  showSelectedItem() {
    let currentSelectedLookupData: any = {};
    currentSelectedLookupData = this.selectedLookup;

    if (this.selectedSettingName == "LookupHTML") {
      this.currentSettingVal = decodeURIComponent(currentSelectedLookupData["LookupDefinition"][this.selectedSettingName]);
    }
    else if (this.selectedSettingName == "LookupController") {
      this.currentSettingVal = decodeURIComponent(currentSelectedLookupData["LookupDefinition"][this.selectedSettingName]);
    }
    else {
      this.currentSettingVal = JSON.stringify(currentSelectedLookupData["LookupDefinition"][this.selectedSettingName]);
    }

    for (let i = 0; i < this.settingTypes.length; i++) {
      if (this.settingTypes[i].Name == this.selectedSettingName) {
        this.selectedSetting = this.settingTypes[i];
        break;
      }
    }
  }

  updateLookupDetails() {
    let lookupId = this.selectedLookup.LookupId;
    let settingsJson = {};
    try {
      switch (this.selectedSettingName) {
        case "LookupDefinition":
          settingsJson["LookupDefinition"] = this.currentSettingVal.replace(/'/g, "''");
          break;
        case "LookupHTML":
          settingsJson["LookupHTML"] = encodeURIComponent(this.currentSettingVal.replace(/'/g, "''"));
          break;
        case "LookupController":
          settingsJson["LookupController"] = encodeURIComponent(this.currentSettingVal.replace(/'/g, "''"));
          break;
      }
      var params = {
        userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
        itemType: "ProcessLookup",
        operationType: 'DEV',
        itemId: lookupId.toString(),
        settingsJson: JSON.stringify(settingsJson)
      };

      if (confirm("Are you sure you want to apply this settings?")) {
        this.showLoading=true;
        var actionresultAssesment = this.socket.callWebSocketService('updateConfigurationItems', params)
          .then((result) => {
            this.showLoading=false;
            if (result != null) {
              if (result["Result"] != undefined) {
                if (result["Result"].toLowerCase() == "success") {
                  alert("Setting Update Successfully!");
                }
                else {
                  alert("Error while updating. Please check console for error");
                }
                console.log(result);
              }
              else {
                console.log(result);
              }
            }
            else {
              console.log(result);
            }
          }, (error: any) => {
            alert("Error while updating. Please check console for error");
            console.log(error);
          });
      }
    }
    catch (error) {
      alert("Error while updating. Please check console for error");
      this.showLoading=false;
      console.log(error);
    }
  }

  deleteProcessLookup() {
    let obj = {};
    obj["key"] = this.selectedSettingName;
    obj["value"] = this.selectedLookup.LookupDefinition[this.selectedSettingName];
    var params = {
      userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
      processId: this.selectedProcess,
      operationType: 'DEV',
      lookupId: this.selectedLookup.LookupId,
      isDeleted: true
    };
    var actionresultAssesment = this.socket.callWebSocketService('DeleteProcessLookup', params)
      .then((result) => {
        if (result != null) {
        }
      }, (error: any) => {

      });
  }

  getSelectedProcess() {
    this.lookups = [];
    this.loadingOutput.emit({name:"Lookups",val:true})
    
    this.loadSubscription=this.rapidflowService.retrieveConfigurationData("ProcessLookup", this.selectedProcess).subscribe((response) => {
      let responseJSON = JSON.parse(response.json());
      this.loadingOutput.emit({name:"Lookups",val:false})
      this.configValue.emit({
        name: "Lookups",
        val: responseJSON.ConfigurationData
    });
      
      if (responseJSON.AuthenticationStatus == "true") {
        this.processLookupConfigrationData = JSON.parse(response.json()).ConfigurationData;
        for (let i = 0; i < this.processLookupConfigrationData.length; i++) {
          this.processLookupConfigrationData[i]["LookupDefinition"] = JSON.parse(this.processLookupConfigrationData[i]["LookupDefinition"]);
          let obj = {};
          obj["label"] = this.processLookupConfigrationData[i]["LookupDefinition"]["Header"]["LookupTitle"];
          obj["value"] = { LookupId: this.processLookupConfigrationData[i]["LookupID"], LookupDefinition: this.processLookupConfigrationData[i] };
          this.lookups.push(obj);
        }
        this.selectedLookup = this.lookups[0]["value"];
        this.showSelectedItem();
      }
      else {
        alert("Not Authenticated");
      }
    });
  }

  setNewLookupFormGroup() {
    this.newLookupFormGroup = this.formBuilder.group({
      'LookupHeader': new FormControl('', Validators.required),
      'LookupColumns': new FormControl('', Validators.required),
      'LookupHTML': new FormControl('', Validators.required),
      'LookupController': new FormControl('', Validators.required)
    });
  }

  getSelectedProcessDataForImportLookup() {
    this.importLookupOptions = [];
    this.rapidflowService.retrieveConfigurationData("ProcessLookup", this.selectedProcessForImportLookup).subscribe((response) => {
      let responseJSON = JSON.parse(response.json());
      if (responseJSON.AuthenticationStatus == "true") {
        this.processLookupConfigrationData = JSON.parse(response.json()).ConfigurationData;
        for (let i = 0; i < this.processLookupConfigrationData.length; i++) {
          this.processLookupConfigrationData[i]["LookupDefinition"] = JSON.parse(this.processLookupConfigrationData[i]["LookupDefinition"]);
          let obj = {};
          obj["label"] = this.processLookupConfigrationData[i]["LookupDefinition"]["Header"]["LookupTitle"];
          obj["value"] = { LookupId: this.processLookupConfigrationData[i]["LookupID"], LookupDefinition: this.processLookupConfigrationData[i] };
          this.importLookupOptions.push(obj);
        }
        this.selectedLookup = this.lookups[0]["value"];
      }
      else {
        alert("Not Authenticated");
      }
    });
  }

  showImportedItems() {
    this.newLookupFormGroup.patchValue({
      'LookupHeader': JSON.stringify(this.importLookup["LookupDefinition"]["LookupDefinition"]["Header"]),
      'LookupColumns': JSON.stringify(this.importLookup["LookupDefinition"]["LookupDefinition"]["Columns"]),
      'LookupHTML': decodeURIComponent(this.importLookup["LookupDefinition"]["LookupHTML"]),
      'LookupController': decodeURIComponent(this.importLookup["LookupDefinition"]["LookupController"])
    });
  }

  addNewLookup() {
    let lookupDefinition: any = {};
    let currentSettingParsed = "LookupHeader";
    try {
      JSON.parse(this.newLookupFormGroup["_value"].LookupHeader);

      currentSettingParsed = "LookupColumns";
      JSON.parse(this.newLookupFormGroup["_value"].LookupColumns);

      currentSettingParsed = "LookupDefinition";
      lookupDefinition["Header"] = JSON.parse(this.newLookupFormGroup["_value"].LookupHeader);
      lookupDefinition["Columns"] = JSON.parse(this.newLookupFormGroup["_value"].LookupColumns);

      JSON.parse(JSON.stringify(lookupDefinition));
      console.log(lookupDefinition);
    }
    catch (ex) {
      alert(currentSettingParsed + " not valid json.\n" + ex.message);
      return;
    }

    let newLookupValue = {
      ProcessID: this.selectedProcess,
      LookupDefinition: JSON.stringify(lookupDefinition),
      LookupHTML: encodeURIComponent(this.newLookupFormGroup["_value"].LookupHTML),
      LookupController: encodeURIComponent(this.newLookupFormGroup["_value"].LookupController)
    }
    var params = {
      userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
      itemType: "ProcessLookup",
      operationType: 'DEV',
      objectIdentity: "0",
      value: JSON.stringify(newLookupValue)
    };

    if (confirm("Are you sure you want to apply this settings?")) {
      var actionresultAssesment = this.socket.callWebSocketService('addDeveloperProcessObject', params)
        .then((result) => {
          if (result != null) {
            alert("Setting Update Successfully!");
            this.getSelectedProcess();
            this.showNewLookupSection = false;
            console.log(result);
          }
          else {
            console.log(result);
          }
        }, (error: any) => {
          alert("Error while updating. Please check console for error");
          console.log(error);
        });
    }
  }
}

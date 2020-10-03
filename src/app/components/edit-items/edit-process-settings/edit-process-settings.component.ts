import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edit-process-settings',
  templateUrl: './edit-process-settings.component.html',
  styleUrls: ['./edit-process-settings.component.css']
})
export class EditProcessSettingsComponent implements OnInit {

  selectedProcess: number;
  currentSettingVal: any;
  selectedSetting: any;
  processConfigurationData: any;
  selectedSettingName: string;
  showWorkflowDisplay: boolean = false;
  currentLoggedInUser: any;
  showLoading: boolean = false;
  allProcesses: any;
  organizations: any;
  loadSubscription:any;
  @Output() loadingOutput = new EventEmitter();
  @Output() configValue = new EventEmitter();

  @Input('selectedOrganizationInput') selectedOrganization: number;
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
    this.loadConfigDataForSelectedProcess();
    this.organizations = JSON.parse(window.localStorage["Organizations"])



  }
  settingTypes: any = [

    {
      Name: "GlobalSettingsJSON",
      Type: "json"
    },
    {
      Name: "ProcessName",
      Type: "textbox"
    },
    {
      Name: "ProcessReference",
      Type: "textbox"
    },
    {
      Name: "ProcessImage",
      Type: "textarea"
    },
    {
      Name: "Organization",
      Type: "dropdown"
    }


  ]
  configurationItems: any = [
    { label: 'GlobalSettingsJSON', value: 'GlobalSettingsJSON' },
    { label: 'ProcessName', value: 'ProcessName' },
    { label: 'ProcessImage', value: 'ProcessImage' },
    { label: 'Organization', value: 'Organization' },
    { label: 'ProcessReference', value: 'ProcessReference' },

  ];
  versions: any;
  constructor(private rapidflowService: RapidflowService, private socket: SocketProvider) { }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.selectedSetting = this.settingTypes[0];
  }

  loadConfigDataForSelectedProcess() {
    this.loadingOutput.emit({ name: "Settings", val: true })
    this.selectedSetting = this.settingTypes[0];
    this.selectedSettingName = this.selectedSetting.Name;
    this.loadSubscription=this.rapidflowService.retrieveConfigurationData("Process", this.selectedProcess).subscribe((response) => {
      this.processConfigurationData = JSON.parse(response.json()).ConfigurationData;
      this.processConfigurationData.push({
        Item: "Organization",
        ID: this.selectedOrganization,
        Value: this.selectedOrganization
      })
      this.configValue.emit({
        name: "Process",
        val: this.processConfigurationData
      });
      this.loadingOutput.emit({ name: "Settings", val: false })
      this.getSelectedSettings();
    },
      (error) => {
        console.log(error);
      }
    );

  }

  getSelectedSettings() {



    for (let i = 0; i < this.processConfigurationData.length; i++) {
      if (this.processConfigurationData[i].Item == this.selectedSettingName) {
        this.currentSettingVal = this.processConfigurationData[i].Value
        break;
      }
    }


    for (let i = 0; i < this.settingTypes.length; i++) {
      if (this.settingTypes[i].Name == this.selectedSettingName) {
        this.selectedSetting = this.settingTypes[i];
        break;
      }
    }



  }

  applySettings() {
    if(confirm("Are you sure you want to apply these settings?"))
    {
      let settingObject: any;
      let settingValue:any={};
      if (this.selectedSettingName == "Organization") {
        settingValue.OrganizationID=this.currentSettingVal.toString();
        settingObject = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessOrganization",
          itemId: this.selectedProcess.toString(),
          settingsJson: JSON.stringify(settingValue),
          operationType: 'DEV'
        };
      }
      else if (this.selectedSettingName == "ProcessName") {
        settingValue.Name=this.currentSettingVal.toString().replace(/'/g, "''");
        settingObject = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "Process",
          itemId: this.selectedProcess.toString(),
          settingsJson: JSON.stringify(settingValue),
          operationType: 'DEV'
        };
      }
      else if (this.selectedSettingName == "ProcessReference") {
        settingValue.ProcessReference=this.currentSettingVal.toString().replace(/'/g, "''");
        settingObject = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "Process",
          itemId: this.selectedProcess.toString(),
          settingsJson: JSON.stringify(settingValue),
          operationType: 'DEV'
        };
      }
      else if (this.selectedSettingName == "ProcessImage") {
        settingValue.Value=this.currentSettingVal.toString().replace(/'/g, "''");
        
        settingObject = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessObject",
          itemId: this.selectedProcess.toString(),
          settingsJson: JSON.stringify(settingValue),
          operationType: 'DEV'
        };
      }
      else if (this.selectedSettingName == "GlobalSettingsJSON") {
        settingValue.Value=this.currentSettingVal.toString().replace(/'/g, "''");
        
        settingObject = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessGlobalSetting",
          itemId: this.selectedProcess.toString(),
          settingsJson: JSON.stringify(settingValue),
          operationType: 'DEV'
        };
      }
  
      let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
      this.showLoading = true;
  
      updateSettingsResult.then((result) => {
  
  
        if (result.Result == "Success") {
          alert("Setting Update Successfully!");
          if(this.selectedSettingName == "Organization"||this.selectedSettingName == "ProcessReference"){
            window.location.reload();
          }
        }
        else {
          alert("Error while updating. Please check console for error");
  
        }
        console.log(result);
        this.showLoading = false;
  
      }).catch((error) => {
        alert("Error while updating. Please check console for error");
        this.showLoading = false
      });

    }
    

  }
}

import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-manage-resources',
  templateUrl: './manage-resources.component.html',
  styleUrls: ['./manage-resources.component.css']
})
export class ManageResourcesComponent implements OnInit {
  allProcesses: any;
 
  currentLoggedInUser: any;
    selectedSettingName: any;
    Resources: any[];
    selectedSetting: any;
    selectedProcess: number;
    @Output() configValue = new EventEmitter();
    
   setItemConfiguration(){
   }
   currentSettingVal:any
    apiCallsSubscriptions:any

    @Output() loadingOutput = new EventEmitter();
    @Input('processObject')
    set processObject(value: number) {
        if(value==undefined)
        {
          return;
        }
        this.selectedProcess = value;
       this.loadResourcesForSelectedProcess()
       
    }
    settingTypes: any = [
       
        {
          Name: "Value",
          Type: "text"
        }
    
    
      ]
    getSelectedSettings(){
        let currentSelectedResourceData:any={};
        for(let i=0;i<this.Resources.length;i++)
        {
          if(this.Resources[i]['ProcessResourceID']==this.selectedResource)
          {
              currentSelectedResourceData=this.Resources[i] ;
              break;
          }
        }

          this.currentSettingVal=currentSelectedResourceData[this.selectedItem]
       
        for(let i=0;i<this.settingTypes.length;i++)
        {
          if(this.settingTypes[i].Name==this.selectedItem)
          {
              this.selectedSetting=this.settingTypes[i];
              break;
          }
        }
      }
    ImportResource: { label: string; value: string; }[];
  ImportProcess: { label: string; value: string; items: { label: string; value: string; }[]; }[];
  configurationItems: { label: string; value: string; }[];
  ResourcesToShows: { label: string; value: string; }[];
  selectedResource:any;
  selectedItem:any;
  showResourceDisplay:false
  constructor(private fb: FormBuilder,private rapidflowService:RapidflowService,private socket: SocketProvider) {
    this.ResourcesToShows = [ ];
    this.configurationItems = [
      { label: 'Value', value: 'Value' }
    ];
   
  this.ImportResource = [ ];
  this.ImportProcess = [ ];
  }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
       //retrieving the process objects using api and updating in process data service
       this.selectedSetting=this.settingTypes[0];
       this.configurationItems = [
      { label: 'Value', value: 'Value' }
    ];
  
  this.ImportProcess = [ ];
  this.setnewResourceFormGroup()
  }
  applySettings() {
    
        let tempSettingsVal=this.currentSettingVal.replace(/'/g, "''");
        let settingsJson: any = {};
        let settingObject:any = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessResource",
          itemId: this.selectedResource.toString(),
          settingsJson: "",
          operationType: 'DEV'
        };
        if (this.selectedSetting.Type == "json") {
          try {
    
            if (confirm("Are you sure you want to apply this settings?")) {
              this.loadingOutput.emit({name:"Resources",val:true})
              settingsJson[this.selectedItem]=JSON.stringify(JSON.parse(tempSettingsVal));
              settingObject.settingsJson=JSON.stringify(settingsJson);
              
              let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
              updateSettingsResult.then((result) => {
                if(result.Result=="Success")
                {
                  alert("Setting Update Successfully!");
                  for(let i=0;i<this.Resources.length;i++)
                  {
                    if(this.Resources[i]['ProcessResourceID']==this.Resources)
                    {
                        this.Resources[i][this.selectedItem]=this.currentSettingVal ;
                        break;
                    }
                  }
                  this.loadingOutput.emit({name:"Resources",val:false})
                  this.configValue.emit({
                    name: "Resources",
                    val: this.Resources
                });
                }
                else{
                  alert("Error while updating. Please check console for error");
                  
                }
                console.log(result);
                
              }).catch((error) => {
                alert("Error while updating. Please check console for error");
              })
            }
          }
          catch (ex) {
            alert("JSON not valid!\nError: " + ex.message)
          }
        }
        else {
    
          if (confirm("Are you sure you want to apply this settings?")) {
          
              settingsJson[this.selectedItem]=tempSettingsVal;
            
    
           settingObject.settingsJson=JSON.stringify(settingsJson);
            
            let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
            updateSettingsResult.then((result: any) => {
              if(result.Result=="Success")
              {
                alert("Setting Update Successfully!");
              }
              else{
                alert("Error while updating. Please check console for error");
                
              }
              console.log(result)
            }).catch((error) => {
              alert("Error while updating. Please check console for error");
              console.log(error);
            })
          }
    
    
    
        }
      }
      
      

      newResourceFormGroup: any;
      selectedProcessForNewResource: number;
      newResourceImportConfigurationData: any = [];
      allResourcesOfProcessForImport: any = [];
      selectedResourceForImport: number;
      setnewResourceFormGroup() {
        this.newResourceFormGroup = this.fb.group({
          'Name': new FormControl('', Validators.required),
          'Description': new FormControl('', Validators.required),
          'Value': new FormControl('', Validators.required)
         
        });
        
      }
      getSelectedProcessForImportResourceData() {
        if (this.selectedProcessForNewResource != undefined) {
          this.rapidflowService.retrieveConfigurationData("ProcessResource", this.selectedProcessForNewResource).subscribe((response) => {
            //set dropdown model for Resources
            this.newResourceImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
            this.allResourcesOfProcessForImport = [];
            for (let i = 0; i < this.newResourceImportConfigurationData.length; i++) {
              this.allResourcesOfProcessForImport.push(
                {
                  label: this.newResourceImportConfigurationData[i]['Name'],
                  value: this.newResourceImportConfigurationData[i]['ProcessResourceID']
                }
              );
            }
            if (this.allResourcesOfProcessForImport[0] != undefined) {
              this.selectedResourceForImport = this.allResourcesOfProcessForImport[0].value;
            }
    
    
    
    
          });
        }
      }
      fillNewResourceForm() {
        let selectedResourceImport: any = {}
        for (let i = 0; i < this.newResourceImportConfigurationData.length; i++) {
          if (this.newResourceImportConfigurationData[i].ProcessResourceID == this.selectedResourceForImport) {
            selectedResourceImport = this.newResourceImportConfigurationData[i];
            break;
          }
        }
        this.newResourceFormGroup.patchValue({
        
          'Name': selectedResourceImport["Name"],
          'Description': selectedResourceImport["Description"],
          'Value': selectedResourceImport["Value"]
        });
      }
    
      addNewResource() {
       
        let newResourceValue = {
          ProcessID: this.selectedProcess,
          Name: this.newResourceFormGroup["_value"].Name,
          Description: this.newResourceFormGroup["_value"].Description,
          Value: this.newResourceFormGroup["_value"].Value
        
            
        }
        let settingObject: any = {
          userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
          itemType: "ProcessResource",
          objectIdentity:"0",
          value: JSON.stringify(newResourceValue),
          operationType: 'DEV'
        };
        if (confirm("Are you sure you want to apply this settings?")) {
    
    
    
          let addNewResourceResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
          addNewResourceResult.then((result) => {
    
            alert("Setting Update Successfully!");
    
            console.log(result);
            this.loadResourcesForSelectedProcess();
            this.showResourceDisplay=false;
    
          }).catch((error) => {
            alert("Error while updating. Please check console for error");
            console.log(error)
          })
        }
      }
      
      loadResourcesForSelectedProcess(){
        this.selectedSetting=this.settingTypes[0];
        this.selectedItem=this.selectedSetting.Name;
        this.ResourcesToShows=[]
        this.currentSettingVal=""
        this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
        this.loadingOutput.emit({name:"Resources",val:true})
        this.rapidflowService.retrieveConfigurationData('ProcessResource',this.selectedProcess)
        .subscribe((response) => {
 
          try {

            let responseJSON=JSON.parse(response.json());
            this.configValue.emit({
              name: "ProcessResource",
              val: responseJSON.ConfigurationData
          });
            if(responseJSON.AuthenticationStatus=="true")
            {
                 this.Resources=JSON.parse(response.json()).ConfigurationData;
                for(let i=0;i<this.Resources.length;i++)
                {
                  let ResourceObject:any={};
                  ResourceObject.label=this.Resources[i]['Name'];
                  ResourceObject.value=this.Resources[i]['ProcessResourceID'];
                  this.ResourcesToShows.push(ResourceObject);
                }
                this.selectedResource=this.ResourcesToShows[0].value;
                this.getSelectedSettings();
                this.loadingOutput.emit({ name: "Resources", val: false })
                this.configValue.emit({
                  name: "Resources",
                  val: this.Resources
              });           
            }
        //   this.Resources=JSON.parse(response.json())
       
         
        //   console.log(this.Resources)

          } catch (error) {
             this.Resources=[]
         }    }, (error: any) => {
 
             this.Resources=[]
 
        });
  }

}

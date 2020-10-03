import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-edit-addons',
  templateUrl: './edit-addons.component.html',
  styleUrls: ['./edit-addons.component.css']
})
export class EditAddonsComponent implements OnInit {
  allProcesses: any;
 
  currentLoggedInUser: any;
    selectedSettingName: any;
    Addons: any[];
    selectedSetting: any;
    selectedProcess: number;
    loadSubscription:any;
    
   setItemConfiguration(){
   }
   currentSettingVal:any
    apiCallsSubscriptions:any
    @Output() loadingOutput = new EventEmitter();
    @Output() configValue = new EventEmitter();
    @Input('processObject')
    set processObject(value: number) {
        if(value==undefined)
        {
          return;
        }
        if(this.loadSubscription!=undefined)
        {
          this.loadSubscription.unsubscribe();
        }
        this.selectedProcess = value;
       this.loadAddonsForSelectedProcess()
       
    }
    settingTypes: any = [
        {
          Name: "ObjectDescription",
          Type: "json"
        },
        {
          Name: "Value",
          Type: "json"
        }
    
    
      ]
    getSelectedSettings(){
        let currentSelectedAddonData:any={};
        for(let i=0;i<this.Addons.length;i++)
        {
          if(this.Addons[i]['ProcessObjectID']==this.selectedAddon)
          {
              currentSelectedAddonData=this.Addons[i] ;
              break;
          }
        }
        // if(this.selectedItem=="Value")
        // {
        //   this.currentSettingVal=decodeURIComponent(currentSelectedAddonData[this.selectedItem]) ;
        // }
        // else if(this.selectedItem=="ObjectDescription"){
        //   this.currentSettingVal=decodeURI(currentSelectedAddonData[this.selectedItem]) ;
          
        // }
        // else{
        //   this.currentSettingVal=currentSelectedAddonData[this.selectedItem]
        // }
        this.currentSettingVal=currentSelectedAddonData[this.selectedItem]
        for(let i=0;i<this.settingTypes.length;i++)
        {
          if(this.settingTypes[i].Name==this.selectedItem)
          {
              this.selectedSetting=this.settingTypes[i];
              break;
          }
        }
      }
    ImportAddon: { label: string; value: string; }[];
  ImportProcess: { label: string; value: string; items: { label: string; value: string; }[]; }[];
  configurationItems: { label: string; value: string; }[];
  AddonsToShows: { label: string; value: string; }[];
  selectedAddon:any;
  selectedItem:any;
  showAddonDisplay:false
  constructor(private fb: FormBuilder,private rapidflowService:RapidflowService,private socket: SocketProvider) {
    this.AddonsToShows = [ ];
    this.configurationItems = [
      { label: 'Object Description', value: 'ObjectDescription' },
      { label: 'Value', value: 'Value' }
    ];
   
  this.ImportAddon = [ ];
  this.ImportProcess = [ ];
  }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
       //retrieving the process objects using api and updating in process data service
       this.selectedSetting=this.settingTypes[0];
       this.configurationItems = [
      { label: 'Object Description', value: 'ObjectDescription' },
      { label: 'Value', value: 'Value' }
    ];
  
  this.ImportProcess = [ ];
  this.setnewAddonFormGroup()
  }
  applySettings() {
    
        let tempSettingsVal=this.currentSettingVal.replace(/'/g, "''");
        let settingsJson: any = {};
        let settingObject:any = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessObject",
          itemId: this.selectedAddon.toString(),
          settingsJson: "",
          operationType: 'DEV'
        };
        if (this.selectedSetting.Type == "json") {
          try {
    
            if (confirm("Are you sure you want to apply this settings?")) {
              this.loadingOutput.emit({name:"Addons",val:true})
      settingsJson[this.selectedItem]=JSON.stringify(JSON.parse(tempSettingsVal));
   
           
              settingObject.settingsJson=JSON.stringify(settingsJson);
              
              let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
              updateSettingsResult.then((result) => {
                if(result.Result=="Success")
                {
                  alert("Setting Update Successfully!");
                  for(let i=0;i<this.Addons.length;i++)
                  {
                    if(this.Addons[i]['ProcessObjectID']==this.Addons)
                    {
                        this.Addons[i][this.selectedItem]=this.currentSettingVal ;
                        break;
                    }
                  }
                  this.loadingOutput.emit({name:"Addons",val:false})
                  this.configValue.emit({
                    name: "Addons",
                    val: this.Addons
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
      

      newAddonFormGroup: any;
      selectedProcessForNewAddon: number;
      newAddonImportConfigurationData: any = [];
      allAddonsOfProcessForImport: any = [];
      selectedAddonForImport: number;
      setnewAddonFormGroup() {
        this.newAddonFormGroup = this.fb.group({
          'ObjectDescription': new FormControl('', Validators.required),
          'Value': new FormControl('', Validators.required)
         
        });
        
      }
      getSelectedProcessForImportAddonData() {
        if (this.selectedProcessForNewAddon != undefined) {
          this.rapidflowService.retrieveConfigurationData("ProcessAddon", this.selectedProcessForNewAddon).subscribe((response) => {
            //set dropdown model for Addons
            this.newAddonImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
            
            this.allAddonsOfProcessForImport = [];
            for (let i = 0; i < this.newAddonImportConfigurationData.length; i++) {
              this.allAddonsOfProcessForImport.push(
                {
                  label:JSON.parse(this.newAddonImportConfigurationData[i]['ObjectDescription']).Title,
                  value: this.newAddonImportConfigurationData[i].ProcessObjectID
                }
              );
            }
            if (this.allAddonsOfProcessForImport[0] != undefined) {
              this.selectedAddonForImport = this.allAddonsOfProcessForImport[0].value;
            }
    
    
    
    
          });
        }
      }
      fillNewAddonForm() {
        let selectedAddonImport: any = {}
        for (let i = 0; i < this.newAddonImportConfigurationData.length; i++) {
          if (this.newAddonImportConfigurationData[i].ProcessObjectID == this.selectedAddonForImport) {
            selectedAddonImport = this.newAddonImportConfigurationData[i];
            break;
          }
        }
        this.newAddonFormGroup.patchValue({
          'ObjectDescription': selectedAddonImport["ObjectDescription"],
          'Value': selectedAddonImport["Value"],
        });
      }
    
      addNewAddon() {
        let currentSettingParsed = "ObjectDescription";
    
        try {
    
    
          currentSettingParsed = "ObjectDescription";
          JSON.parse(this.newAddonFormGroup["_value"].ObjectDescription)
    
        
        }
        catch (ex) {
          alert(currentSettingParsed + " not valid json.\n" + ex.message);
          return;
        }
    
        let newAddonValue = {
          ProcessID: this.selectedProcess,
         
          Value: this.newAddonFormGroup["_value"].Value,
          ObjectDescription: this.newAddonFormGroup["_value"].ObjectDescription,
            
        }
        let settingObject: any = {
          userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
          itemType: "ProcessObject",
          objectIdentity:"0",
          value: JSON.stringify(newAddonValue),
          operationType: 'DEV'
        };
        if (confirm("Are you sure you want to apply this settings?")) {
    
    
    
          let addNewAddonResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
          addNewAddonResult.then((result) => {
    
            alert("Setting Update Successfully!");
    
            console.log(result);
            this.loadAddonsForSelectedProcess();
            this.showAddonDisplay=false;
    
          }).catch((error) => {
            alert("Error while updating. Please check console for error");
            console.log(error)
          })
        }
      }
      
      loadAddonsForSelectedProcess(){
        this.selectedSetting=this.settingTypes[0];
        this.selectedItem=this.selectedSetting.Name;
        this.AddonsToShows=[]
        this.currentSettingVal=""
        this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
        this.loadingOutput.emit({name:"Addons",val:true})
       this.loadSubscription= this.rapidflowService.retrieveConfigurationData('ProcessAddon',this.selectedProcess)
        .subscribe((response) => {
 
          try {

            let responseJSON=JSON.parse(response.json());
            this.configValue.emit({
              name: "Addons",
              val: responseJSON.ConfigurationData
          });
            if(responseJSON.AuthenticationStatus=="true")
            {
                 this.Addons=JSON.parse(response.json()).ConfigurationData;
                for(let i=0;i<this.Addons.length;i++)
                {
                  let AddonObject:any={};
                  AddonObject.label=JSON.parse(this.Addons[i]['ObjectDescription']).Title;
                  AddonObject.value=this.Addons[i]['ProcessObjectID'];
                  this.AddonsToShows.push(AddonObject);
                }
                this.selectedAddon=this.AddonsToShows[0].value;
                this.getSelectedSettings();
             
                this.loadingOutput.emit({name:"Addons",val:true})
                this.loadingOutput.emit({ name: "Addons", val: false })
                this.configValue.emit({
                  name: "Addons",
                  val: this.Addons
              });             
            }
        //   this.Addons=JSON.parse(response.json())
       
         
        //   console.log(this.Addons)

          } catch (error) {
             this.Addons=[]
         }    }, (error: any) => {
 
             this.Addons=[]
 
        });
  }

}

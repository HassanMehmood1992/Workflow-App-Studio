import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-edit-pivots',
  templateUrl: './edit-pivots.component.html',
  styleUrls: ['./edit-pivots.component.css']
})
export class EditPivotsComponent implements OnInit {
  allProcesses: any;
 
  currentLoggedInUser: any;
    selectedSettingName: any;
    Pivots: any[];
    selectedSetting: any;
    selectedProcess: number;
    loadSubscription:any;
    
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
        if(this.loadSubscription!=undefined)
        {
          this.loadSubscription.unsubscribe();
        }
        this.selectedProcess = value;
       this.loadPivotsForSelectedProcess()
       
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
        let currentSelectedPivotData:any={};
        for(let i=0;i<this.Pivots.length;i++)
        {
          if(this.Pivots[i]['ProcessObjectID']==this.selectedPivot)
          {
              currentSelectedPivotData=this.Pivots[i] ;
              break;
          }
        }

          this.currentSettingVal=currentSelectedPivotData[this.selectedItem]
       
        for(let i=0;i<this.settingTypes.length;i++)
        {
          if(this.settingTypes[i].Name==this.selectedItem)
          {
              this.selectedSetting=this.settingTypes[i];
              break;
          }
        }
      }
    ImportPivot: { label: string; value: string; }[];
  ImportProcess: { label: string; value: string; items: { label: string; value: string; }[]; }[];
  configurationItems: { label: string; value: string; }[];
  PivotsToShows: { label: string; value: string; }[];
  selectedPivot:any;
  selectedItem:any;
  showPivotDisplay:false
  constructor(private fb: FormBuilder,private rapidflowService:RapidflowService,private socket: SocketProvider) {
    this.PivotsToShows = [ ];
    this.configurationItems = [
      { label: 'Object Description', value: 'ObjectDescription' },
      { label: 'Value', value: 'Value' }
    ];
   
  this.ImportPivot = [ ];
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
  this.setnewPivotFormGroup()
  }
  applySettings() {
    
        let tempSettingsVal=this.currentSettingVal.replace(/'/g, "''");
        let settingsJson: any = {};
        let settingObject:any = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessObject",
          itemId: this.selectedPivot.toString(),
          settingsJson: "",
          operationType: 'DEV'
        };
        if (this.selectedSetting.Type == "json") {
          try {
    
            if (confirm("Are you sure you want to apply this settings?")) {
              this.loadingOutput.emit({name:"Pivots",val:true})
              settingsJson[this.selectedItem]=JSON.stringify(JSON.parse(tempSettingsVal));
              settingObject.settingsJson=JSON.stringify(settingsJson);
              
              let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
              updateSettingsResult.then((result) => {
                if(result.Result=="Success")
                {
                  alert("Setting Update Successfully!");
                  for(let i=0;i<this.Pivots.length;i++)
                  {
                    if(this.Pivots[i]['ProcessObjectID']==this.Pivots)
                    {
                        this.Pivots[i][this.selectedItem]=this.currentSettingVal ;
                        break;
                    }
                  }
                  this.loadingOutput.emit({name:"Pivots",val:false})
                  this.configValue.emit({
                    name: "Pivots",
                    val: this.Pivots
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
      
      

      newPivotFormGroup: any;
      selectedProcessForNewPivot: number;
      newPivotImportConfigurationData: any = [];
      allPivotsOfProcessForImport: any = [];
      selectedPivotForImport: number;
      setnewPivotFormGroup() {
        this.newPivotFormGroup = this.fb.group({
          'ObjectDescription': new FormControl('', Validators.required),
          'Value': new FormControl('', Validators.required)
         
        });
        
      }
      getSelectedProcessForImportPivotData() {
        if (this.selectedProcessForNewPivot != undefined) {
          this.rapidflowService.retrieveConfigurationData("ProcessPivot", this.selectedProcessForNewPivot).subscribe((response) => {
            //set dropdown model for Pivots
            this.newPivotImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
            this.allPivotsOfProcessForImport = [];
            for (let i = 0; i < this.newPivotImportConfigurationData.length; i++) {
              this.allPivotsOfProcessForImport.push(
                {
                  label:JSON.parse(this.newPivotImportConfigurationData[i]['ObjectDescription']).Title,
                  value: this.newPivotImportConfigurationData[i].ProcessObjectID
                }
              );
            }
            if (this.allPivotsOfProcessForImport[0] != undefined) {
              this.selectedPivotForImport = this.allPivotsOfProcessForImport[0].value;
            }
    
    
    
    
          });
        }
      }
      fillNewPivotForm() {
        let selectedPivotImport: any = {}
        for (let i = 0; i < this.newPivotImportConfigurationData.length; i++) {
          if (this.newPivotImportConfigurationData[i].ProcessObjectID == this.selectedPivotForImport) {
            selectedPivotImport = this.newPivotImportConfigurationData[i];
            break;
          }
        }
        this.newPivotFormGroup.patchValue({
          'ObjectDescription': selectedPivotImport["ObjectDescription"],
          'Value': selectedPivotImport["Value"],
        });
      }
    
      addNewPivot() {
        let currentSettingParsed = "ObjectDescription";
    
        try {
    
    
          currentSettingParsed = "ObjectDescription";
          JSON.parse(this.newPivotFormGroup["_value"].ObjectDescription)
    
        
        }
        catch (ex) {
          alert(currentSettingParsed + " not valid json.\n" + ex.message);
          return;
        }
    
        let newPivotValue = {
          ProcessID: this.selectedProcess,
         
          Value: this.newPivotFormGroup["_value"].Value,
          ObjectDescription: this.newPivotFormGroup["_value"].ObjectDescription,
            
        }
        let settingObject: any = {
          userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
          itemType: "ProcessObject",
          objectIdentity:"0",
          value: JSON.stringify(newPivotValue),
          operationType: 'DEV'
        };
        if (confirm("Are you sure you want to apply this settings?")) {
    
    
    
          let addNewPivotResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
          addNewPivotResult.then((result) => {
    
            alert("Setting Update Successfully!");
    
            console.log(result);
            this.loadPivotsForSelectedProcess();
            this.showPivotDisplay=false;
    
          }).catch((error) => {
            alert("Error while updating. Please check console for error");
            console.log(error)
          })
        }
      }
      
      loadPivotsForSelectedProcess(){
        this.selectedSetting=this.settingTypes[0];
        this.selectedItem=this.selectedSetting.Name;
        this.PivotsToShows=[]
        this.currentSettingVal=""
        this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
        this.loadingOutput.emit({name:"Pivots",val:true})
        this.loadSubscription=this.rapidflowService.retrieveConfigurationData('ProcessPivot',this.selectedProcess)
        .subscribe((response) => {
 
          try {

            let responseJSON=JSON.parse(response.json());
            this.configValue.emit({
              name: "Pivots",
              val: responseJSON.ConfigurationData
          });
            if(responseJSON.AuthenticationStatus=="true")
            {
                 this.Pivots=JSON.parse(response.json()).ConfigurationData;
                for(let i=0;i<this.Pivots.length;i++)
                {
                  let PivotObject:any={};
                  PivotObject.label=JSON.parse(this.Pivots[i]['ObjectDescription']).Title;
                  PivotObject.value=this.Pivots[i]['ProcessObjectID'];
                  this.PivotsToShows.push(PivotObject);
                }
                this.selectedPivot=this.PivotsToShows[0].value;
                this.getSelectedSettings();
                this.loadingOutput.emit({ name: "Pivots", val: false })
                this.configValue.emit({
                  name: "Pivots",
                  val: this.Pivots
              });           
            }
        //   this.Pivots=JSON.parse(response.json())
       
         
        //   console.log(this.Pivots)

          } catch (error) {
             this.Pivots=[]
         }    }, (error: any) => {
 
             this.Pivots=[]
 
        });
  }

}

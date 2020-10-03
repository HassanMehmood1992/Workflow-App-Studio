import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-edit-stored-query',
  templateUrl: './edit-stored-query.component.html',
  styleUrls: ['./edit-stored-query.component.css']
})
export class EditStoredQueryComponent implements OnInit {
  allProcesses: any;
 
  currentLoggedInUser: any;
    selectedSettingName: any;
    StoredQueries: any[];
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
       this.loadStoredQueriesForSelectedProcess()
       
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
        let currentSelectedStoredQueryData:any={};
        for(let i=0;i<this.StoredQueries.length;i++)
        {
          if(this.StoredQueries[i]['ProcessObjectID']==this.selectedStoredQuery)
          {
              currentSelectedStoredQueryData=this.StoredQueries[i] ;
              break;
          }
        }
        // if(this.selectedItem=="Value")
        // {
        //   this.currentSettingVal=decodeURIComponent(currentSelectedStoredQueryData[this.selectedItem]) ;
        // }
        // else if(this.selectedItem=="ObjectDescription"){
        //   this.currentSettingVal=decodeURI(currentSelectedStoredQueryData[this.selectedItem]) ;
          
        // }
        // else{
        //   this.currentSettingVal=currentSelectedStoredQueryData[this.selectedItem]
        // }
        this.currentSettingVal=currentSelectedStoredQueryData[this.selectedItem]
        for(let i=0;i<this.settingTypes.length;i++)
        {
          if(this.settingTypes[i].Name==this.selectedItem)
          {
              this.selectedSetting=this.settingTypes[i];
              break;
          }
        }
      }
    ImportStoredQuery: { label: string; value: string; }[];
  ImportProcess: { label: string; value: string; items: { label: string; value: string; }[]; }[];
  configurationItems: { label: string; value: string; }[];
  StoredQueriesToShows: { label: string; value: string; }[];
  selectedStoredQuery:any;
  selectedItem:any;
  showStoredQueryDisplay:false
  constructor(private fb: FormBuilder,private rapidflowService:RapidflowService,private socket: SocketProvider) {
    this.StoredQueriesToShows = [ ];
    this.configurationItems = [
      { label: 'Object Description', value: 'ObjectDescription' },
      { label: 'Value', value: 'Value' }
    ];
   
  this.ImportStoredQuery = [ ];
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
  this.setnewStoredQueryFormGroup()
  }
  applySettings() {
    
        let tempSettingsVal=this.currentSettingVal.replace(/'/g, "''");
        let settingsJson: any = {};
        let settingObject:any = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessObject",
          itemId: this.selectedStoredQuery.toString(),
          settingsJson: "",
          operationType: 'DEV'
        };
        if (this.selectedSetting.Type == "json") {
          try {
    
            if (confirm("Are you sure you want to apply this settings?")) {
              this.loadingOutput.emit({name:"StoredQueries",val:true})
      settingsJson[this.selectedItem]=JSON.stringify(JSON.parse(tempSettingsVal));
   
           
              settingObject.settingsJson=JSON.stringify(settingsJson);
              
              let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
              updateSettingsResult.then((result) => {
                if(result.Result=="Success")
                {
                  alert("Setting Update Successfully!");
                  for(let i=0;i<this.StoredQueries.length;i++)
                  {
                    if(this.StoredQueries[i]['ProcessObjectID']==this.StoredQueries)
                    {
                        this.StoredQueries[i][this.selectedItem]=this.currentSettingVal ;
                        break;
                    }
                  }
                  this.loadingOutput.emit({name:"StoredQueries",val:false})
                  this.configValue.emit({
                    name: "StoredQueries",
                    val: this.StoredQueries
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
      

      newStoredQueryFormGroup: any;
      selectedProcessForNewStoredQuery: number;
      newStoredQueryImportConfigurationData: any = [];
      allStoredQueriesOfProcessForImport: any = [];
      selectedStoredQueryForImport: number;
      setnewStoredQueryFormGroup() {
        this.newStoredQueryFormGroup = this.fb.group({
          'ObjectDescription': new FormControl('', Validators.required),
          'Value': new FormControl('', Validators.required)
         
        });
        
      }
      getSelectedProcessForImportStoredQueryData() {
        if (this.selectedProcessForNewStoredQuery != undefined) {
          this.rapidflowService.retrieveConfigurationData("ProcessStoredQuery", this.selectedProcessForNewStoredQuery).subscribe((response) => {
            //set dropdown model for StoredQueries
            this.newStoredQueryImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
            
            this.allStoredQueriesOfProcessForImport = [];
            for (let i = 0; i < this.newStoredQueryImportConfigurationData.length; i++) {
              this.allStoredQueriesOfProcessForImport.push(
                {
                  label:JSON.parse(this.newStoredQueryImportConfigurationData[i]['ObjectDescription']).Title,
                  value: this.newStoredQueryImportConfigurationData[i].ProcessObjectID
                }
              );
            }
            if (this.allStoredQueriesOfProcessForImport[0] != undefined) {
              this.selectedStoredQueryForImport = this.allStoredQueriesOfProcessForImport[0].value;
            }
    
    
    
    
          });
        }
      }
      fillNewStoredQueryForm() {
        let selectedStoredQueryImport: any = {}
        for (let i = 0; i < this.newStoredQueryImportConfigurationData.length; i++) {
          if (this.newStoredQueryImportConfigurationData[i].ProcessObjectID == this.selectedStoredQueryForImport) {
            selectedStoredQueryImport = this.newStoredQueryImportConfigurationData[i];
            break;
          }
        }
        this.newStoredQueryFormGroup.patchValue({
          'ObjectDescription': selectedStoredQueryImport["ObjectDescription"],
          'Value': selectedStoredQueryImport["Value"],
        });
      }
    
      addNewStoredQuery() {
        let currentSettingParsed = "ObjectDescription";
    
        try {
    
    
          currentSettingParsed = "ObjectDescription";
          JSON.parse(this.newStoredQueryFormGroup["_value"].ObjectDescription)
    
        
        }
        catch (ex) {
          alert(currentSettingParsed + " not valid json.\n" + ex.message);
          return;
        }
    
        let newStoredQueryValue = {
          ProcessID: this.selectedProcess,
         
          Value: this.newStoredQueryFormGroup["_value"].Value,
          ObjectDescription: this.newStoredQueryFormGroup["_value"].ObjectDescription,
            
        }
        let settingObject: any = {
          userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
          itemType: "ProcessObject",
          objectIdentity:"0",
          value: JSON.stringify(newStoredQueryValue),
          operationType: 'DEV'
        };
        if (confirm("Are you sure you want to apply this settings?")) {
    
    
    
          let addNewStoredQueryResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
          addNewStoredQueryResult.then((result) => {
    
            alert("Setting Update Successfully!");
    
            console.log(result);
            this.loadStoredQueriesForSelectedProcess();
            this.showStoredQueryDisplay=false;
    
          }).catch((error) => {
            alert("Error while updating. Please check console for error");
            console.log(error)
          })
        }
      }
      
      loadStoredQueriesForSelectedProcess(){
        this.selectedSetting=this.settingTypes[0];
        this.selectedItem=this.selectedSetting.Name;
        this.StoredQueriesToShows=[]
        this.currentSettingVal=""
        this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
        this.loadingOutput.emit({name:"StoredQueries",val:true})
        this.loadSubscription=this.rapidflowService.retrieveConfigurationData('ProcessStoredQuery',this.selectedProcess)
        .subscribe((response) => {
 
          try {

            let responseJSON=JSON.parse(response.json());
            this.configValue.emit({
              name: "StoredQueries",
              val: responseJSON.ConfigurationData
          });
            if(responseJSON.AuthenticationStatus=="true")
            {
                 this.StoredQueries=JSON.parse(response.json()).ConfigurationData;
                for(let i=0;i<this.StoredQueries.length;i++)
                {
                  let StoredQueryObject:any={};
                  StoredQueryObject.label=JSON.parse(this.StoredQueries[i]['ObjectDescription']).Title;
                  StoredQueryObject.value=this.StoredQueries[i]['ProcessObjectID'];
                  this.StoredQueriesToShows.push(StoredQueryObject);
                }
                this.selectedStoredQuery=this.StoredQueriesToShows[0].value;
                this.getSelectedSettings();
             
                this.loadingOutput.emit({name:"StoredQueries",val:true})
                this.loadingOutput.emit({ name: "StoredQueries", val: false })
                this.configValue.emit({
                  name: "StoredQueries",
                  val: this.StoredQueries
              });             
            }
        //   this.StoredQueries=JSON.parse(response.json())
       
         
        //   console.log(this.StoredQueries)

          } catch (error) {
             this.StoredQueries=[]
         }    }, (error: any) => {
 
             this.StoredQueries=[]
 
        });
  }

}

import { SocketProvider } from './../../../services/socket.service';
import { RapidflowService } from './../../../services/rapidflow.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-edit-reports',
  templateUrl: './edit-reports.component.html',
  styleUrls: ['./edit-reports.component.css']
})
export class EditReportsComponent implements OnInit {
  allProcesses: any;
 
  currentLoggedInUser: any;
    Reports: any[];
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
       this.loadReportsForSelectedProcess()
       
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
        let currentSelectedReportData:any={};
        for(let i=0;i<this.Reports.length;i++)
        {
          if(this.Reports[i]['ProcessObjectID']==this.selectedReport)
          {
              currentSelectedReportData=this.Reports[i] ;
              break;
          }
        }


          this.currentSettingVal=currentSelectedReportData[this.selectedItem]
        
        for(let i=0;i<this.settingTypes.length;i++)
        {
          if(this.settingTypes[i].Name==this.selectedItem)
          {
              this.selectedSetting=this.settingTypes[i];
              break;
          }
        }
      }
    ImportReport: { label: string; value: string; }[];
  ImportProcess: { label: string; value: string; items: { label: string; value: string; }[]; }[];
  configurationItems: { label: string; value: string; }[];
  ReportsToShows: { label: string; value: string; }[];
  selectedReport:any;
  selectedItem:any;
  showReportDisplay:false
  constructor(private fb: FormBuilder,private rapidflowService:RapidflowService,private socket: SocketProvider) {
    this.ReportsToShows = [ ];
    this.configurationItems = [
      { label: 'Object Description', value: 'ObjectDescription' },
      { label: 'Value', value: 'Value' }
    ];
   
  this.ImportReport = [ ];
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
  this.setnewReportFormGroup()
  }
  applySettings() {
    
        let tempSettingsVal=this.currentSettingVal.replace(/'/g, "''");
        let settingsJson: any = {};
        let settingObject:any = {
          userToken: this.currentLoggedInUser.AuthenticationToken,
          itemType: "ProcessObject",
          itemId: this.selectedReport.toString(),
          settingsJson: "",
          operationType: 'DEV'
        };
        if (this.selectedSetting.Type == "json") {
          try {
    
            if (confirm("Are you sure you want to apply this settings?")) {
              this.loadingOutput.emit({name:"Reports",val:true})
              settingsJson[this.selectedItem]=JSON.stringify(JSON.parse(tempSettingsVal));
              settingObject.settingsJson=JSON.stringify(settingsJson);
              
              let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
              updateSettingsResult.then((result) => {
                if(result.Result=="Success")
                {

                  for(let i=0;i<this.Reports.length;i++)
                  {
                    if(this.Reports[i]['ProcessObjectID']==this.selectedReport)
                    {
                        this.Reports[i][this.selectedItem]=this.currentSettingVal ;
                        break;
                    }
                  }
                  this.loadingOutput.emit({name:"Reports",val:false})
                  this.configValue.emit({
                    name: "Reports",
                    val: this.Reports
                });
                  alert("Setting Update Successfully!");
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
      
      

      newReportFormGroup: any;
      selectedProcessForNewReport: number;
      newReportImportConfigurationData: any = [];
      allReportsOfProcessForImport: any = [];
      selectedReportForImport: number;
      setnewReportFormGroup() {
        this.newReportFormGroup = this.fb.group({
          'ObjectDescription': new FormControl('', Validators.required),
          'Value': new FormControl('', Validators.required)
         
        });
        
      }
      getSelectedProcessForImportReportData() {
        if (this.selectedProcessForNewReport != undefined) {
          this.rapidflowService.retrieveConfigurationData("ProcessReport", this.selectedProcessForNewReport).subscribe((response) => {
            //set dropdown model for Reports
            this.newReportImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
            this.allReportsOfProcessForImport = [];
            for (let i = 0; i < this.newReportImportConfigurationData.length; i++) {
              this.allReportsOfProcessForImport.push(
                {
                  label:JSON.parse(this.newReportImportConfigurationData[i]['ObjectDescription']).Title,
                  value: this.newReportImportConfigurationData[i].ProcessObjectID
                }
              );
            }
            if (this.allReportsOfProcessForImport[0] != undefined) {
              this.selectedReportForImport = this.allReportsOfProcessForImport[0].value;
            }
    
    
    
    
          });
        }
      }
      fillNewReportForm() {
        let selectedReportImport: any = {}
        for (let i = 0; i < this.newReportImportConfigurationData.length; i++) {
          if (this.newReportImportConfigurationData[i].ProcessObjectID == this.selectedReportForImport) {
            selectedReportImport = this.newReportImportConfigurationData[i];
            break;
          }
        }
        this.newReportFormGroup.patchValue({
          'ObjectDescription': selectedReportImport["ObjectDescription"],
          'Value': selectedReportImport["Value"],
        });
      }
    
      addNewReport() {
        let currentSettingParsed = "ObjectDescription";
    
        try {
    
    
          currentSettingParsed = "ObjectDescription";
          JSON.parse(this.newReportFormGroup["_value"].ObjectDescription)
    
        
        }
        catch (ex) {
          alert(currentSettingParsed + " not valid json.\n" + ex.message);
          return;
        }
    
        let newReportValue = {
          ProcessID: this.selectedProcess,
         
          Value: this.newReportFormGroup["_value"].Value,
          ObjectDescription: this.newReportFormGroup["_value"].ObjectDescription,
            
        }
        let settingObject: any = {
          userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
          itemType: "ProcessObject",
          objectIdentity:"0",
          value: JSON.stringify(newReportValue),
          operationType: 'DEV'
        };
        if (confirm("Are you sure you want to apply this settings?")) {
    
    
    
          let addNewReportResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
          addNewReportResult.then((result) => {
    
            alert("Setting Update Successfully!");
    
            console.log(result);
            this.loadReportsForSelectedProcess();
            this.showReportDisplay=false;
    
          }).catch((error) => {
            alert("Error while updating. Please check console for error");
            console.log(error)
          })
        }
      }
      
      loadReportsForSelectedProcess(){
        this.selectedSetting=this.settingTypes[0];
        this.selectedItem=this.selectedSetting.Name;
        this.ReportsToShows=[]
        this.currentSettingVal=""
        this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
       
          this.loadingOutput.emit({name:"Workflows",val:true})
        this.loadSubscription=this.rapidflowService.retrieveConfigurationData('ProcessReport',this.selectedProcess)
        .subscribe((response) => {
 
          try {

            let responseJSON=JSON.parse(response.json());
            this.configValue.emit({
              name: "Reports",
              val: responseJSON.ConfigurationData
          });
            if(responseJSON.AuthenticationStatus=="true")
            {
                 this.Reports=JSON.parse(response.json()).ConfigurationData;
                for(let i=0;i<this.Reports.length;i++)
                {
                  let ReportObject:any={};
                  ReportObject.label=JSON.parse(this.Reports[i]['ObjectDescription']).Title;
                  ReportObject.value=this.Reports[i]['ProcessObjectID'];
                  this.ReportsToShows.push(ReportObject);
                }
                this.selectedReport=this.ReportsToShows[0].value;
                this.getSelectedSettings();
                this.loadingOutput.emit({ name: "Reports", val: false })
                this.configValue.emit({
                  name: "Reports",
                  val: this.Reports
              });
                            
            }
        //   this.Reports=JSON.parse(response.json())
       
         
        //   console.log(this.Reports)

          } catch (error) {
             this.Reports=[]
         }    
         
        }, (error: any) => {
 
             this.Reports=[]
 
        });
  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { RapidflowService } from '../../services/rapidflow.service';
import { SocketProvider } from '../../services/socket.service';

@Component({
  selector: 'app-register-process-heartbeat',
  templateUrl: './register-process-heartbeat.component.html',
  styleUrls: ['./register-process-heartbeat.component.css']
})
export class RegisterProcessHeartbeatComponent implements OnInit {
  showImportTemplateDialog: boolean = false;
  newVersion: FormGroup;
  HeartBeatDetails;
  Processes;
  Workflows;
  selectedWorkflow;
  selectedProcess;
  workflowstatus;
  reason;
  showLoading:boolean = false;
  currentLoggedInUser;
  constructor(private fb: FormBuilder,private socket:SocketProvider,private rapidflowService:RapidflowService) { }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.reason = "";
    this.newVersion = this.fb.group({
      'ProcessName': new FormControl('', Validators.required),
     'ProcessID': new FormControl('', Validators.required),
  
     'WorkflowName': new FormControl('', Validators.required),
  
     'WorkflowID': new FormControl('', Validators.required),
     'ProcessReference': new FormControl('', Validators.required),
     'ProcessDescription': new FormControl('', Validators.required),
     'Organization': new FormControl('', Validators.required),
     'ProcessOwnerEmail': new FormControl('', Validators.required),
     'ProcessAdminEmail': new FormControl('', Validators.required),
     'ProcessCMDBID': new FormControl('', Validators.required),
     'ProcessVersion': new FormControl('', Validators.required)
     
  
   });
   this.Processes = [];
   this.getHeartbeatData();
  }
  getHeartbeatData()
  {
    this.showLoading = true;
    this.rapidflowService.retrieveHeartBeatDetailsWCF("ALL", "ALL").subscribe((response) => {
     this.HeartBeatDetails = JSON.parse(response.json());
     this.showLoading = false;
     
     for (let i = 0; i < this.HeartBeatDetails.length; i++) {
       let already = false;
       let processObj: any = {};
         for(let j = 0; j < this.Processes.length;j++)
         {
           if(this.Processes[j].value == this.HeartBeatDetails[i].ProcessID)
           {
             already = true;
             break;
           }
         }
         if(!already)
         {
           processObj.label = this.HeartBeatDetails[i].ProcessTitle;
           processObj.value = this.HeartBeatDetails[i].ProcessID;
           this.Processes.push(processObj);
         }
         this.selectedProcess = this.Processes[0].value;
         
       
       
     }
     this.getWorkflows();
     //this.popupselectedWorkflow = this.workflows[0].value;
   },
     (error) => {
       console.log(error);
     }
   );
  }
  openImportTemplateDialog() {
    this.showImportTemplateDialog = true;
  }

  getWorkflows()
  {
    this.Workflows = []
    for(let  i = 0 ; i < this.HeartBeatDetails.length;i++)
    {

        let workflowobj:any = {};
        if(this.selectedProcess == this.HeartBeatDetails[i].ProcessID)
        {
          workflowobj.label = this.HeartBeatDetails[i].WorkflowName;
          workflowobj.value = this.HeartBeatDetails[i].WorkflowID;
          this.Workflows.push(workflowobj);
        }
    }
    this.selectedWorkflow = this.Workflows[0].value;
    this.setStatusValue()

  }
  setStatusValue()
  {
    for(let  i = 0 ; i < this.HeartBeatDetails.length;i++)
    {
      if(this.HeartBeatDetails[i].WorkflowID == this.selectedWorkflow && this.selectedProcess == this.HeartBeatDetails[i].ProcessID)
      {
        this.workflowstatus = this.HeartBeatDetails[i].IsActive
      }
      if(this.workflowstatus == null)
      {
        this.workflowstatus = false;
      }
    }
    console.log(this.workflowstatus)

  }
  updateStatus(status)
  {
    this.showLoading = true;
    this.rapidflowService.updateHeartBeatDetailsWCF(this.selectedProcess.toString(),this.selectedWorkflow.toString(),this.currentLoggedInUser.Email,this.reason, status).subscribe((response) => {
      let result = response.json();
      this.showLoading = false;
      if(result == 'True')
      {
        for(let  i = 0 ; i < this.HeartBeatDetails.length;i++)
        {
          if(this.HeartBeatDetails[i].WorkflowID == this.selectedWorkflow && this.selectedProcess == this.HeartBeatDetails[i].ProcessID)
          {
            if(status == 'Activate')
            {
              this.HeartBeatDetails[i].IsActive = true;
            }
            else
            {
              this.HeartBeatDetails[i].IsActive = false;
            }
          }
        }
        this.setStatusValue();
      }
      else
      {
        alert('Some error occurred..')
      }
     
      //this.popupselectedWorkflow = this.workflows[0].value;
    },
      (error) => {
        console.log(error);
      }
    );
  }
  registerNewWorkflow()
  {
    this.showLoading=true;
    let settingObject = {
      processId:this.newVersion.value.ProcessID.toString(),
      processTitle:this.newVersion.value.ProcessName,
      processReference:this.newVersion.value.ProcessReference,
      processDescription:this.newVersion.value.ProcessDescription,
      organization:this.newVersion.value.Organization,
      processOwnerEmail:this.newVersion.value.ProcessOwnerEmail,

      processAdministratorEmail:this.newVersion.value.ProcessAdminEmail,
      startDateTime:'2018-06-29 05:23:38.000',
      lastRunDateTime:'2018-06-29 05:23:38.000',
      transactionCount:"0",
      uniqueUserCount:"0",
      rapidFlowVersion:"6.0",
      workflowId:this.newVersion.value.WorkflowID.toString(),
      workflowName:this.newVersion.value.WorkflowName,
      processCMDBID:this.newVersion.value.ProcessCMDBID,
      processVersion: this.newVersion.value.ProcessVersion,
      operationType: 'PROCESS',
      diagnosticLogging:'false'

    }
    let addNewWorkflowResult = this.socket.callWebSocketService('registerProcessHeartbeat', settingObject);
    addNewWorkflowResult.then((result) => {

      if(result.Error!=undefined)
      {
        alert(result.Error)
      }
      else if(result=="True"){
        alert("successfully registered!");
        //this.retrieveAndFillProcessesDropDown();
        this.getHeartbeatData()
        this.showImportTemplateDialog = false;
      }
      else{
        alert("Error while adding process. Please check console for error");
      }
  
      this.showLoading=false;
      console.log(result);
      
      

    }).catch((error) => {
      alert("Error while adding process. Please check console for error");
      console.log(error)
      this.showLoading=false;
    })
  }
}

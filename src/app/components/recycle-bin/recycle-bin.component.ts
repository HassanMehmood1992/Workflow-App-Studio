import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-recycle-bin',
  templateUrl: './recycle-bin.component.html',
  styleUrls: ['./recycle-bin.component.css']
})
export class RecycleBinComponent implements OnInit {
  allProcessConfigData: any = [];
  allObjectsInfo: any = [];
  allObjectKeys: any = [];
  selectedProcess: number;
  selectedObject: any;
  selectedObjectIndex: any = 0;
  selectedObjectDetails: any;
  selectedObjectDetailsDropDown = [];
  selectedItem: any;
  selectedItemDetails:any;
  isItemDeleted:boolean = false;
  workflowNames:any;
  selectedItemWorkflowName:any;
  selectedWorkflowTemplate:any;
  @Input('selectedProcessInput')
  set selectedProcessInput(value: number) {
    if (value == undefined) {
      return;
    }
    this.selectedProcess = value;
    this.allProcessConfigData = [];
    this.loadAllObjectsInfo();

  }
  @Input('allProcessConfigDataInput')
  set allProcessConfigDataInput(value: any) {
    if (value == undefined) {
      return;
    }
    this.allProcessConfigData = value;

  }

  constructor(private rapidflowService: RapidflowService) { }

  ngOnInit() {
  }

  loadAllObjectsInfo() {
    this.rapidflowService.retrieveConfigurationData("AllObjects", this.selectedProcess).subscribe((response) => {
      this.allObjectsInfo = JSON.parse(response.json()).ConfigurationData;
      console.log(this.allObjectsInfo);
      this.getProcessObjects();
    });
  }

  getProcessObjects(){
    this.allObjectKeys = []; 
    for(let i=0;i<this.allObjectsInfo.length;i++){
      for(let key in this.allObjectsInfo[i]){
        if(this.allObjectKeys.indexOf(key) == -1){
          this.allObjectKeys.push(key);
        }
      }
    }
    this.tabChanged("");
  }

  tabChanged(evt){
    if(evt == ""){
      this.selectedObjectIndex = 0;
      this.selectedObject = this.allObjectKeys[0];
    }
    else{
      this.selectedObjectIndex = evt.index;
      this.selectedObject = this.allObjectKeys[this.selectedObjectIndex];
    }
    this.selectedObjectDetails = [];
    for(let i=0;i<this.allObjectsInfo.length;i++){
      for(let key in this.allObjectsInfo[i]){
        if(this.selectedObject.indexOf(key) != -1){
          this.selectedObjectDetails = JSON.parse(this.allObjectsInfo[i][key]);
        }
      }
    }

    if(this.selectedObject != "NotificationTemplates"){
      this.selectedObjectDetailsDropDown = [];
      for(let count = 0;count<this.selectedObjectDetails.length;count++){
        let obj = {};
        obj["label"] = this.selectedObjectDetails[count]["Title"];
        switch(this.selectedObject){
          case "Workflows":
            obj["value"] = this.selectedObjectDetails[count]["WorkflowID"];
          break;
          case "Lookups":
            obj["value"] = this.selectedObjectDetails[count]["LookupID"];
          break;
          case "Reports":
          case "Pivots":
          case "Addons":
          case "StoredQueries":
            obj["value"] = this.selectedObjectDetails[count]["ProcessObjectID"];
          break;
          case "CustomRoles":
          break;
        }
        this.selectedObjectDetailsDropDown.push(obj);
      }
      this.checkItemStatus("");  
    }
    else{
      this.selectedObjectDetailsDropDown = [];
      this.workflowNames = [];
      var tempArrayWorkflowName = [];
      var tempArrayWorkflowId = [];
      for(let count = 0;count<this.selectedObjectDetails.length;count++){
        if(tempArrayWorkflowName.indexOf(this.selectedObjectDetails[count]["WorkflowName"]) == -1){
          tempArrayWorkflowName.push(this.selectedObjectDetails[count]["WorkflowName"]);
          tempArrayWorkflowId.push(this.selectedObjectDetails[count]["WorkflowID"]);
        }
      }

      for(let j=0;j<tempArrayWorkflowId.length;j++){
        let obj = {};
        obj["label"] = tempArrayWorkflowName[j];
        obj["value"] = tempArrayWorkflowId[j];
        this.workflowNames.push(obj);
      }
      this.populateTemplates("");
    }
  }

  populateTemplates(evt){
    this.selectedObjectDetailsDropDown = [];
    if(evt == ""){
      this.selectedItemWorkflowName = this.workflowNames[0].value;
      for(let count = 0;count<this.selectedObjectDetails.length;count++){
        if(this.workflowNames[0].label.indexOf(this.selectedObjectDetails[count]["WorkflowName"]) != -1){
          var obj = {};
          obj["label"] = this.selectedObjectDetails[count]["NotificationType"];
          obj["value"] = this.selectedObjectDetails[count]["NotificationTypeID"];
          this.selectedObjectDetailsDropDown.push(obj);
        }
      }
    }
    else{
      for(let count = 0;count<this.selectedObjectDetails.length;count++){
        if(this.selectedObjectDetails[count]["WorkflowID"] == evt.value){
          var obj = {};
          obj["label"] = this.selectedObjectDetails[count]["NotificationType"];
          obj["value"] = this.selectedObjectDetails[count]["NotificationTypeID"];
          this.selectedObjectDetailsDropDown.push(obj);
        }
      }
    }
    this.checkItemStatus("");
  }

  checkItemStatus(evt){
    this.selectedItem = [];
    if(evt == ""){
      if(this.selectedObjectDetailsDropDown[0] != undefined){
        if(this.selectedObject != "NotificationTemplates"){
          this.selectedItem = this.selectedObjectDetailsDropDown[0].value;
        }
        else{
          this.selectedItem = this.selectedObjectDetailsDropDown[0].value; 
        }
      }
      else{
        this.selectedItem = undefined;
      }
    }
    else{
      this.selectedItem = evt.value;
    }

    if(this.selectedItem == undefined){
      for(let i=0;i<this.selectedObjectDetails.length;i++){
        if(this.selectedObjectDetails[i]["Active"] != undefined){
          if(this.selectedObjectDetails[i]["Active"]){
            this.isItemDeleted = false;
          }
          else{
            this.isItemDeleted = true;
          }
        }
        else{
          this.isItemDeleted = true;
        }
      }
    }
    else{
      for(let i=0;i<this.selectedObjectDetails.length;i++){
        switch(this.selectedObject){
          case "Workflows":
            if(this.selectedObjectDetails[i]["WorkflowID"] == this.selectedItem){
              if(this.selectedObjectDetails[i]["Deleted"] != undefined){
                if(this.selectedObjectDetails[i]["Deleted"]){
                  this.isItemDeleted = true;
                }
                else{
                  this.isItemDeleted = false;
                }
              }
              else{
                this.isItemDeleted = false;
              }
            }
          break;
          case "Lookups":
            if(this.selectedObjectDetails[i]["LookupID"] == this.selectedItem){
              if(this.selectedObjectDetails[i]["Deleted"] != undefined){
                if(this.selectedObjectDetails[i]["Deleted"]){
                  this.isItemDeleted = true;
                }
                else{
                  this.isItemDeleted = false;
                }
              }
              else{
                this.isItemDeleted = false;
              }
            }
          break;
          case "Reports":
          case "Pivots":
          case "Addons":
          case "StoredQueries":
            if(this.selectedObjectDetails[i]["ProcessObjectID"] == this.selectedItem){
              if(this.selectedObjectDetails[i]["Deleted"] != undefined){
                if(this.selectedObjectDetails[i]["Deleted"]){
                  this.isItemDeleted = true;
                }
                else{
                  this.isItemDeleted = false;
                }
              }
              else{
                this.isItemDeleted = false;
              }
            }
          break;
          case "NotificationTemplates":
            if(this.selectedObjectDetails[i]["NotificationTypeID"] == this.selectedItem && this.selectedObjectDetails[i]["WorkflowID"] == this.selectedItemWorkflowName){
              if(this.selectedObjectDetails[i]["Deleted"] != undefined){
                if(this.selectedObjectDetails[i]["Deleted"]){
                  this.isItemDeleted = true;
                }
                else{
                  this.isItemDeleted = false;
                }
              }
              else{
                this.isItemDeleted = false;
              }
            }
          break;
          case "CustomRoles":
          break;
        }          
      }
    }
  }

  updateItem(value){
    var currentObject = "";
    var currentObjectDetails:any;
    switch(this.selectedObject){
      case "Process":
        currentObject = "Process";
        currentObjectDetails = this.selectedProcess;
      break;
      case "Workflows":
        currentObject = "ProcessWorkflow";
        currentObjectDetails = this.selectedItem;
      break;
      case "Lookups":
        currentObject = "ProcessLookup";
        currentObjectDetails = this.selectedItem;
      break;
      case "Reports":
      case "Pivots":
      case "Addons":
      case "StoredQueries":
        currentObject = "ProcessObject";
        currentObjectDetails = this.selectedItem;
      break;
      case "NotificationTemplates":
        currentObject = "NotificationTemplate";
        currentObjectDetails = {
          ProcessID: this.selectedProcess.toString(),
          WorkflowID: this.selectedItemWorkflowName.toString(),
          NotificationTypeID: this.selectedItem.toString()
        };
      break;
      case "CustomRoles":
      break;
    }
    this.rapidflowService.deleteRestoreObject(currentObject,JSON.stringify(currentObjectDetails),value).subscribe((response) => {
      var result = JSON.parse(response.json());
      if (result != null) {
        if (result["Result"] != undefined) {
          if (result["Result"].toLowerCase() == "success") {
            alert("Setting Update Successfully!");
            this.loadAllObjectsInfo();
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
    });
  }

}

import { TreeNode } from 'primeng/api';
import { Component, OnInit, Input } from '@angular/core';
import { RapidflowService } from '../../../services/rapidflow.service';

@Component({
  selector: 'app-export-new',
  templateUrl: './export-new.component.html',
  styleUrls: ['./export-new.component.css']
})
export class ExportNewComponent implements OnInit {
  allProcessConfigData: any = [];
  allObjectsInfo: any = [];
  selectedProcess: number;
  selectedItems: any;
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
    this.selectedProcess = value;
    this.allProcessConfigData = [];
    this.selectedItems = [];
    console.log(this.allProcessConfigData);
    this.loadAllObjectsInfo();

  }
  @Input('allProcessConfigDataInput')
  set allProcessConfigDataInput(value: any) {
    if (value == undefined) {
      return;
    }
    this.allProcessConfigData = value;

  }


  constructor(private rapidflowService: RapidflowService) {

  }
  exportNewObjectsTree: any

  ngOnInit() {


  }


  loadAllObjectsInfo() {
    this.loadSubscription=this.rapidflowService.retrieveConfigurationData("AllObjects", this.selectedProcess).subscribe((response) => {
      this.allObjectsInfo = JSON.parse(response.json()).ConfigurationData;
      console.log(this.allObjectsInfo);
      this.getDistinctWorkflows();
      
      this.generateProcessTreeFromInfo();
    });
  }

  getDistinctWorkflows(){
    if(this.allObjectsInfo[0].Workflows)
    {
      let tempWorkflows=JSON.parse(this.allObjectsInfo[0].Workflows);
      let workflowsAdded=[];
      this.allObjectsInfo[0].DistinctWorkflows=[];
      for(let i=0;i<tempWorkflows.length;i++)
      {
        if(workflowsAdded.indexOf(tempWorkflows[i].WorkflowID)==-1)
        {
          this.allObjectsInfo[0].DistinctWorkflows.push(
            {
              Title:tempWorkflows[i].Name,
              WorkflowID:tempWorkflows[i].WorkflowID
            }
          );
          workflowsAdded.push(tempWorkflows[i].WorkflowID);
          
        }
      }
      this.allObjectsInfo[0].DistinctWorkflows=JSON.stringify(this.allObjectsInfo[0].DistinctWorkflows);
    }
  
  }

  generateProcessTreeFromInfo() {
    this.exportNewObjectsTree = [
      {
        "label": "Process",
        "data": "Process",
        "expandedIcon": "fa-file-alt",
        "collapsedIcon": "fa-file-alt"

      }
    ];
    for (let key in this.allObjectsInfo[0]) {
      if (key == "Workflows") {
        this.addNewItemToNode("Workflows", "Workflows", "fa-file-alt", this.allObjectsInfo[0][key], "Title", "WorkflowID")
      }
      else if (key == "Reports") {
        this.addNewItemToNode("Reports", "Reports", "fa-archive", this.allObjectsInfo[0][key], "Title", "ProcessObjectID")
      }
      else if (key == "Pivots") {
        this.addNewItemToNode("Pivots", "Pivots", "fa-archive", this.allObjectsInfo[0][key], "Title", "ProcessObjectID")
      }
      else if (key == "Addons") {
        this.addNewItemToNode("Addons", "Addons", "fa-archive", this.allObjectsInfo[0][key], "Title", "ProcessObjectID")
      }
      else if (key == "StoredQueries") {
        this.addNewItemToNode("StoredQueries", "StoredQueries", "fa-archive", this.allObjectsInfo[0][key], "Title", "ProcessObjectID")
      }
      else if (key == "Lookups") {
        this.addNewItemToNode("Lookups", "Lookups", "fa-search", this.allObjectsInfo[0][key], "Title", "LookupID")
      }
      else if (key == "NotificationTemplates") {
        this.addNewItemToNode("Notifications", "Notifications", "fa-file-alt", this.allObjectsInfo[0]["DistinctWorkflows"], "Title", "WorkflowID")
        this.addSubChildrenToNode("Notifications", "", this.allObjectsInfo[0][key], "WorkflowID", "NotificationType", "NotificationTypeID")
      }

    }
  }

  addNewItemToNode(itemLabel, itemData, icons, itemsArray, labelKey, dataKey) {
    this.exportNewObjectsTree.push({
      "label": itemLabel,
      "data": itemData,
      "expandedIcon": icons,
      "collapsedIcon": icons,
      "children": this.getChildrenArrayForItemType(itemsArray, labelKey, dataKey)
    });

  }

  getChildrenArrayForItemType(itemsArray, labelKey, dataKey) {
    let childrenArray = [];
    let currentItems = JSON.parse(itemsArray)
    for (let i = 0; i < currentItems.length; i++) {
      childrenArray.push({
        "label": currentItems[i][labelKey],
        "data": currentItems[i][dataKey]
      });
    }

    return childrenArray;
  }

  addSubChildrenToNode(nodeToAdd, icons, itemsArray, dataKeyToMatch, childLabelKey, childDataKey) {
    itemsArray = JSON.parse(itemsArray);
    for (let i = 0; i < this.exportNewObjectsTree.length; i++) {
      if (this.exportNewObjectsTree[i].data == nodeToAdd) {
        for (let j = 0; j < this.exportNewObjectsTree[i].children.length; j++) {
          this.exportNewObjectsTree[i].children[j].children = [];
          for (let k = 0; k < itemsArray.length; k++) {
            if (this.exportNewObjectsTree[i].children[j].data == itemsArray[k][dataKeyToMatch]) {
              this.exportNewObjectsTree[i].children[j].children.push({
                "label": itemsArray[k][childLabelKey],
                "data": itemsArray[k][childDataKey]
              });
            }
          }
        }
      }
    }
    console.log(this.exportNewObjectsTree);

  }

  generateExportScript() {
    let processConfigItems=this.getProcessCofigItemsJSON();
    let exportJSON: any = {
      ExportInfo: {
        Operation: "Add",
        ProcessReference: processConfigItems.ProcessReference,
        ProcessName: processConfigItems.ProcessReference,
        ProcessID: this.selectedProcess.toString()
      }
    };
    let itemTypesAdded=[];
    exportJSON.Items = {};
    for (let i = 0; i < this.selectedItems.length; i++) {
      if (this.selectedItems[i].children != undefined && this.selectedItems[i].parent == undefined) {
        if (this.selectedItems[i].data == "Workflows") {
          if (exportJSON.Items.Workflows == undefined) {
            exportJSON.Items.Workflows = [];
            itemTypesAdded.push("Workflows");
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Workflows", this.selectedItems[i].children[j].data, "WorkflowID",this.selectedItems[i].children[j].label)
            if (currentItemValue) {
              exportJSON.Items.Workflows.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }

        if (this.selectedItems[i].data == "Lookups") {
          if (exportJSON.Items.Lookups == undefined) {
            exportJSON.Items.Lookups = [];
            itemTypesAdded.push("Lookups");
            
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Lookups", this.selectedItems[i].children[j].data, "LookupID")
            if (currentItemValue) {
              exportJSON.Items.Lookups.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }



        if (this.selectedItems[i].data == "Reports") {
          if (exportJSON.Items.Reports == undefined) {
            exportJSON.Items.Reports = [];
            itemTypesAdded.push("Reports");
            
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Reports", this.selectedItems[i].children[j].data, "ProcessObjectID")
            if (currentItemValue) {
              exportJSON.Items.Reports.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }

        if (this.selectedItems[i].data == "Pivots") {
          if (exportJSON.Items.Pivots == undefined) {
            exportJSON.Items.Pivots = [];
            itemTypesAdded.push("Pivots");
            
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Pivots", this.selectedItems[i].children[j].data, "ProcessObjectID")
            if (currentItemValue) {
              exportJSON.Items.Pivots.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }


        if (this.selectedItems[i].data == "Addons") {
          if (exportJSON.Items.Addons == undefined) {
            exportJSON.Items.Addons = [];
            itemTypesAdded.push("Addons");
            
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Addons", this.selectedItems[i].children[j].data, "ProcessObjectID")
            if (currentItemValue) {
              exportJSON.Items.Addons.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }


        if (this.selectedItems[i].data == "StoredQueries") {
          if (exportJSON.Items.StoredQueries == undefined) {
            exportJSON.Items.StoredQueries = [];
            itemTypesAdded.push("StoredQueries");
            
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("StoredQueries", this.selectedItems[i].children[j].data, "ProcessObjectID")
            if (currentItemValue) {
              exportJSON.Items.StoredQueries.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }

        if (this.selectedItems[i].data == "Notifications") {
          if (exportJSON.Items.Notifications == undefined) {
            exportJSON.Items.Notifications = [];
            itemTypesAdded.push("Notifications");
            
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {

            for(let k=0;k<this.selectedItems[i].children[j].children.length;k++)
            {
              let currentItemValue = this.getItemValueForExport("Notifications", [this.selectedItems[i].children[j].data,this.selectedItems[i].children[j].children[k].data], ["WorkflowID","NotificationTypeID"])
              if (currentItemValue) {
                exportJSON.Items.Notifications.push({
                  Name: this.selectedItems[i].children[j].label+" - "+this.selectedItems[i].children[j].children[k].label,
                  ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                  Value: currentItemValue
                });
              }
            }
           
          }
        }




      }
      else if (this.selectedItems[i].children == undefined && this.selectedItems[i].parent == undefined) {
        if (this.selectedItems[i].data == "Process") {
          exportJSON.Process = processConfigItems;
        }
      }
    }


    let notificationsForWorkflowAdded=[];
    for(let i=0;i<this.selectedItems.length;i++)
    {
        if (this.selectedItems[i].children != undefined && this.selectedItems[i].parent != undefined)
        {
          if(this.selectedItems[i].parent.data=="Notifications" && itemTypesAdded.indexOf("Notifications")==-1)
          {
            if (exportJSON.Items.Notifications == undefined) {
              exportJSON.Items.Notifications = [];
            }
            for(let j=0;j<this.selectedItems[i].children.length;j++)
            {
              let currentItemValue = this.getItemValueForExport("Notifications", [this.selectedItems[i].data,this.selectedItems[i].children[j].data], ["WorkflowID","NotificationTypeID"])
              if (currentItemValue) {
                exportJSON.Items.Notifications.push({
                  Name: this.selectedItems[i].label+" - "+this.selectedItems[i].children[j].label,
                  ObjectIdentity: this.selectedItems[i].data.toString(),
                  Value: currentItemValue
                });
              }
            }
           notificationsForWorkflowAdded.push(this.selectedItems[i].data); 
          }
         }
    }    



    for(let i=0;i<this.selectedItems.length;i++)
    {
      if (this.selectedItems[i].children == undefined && this.selectedItems[i].parent != undefined) {
        if (this.selectedItems[i].parent.data == "Workflows"&&itemTypesAdded.indexOf("Workflows")==-1) {
          if (exportJSON.Items.Workflows == undefined) {
            exportJSON.Items.Workflows = [];
          }
          let currentItemValue = this.getItemValueForExport("Workflows", this.selectedItems[i].data, "WorkflowID",this.selectedItems[i].label)
          if (currentItemValue) {
            exportJSON.Items.Workflows.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }

        }
        else if (this.selectedItems[i].parent.data == "Lookups" && itemTypesAdded.indexOf("Lookups")==-1) {
          if (exportJSON.Items.Lookups == undefined) {
            exportJSON.Items.Lookups = [];
          }
          let currentItemValue = this.getItemValueForExport("Lookups", this.selectedItems[i].data, "LookupID")
          if (currentItemValue) {
            exportJSON.Items.Lookups.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }
        }

        else if (this.selectedItems[i].parent.data == "Reports" && itemTypesAdded.indexOf("Reports")==-1) {
          if (exportJSON.Items.Reports == undefined) {
            exportJSON.Items.Reports = [];
          }
          let currentItemValue = this.getItemValueForExport("Reports", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            exportJSON.Items.Reports.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }
        }

        else if (this.selectedItems[i].parent.data == "Pivots" && itemTypesAdded.indexOf("Pivots")==-1) {
          if (exportJSON.Items.Pivots == undefined) {
            exportJSON.Items.Pivots = [];
          }
          let currentItemValue = this.getItemValueForExport("Pivots", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            exportJSON.Items.Pivots.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }
        }


        else if (this.selectedItems[i].parent.data == "Addons" && itemTypesAdded.indexOf("Addons")==-1) {
          if (exportJSON.Items.Addons == undefined) {
            exportJSON.Items.Addons = [];
          }
          let currentItemValue = this.getItemValueForExport("Addons", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            exportJSON.Items.Addons.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }
        }

        else if (this.selectedItems[i].parent.data == "StoredQueries" && itemTypesAdded.indexOf("StoredQueries")==-1) {
          if (exportJSON.Items.StoredQueries == undefined) {
            exportJSON.Items.StoredQueries = [];
          }
          let currentItemValue = this.getItemValueForExport("StoredQueries", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            exportJSON.Items.StoredQueries.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }
        }
        else if (this.selectedItems[i].parent.parent!=undefined&&this.selectedItems[i].parent.parent.data == "Notifications" && itemTypesAdded.indexOf("Notifications")==-1) {
          if(notificationsForWorkflowAdded.indexOf(this.selectedItems[i].parent.data)==-1)
          {
            if (exportJSON.Items.Notifications == undefined) {
              exportJSON.Items.Notifications = [];
            }
            let currentItemValue = this.getItemValueForExport("Notifications", [this.selectedItems[i].parent.data,this.selectedItems[i].data], ["WorkflowID","NotificationTypeID"])
            if (currentItemValue) {
              exportJSON.Items.Notifications.push({
                Name: this.selectedItems[i].parent.label+" - "+this.selectedItems[i].label,
                ObjectIdentity: this.selectedItems[i].data.toString(),
                Value: currentItemValue
              });
            }
          }
       
        }

         
      }
    }


    console.log(exportJSON);
    this.downloadJSON("Export New", JSON.stringify(exportJSON));
  }

  getItemValueForExport(itemType, itemID, itemIDName,itemLabel?) {

    try {
      for (let i = 0; i < this.allProcessConfigData.length; i++) {
        if (this.allProcessConfigData[i].name == itemType) {
          for (let j = 0; j < this.allProcessConfigData[i].val.length; j++) {

            if(itemType=="Workflows")
            {
              if (this.allProcessConfigData[i].val[j][itemIDName] == itemID&&this.allProcessConfigData[i].val[j]["Version"]==this.getWorkflowVersionFromName(itemLabel)) {
                return this.allProcessConfigData[i].val[j];
              }
            }
            else if(itemType=="Notifications")
            {
              if (this.allProcessConfigData[i].val[j][itemIDName[0]] == itemID[0]&&this.allProcessConfigData[i].val[j][itemIDName[1]] == itemID[1]) {
                return this.allProcessConfigData[i].val[j];
              }
            }
            else{

              if (this.allProcessConfigData[i].val[j][itemIDName] == itemID) {
                return this.allProcessConfigData[i].val[j];
              }
            }

            
          }
        }
      }
      return false;
    }
    catch (ex) {
      return false
    }


  }

  getProcessCofigItemsJSON() {
    let processItemsJSON: any = {
      ObjectIdentity: this.selectedProcess.toString(),
      Description: ""
    };
    for (let i = 0; i < this.allProcessConfigData.length; i++) {
      if (this.allProcessConfigData[i].name == "Process") {
        for (let j = 0; j < this.allProcessConfigData[i].val.length; j++) {
          if (this.allProcessConfigData[i].val[j].Item == "ProcessImage") {
            processItemsJSON.ProcessImage = this.allProcessConfigData[i].val[j].Value
            processItemsJSON.ProcessImageID = this.allProcessConfigData[i].val[j].ID.toString();

          }
          else if (this.allProcessConfigData[i].val[j].Item == "ProcessName") {
            processItemsJSON.Name = this.allProcessConfigData[i].val[j].Value

          }
          else if (this.allProcessConfigData[i].val[j].Item == "ProcessReference") {
            processItemsJSON.ProcessReference = this.allProcessConfigData[i].val[j].Value

          }
          else if (this.allProcessConfigData[i].val[j].Item == "Organization") {
            processItemsJSON.OrganizationID = this.allProcessConfigData[i].val[j].ID.toString();

          }
          else if (this.allProcessConfigData[i].val[j].Item == "GlobalSettingsJSON") {
            processItemsJSON.GlobalSettingsJSON = this.allProcessConfigData[i].val[j].Value;

          }
        }
      }
    }
    processItemsJSON.OrganizationName=this.getSelectedOrganizationName(processItemsJSON.OrganizationID);
    return processItemsJSON;
  }

  downloadJSON(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }


  getSelectedOrganizationName(selectedOrganization){
    let organizations=JSON.parse(window.localStorage["Organizations"])
    for(let i=0;i<organizations.length;i++)
    {
      if(organizations[i].value==selectedOrganization)
      {
        return organizations[i].label;
      }
    }
    return "N/A"
  }

  getWorkflowVersionFromName(workflowName){
   
    let rex = /\d+(?=\))/g;
    let matches = workflowName.match(rex);
    if(matches==null)
    {
      return 0
    }
    else{
      return matches[matches.length-1]
    }
  }
}

import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-export-update',
  templateUrl: './export-update.component.html',
  styleUrls: ['./export-update.component.css']
})
export class ExportUpdateComponent implements OnInit {
  allProcessConfigData: any = [];
  allObjectsInfo: any = [];
  selectedProcess: number;
  configurationItemTypes: any = [];
  selectedItems: any;
  exportJSON: any = {};
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
    this.configurationItemTypes = {

      Workflows: [
        {
          "label": "WorkflowSettingsJSON",
          "data": "WorkflowSettingsJSON"
        },
        {
          "label": "FormHTML",
          "data": "FormHTML"
        },
        {
          "label": "FormLogic",
          "data": "FormController"
        },
        {
          "label": "WorkflowTasksJSON",
          "data": "WorkflowTasksJSON"
        },
        {
          "label": "DefaultValuesJSON",
          "data": "DefaultValuesJSON"
        },
        {
          "label": "RepeatingTableJSON",
          "data": "RepeatingTableJSON"
        },
        {
          "label": "PdfCss",
          "data": "PdfCss"
        }
      ],
      Reports: [
        {
          "label": "ObjectDescription",
          "data": "ObjectDescription"
        },
        {
          "label": "Value",
          "data": "Value"
        }
      ],
      Lookups: [
        {
          "label": "LookupDefinition",
          "data": "LookupDefinition"
        },
        {
          "label": "LookupHTML",
          "data": "LookupHTML"
        },

        {
          "label": "LookupController",
          "data": "LookupController"
        }
      ],
      Notifications:[
        {
          "label": "PushNotificationMessage",
          "data": "PushNotificationMessage"
        },
        {
          "label": "EmailSubject",
          "data": "EmailSubject"
        },
        {
          "label": "EmailBody",
          "data": "EmailBody"
        },
        {
          "label": "AppNotificationSubject",
          "data": "AppNotificationSubject"
        },
        {
          "label": "AppNotificationBody",
          "data": "AppNotificationBody"
        },
        {
          "label": "Description",
          "data": "Description"
        }
      ]


    }
    this.configurationItemTypes.Addons = this.configurationItemTypes.Reports;
    this.configurationItemTypes.Pivots = this.configurationItemTypes.Reports;
    this.configurationItemTypes.StoredQueries = this.configurationItemTypes.StoredQueries;


  }

  exportUpdateObjectsTree: any
  exportSelectedItems() {
    console.log(this.allProcessConfigData);
  }
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
    this.exportUpdateObjectsTree = [
      {
        "label": "Process",
        "data": "Process",
        "expandedIcon": "fa-file-alt",
        "collapsedIcon": "fa-file-alt",
        "children": [
          {
            "label": "ProcessName",
            "data": "ProcessName"
          },
          {
            "label": "ProcessReference",
            "data": "ProcessReference"
          },
          {
            "label": "ProcessImage",
            "data": "ProcessImage"
          },
          {
            "label": "GlobalSettingsJSON",
            "data": "GlobalSettingsJSON"
          },
          {
            "label": "Organization",
            "data": "Organization"
          }
        ]

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
      else if (key == "StoredQuery") {
        this.addNewItemToNode("StoredQuery", "StoredQuery", "fa-archive", this.allObjectsInfo[0][key], "Title", "ProcessObjectID")
      }
      else if (key == "Lookups") {
        this.addNewItemToNode("Lookups", "Lookups", "fa-search", this.allObjectsInfo[0][key], "Title", "LookupID")
      }
      else if (key == "NotificationTemplates") {
        this.addNewItemToNode("Notifications", "Notifications", "fa-file-alt", this.allObjectsInfo[0]["DistinctWorkflows"], "Title", "WorkflowID")
        this.addSubChildrenToNode("Notifications", "", this.allObjectsInfo[0][key], "WorkflowID", "NotificationType", "NotificationTypeID")
      }

    }
    this.addConfigColumnsNodeToItems();
  }

  addNewItemToNode(itemLabel, itemData, icons, itemsArray, labelKey, dataKey) {
    this.exportUpdateObjectsTree.push({
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
    for (let i = 0; i < this.exportUpdateObjectsTree.length; i++) {
      if (this.exportUpdateObjectsTree[i].data == nodeToAdd) {
        for (let j = 0; j < this.exportUpdateObjectsTree[i].children.length; j++) {
          this.exportUpdateObjectsTree[i].children[j].children = [];
          for (let k = 0; k < itemsArray.length; k++) {
            if (this.exportUpdateObjectsTree[i].children[j].data == itemsArray[k][dataKeyToMatch]) {
              this.exportUpdateObjectsTree[i].children[j].children.push({
                "label": itemsArray[k][childLabelKey],
                "data": itemsArray[k][childDataKey]
              });
            }
          }
        }
      }
    }
    console.log(this.exportUpdateObjectsTree);

  }

  addConfigColumnsNodeToItems() {
    for (let i = 0; i < this.exportUpdateObjectsTree.length; i++) {
      for (let key in this.configurationItemTypes) {
        if (key == this.exportUpdateObjectsTree[i].data) {
          for (let j = 0; j < this.exportUpdateObjectsTree[i].children.length; j++) {
            if (this.exportUpdateObjectsTree[i].children[j].children == undefined) {
              this.exportUpdateObjectsTree[i].children[j].children = JSON.parse(JSON.stringify(this.configurationItemTypes[key]));
            }
            else //for notifications
            {
              for(let k=0;k<this.exportUpdateObjectsTree[i].children[j].children.length;k++)
              {
                this.exportUpdateObjectsTree[i].children[j].children[k].children = JSON.parse(JSON.stringify(this.configurationItemTypes[key]));
                
              }
            }

          }
        }
      }
    }
    console.log(this.exportUpdateObjectsTree);
  }


  generateExportScript() {
    let processConfigItems = this.getProcessCofigItemsJSON();
    this.exportJSON = {
      ExportInfo: {
        Operation: "Update",
        ProcessReference: processConfigItems.ProcessReference,
        ProcessName: processConfigItems.ProcessReference,
        ProcessID: this.selectedProcess.toString()
      }
    };

    let itemTypesAdded = [];
    this.exportJSON.Items = {};
    for (let i = 0; i < this.selectedItems.length; i++) {
      if (this.selectedItems[i].children != undefined && this.selectedItems[i].parent == undefined) {
        if (this.selectedItems[i].data == "Workflows") {
          if (this.exportJSON.Items.Workflows == undefined) {
            this.exportJSON.Items.Workflows = [];
            itemTypesAdded.push("Workflows");
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Workflows", this.selectedItems[i].children[j].data, "WorkflowID",this.selectedItems[i].children[j].label)
            if (currentItemValue) {
              let workflowObjectIdentity:any={};
              workflowObjectIdentity.WorkflowID=this.selectedItems[i].children[j].data;
              workflowObjectIdentity.Version=this.getWorkflowVersionFromName(this.selectedItems[i].children[j].label);
              workflowObjectIdentity=JSON.stringify(workflowObjectIdentity);
              this.exportJSON.Items.Workflows.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: workflowObjectIdentity,
                Value: currentItemValue
              });
            }
          }
        }


        if (this.selectedItems[i].data == "Lookups") {
          if (this.exportJSON.Items.Lookups == undefined) {
            this.exportJSON.Items.Lookups = [];
            itemTypesAdded.push("Lookups");
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Lookups", this.selectedItems[i].children[j].data, "LookupID")
            if (currentItemValue) {
              this.exportJSON.Items.Lookups.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }


        if (this.selectedItems[i].data == "Reports") {
          if (this.exportJSON.Items.Reports == undefined) {
            this.exportJSON.Items.Reports = [];
            itemTypesAdded.push("Reports");
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Reports", this.selectedItems[i].children[j].data, "ProcessObjectID")
            if (currentItemValue) {
              this.exportJSON.Items.Reports.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }


        if (this.selectedItems[i].data == "Pivots") {
          if (this.exportJSON.Items.Pivots == undefined) {
            this.exportJSON.Items.Pivots = [];
            itemTypesAdded.push("Pivots");
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Pivots", this.selectedItems[i].children[j].data, "ProcessObjectID")
            if (currentItemValue) {
              this.exportJSON.Items.Pivots.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }

        if (this.selectedItems[i].data == "StoredQueries") {
          if (this.exportJSON.Items.StoredQueries == undefined) {
            this.exportJSON.Items.StoredQueries = [];
            itemTypesAdded.push("StoredQueries");
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("StoredQueries", this.selectedItems[i].children[j].data, "ProcessObjectID")
            if (currentItemValue) {
              this.exportJSON.Items.StoredQueries.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }


        if (this.selectedItems[i].data == "Addons") {
          if (this.exportJSON.Items.Addons == undefined) {
            this.exportJSON.Items.Addons = [];
            itemTypesAdded.push("Addons");
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {
            let currentItemValue = this.getItemValueForExport("Addons", this.selectedItems[i].children[j].data, "LookupID")
            if (currentItemValue) {
              this.exportJSON.Items.Addons.push({
                Name: this.selectedItems[i].children[j].label,
                ObjectIdentity: this.selectedItems[i].children[j].data.toString(),
                Value: currentItemValue
              });
            }
          }
        }

        if (this.selectedItems[i].data == "Notifications") {
          if (this.exportJSON.Items.Notifications == undefined) {
            this.exportJSON.Items.Notifications = [];
            itemTypesAdded.push("Notifications");
            
          }
          for (let j = 0; j < this.selectedItems[i].children.length; j++) {

            for(let k=0;k<this.selectedItems[i].children[j].children.length;k++)
            {
              let currentItemValue = this.getItemValueForExport("Notifications", [this.selectedItems[i].children[j].data,this.selectedItems[i].children[j].children[k].data], ["WorkflowID","NotificationTypeID"])
              if (currentItemValue) {
                let notificationObjectIdentity:any={};
                notificationObjectIdentity.WorkflowID=this.selectedItems[i].children[j].data;
                notificationObjectIdentity.ProcessID=this.selectedProcess;
                notificationObjectIdentity.NotificationTypeID=this.selectedItems[i].children[j].children[k].data;
                notificationObjectIdentity=JSON.stringify(notificationObjectIdentity);
                this.exportJSON.Items.Notifications.push({
                  Name: this.selectedItems[i].children[j].label+" - "+this.selectedItems[i].children[j].children[k].label,
                  ObjectIdentity: notificationObjectIdentity,
                  Value: currentItemValue
                });
              }
            }
           
          }
        }

        if (this.selectedItems[i].data == "Process") {
          if (this.exportJSON.Items.Process == undefined) {
            this.exportJSON.Items.Process = [];
            itemTypesAdded.push("Process");
          }
          this.addProcessRelatedItemObject(this.selectedItems[i].children)
        }

      }

    }



    



    for (let i = 0; i < this.selectedItems.length; i++) {
      if (this.selectedItems[i].children != undefined && this.selectedItems[i].parent != undefined) {
        if (this.selectedItems[i].parent.data == "Workflows" && itemTypesAdded.indexOf("Workflows") == -1) {
          if (this.exportJSON.Items.Workflows == undefined) {
            this.exportJSON.Items.Workflows = [];
          }
          let currentItemValue = this.getItemValueForExport("Workflows", this.selectedItems[i].data, "WorkflowID",this.selectedItems[i].label)
          if (currentItemValue) {
            let workflowObjectIdentity:any={};
            workflowObjectIdentity.WorkflowID=this.selectedItems[i].data;
            workflowObjectIdentity.Version=this.getWorkflowVersionFromName(this.selectedItems[i].label);
            workflowObjectIdentity=JSON.stringify(workflowObjectIdentity);
            this.exportJSON.Items.Workflows.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: workflowObjectIdentity,
              Value: currentItemValue
            });
          }

        }

        if (this.selectedItems[i].parent.data == "Lookups" && itemTypesAdded.indexOf("Lookups") == -1) {
          if (this.exportJSON.Items.Lookups == undefined) {
            this.exportJSON.Items.Lookups = [];
          }
          let currentItemValue = this.getItemValueForExport("Lookups", this.selectedItems[i].data, "LookupID")
          if (currentItemValue) {
            this.exportJSON.Items.Lookups.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }

        }

        if (this.selectedItems[i].parent.data == "Reports" && itemTypesAdded.indexOf("Reports") == -1) {
          if (this.exportJSON.Items.Reports == undefined) {
            this.exportJSON.Items.Reports = [];
          }
          let currentItemValue = this.getItemValueForExport("Reports", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            this.exportJSON.Items.Reports.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }

        }

        if (this.selectedItems[i].parent.data == "Pivots" && itemTypesAdded.indexOf("Pivots") == -1) {
          if (this.exportJSON.Items.Pivots == undefined) {
            this.exportJSON.Items.Pivots = [];
          }
          let currentItemValue = this.getItemValueForExport("Pivots", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            this.exportJSON.Items.Pivots.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }

        }

        if (this.selectedItems[i].parent.data == "StoredQueries" && itemTypesAdded.indexOf("StoredQueries") == -1) {
          if (this.exportJSON.Items.StoredQueries == undefined) {
            this.exportJSON.Items.StoredQueries = [];
          }
          let currentItemValue = this.getItemValueForExport("StoredQueries", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            this.exportJSON.Items.StoredQueries.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }

        }

        if (this.selectedItems[i].parent.data == "Addons" && itemTypesAdded.indexOf("Addons") == -1) {
          if (this.exportJSON.Items.Addons == undefined) {
            this.exportJSON.Items.Addons = [];
          }
          let currentItemValue = this.getItemValueForExport("Addons", this.selectedItems[i].data, "ProcessObjectID")
          if (currentItemValue) {
            this.exportJSON.Items.Addons.push({
              Name: this.selectedItems[i].label,
              ObjectIdentity: this.selectedItems[i].data.toString(),
              Value: currentItemValue
            });
          }

        }


      }
    }


    let notificationsForWorkflowAdded=[];
    for(let i=0;i<this.selectedItems.length;i++)
    {
        if (this.selectedItems[i].children != undefined && this.selectedItems[i].parent != undefined && this.selectedItems[i].parent.parent == undefined)
        {
          if(this.selectedItems[i].parent.data=="Notifications" && itemTypesAdded.indexOf("Notifications")==-1)
          {
            if (this.exportJSON.Items.Notifications == undefined) {
              this.exportJSON.Items.Notifications = [];
            }
            for(let j=0;j<this.selectedItems[i].children.length;j++)
            {
              let currentItemValue = this.getItemValueForExport("Notifications", [this.selectedItems[i].data,this.selectedItems[i].children[j].data], ["WorkflowID","NotificationTypeID"])
              if (currentItemValue) {
                let notificationObjectIdentity:any={};
                notificationObjectIdentity.WorkflowID=this.selectedItems[i].data;
                notificationObjectIdentity.ProcessID=this.selectedProcess;
                notificationObjectIdentity.NotificationTypeID=this.selectedItems[i].children[j].data;
                notificationObjectIdentity=JSON.stringify(notificationObjectIdentity);
                this.exportJSON.Items.Notifications.push({
                  Name: this.selectedItems[i].label+" - "+this.selectedItems[i].children[j].label,
                  ObjectIdentity: notificationObjectIdentity,
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
      if (this.selectedItems[i].children != undefined && this.selectedItems[i].parent != undefined && this.selectedItems[i].children.children == undefined)
      {
        if (this.selectedItems[i].parent.parent!=undefined&&this.selectedItems[i].parent.parent.data == "Notifications" && itemTypesAdded.indexOf("Notifications")==-1) {
          if(notificationsForWorkflowAdded.indexOf(this.selectedItems[i].parent.data)==-1)
          {
            if (this.exportJSON.Items.Notifications == undefined) {
              this.exportJSON.Items.Notifications = [];
            }
            let currentItemValue = this.getItemValueForExport("Notifications", [this.selectedItems[i].parent.data,this.selectedItems[i].data], ["WorkflowID","NotificationTypeID"])
            if (currentItemValue) {
              let notificationObjectIdentity:any={};
              notificationObjectIdentity.WorkflowID=this.selectedItems[i].parent.data;
              notificationObjectIdentity.ProcessID=this.selectedProcess;
              notificationObjectIdentity.NotificationTypeID=this.selectedItems[i].data;
              notificationObjectIdentity=JSON.stringify(notificationObjectIdentity);
             this.exportJSON.Items.Notifications.push({
                Name: this.selectedItems[i].parent.label+" - "+this.selectedItems[i].label,
                ObjectIdentity: notificationObjectIdentity,
                Value: currentItemValue
              });
            }
          }
       
        }
      }
  
    } 



    for (let i = 0; i < this.selectedItems.length; i++) {
      if (this.selectedItems[i].children == undefined && this.selectedItems[i].parent != undefined && this.selectedItems[i].parent.partialSelected) {

        if (this.selectedItems[i].parent.data == "Process" && itemTypesAdded.indexOf("Process") == -1) {
          if (this.exportJSON.Items.Process == undefined) {
            this.exportJSON.Items.Process = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("Process", this.selectedItems[i].data, "Item", "Value", this.selectedItems[i].label)
          this.addProcessRelatedItemObject(this.selectedItems[i]);


        }
        else if (this.selectedItems[i].parent.parent.data == "Workflows" && itemTypesAdded.indexOf("Workflows") == -1) {
          if (this.exportJSON.Items.Workflows == undefined) {
            this.exportJSON.Items.Workflows = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("Workflows", this.selectedItems[i].parent.data, "WorkflowID", this.selectedItems[i].data, this.selectedItems[i].parent.label)


        }

        else if (this.selectedItems[i].parent.parent.data == "Lookups" && itemTypesAdded.indexOf("Lookups") == -1) {
          if (this.exportJSON.Items.Lookups == undefined) {
            this.exportJSON.Items.Lookups = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("Lookups", this.selectedItems[i].parent.data, "LookupID", this.selectedItems[i].data, this.selectedItems[i].parent.label)


        }


        else if (this.selectedItems[i].parent.parent.data == "Reports" && itemTypesAdded.indexOf("Reports") == -1) {
          if (this.exportJSON.Items.Reports == undefined) {
            this.exportJSON.Items.Reports = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("Reports", this.selectedItems[i].parent.data, "ProcessObjectID", this.selectedItems[i].data, this.selectedItems[i].parent.label)


        }


        else if (this.selectedItems[i].parent.parent.data == "Pivots" && itemTypesAdded.indexOf("Pivots") == -1) {
          if (this.exportJSON.Items.Pivots == undefined) {
            this.exportJSON.Items.Pivots = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("Pivots", this.selectedItems[i].parent.data, "ProcessObjectID", this.selectedItems[i].data, this.selectedItems[i].parent.label)


        }

        else if (this.selectedItems[i].parent.parent.data == "StoredQueries" && itemTypesAdded.indexOf("StoredQueries") == -1) {
          if (this.exportJSON.Items.StoredQueries == undefined) {
            this.exportJSON.Items.StoredQueries = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("StoredQueries", this.selectedItems[i].parent.data, "ProcessObjectID", this.selectedItems[i].data, this.selectedItems[i].parent.label)


        }


        else if (this.selectedItems[i].parent.parent.data == "Addons" && itemTypesAdded.indexOf("Addons") == -1) {
          if (this.exportJSON.Items.Addons == undefined) {
            this.exportJSON.Items.Addons = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("Addons", this.selectedItems[i].parent.data, "ProcessObjectID", this.selectedItems[i].data, this.selectedItems[i].parent.label)


        }

        else if (this.selectedItems[i].parent.parent.parent != undefined && this.selectedItems[i].parent.parent.parent.data== "Notifications" && itemTypesAdded.indexOf("Notifications") == -1) {
          if (this.exportJSON.Items.Notifications == undefined) {
            this.exportJSON.Items.Notifications = [];
          }
          let currentItemValue = this.addOrUpdateConfigItemValue("Notifications", [this.selectedItems[i].parent.parent.data,this.selectedItems[i].parent.data], ["WorkflowID","NotificationTypeID"], this.selectedItems[i].data, this.selectedItems[i].parent.label)


        }



        
      }
    }


    console.log(this.exportJSON);
    this.downloadJSON("Export Update", JSON.stringify(this.exportJSON));
  }


  addOrUpdateConfigItemValue(itemType, itemID, itemIDName, itemKey, itemLabel) {
    let valueUpdate: boolean = false;
    for (let i = 0; i < this.exportJSON.Items[itemType].length; i++) {

      if(itemType=="Notifications")
      {
        if (JSON.parse(this.exportJSON.Items[itemType][i]["ObjectIdentity"])[itemIDName[0]] == itemID[0]&&JSON.parse(this.exportJSON.Items[itemType][i]["ObjectIdentity"])[itemIDName[1]] == itemID[1] ) {
          this.exportJSON.Items[itemType][i].Value[itemKey] = this.getSubItemValueForExport(itemType, itemID, itemIDName, itemKey,itemLabel)
          valueUpdate = true;
  
          break;
        }
      }
      else if(itemType=="Workflows"){
        if (JSON.parse(this.exportJSON.Items[itemType][i]["ObjectIdentity"])[itemIDName] == itemID&&this.getWorkflowVersionFromName(this.exportJSON.Items[itemType][i]["Name"])==this.getWorkflowVersionFromName(itemLabel) ) {
          this.exportJSON.Items[itemType][i].Value[itemKey] = this.getSubItemValueForExport(itemType, itemID, itemIDName, itemKey,itemLabel)
          valueUpdate = true;
  
          break;
        }
      }
      else{
        if (this.exportJSON.Items[itemType][i]["ObjectIdentity"][itemIDName] == itemID&&this.getWorkflowVersionFromName(this.exportJSON.Items[itemType][i]["Name"])==this.getWorkflowVersionFromName(itemLabel) ) {
          this.exportJSON.Items[itemType][i].Value[itemKey] = this.getSubItemValueForExport(itemType, itemID, itemIDName, itemKey,itemLabel)
          valueUpdate = true;
  
          break;
        }

      }
      
      

    }

    let objectIdentityForItem:any;
    if(itemType=="Workflows")
    {
      objectIdentityForItem={};
      objectIdentityForItem.WorkflowID=itemID;
      objectIdentityForItem.Version=this.getWorkflowVersionFromName(itemLabel);
      objectIdentityForItem=JSON.stringify(objectIdentityForItem);
    }
    else if(itemType=="Notifications")
    {
      objectIdentityForItem={};
      objectIdentityForItem.WorkflowID=itemID[0];
      objectIdentityForItem.NotificationTypeID=itemID[1];
      objectIdentityForItem.ProcessID=this.selectedProcess;
      objectIdentityForItem=JSON.stringify(objectIdentityForItem);
    }
    else if(itemType=="Process")
    {
      objectIdentityForItem = this.getSubItemValueForExport(itemType, itemID, itemIDName, "ID",itemLabel)
    }
    else{
      objectIdentityForItem=itemID.toString();
    }
    if (!valueUpdate) {
      let newItemValue = {};
      newItemValue[itemKey] = this.getSubItemValueForExport(itemType, itemID, itemIDName, itemKey,itemLabel)
      if(itemType=="Process")
      {
        newItemValue=newItemValue[itemKey]
      }
      this.exportJSON.Items[itemType].push({
        Name: itemLabel,
        ObjectIdentity: objectIdentityForItem,
        Value: newItemValue
      });
    }


  }

  getItemValueForExport(itemType, itemID, itemIDName, itemLabel?) {

    try {
      for (let i = 0; i < this.allProcessConfigData.length; i++) {
        if (this.allProcessConfigData[i].name == itemType) {
          for (let j = 0; j < this.allProcessConfigData[i].val.length; j++) {

            if (itemType == "Workflows") {
              if (this.allProcessConfigData[i].val[j][itemIDName] == itemID && this.allProcessConfigData[i].val[j]["Version"] == this.getWorkflowVersionFromName(itemLabel)) {
                return this.allProcessConfigData[i].val[j];
              }
            }
            else if(itemType=="Notifications")
            {
              if (this.allProcessConfigData[i].val[j][itemIDName[0]] == itemID[0]&&this.allProcessConfigData[i].val[j][itemIDName[1]] == itemID[1]) {
                return this.allProcessConfigData[i].val[j];
              }
            }
            else {

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

  getSubItemValueForExport(itemType, itemID, itemIDName, itemKey, itemLabel) {

    try {

      let selectedItemTypesData = "";
      for (let i = 0; i < this.allProcessConfigData.length; i++) {
        if (this.allProcessConfigData[i].name == itemType) {
          for (let j = 0; j < this.allProcessConfigData[i].val.length; j++) {
            if (itemType == "Workflows") {
              if (this.allProcessConfigData[i].val[j][itemIDName] == itemID && this.allProcessConfigData[i].val[j]["Version"] == this.getWorkflowVersionFromName(itemLabel)) {
                return this.allProcessConfigData[i].val[j][itemKey];
              }
            }
            else if (itemType == "Notifications") {
              if (this.allProcessConfigData[i].val[j][itemIDName[0]] == itemID[0]&&this.allProcessConfigData[i].val[j][itemIDName[1]] == itemID[1]) {
                return this.allProcessConfigData[i].val[j][itemKey];
              }
            }
            else {

              if (this.allProcessConfigData[i].val[j][itemIDName] == itemID) {
                return this.allProcessConfigData[i].val[j][itemKey];
              }
            }
          }
        }
      }
      return selectedItemTypesData;
    }
    catch (ex) {
      return false
    }


  }


  addProcessRelatedItemObject(selectedItems) {
    for (let i = 0; i < selectedItems.length; i++) {
      let processItemToPush = this.getProcessSingleConfigItemValue(selectedItems[i].data)
      if (processItemToPush) {
        this.exportJSON.Items.Process.push(processItemToPush);
      }

    }
  }

  getProcessSingleConfigItemValue(typeName) {
    for (let i = 0; i < this.allProcessConfigData.length; i++) {
      if (this.allProcessConfigData[i].name == "Process") {
        for (let j = 0; j < this.allProcessConfigData[i].val.length; j++) {
          if (this.allProcessConfigData[i].val[j].Item == typeName) {
            return {
              Name: typeName,
              ObjectIdentity: this.allProcessConfigData[i].val[j].ID,
              Value: this.allProcessConfigData[i].val[j].Value,
            };
          }
        }
      }
    }
    return false;
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
        }
      }
    }
    processItemsJSON.OrganizationName = this.getSelectedOrganizationName(processItemsJSON.OrganizationID);
    return processItemsJSON;
  }

  updateProcessArrayInExportJSON(processArray) {
    let newProcessArray = [];
    for (let i = 0; i < processArray.length; i++) {

    }
  }

  getProcessItemBasedOnKey(key) {
    let processItemTypesMapping = {
      "Organization": "Organization",
      "ProcessReference": "Process",
      "ProcessName": "Process",
      "ProcessImage": "ProcessObjects",
    }
    for (let i = 0; i < this.allProcessConfigData.length; i++) {
      if (this.allProcessConfigData[i].name == "Process") {
        for (let j = 0; j < this.allProcessConfigData[i].val.length; j++) {
          if (this.allProcessConfigData[i].val[j].Item == key) {

          }
        }
      }
    }
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


  getSelectedOrganizationName(selectedOrganization) {
    let organizations = JSON.parse(window.localStorage["Organizations"])
    for (let i = 0; i < organizations.length; i++) {
      if (organizations[i].value == selectedOrganization) {
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

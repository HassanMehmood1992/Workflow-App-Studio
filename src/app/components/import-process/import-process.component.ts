import { SocketProvider } from './../../services/socket.service';
import { TreeNode } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { Message } from 'primeng/components/common/message';

@Component({
  selector: 'app-import-process',
  templateUrl: './import-process.component.html',
  styleUrls: ['./import-process.component.css']
})
export class ImportProcessComponent implements OnInit {

  msgs: Message[];
  showTree: boolean;
  importObjectsTree: TreeNode[]
  uploadedFiles: any[] = [];
  selectedFileText: string = "";
  selectedFileTextJSON: any;
  importHeaderObject: any
  fileImported: boolean = false;
  resultJSONDownloaded=false;
  importStatusText: string = "";
  importOperation: string = "";
  importProgress: number = 0;
  resultJSON:any=[];
  itemTypes = {
    Workflows: "ProcessWorkflow",
    Lookups: "ProcessLookup",
    Process: "Process",
    Reports: "ProcessObject",
    Pivots: "ProcessObject",
    Addons: "ProcessObject",
    StoredQueries: "ProcessObject",
    Notifications:"NotificationTemplate"
  }
  importing: boolean = false;
  constructor(private socket: SocketProvider) {
    this.showTree = false;
  }

  unwantedKeysForUpdate={
    Workflows:["WorkflowID","Version","WorkflowName"],
    Reports:["ProcessObjectID"],
    Pivots:["ProcessObjectID"],
    Addons:["ProcessObjectID"],
    StoredQueries:["ProcessObjectID"],
    Notifications:["ProcessID","WorkflowID","NotificationTypeID","NotificationType","WorkflowName","ProcessName"],
    Lookups:["LookupID"],
    Process:[]
  }

  ngOnInit() {


  }
  onFileSelect(fileSelectEvent) {
    let textFile = fileSelectEvent.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      this.selectedFileText = e.target.result;
      try {
        this.selectedFileTextJSON = JSON.parse(this.selectedFileText);
         if (this.selectedFileTextJSON.ExportInfo.Operation == "Add") {
          this.importOperation = "added";
        }
        else if (this.selectedFileTextJSON.ExportInfo.Operation == "Update") {
          this.importOperation = "updated";
        }
        else if (this.selectedFileTextJSON.ExportInfo.Operation == "Delete") {
          this.importOperation = "deleted";
        }
        this.generateImportItemsTree();
        this.fileImported = true;

      }
      catch (ex) {
        console.log(ex);
        alert(ex.message);
      }



    }
    fileReader.readAsText(textFile);


  }
  onUpload(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.msgs = [];
    this.msgs.push({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  displayTree() {
    this.showTree = true;
    this.importObjectsTree.forEach(node => {
      this.expandRecursive(node, true);
    });
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  onClearFile() {
    this.showTree = false;
  }
  currentSettingVal: string = "{}";

  generateImportItemsTree() {
    this.importHeaderObject = {};
    this.importObjectsTree = [];
    for (let key in this.selectedFileTextJSON.Items) {
      this.addNewItemToNode(key, key, "", this.selectedFileTextJSON.Items[key])

    }

    if (this.importObjectsTree.length > 0) {
      this.displayTree();
    }
    else {
      this.showTree = false;
    }

  }

  addNewItemToNode(itemLabel, itemData, icons, itemsArray) {
    this.importObjectsTree.push({
      "label": itemLabel,
      "data": itemData,
      "expandedIcon": icons,
      "collapsedIcon": icons,
      "children": this.getChildrenArrayForItemType(itemsArray, itemData)
    });

  }
  getChildrenArrayForItemType(itemsArray, itemData) {
    let childrenArray = [];
    if (this.selectedFileTextJSON.ExportInfo.Operation == "Add") {
      for (let i = 0; i < itemsArray.length; i++) {
        childrenArray.push({
          "label": itemsArray[i]["Name"],
          "data": itemsArray[i]["ObjectIdentity"]
        });
      }
    }
    else if (this.selectedFileTextJSON.ExportInfo.Operation == "Update") {
      this.removeUnwantedKeysFromUpdateObject();
      if (itemData == "Process") {
        for (let i = 0; i < itemsArray.length; i++) {
          childrenArray.push({
            "label": itemsArray[i]["Name"],
            "data": itemsArray[i]["ObjectIdentity"]

          });
        }
      }
      else {
        for (let i = 0; i < itemsArray.length; i++) {
          childrenArray.push({
            "label": itemsArray[i]["Name"],
            "data": itemsArray[i]["ObjectIdentity"],
            "children": this.getChildrenConfigItemsForUpdate(itemsArray[i].Value)

          });
        }
      }

    }


    return childrenArray;
  }

  getChildrenConfigItemsForUpdate(itemsArrayValues) {
    let subChildrenArray = [];
    for (let key in itemsArrayValues) {

      subChildrenArray.push({
        "label": key,
        "data": key

      });


    }
    return subChildrenArray;
  }

  generateImportNewParameters() {

    this.importProgress = 0;
    this.importing = true;
    let totalItems = 0;

    let allObjectParameters = [];
    let userToken = JSON.parse(window.localStorage["User"]).AuthenticationToken;

    for (let key in this.selectedFileTextJSON.Items) {
      for (let i = 0; i < this.selectedFileTextJSON.Items[key].length; i++) {
        let settingObject: any = {};
        settingObject.itemType = this.itemTypes[key];
        settingObject.userToken = userToken;
        settingObject.objectIdentity = this.selectedFileTextJSON.Items[key][i].ObjectIdentity;
        settingObject.operationType = 'DEV';
        this.selectedFileTextJSON.Items[key][i].Value.ProcessID = this.selectedFileTextJSON.ExportInfo.ProcessID
        settingObject.value = JSON.stringify(this.selectedFileTextJSON.Items[key][i].Value);
        allObjectParameters.push(settingObject);

      }
    }
    totalItems = allObjectParameters.length;
    let progressOffset = 0;
    if (totalItems > 0) {
      progressOffset = Math.ceil(100 / totalItems);
    }
    else {
      progressOffset = 1;
    }


    if (this.selectedFileTextJSON.Process != undefined) {
      totalItems++;
      progressOffset = Math.ceil(100 / totalItems);
      let settingObject: any = {};
      settingObject.itemType = this.itemTypes["Process"];
      settingObject.userToken = userToken;
      settingObject.objectIdentity = this.selectedFileTextJSON.Process.ObjectIdentity;
      settingObject.operationType = 'DEV';
      this.selectedFileTextJSON.Process.Value = this.selectedFileTextJSON.Process.ProcessImage;
      this.selectedFileTextJSON.Process.ObjectDescription = '{"Type":"ProcessImage"}';
      settingObject.value = JSON.stringify(this.selectedFileTextJSON.Process);
      let importCall = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
      importCall.then((result) => {
        this.addResultToResultJSON(settingObject,result);
        this.importProgress = this.importProgress + progressOffset;
        if (this.importProgress >= 100) {
          this.importProgress = 100;
          setTimeout(() => {
            this.importStatusText = "Script executed successfully. Please check console for results";
            this.importing = false;
            this.resultJSON.EndDateTime=new Date().toString();            
            this.donwloadResultJSON("Import Results "+this.resultJSON.StartDateTime,JSON.stringify(this.resultJSON));
          }, 2000);
        }
        else {
          this.executeSocketCalls(allObjectParameters, progressOffset,'addDeveloperProcessObject');
        }



      }).catch((error) => {
        this.importProgress = 100;
        this.importStatusText = "Error while adding new process.";
        this.importing = false;
        this.resultJSON.EndDateTime=new Date().toString();            
        this.donwloadResultJSON("Import Results "+this.resultJSON.StartDateTime,JSON.stringify(this.resultJSON));

      });
    }
    else {
      this.executeSocketCalls(allObjectParameters, progressOffset,'addDeveloperProcessObject');
    }



 
  }

  generateImportUpdateParameters() {
  
     
    this.importProgress = 0;
    this.importing = true;
    let totalItems = 0;

    let allObjectParameters = [];
    let userToken = JSON.parse(window.localStorage["User"]).AuthenticationToken;
    for (let key in this.selectedFileTextJSON.Items) {
      if(key=="Process")
      {
        for (let i = 0; i < this.selectedFileTextJSON.Items[key].length; i++) {
          let settingObject=this.getProcessUpdateParameterObject(this.selectedFileTextJSON.Items[key][i].Name,this.selectedFileTextJSON.Items[key][i].Value,this.selectedFileTextJSON.Items[key][i].ObjectIdentity,userToken);
          if(settingObject!=undefined)
          {
            allObjectParameters.push(settingObject);
            
          }
        }
      }
      else
      {
        for (let i = 0; i < this.selectedFileTextJSON.Items[key].length; i++) {
          let settingObject: any = {};
          settingObject.itemType = this.itemTypes[key];
          settingObject.userToken = userToken;
          settingObject.itemId = this.selectedFileTextJSON.Items[key][i].ObjectIdentity.toString();
          settingObject.operationType = 'DEV';
          settingObject.settingsJson = JSON.stringify(this.selectedFileTextJSON.Items[key][i].Value).replace(/'/g, "''");
          allObjectParameters.push(settingObject);
  
        }
      }
      
    }
    totalItems = allObjectParameters.length;
    let progressOffset = 0;
    if (totalItems > 0) {
      progressOffset = Math.ceil(100 / totalItems);
    }
    else {
      progressOffset = 1;
    }
    this.executeSocketCalls(allObjectParameters,progressOffset,"updateConfigurationItems");

    


    console.log(allObjectParameters);

  }

  executeSocketCalls(allObjectParameters, progressOffset, callName) {

    
    for (let i = 0; i < allObjectParameters.length; i++) {
     
      let importCall = this.socket.callWebSocketService(callName, allObjectParameters[i]);
      importCall.then((result) => {
       
        this.addResultToResultJSON(allObjectParameters[i],result);
        this.importProgress = this.importProgress + progressOffset;
        if (this.importProgress >= 100) {
          this.importProgress = 100;
          setTimeout(() => {
            this.importStatusText = "Script executed successfully!";
            this.importing = false;
            this.resultJSON.EndDateTime=new Date().toString();
            this.donwloadResultJSON("Import Results "+this.resultJSON.StartDateTime,JSON.stringify(this.resultJSON));
          }, 2000);
        }


      }).catch((error) => {
        this.importProgress = this.importProgress + progressOffset;
        if (this.importProgress >= 100) {
          this.importProgress = 100;
          setTimeout(() => {
            this.importStatusText = "Script executed successfully!";
            this.importing = false;
            this.resultJSON.EndDateTime=new Date().toString();            
            this.donwloadResultJSON("Import Results "+this.resultJSON.StartDateTime,JSON.stringify(this.resultJSON));
          }, 2000);
        }
        

      })
    }



  }

  addResultToResultJSON(currentParameter,currentResult){
    let resultObject:any={};
    resultObject.ItemType=currentParameter.itemType;
    resultObject.Result=currentResult;
    if(this.selectedFileTextJSON.ExportInfo.Operation=="Add")
    {
      resultObject.ItemID=currentParameter.objectIdentity;
    }
    else if(this.selectedFileTextJSON.ExportInfo.Operation=="Update")
    {
      resultObject.ItemID=currentParameter.itemId;
    }
    this.resultJSON.Results.push(resultObject);
  }


  removeUnwantedKeysFromUpdateObject(){
    for(let key in this.selectedFileTextJSON.Items)
    {
      
        this.selectedFileTextJSON.Items[key]=this.removeKeyFromArray(this.selectedFileTextJSON.Items[key],this.unwantedKeysForUpdate[key]);
      
    }
  }

  removeKeyFromArray(itemsArray,keysToRemove){
    for(let i=0;i<itemsArray.length;i++)
    {
      for(let j=0;j<keysToRemove.length;j++)
      {
        delete itemsArray[i].Value[keysToRemove[j]];
      }
      
    }
    return itemsArray;
  }

  generateParameters(){
    this.resultJSONDownloaded=false;
    this.resultJSON={
      ImportInfo:this.selectedFileTextJSON.ExportInfo,
      StartDateTime:new Date().toString(),
      Results:[]
    };
    if(this.selectedFileTextJSON.ExportInfo.Operation=="Add")
    {
      this.generateImportNewParameters();
    }
    else if(this.selectedFileTextJSON.ExportInfo.Operation=="Update")
    {
      this.generateImportUpdateParameters();
    }
  }

  getProcessUpdateParameterObject(itemKey,itemValue,itemId,userToken){
    let settingObject: any;
    let settingValue:any={};
    if (itemKey== "Organization") {
      settingValue.OrganizationID=itemValue.toString();
      settingObject = {
        userToken: userToken,
        itemType: "ProcessOrganization",
        itemId: this.selectedFileTextJSON.ExportInfo.ProcessID,
        settingsJson: JSON.stringify(settingValue),
        operationType: 'DEV'
      };
    }
    else if (itemKey == "ProcessName") {
      settingValue.Name=itemValue.toString().replace(/'/g, "''");
      settingObject = {
        userToken: userToken,
        itemType: "Process",
        itemId: itemId.toString(),
        settingsJson: JSON.stringify(settingValue),
        operationType: 'DEV'
      };
    }
    else if (itemKey == "ProcessReference") {
      settingValue.ProcessReference=itemValue.toString().replace(/'/g, "''");
      settingObject = {
        userToken: userToken,
        itemType: "Process",
        itemId: itemId.toString(),
        settingsJson: JSON.stringify(settingValue),
        operationType: 'DEV'
      };
    }
    else if (itemKey == "ProcessImage") {
      settingValue.Value=itemValue.toString().replace(/'/g, "''");
      
      settingObject = {
        userToken: userToken,
        itemType: "ProcessObject",
        itemId: itemId.toString(),
        settingsJson: JSON.stringify(settingValue),
        operationType: 'DEV'
      };
    }
    else if (itemKey == "GlobalSettingsJSON") {
      settingValue.Value=itemValue.toString().replace(/'/g, "''");
      
      settingObject = {
        userToken: userToken,
        itemType: "ProcessGlobalSetting",
        itemId: this.selectedFileTextJSON.ExportInfo.ProcessID,
        settingsJson: JSON.stringify(settingValue),
        operationType: 'DEV'
      };
    }

    return settingObject;
  }

  donwloadResultJSON(filename, text) {
    if(!this.resultJSONDownloaded)
    {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      this.resultJSONDownloaded=true;
    }

    
  }
}

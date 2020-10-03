import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RapidflowService } from '../../../services/rapidflow.service';
import { SocketProvider } from '../../../services/socket.service';

@Component({
  selector: 'app-edit-notifications',
  templateUrl: './edit-notifications.component.html',
  styleUrls: ['./edit-notifications.component.css']
})
export class EditNotificationsComponent implements OnInit {
  public showLoading: boolean = false;
  notificationTypes: any;
  allNotificationTypes: any;
  allNotificationTypeModel: any;
  workflows: any;
  showImportTemplateDialog: boolean = false;
  newVersion: FormGroup;
  selectedProcessId: any;
  processWorklowsConfigrationData: any;
  selectedWorkflow: any;
  showselectedWorkflow: any;
  selectedNotificationType: any;
  currentSettingVal: string;
  currentLoggedInUser: any;
  loadSubscriptionNtype: any;
  loadSubscriptionNtemp: any;
  popupworkflows: any;
  allProcesses: any;
  popupselectedWorkflow: any;
  popupselectedProcess: any;
  selectedProcessForNewWorkflow: number;
  popupNotificationTypes;
  popupSelectedNotificationType;
  newWorkflowImportConfigurationData: any = [];
  allWorkflowsOfProcessForImport: any = [];
  selectedWorkflowForImport: number;
  public emailSubject: any;
  public emailBody: any;
  public pushNotificationMessage: any;
  public appNotificationSubject: any;
  public appNotificationBody: any;
  public description: any;
  public globalNotificationTypes: any;
  public selectedNewValue: string = "new";
  public defaultGlobalNotificationTypes: any;
  public processGlobalNotificationTypes: any;
  newNotificationType: string = "";
  notificationTypeRadio: string = 'existing';
  @Output() configValue = new EventEmitter();
  @Input('selectedProcessInput')
  set selectedProcessInput(value: number) {
    if (value == undefined) {
      return;
    }
    if (this.loadSubscriptionNtype != undefined) {
      this.loadSubscriptionNtype.unsubscribe();
    }
    if (this.loadSubscriptionNtemp != undefined) {
      this.loadSubscriptionNtemp.unsubscribe();
    }
    this.defaultGlobalNotificationTypes = [];
    this.processGlobalNotificationTypes = [];
    this.selectedProcessId = value;
    this.loadProcessNotifications();
  }


  constructor(private fb: FormBuilder, private socket: SocketProvider, private rapidflowService: RapidflowService) {
  }

  ngOnInit() {
    this.allNotificationTypes = [];
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
    this.newVersion = this.fb.group({
      'NewNotificationType': new FormControl('', Validators.required),
      'PushNotification': new FormControl('', Validators.required),
      'EmailSubject': new FormControl('', Validators.required),
      'EmailBody': new FormControl('', Validators.required),
      'AppNotificationSubject': new FormControl('', Validators.required),
      'AppNotificationBody': new FormControl('', Validators.required),
      'Description': new FormControl('', Validators.required)
    });
  }

  loadProcessNotifications() {
    this.showLoading = true;
    this.allNotificationTypes = [];
    this.globalNotificationTypes = [];
    this.loadSubscriptionNtype = this.rapidflowService.retrieveConfigurationData("NotificationType", this.selectedProcessId).subscribe((response) => {
      let notificationtypes = JSON.parse(response.json()).ConfigurationData;
      for (let i = 0; i < notificationtypes.length; i++) {
        let notificationObject: any = {};
        notificationObject.label = notificationtypes[i].NotificationType;
        notificationObject.value = notificationtypes[i].NotificationTypeID;
        this.allNotificationTypes.push(notificationObject);
      }
      if (this.allNotificationTypes.length > 0) {
        this.allNotificationTypeModel = this.allNotificationTypes[0].value;
      }
      this.workflows = [];
      this.retrieveNotificationType();
    },
      (error) => {
        this.showLoading = false;
        console.log(error);
      });
  }

  initializeDefaultNotificationTypes() {
    this.defaultGlobalNotificationTypes.push("Errors");
    this.defaultGlobalNotificationTypes.push("AccessRequestAcknowledgement");
    this.defaultGlobalNotificationTypes.push("AccessRequestAssignment");
    this.defaultGlobalNotificationTypes.push("AccessRequestApproval");
    this.defaultGlobalNotificationTypes.push("AccessRequestRejection");
    this.defaultGlobalNotificationTypes.push("UserRegistrationAcknowledgement");
    this.defaultGlobalNotificationTypes.push("UserRegistrationAssignmnet");
    this.defaultGlobalNotificationTypes.push("UserRegistrationOutcome");
    this.defaultGlobalNotificationTypes.push("ProcessLookupApprovalAcknowledgement");
    this.defaultGlobalNotificationTypes.push("ProcessLookupApprovalAssignment");
    this.defaultGlobalNotificationTypes.push("ProcessLookupApprovalOutcome");
  }

  initializeProcessNotificationTypes() {
    let tempAllNotificationTypes = JSON.parse(JSON.stringify(this.allNotificationTypes));
    for (let i = 0; i < tempAllNotificationTypes.length; i++) {
      if (this.defaultGlobalNotificationTypes.indexOf(tempAllNotificationTypes[i].label) != -1) {
        tempAllNotificationTypes.splice(i, 1);
        i--;
      }
    }

    for (let i = 0; i < this.notificationTypes.length; i++) {
      for (let j = 0; j < tempAllNotificationTypes.length; j++) {
        if (this.notificationTypes[i].label == tempAllNotificationTypes[j].label) {
          tempAllNotificationTypes.splice(j, 1);
          j--;
        }
      }
    }

    for (let i = 0; i < tempAllNotificationTypes.length; i++) {
      let notificationObject: any = {};
      notificationObject.label = tempAllNotificationTypes[i].label;
      notificationObject.value = tempAllNotificationTypes[i].value;
      this.processGlobalNotificationTypes.push(notificationObject);
    }
  }

  retrieveNotificationType() {
    this.initializeDefaultNotificationTypes();
    this.rapidflowService.retrieveConfigurationData("ProcessWorkflow", this.selectedProcessId).subscribe((response) => {
      let processWorkflows = JSON.parse(response.json()).ConfigurationData;
      for (let i = 0; i < processWorkflows.length; i++) {
        let workflowObject: any = {};
        let already = false;
        for (let j = 0; j < this.workflows.length; j++) {
          if (this.workflows[j].value == processWorkflows[i].WorkflowID) {
            already = true;
            break;
          }
        }
        if (!already) {
          workflowObject.label = processWorkflows[i].WorkflowName;
          workflowObject.value = processWorkflows[i].WorkflowID;
          this.workflows.push(workflowObject);
        }
      }
      if (this.workflows.length > 0) {
        this.selectedWorkflow = this.workflows[0].value;
        this.showselectedWorkflow = this.workflows[0];
      }
      this.loadSubscriptionNtemp = this.rapidflowService.retrieveConfigurationData("NotificationTemplate", this.selectedProcessId).subscribe((response) => {
        this.processWorklowsConfigrationData = JSON.parse(response.json()).ConfigurationData;
        this.configValue.emit({
          name: "Notifications",
          val: this.processWorklowsConfigrationData
        });
        this.setNotificationTypes();
        this.showLoading = false;
      });
    },
      (error) => {
        this.showLoading = false;
        console.log(error);
      });
  }

  setNotificationTypes() {
    this.notificationTypes = [];
    for (let i = 0; i < this.processWorklowsConfigrationData.length; i++) {
      let notificationtypeobject: any = {};
      if (this.selectedWorkflow == this.processWorklowsConfigrationData[i].WorkflowID) {
        notificationtypeobject.label = this.processWorklowsConfigrationData[i].NotificationType
        notificationtypeobject.value = this.processWorklowsConfigrationData[i].NotificationTypeID
        this.notificationTypes.push(notificationtypeobject);
      }
    }
    //this.updatePopupAllNotifications();
    if (this.notificationTypes.length > 0) {
      this.selectedNotificationType = this.notificationTypes[0].value;
    }
    this.setTemplateDetails();
  }

  setTemplateDetails() {
    for (let count = 0; count < this.processWorklowsConfigrationData.length; count++) {
      if (this.processWorklowsConfigrationData[count]["NotificationTypeID"] == this.selectedNotificationType && this.selectedWorkflow == this.processWorklowsConfigrationData[count].WorkflowID) {
        this.pushNotificationMessage = decodeURIComponent(this.processWorklowsConfigrationData[count]["PushNotificationMessage"]);
        this.emailSubject = decodeURIComponent(this.processWorklowsConfigrationData[count]["EmailSubject"]);
        this.emailBody = decodeURIComponent(this.processWorklowsConfigrationData[count]["EmailBody"]);
        this.appNotificationSubject = decodeURIComponent(this.processWorklowsConfigrationData[count]["AppNotificationSubject"]);
        this.appNotificationBody = decodeURIComponent(this.processWorklowsConfigrationData[count]["AppNotificationBody"]);
        this.description = this.processWorklowsConfigrationData[count]["Description"];
      }
    }
    this.initializeProcessNotificationTypes();
  }

  updateColumn() {
    let settingsJson = {
      "ProcessID": this.selectedProcessId.toString(),
      "WorkflowID": this.selectedWorkflow.toString(),
      "NotificationTypeID": this.selectedNotificationType.toString()
    }
    let dbcolumn = new Object();
    dbcolumn["AppNotificationBody"] = encodeURIComponent(this.appNotificationBody.replace(/'/g, "''"));
    dbcolumn["AppNotificationSubject"] = encodeURIComponent(this.appNotificationSubject.replace(/'/g, "''"));
    dbcolumn["EmailBody"] = encodeURIComponent(this.emailBody.replace(/'/g, "''"));
    dbcolumn["EmailSubject"] = encodeURIComponent(this.emailSubject.replace(/'/g, "''"));
    dbcolumn["PushNotificationMessage"] = encodeURIComponent(this.pushNotificationMessage.replace(/'/g, "''"));
    dbcolumn["Description"] = this.description.replace(/'/g, "''");
    let settingObject: any = {
      userToken: this.currentLoggedInUser.AuthenticationToken,
      itemType: "NotificationTemplate",
      settingsJson: JSON.stringify(dbcolumn),
      itemId: JSON.stringify(settingsJson),
      operationType: 'DEV'
    };
    try {
      if (confirm("Are you sure you want to apply this settings?")) {
        let updateSettingsResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
        updateSettingsResult.then((result) => {
          if (result.Result == "Success") {
            alert("Setting Update Successfully!");
            this.updateLocalData();
          }
          else {
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

  openImportTemplateDialog() {
    this.showImportTemplateDialog = true;
    this.allProcesses = []
    this.allProcesses = JSON.parse(window.localStorage["AllProcesses"]);
    this.selectedProcessForNewWorkflow = null;
    console.log(this.allNotificationTypes);
  }

  updateLocalData() {
    let value = "";
    let flag = false;
    let index = 0;
    for (let i = 0; i < this.processWorklowsConfigrationData.length; i++) {
      if (this.selectedWorkflow == this.processWorklowsConfigrationData[i].WorkflowID && this.selectedNotificationType == this.processWorklowsConfigrationData[i].NotificationTypeID) {
        flag = true;
        index = i;
        break;
      }
    }
    if (flag) {
      this.processWorklowsConfigrationData[index]["AppNotificationBody"] = encodeURIComponent(this.appNotificationBody.replace(/'/g, "''"));
      this.processWorklowsConfigrationData[index]["AppNotificationSubject"] = encodeURIComponent(this.appNotificationSubject.replace(/'/g, "''"));
      this.processWorklowsConfigrationData[index]["EmailBody"] = encodeURIComponent(this.emailBody.replace(/'/g, "''"));
      this.processWorklowsConfigrationData[index]["EmailSubject"] = encodeURIComponent(this.emailSubject.replace(/'/g, "''"));
      this.processWorklowsConfigrationData[index]["PushNotificationMessage"] = encodeURIComponent(this.pushNotificationMessage.replace(/'/g, "''"));
      this.processWorklowsConfigrationData[index]["Description"] = this.description.replace(/'/g, "''");
    }
    this.configValue.emit({
      name: "Notifications",
      val: this.processWorklowsConfigrationData
    });

  }

  // popup related functions

  loadWorkflowsForSelectedProcess() {
    this.popupworkflows = [];
    this.rapidflowService.retrieveConfigurationData("ProcessWorkflow", this.popupselectedProcess).subscribe((response) => {
      this.processWorklowsConfigrationData = JSON.parse(response.json()).ConfigurationData;
      this.processWorklowsConfigrationData = this.processWorklowsConfigrationData;
      for (let i = 0; i < this.processWorklowsConfigrationData.length; i++) {
        let workflowObject: any = {};
        workflowObject.label = this.processWorklowsConfigrationData[i].WorkflowName;
        workflowObject.value = this.processWorklowsConfigrationData[i].WorkflowID;
        this.workflows.push(workflowObject);
      }
      this.popupselectedWorkflow = this.workflows[0].value;
    },
      (error) => {
        console.log(error);
      }
    );
  }

  getSelectedProcessForImportWorkflowData() {
    if (this.selectedProcessForNewWorkflow != undefined) {
      this.rapidflowService.retrieveConfigurationData("NotificationTemplate", this.selectedProcessForNewWorkflow).subscribe((response) => {
        //set dropdown model for workflows
        this.newWorkflowImportConfigurationData = JSON.parse(response.json()).ConfigurationData;
        this.allWorkflowsOfProcessForImport = [];
        for (let i = 0; i < this.newWorkflowImportConfigurationData.length; i++) {
          let workflowObject: any = {};
          let already = false;
          for (let j = 0; j < this.allWorkflowsOfProcessForImport.length; j++) {
            if (this.allWorkflowsOfProcessForImport[j].value == this.newWorkflowImportConfigurationData[i].WorkflowID) {
              already = true;
              break;
            }
          }
          if (!already) {
            workflowObject.label = this.newWorkflowImportConfigurationData[i].WorkflowName;
            workflowObject.value = this.newWorkflowImportConfigurationData[i].WorkflowID;
            this.allWorkflowsOfProcessForImport.push(workflowObject);
          }
        }
        if (this.allWorkflowsOfProcessForImport[0] != undefined) {
          this.selectedWorkflowForImport = this.allWorkflowsOfProcessForImport[0].value;
          this.setpopupNotificationTypes();
        }
      });
    }
  }

  setpopupNotificationTypes() {
    this.popupNotificationTypes = [];
    for (let i = 0; i < this.newWorkflowImportConfigurationData.length; i++) {
      let notificationtypeobject: any = {};
      if (this.selectedWorkflowForImport == this.newWorkflowImportConfigurationData[i].WorkflowID) {
        notificationtypeobject.label = this.newWorkflowImportConfigurationData[i].NotificationType
        notificationtypeobject.value = this.newWorkflowImportConfigurationData[i].NotificationTypeID
        this.popupNotificationTypes.push(notificationtypeobject);
      }
    }
    this.popupSelectedNotificationType = this.popupNotificationTypes[0].value;
    this.newVersion.patchValue({
      'NewNotificationType': "",
      'PushNotification': "",
      'EmailSubject': "",
      'EmailBody': "",
      'AppNotificationSubject': "",
      'AppNotificationBody': "",
      'Description': ""
    });
  }
  emptyfields() {
    this.newVersion.patchValue({
      'NewNotificationType': "",
      'PushNotification': "",
      'EmailSubject': "",
      'EmailBody': "",
      'AppNotificationSubject': "",
      'AppNotificationBody': "",
      'Description': ""
    });
  }
  setpopupColumnValue() {
    let value = "";
    let flag = false;
    let index = 0;
    for (let i = 0; i < this.newWorkflowImportConfigurationData.length; i++) {
      if (this.selectedWorkflowForImport == this.newWorkflowImportConfigurationData[i].WorkflowID && this.popupSelectedNotificationType == this.newWorkflowImportConfigurationData[i].NotificationTypeID) {
        flag = true;
        index = i;
        break;
      }
    }
    if (!flag) {
      this.newVersion.patchValue({
        'NewNotificationType': "",
        'PushNotification': "",
        'EmailSubject': "",
        'EmailBody': "",
        'AppNotificationSubject': "",
        'AppNotificationBody': "",
        'Description': ""
      });
    }
    else {
      this.newVersion.patchValue({
        'NewNotificationType': "",
        'PushNotification': decodeURIComponent(this.newWorkflowImportConfigurationData[index]["PushNotificationMessage"]),
        'EmailSubject': decodeURIComponent(this.newWorkflowImportConfigurationData[index]["EmailSubject"]),
        'EmailBody': decodeURIComponent(this.newWorkflowImportConfigurationData[index]["EmailBody"]),
        'AppNotificationSubject': decodeURIComponent(this.newWorkflowImportConfigurationData[index]["AppNotificationSubject"]),
        'AppNotificationBody': decodeURIComponent(this.newWorkflowImportConfigurationData[index]["AppNotificationBody"]),
        'Description': this.newWorkflowImportConfigurationData[index]["Description"]
      });
    }
  }

  addNewtemplate() {
    let newNotificationType = new Object();

    if (this.selectedNewValue == "new") {
      this.newNotificationType = this.newVersion.value.NewNotificationType;
      if (this.newNotificationType.length > 0) {
        if (this.validateNotificationType()) {
          alert('Please type a unique notification type.')
          this.newNotificationType = '';
        }
        else {
          newNotificationType["NotificationType"] = this.newNotificationType;
          let settingObject: any = {
            userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
            itemType: "NotificationType",
            objectIdentity: "0",
            value: JSON.stringify(newNotificationType),
            operationType: 'DEV'
          };
          let addNewWorkflowResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
          addNewWorkflowResult.then((result) => {
            console.log(result);
            this.allNotificationTypes.push({ label: this.newNotificationType, value: result.ObjectIdentity });
            let valueObj = {
              PushNotificationMessage: encodeURIComponent(this.newVersion.value.PushNotification),
              EmailSubject: encodeURIComponent(this.newVersion.value.EmailSubject),
              EmailBody: encodeURIComponent(this.newVersion.value.EmailBody),
              AppNotificationSubject: encodeURIComponent(this.newVersion.value.AppNotificationSubject),
              AppNotificationBody: encodeURIComponent(this.newVersion.value.AppNotificationBody),
              Description: (this.newVersion.value.Description),
              ProcessID: this.selectedProcessId.toString(),
              WorkflowID: this.selectedWorkflow.toString(),
              NotificationTypeID: result.ObjectIdentity.toString()

            }
            let ntemplateObj = {
              userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
              itemType: "NotificationTemplate",
              objectIdentity: "0",
              value: JSON.stringify(valueObj),
              operationType: 'DEV'
            }
            let addNewNotificationTemplateResult = this.socket.callWebSocketService('addDeveloperProcessObject', ntemplateObj);
            addNewNotificationTemplateResult.then((result) => {
              console.log(result)
              this.retrieveNotificationType();
              //this.updatePopupAllNotifications();
              this.showImportTemplateDialog = false;
            }).catch((error) => {
              alert("Error while updating. Please check console for error");
              console.log(error)
            });

          }).catch((error) => {
            alert("Error while updating. Please check console for error");
            console.log(error)
          });
        }
      }
      else {
        alert('Please enter a unique notification type.')
      }
    }
    else {
      for (let i = 0; this.processGlobalNotificationTypes.length; i++) {
        if (this.processGlobalNotificationTypes[i].value == this.newVersion.value.NewNotificationType) {
          this.newNotificationType = this.processGlobalNotificationTypes[i].label;
          break;
        }
      }
      let valueObj = {
        PushNotificationMessage: encodeURIComponent(this.newVersion.value.PushNotification),
        EmailSubject: encodeURIComponent(this.newVersion.value.EmailSubject),
        EmailBody: encodeURIComponent(this.newVersion.value.EmailBody),
        AppNotificationSubject: encodeURIComponent(this.newVersion.value.AppNotificationSubject),
        AppNotificationBody: encodeURIComponent(this.newVersion.value.AppNotificationBody),
        Description: (this.newVersion.value.Description),
        ProcessID: this.selectedProcessId.toString(),
        WorkflowID: this.selectedWorkflow.toString(),
        NotificationTypeID: this.newVersion.value.NewNotificationType.toString()

      }
      let ntemplateObj = {
        userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
        itemType: "NotificationTemplate",
        objectIdentity: "0",
        value: JSON.stringify(valueObj),
        operationType: 'DEV'
      }
      let addNewNotificationTemplateResult = this.socket.callWebSocketService('addDeveloperProcessObject', ntemplateObj);
      addNewNotificationTemplateResult.then((result) => {
        console.log(result)
        this.retrieveNotificationType();
        //this.updatePopupAllNotifications();
        this.showImportTemplateDialog = false;
      }).catch((error) => {
        alert("Error while updating. Please check console for error");
        console.log(error)
      });

    }

  }
  // updatePopupAllNotifications() {
  //   let tempTypes = [];
  //   let tempallTypes = [];
  //   for (let i = 0; i < this.allNotificationTypes.length; i++) {
  //     let flag = false
  //     for (let j = 0; j < this.notificationTypes.length; j++) {
  //       if (this.notificationTypes[j].value == this.allNotificationTypes[i].value) {
  //         flag = true;
  //         break;
  //       }
  //     }
  //     if (flag) {
  //       tempTypes.push(this.allNotificationTypes[i])
  //     }
  //     else {
  //       tempallTypes.push(this.allNotificationTypes[i])
  //     }
  //   }
  //   this.notificationTypes = tempTypes;
  //   this.allNotificationTypes = tempallTypes;
  // }
  validateNotificationType() {
    let flag = false;
    for (let i = 0; i < this.allNotificationTypes.length; i++) {
      if (this.newNotificationType.toLowerCase() == this.allNotificationTypes[i].label.toLowerCase()) {
        flag = true;
        break;
      }
    }
    return flag;
  }
}

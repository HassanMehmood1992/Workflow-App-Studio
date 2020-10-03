import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SocketProvider } from '../../../services/socket.service';

@Component({
  selector: 'app-edit-app-notifications',
  templateUrl: './edit-app-notifications.component.html',
  styleUrls: ['./edit-app-notifications.component.css']
})
export class EditAppNotificationsComponent implements OnInit {

  public notificationTypes:any;
  public globalNotifications:any;
  public globalNotificationTypes:any;
  public selectedType:any;
  public defaultGlobalNotificationTypes:any;
  public emailSubject:any;
  public emailBody:any;
  public pushNotificationMessage:any;
  public appNotificationSubject:any;
  public appNotificationBody:any;
  public currentLoggedInUser:any;

  @Input('globalNotificationsInput')
  set globalNotificationsInput(value: any) {
    if(value==undefined)
    {
      return;
    }

    this.globalNotifications = value;
    console.log(this.globalNotifications);
  }

  @Input('globalNotificationTypesInput')
  set globalNotificationTypesInput(value: any) {
    if(value==undefined)
    {
      return;
    }

    this.globalNotificationTypes = value;
    console.log(this.globalNotificationTypes);
    this.initializeNotificationTypes();
  }

  constructor(private rapidflowService: RapidflowService, private socket: SocketProvider) {    
   }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.notificationTypes = [];
    this.defaultGlobalNotificationTypes = [];
    this.initializeDefaultNotificationTypes();
  }

  initializeDefaultNotificationTypes(){
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

  initializeNotificationTypes(){
    this.notificationTypes = [];
    for(let count = 0;count<this.globalNotificationTypes.length;count++){
        if(this.defaultGlobalNotificationTypes.indexOf(this.globalNotificationTypes[count]["NotificationType"].trim()) == -1){
          this.globalNotificationTypes.splice(count,1);
          count--;
        }
    }
    for(let count2=0;count2<this.globalNotificationTypes.length;count2++){
      let obj = {};
      obj["label"] = this.globalNotificationTypes[count2]["NotificationType"];
      obj["value"] = this.globalNotificationTypes[count2]["NotificationTypeID"];
      this.notificationTypes.push(obj);
    }
    this.selectedType = this.notificationTypes[0]["value"];
    this.setTemplateDetails();
  }

  setTemplateDetails(){
    for(let count=0;count<this.globalNotifications.length;count++){
      if(this.globalNotifications[count]["NotificationTypeID"] == this.selectedType){
        this.pushNotificationMessage = decodeURIComponent(this.globalNotifications[count]["PushNotificationMessage"]);
        this.emailSubject = decodeURIComponent(this.globalNotifications[count]["EmailSubject"]);
        this.emailBody = decodeURIComponent(this.globalNotifications[count]["EmailBody"]);
        this.appNotificationSubject = decodeURIComponent(this.globalNotifications[count]["AppNotificationSubject"]);
        this.appNotificationBody = decodeURIComponent(this.globalNotifications[count]["AppNotificationBody"]);
      }
    }
  }

  updateNotification(){
    let itemDetails = {
      "ProcessID": "0",
      "WorkflowID": "0",
      "NotificationTypeID": this.selectedType.toString()
    }
    
    let updateObj = {};
    updateObj["AppNotificationBody"] = encodeURIComponent(this.appNotificationBody.replace(/'/g, "''"));
    updateObj["AppNotificationSubject"] = encodeURIComponent(this.appNotificationSubject.replace(/'/g, "''"));
    updateObj["EmailBody"] = encodeURIComponent(this.emailBody.replace(/'/g, "''"));
    updateObj["EmailSubject"] = encodeURIComponent(this.emailSubject.replace(/'/g, "''"));
    updateObj["PushNotificationMessage"] = encodeURIComponent(this.pushNotificationMessage.replace(/'/g, "''")); 

    var params1 = {
      userToken: this.currentLoggedInUser.AuthenticationToken,
      itemType: "NotificationTemplate",
      settingsJson:  JSON.stringify(updateObj),
      itemId: JSON.stringify(itemDetails),
      operationType: 'DEV'
    };

    if (confirm("Are you sure you want to apply this settings?")) {
      var actionresultAssesment = this.socket.callWebSocketService('updateConfigurationItems', params1)
        .then((result) => {
          if (result != null) {
            if (result["Result"] != undefined) {
              if (result["Result"].toLowerCase() == "success") {
                alert("Setting Update Successfully!");
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
        }, (error: any) => {
          alert("Error while updating. Please check console for error");
          console.log(error);
        });
    }
  }

}

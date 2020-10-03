import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SocketProvider } from '../../../services/socket.service';

@Component({
  selector: 'app-edit-app-resources',
  templateUrl: './edit-app-resources.component.html',
  styleUrls: ['./edit-app-resources.component.css']
})
export class EditAppResourcesComponent implements OnInit {

  public applicationObjects: any;
  public applicationObjectTypes: any;
  public selectedObject: any;
  public objectName: any;
  public objectDescription: any;
  public objectValue: any;
  public newApplicationObjectFormGroup: FormGroup;
  public showNewApplicationObjectSection: boolean;
  public currentLoggedInUser: any;

  @Input('applicationObjectsInput')
  set applicationObjectsInput(value: any) {
    if (value == undefined) {
      return;
    }

    this.applicationObjects = value;
    console.log(this.applicationObjects);
    this.initializeApplicationObjectTypes();
  }

  constructor(private rapidflowService: RapidflowService, private socket: SocketProvider, private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.applicationObjectTypes = [];
    this.showNewApplicationObjectSection = false;
    this.setNewFormGroup();
  }

  initializeApplicationObjectTypes() {
    for (let count = 0; count < this.applicationObjects.length; count++) {
      let obj = {};
      obj["label"] = this.applicationObjects[count]["Name"];
      obj["value"] = this.applicationObjects[count]["ApplicationObjectID"];
      this.applicationObjectTypes.push(obj);
    }
    this.selectedObject = this.applicationObjectTypes[0]["value"];

    this.setObjectDetails();
  }

  setObjectDetails() {
    for (let count = 0; count < this.applicationObjects.length; count++) {
      if (this.applicationObjects[count]["ApplicationObjectID"] == this.selectedObject) {
        this.objectName = this.applicationObjects[count]["Name"];
        this.objectDescription = this.applicationObjects[count]["Description"];
        this.objectValue = this.applicationObjects[count]["Value"];
      }
    }
  }

  updateApplicationObjectDetails() {
    let settingsJson = {};
    try {
      settingsJson["Name"] = this.objectName;
      settingsJson["Description"] = this.objectDescription;
      settingsJson["Value"] = this.objectValue;

      var params = {
        userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
        itemType: "ApplicationObject",
        operationType: 'DEV',
        itemId: this.selectedObject.toString(),
        settingsJson: JSON.stringify(settingsJson)
      };

      if (confirm("Are you sure you want to apply this settings?")) {
        var actionresultAssesment = this.socket.callWebSocketService('updateConfigurationItems', params)
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
    catch (error) {
      alert("Error while updating. Please check console for error");
      console.log(error);
    }
  }

  setNewFormGroup() {
    this.newApplicationObjectFormGroup = this.formBuilder.group({
      'Name': new FormControl('', Validators.required),
      'Description': new FormControl('', Validators.required),
      'Value': new FormControl('', Validators.required)
    });
  }

  showNewApplicationObjectDialog() {
    this.showNewApplicationObjectSection = true;
  }

  addResource() {
    let applicationObjectId = 0;
    let settingsJson = {};
    try {
      settingsJson["Name"] = this.newApplicationObjectFormGroup.value.Name;
      settingsJson["Description"] = this.newApplicationObjectFormGroup.value.Description;
      settingsJson["Value"] = this.newApplicationObjectFormGroup.value.Value;
      var params = {
        userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
        itemType: "ApplicationObject",
        operationType: 'DEV',
        objectIdentity: "0",
        value: JSON.stringify(settingsJson)
      };

      if (confirm("Are you sure you want to apply this settings?")) {
        var actionresultAssesment = this.socket.callWebSocketService('addDeveloperProcessObject', params)
          .then((result) => {
            if (result != null) {
              alert("Setting Update Successfully!");
              this.showNewApplicationObjectSection = false;
              console.log(result);
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
    catch (error) {
      alert("Error while updating. Please check console for error");
      console.log(error);
    }
  }
}

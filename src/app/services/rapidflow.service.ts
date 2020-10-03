import { MatDialog } from '@angular/material';
import { SocketProvider } from './socket.service';
import { Router } from '@angular/router';
import { async } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';

declare var jquery: any; // Global variable of the class to store the JQuery variable referenced from jquery.min.js 
declare var $: any; // Global variable of the class to store the jQuery variable referenced from jquery.min.js 

@Injectable()
export class RapidflowService {

   appServer: string; // Global variable of the class to store the app server for the current build
  public CurrentLoggedInUser: any; // Global variable of the class to store the current logged in user
    
  /**
   * Creates an instance of RapidflowService.
   * @param {Http} http 
   * @param {Router} rtr 
   * @param {SocketProvider} SocketProvider 
   * @param {MatDialog} errorDialog 
   * @param {MatDialog} progressDialog 
   * @param {MatDialog} alertDialog 
   * @memberof RapidflowService
   */
  constructor(private http: Http, private rtr: Router, private SocketProvider: SocketProvider) {
     this.SocketProvider.check();    
    this.CurrentLoggedInUser = {}
   }


   verifyUserSession() {
    try {
      this.CurrentLoggedInUser = JSON.parse(window.localStorage['User']);
      this.appServer =window.localStorage["AppServerUrl"];
    } catch (e) {
        this.rtr.navigate(['login']).then((result)=>{
          
        }).catch((err)=>{
          console.log(err);
       });
       
     }
  }
  retrieveConfigurationData(itemType,processId){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveConfigurationData?userToken="+this.CurrentLoggedInUser.AuthenticationToken+"&&itemType="+itemType+"&processId="+processId, { withCredentials: true });
  }
  retrieveUserApplicationSettings(){
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFAppService.svc/retrieveUserApplicationSettings?userToken="+this.CurrentLoggedInUser.AuthenticationToken+"&diagnosticLogging=false", { withCredentials: true });
  }
  
  retrieveAllProcessesOraganizations() {
    this.verifyUserSession();
     return this.http.get(this.appServer + '/WCFAppService.svc/retrieveAllProcessOrganizations?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&diagnosticLogging=false", { withCredentials: true });
  }
  retrieveDeveloperProcesses() {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveDeveloperProcesses?userToken="+this.CurrentLoggedInUser.AuthenticationToken, { withCredentials: true });

  }
  editRolePermissions(permissionsValue: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '/WCFProcessService.svc/editRolePermissions?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&permissionsValue=' + permissionsValue+"&diagnosticLogging=false", { withCredentials: true });
  }
  deleteRestoreObject(itemType,itemId,settings) {
    this.verifyUserSession();
     return this.http.get(this.appServer + '/WCFDevService.svc/deleteDeveloperProcessObject?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&itemType="+itemType+"&itemId="+itemId+"&settings="+settings+"&diagnosticLogging=false", { withCredentials: true });
  }
  manageFormDataTasks(operationStatement) {
    this.verifyUserSession();
     return this.http.get(this.appServer + '/WCFDevService.svc/updateFormDataTasks?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken+"&operationStatement="+operationStatement, { withCredentials: true });
  }

  retrieveProcessPermissions(processID: number) {
    
        this.verifyUserSession();
        
        return this.http.get(this.appServer + '/WCFProcessService.svc/retrieveProcessPermissions?&userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&processId=' + processID+"&diagnosticLogging=false", { withCredentials: true });
      }

        /**
   * Function to check if the provided string is json or not
   * 
   * @param {any} str provided string
   * @returns true if json, false otherwise
   * @memberof RapidflowService
   */
  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Function called to return JSON object if string is passed
   * 
   * @param {any} JsonStr json string
   * @returns json object parsed
   * @memberof RapidflowService
   */
  parseRapidflowJSON(JsonStr) {
    let JsonString = JsonStr.json()
    let result: any
    try {
      if (JsonString != "") {
        if (this.isJson(JsonString)) {
          try {
            result = JSON.parse(JsonString)
          } catch (e) {
            result = JsonString
          }
          if (Array.isArray(result)) {
            if (result[0] != undefined && result[0].AuthenticationStatus != undefined && result[0].AuthenticationStatus.toString() == "false") {
              window.localStorage.clear();
              result = []
              window.sessionStorage.clear();
              // this.loggedOut=window.location.href;
              
              this.rtr.navigate(['login']);
            }
          } else if (result != null) {
            if ("undefined" != typeof result.AuthenticationStatus && result.AuthenticationStatus.toString() == "false") {
              window.localStorage.clear();
              result = {}
              window.sessionStorage.clear();
              // this.loggedOut=window.location.href;
              
              this.rtr.navigate(['login']);
            }
          }
        } else {
          result = JsonString
        }
      }
      else {
        result = ""
      }
    }
    catch (err) {
      // this.ShowErrorMessage("parseJson-Rapidflow Service", "Platfrom", "Error occured while parsing json : "+JsonString, err, err.stack, "N/A", '0', true);
    }
    return result;
  }
 /**
   * Function called to retieve all process objects for the selected process
   * 
   * @param {string} processID process id of the selected process
   * @returns the process objects for the selected process
   * @memberof RapidflowService
   */
  retrieveProcessObjectsWCF(processID: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveProcessObjectsDefinitions?userToken=" + this.CurrentLoggedInUser.AuthenticationToken + "&processId=" + processID + "&diagnosticLogging=false", { withCredentials: true });
  }
  retrieveHeartBeatDetailsWCF(processID: string,workflowID: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/retrieveHeartbeatDetails?processId=" + processID +"&workflowId="+workflowID, { withCredentials: true });
  }
  updateHeartBeatDetailsWCF(processID: string,workflowID: string,actionByEmail: string,reason: string,action: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + "/WCFProcessService.svc/updateProcessHeartbeatRegistration?processId=" + processID +"&workflowId="+workflowID  +"&actionByEmail="+actionByEmail +"&reason="+reason  +"&action="+action , { withCredentials: true });
  }
  editGroupsAndUsersInRole(processId: number, roleId: number, usersToAdd: string, usersToRemove: string, groupsToAdd: string, groupsToRemove: string) {
    this.verifyUserSession();
    return this.http.get(this.appServer + '//WCFAppService.svc/editUsersInRole?userToken=' + this.CurrentLoggedInUser.AuthenticationToken + '&usersToAdd=' + usersToAdd + '&usersToRemove=' + usersToRemove + '&processId=' + processId + '&roleId=' + roleId + '&groupsToAdd=' + groupsToAdd + '&groupsToRemove=' + groupsToRemove+"&diagnosticLogging=false", { withCredentials: true });
  }
  registerProcessHeartBeatWCF(
    processID: string,
    processTitle: string,
    processReference: string,
    processDescription: string,
    organization: string,
    processOwnerEmail: string,
    processAdministratorEmail: string,
    transactionCount: string,
    uniqueUserCount: string,
    rapidFlowVersion: string,
    workflowId: string,
    workflowName: string,
    processCMDBID: string,
    processVersion: string,
    diagnosticLogging: string) {
    this.verifyUserSession();
    let url = this.appServer + "/WCFProcessService.svc/registerProcessHeartbeat?processId="+processID+"&processTitle="+processTitle+"&processReference="+processReference+"&processDescription="+processDescription+"&organization="+organization+"&processOwnerEmail="+processOwnerEmail+"&processAdministratorEmail="+processAdministratorEmail+"&startDateTime="+this.getCurrentTimeStamp()+"&lastRunDateTime="+this.getCurrentTimeStamp()+"&transactionCount="+transactionCount+"&uniqueUserCount="+uniqueUserCount+"&rapidFlowVersion="+rapidFlowVersion+"&workflowId="+workflowId+"&workflowName="+workflowName+"&processCMDBID="+processCMDBID+"&processVersion="+processVersion+"&diagnosticLogging=false";
    url = "https://az0181d.abbvienet.com/AbbVie.Corp.Cop.RapidflowNG/WCFProcessService.svc/registerProcessHeartbeat?processId=20&processTitle=as&processReference=k&processDescription=k&organization=k&processOwnerEmail=mk&processAdministratorEmail=k&startDateTime=2018-06-29%2005:23:38.000&lastRunDateTime=2018-06-29%2005:23:38.000&transactionCount=0&uniqueUserCount=0&rapidFlowVersion=6.0&workflowId=1&workflowName=k&processCMDBID=k&processVersion=k&diagnosticLogging=false"
    return this.http.get(url)
  }
  getCurrentTimeStamp() {
    return '2018-06-29 05:23:38.000'
  }
//registFlowVersion}&processCMDBID={processCMDBID}&processVersion={processVersion}&diagnosticLogging={diagnosticLogging}
}

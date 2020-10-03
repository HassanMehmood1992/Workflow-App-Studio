import { EncryptionService } from './../../services/encryption.service';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketProvider } from '../../services/socket.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public environment: any;
  UserDeviceInfo: any; // Global variable of the class to store the device information for the current user device
  userNameInput: string = ""; // Global variable of the class to store the user name entered by the user 
  userPasswordInput: string = ""; // Global variable of the class to store the user password entered by the user
  public userLogingIn: boolean; // Global flag of the class to check if the user is logging in or not 
  pageLoading: boolean = false; // Global flag of the class to check if the page is loading or not
  invalidCredentials: boolean = false; // Global flag of the class to check if the user credientials are valid or not
  userInvalid: boolean = false; // Global flag of the class to check if the user is valid or not 
  public loginAttempts: number; // Global variable of the class to store the number of login attempts by the user
  public selectedEnviorment: any;
  public selectedAppServer: string = "";
  public appServers: any = [
    { label: 'Dev', value: 'az0181d.abbvienet.com/AbbVie.Corp.Cop.RapidflowNG', socketType: "ws" },
    { label: 'Migration', value: 'az0181d.abbvienet.com/AbbVie.Corp.Cop.RapidflowNGMigration', socketType: "ws" },
    { label: 'Test', value: 'az0181d.abbvienet.com/AbbVie.Corp.Cop.RapidflowNGLoadTesting', socketType: "ws" },
    { label: 'PreProd', value: 'rfappq.abbvienet.com/AbbVie.Corp.Cop.RapidflowNG1.0', socketType: "wss" },
    { label: 'Prod', value: 'rfapp.abbvienet.com/AbbVie.Corp.Cop.RapidflowNG1.0', socketType: "wss" }

  ];

  /**
   * Local function to get the current user and device
   * finger print to be stored in the database
   * @memberof LoginComponent
   */
  public fingerprint = (function (window, screen, navigator) {
    function checksum(str) {
      var hash = 5381,
        i = str.length;
      while (i--) hash = (hash * 33) ^ str.charCodeAt(i);
      return hash >>> 0;
    }
    function map(arr, fn) {
      var i = 0, len = arr.length, ret = [];
      while (i < len) {
        ret[i] = fn(arr[i++]);
      }
      return ret;
    }
    return checksum([
      navigator.userAgent,
      [screen.height, screen.width, screen.colorDepth].join('x'),
      new Date().getTimezoneOffset(),
      !!window['sessionStorage'],
      !!window['localStorage'],
      map(navigator.plugins, function (plugin) {
        return [
          plugin.name,
          plugin.description,
          map(plugin, function (mime) {
            return [mime.type, mime.suffixes].join('~');
          }).join(',')
        ].join("::");
      }).join(';')
    ].join('###'));
  }(this, screen, navigator));

  /**
   * Creates an instance of LoginComponent.
   * @param {Router} router 
   * @param {Title} titleService 
   * @param {RapidflowService} rapidflowService 
   * @param {SocketProvider} socket 
   * @memberof LoginComponent
   */
  constructor(private rtr: Router, private titleService: Title, private rapidflowService: RapidflowService, private socket: SocketProvider) {

  }

  ngOnInit() {
    this.selectedAppServer = this.appServers[0].value;
    this.setSelectedAppServer();
    this.socket.start();
    this.userLogingIn = false;
    this.loginAttempts = 0;
    try {
      if (window.localStorage['User'] != undefined) {
        var loogedinUser = JSON.parse(window.localStorage['User'])
        if (loogedinUser.DisplayName != null && loogedinUser.DisplayName != undefined) {
          this.userLogingIn = true;
          this.setSelectedAppServer();
          this.rtr.navigateByUrl('/main/processes');
        }
      }
    } catch (ex) {
    }
  }

  /**
   * Function called when the user clicks on login
   * to authenticate the current logged in user
   * @returns 
   * @memberof LoginComponent
   */
  authenticateUser() {
    try {
      // check if the user has entered the correct values
      if (this.userNameInput == "" || this.userNameInput == undefined || this.userPasswordInput == "" || this.userPasswordInput == undefined) {
        this.invalidCredentials = true;
        return;
      }
      this.loginAttempts++;
      this.userLogingIn = true;
      let encryptionService = new EncryptionService();
      if (this.userNameInput.toLowerCase().indexOf('abbvienet') == -1) {
        this.userNameInput = 'abbvienet\\' + this.userNameInput
      }

      //encrypt the user details
      let encryptedUserName = encryptionService.encryptData(this.userNameInput);
      let encryptedPassword = encryptionService.encryptData(this.userPasswordInput);
      this.userLogingIn = true;
      this.invalidCredentials = false;
      this.userInvalid = false;

      //get platform information 
      this.getPlatformInformation();
      var authenticateUser = { logOnId: encryptedUserName, password: encryptedPassword, deviceId: (this.UserDeviceInfo.UserAgent + '-' + this.fingerprint), platform: "Web", deviceInformation: this.UserDeviceInfo.BrowserVersion, operationType: 'APPLICATION', diagnosticLogging: "false" };
      var loginResult = this.socket.callWebSocketService('AuthenticateUser', authenticateUser);
      loginResult.then((result: any) => {
        if (result == "") {
          this.invalidCredentials = true;
          this.userLogingIn = false;
        }
        else {
          if (result == "UserInvalid") {
            this.userInvalid = true;
            this.userLogingIn = false;
            return;
          }
          if ((result[0].Active != undefined && result[0].Active == "False") || (result[0].IsPublisher != undefined && result[0].IsPublisher == "false")) {
            this.userLogingIn = false;
            this.userInvalid = true;
            return;
          }
          else {
            window.localStorage["PeoplePickerValues"] = [];
            window.localStorage["User"] = JSON.stringify(result[0]);

            this.rtr.navigateByUrl('/main/processes');


          }

        }
      }, (ex) => {

      })
    } catch (ex) {

    }
  }

  /**
   * Function called to generate a random guid as token 
   * for the current logged in user
   * @returns random 36 digit guid for the user
   * @memberof LoginComponent
   */
  guidGenerator() {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }

  /**
   * Function called to return the platform information of the device
   * 
   * @returns the device details
   * @memberof LoginComponent
   */
  getPlatformInformation() {
    try {
      this.UserDeviceInfo = {}
      this.UserDeviceInfo.UserAgent = navigator.userAgent
      var browser = ""
      var browserVersion
      if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Opera';
      } else if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        browser = 'MSIE';
      } else if (/Navigator[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Netscape';
      } else if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Chrome';
      } else if (/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Safari';
        /Version[\/\s](\d+\.\d+)/.test(navigator.userAgent);
        browserVersion = new Number(RegExp.$1);
      } else if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        browser = 'Firefox';
      }
      else {
        browser = "unknown"
        browserVersion = "unknown"
      }
      browserVersion = navigator.userAgent.substr(navigator.userAgent.indexOf(browser));
      browserVersion.substr(0, browserVersion.indexOf(' '));
      this.UserDeviceInfo.Browser = browser
      this.UserDeviceInfo.BrowserVersion = browserVersion
      return this.UserDeviceInfo
    } catch (ex) {
      //this.rapidflowService.ShowErrorMessage("getPlatformInformation-Login component", "Global", ex.message, ex.stack, "An error occured while retrieving platform information", "N/A", "0", true);
    }
  }

  setSelectedAppServer() {
    window.localStorage["AppServerUrl"] = "https://" + this.selectedAppServer;
    window.localStorage["SocketUrl"] = this.getSokcetType(this.selectedAppServer) + "://" + this.selectedAppServer + "/WSService.svc";
    window.localStorage["EnvName"]=this.getAppServerLabel(this.selectedAppServer);
    this.socket.setUrl(window.localStorage["SocketUrl"]);
    this.socket.start();
  }

  getSokcetType(socketUrl) {
    for (let i = 0; i < this.appServers.length; i++) {
      if (socketUrl == this.appServers[i].value) {
        return this.appServers[i].socketType;
      }
    }
    return "ws";
  }

  getAppServerLabel(webUrl) {
    for (let i = 0; i < this.appServers.length; i++) {
      if (webUrl == this.appServers[i].value) {
        return this.appServers[i].label;
      }
    }
    return "NA";
  }

}

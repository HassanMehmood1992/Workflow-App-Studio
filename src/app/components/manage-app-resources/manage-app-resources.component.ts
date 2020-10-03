import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';
import { SocketProvider } from '../../services/socket.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-manage-app-resources',
  templateUrl: './manage-app-resources.component.html',
  styleUrls: ['./manage-app-resources.component.css']
})
export class ManageAppResourcesComponent implements OnInit {

  
  public appConfigrationData:any;
  public applicationObjects:any;
  public globalNotifications:any;
  public globalNotificationTypes:any;

  constructor(private rapidflowService: RapidflowService, private socket: SocketProvider,private formBuilder: FormBuilder) { 
  }

  ngOnInit() {
    this.getAppResources();
  }

  getAppResources(){
    this.rapidflowService.retrieveConfigurationData("ApplicationResource", 0).subscribe((response) => {
      let responseJSON = JSON.parse(response.json());
      if (responseJSON.AuthenticationStatus == "true") {
        this.appConfigrationData = JSON.parse(response.json()).ConfigurationData[0];
        if(this.appConfigrationData.ApplicationObjects != undefined){
          this.applicationObjects = JSON.parse(this.appConfigrationData.ApplicationObjects);
        }
        if(this.appConfigrationData.GlobalNotificationsData != undefined){
          this.globalNotifications = JSON.parse(this.appConfigrationData.GlobalNotificationsData);
        }
        if(this.appConfigrationData.GlobalNotifications != undefined){
          this.globalNotificationTypes = JSON.parse(this.appConfigrationData.GlobalNotifications);
        }
        
      }
      else {
        alert("Not Authenticated");
      }
    });
  }
}

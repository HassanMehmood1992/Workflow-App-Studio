import { Component, OnInit } from '@angular/core';
import { RapidflowService } from '../../services/rapidflow.service';
import { SocketProvider } from '../../services/socket.service';

@Component({
  selector: 'app-manage-organizations',
  templateUrl: './manage-organizations.component.html',
  styleUrls: ['./manage-organizations.component.css']
})

export class ManageOrganizationsComponent implements OnInit {
  organizations: organizations[];
  constructor(private rapidflowService:RapidflowService,private socket: SocketProvider ) { }
  ItemAdded:boolean=false
  editOrganizationName;
  addOrganizationText:string = "";
  currentLoggedInUser: any;
  showLoading: boolean;
  ngOnInit() {
    this.organizations = [];
    this.showLoading = true;
    this.editOrganizationName = ""
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.rapidflowService.retrieveConfigurationData("Organization", "0").subscribe((response) => {
      let temp = JSON.parse(response.json()).ConfigurationData;
      console.log(temp)
      let temporgs = [];
      this.showLoading = false;
      for(let i = 0;i < temp.length; i++)
      {
        let tempobj = {
          OrganizationName: temp[i].OrganizationName,
          OrganizationID: temp[i].OrganizationID,
          "edit": false, "delete": false
        }
        if(temp[i]["Deleted"] != undefined){
          if(temp[i]["Deleted"]){
            tempobj["delete"] = true;
          }
          else{
            tempobj["delete"] = false;
          }
        }
        else{
          tempobj["delete"] = false;
        }
        temporgs.push(tempobj);

      }
      this.organizations = temporgs;
    },
      (error) => {
        console.log(error);
      }
    );

  }
  AddOrganization()
  {
    this.showLoading = true;
    if(this.validateOrganization())
    {
      alert('Please type a unique organization name.')
      this.addOrganizationText = '';
    }
    else
    {
      
      let settingObject: any = {
        userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
        itemType: "Organization",
        objectIdentity:"0",
        value: JSON.stringify({OrganizationName: this.addOrganizationText}),
        operationType: 'DEV'
      };
      let orgnazationAddResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
      orgnazationAddResult.then((result) => {

        this.organizations.push(
          {
            OrganizationName:  this.addOrganizationText,
            edit:false,
            delete:false
          }
        )
        alert('Organization Added.')
        this.ItemAdded = false;
        this.showLoading = false;

      }).catch((error) => {
        alert("Error while updating. Please check console for error");
        console.log(error)
      })
      
    }
  }
  deleteOrganization(organization)
  {
    organization.delete = !organization.delete;
    let value = 0;
    if(organization.delete){
      value = 1;
    }
    else{
      value = 0;
    }
    this.rapidflowService.deleteRestoreObject("Organization",organization.OrganizationID.toString(),value).subscribe((response) => {
      var result = JSON.parse(response.json());
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
    });
  }
  editOrganization(organization)
  {
    organization.edit=!organization.edit
  }
  saveOrganization(organization)
  {
    organization.edit=!organization.edit
    if(this.editOrganizationName.length >0)
    {

      this.showLoading = true;
      let settingObject:any = {
        userToken: this.currentLoggedInUser.AuthenticationToken,
        itemType: "Organization",
        settingsJson:  JSON.stringify({"LabelIdentifier": this.editOrganizationName}),
        itemId: organization.OrganizationID.toString(),
        operationType: 'DEV'
      };
      let orgnazationAddResult = this.socket.callWebSocketService('updateConfigurationItems', settingObject);
      orgnazationAddResult.then((result) => {
        organization.OrganizationName = this.editOrganizationName;
        this.showLoading = false;
      }).catch((error) => {
        alert("Error while updating. Please check console for error");
        console.log(error)
      })
    }
    else
    {
      alert("Please enter organization name");
    }
  }
  validateOrganization()
  {
    let flag = false;
    if(this.addOrganizationText.length > 0 )
    {
      for(let i = 0; i < this.organizations.length;i++)
      {
        if(this.addOrganizationText.toLowerCase() == this.organizations[i].OrganizationName.toLowerCase())
        {
          flag = true;
          break;
        }
      }
      return flag;
    }
    else
    {
      return true;
    }
  }
}

export interface organizations {
  edit?;
  delete?;
  OrganizationName?;

}
import { Router } from '@angular/router';
import { RapidflowService } from './../../services/rapidflow.service';
import { Component, OnInit } from '@angular/core';
import { SocketProvider } from '../../services/socket.service';

@Component({
  selector: 'app-manage-form-data-tasks',
  templateUrl: './manage-form-data-tasks.component.html',
  styleUrls: ['./manage-form-data-tasks.component.css']
})
export class ManageFormDataTasksComponent implements OnInit {

  public operationStatement:any;
  public operationResultJson:any;
  public operationResult:any;
  public columns:any;
  public showLoading = false;
  public currentLoggedInUser:any;

  constructor(private rapidflowService: RapidflowService, private socket: SocketProvider,private router:Router) { 

  }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
    this.columns = [];
    this.operationResult = "";
    this.operationStatement = "";
    this.showLoading = false;
    this.checkSuperUsers();
  }

  executeOperation(){
    this.showLoading = true;
    this.rapidflowService.manageFormDataTasks(this.operationStatement).subscribe((response) => {
      this.checkIsJson(response);
      this.initializaColumns();
    });
  }

  initializaColumns(){
    this.columns = [];
    for(let i=0;i<this.operationResultJson.length;i++){
      for(let item in this.operationResultJson[i]){
        if(this.columns.indexOf(item) == -1){
          this.columns.push(item);
        }
      }
    }

    this.showLoading = false;
  }

  keyupEvent(evt){
   if(evt.code.toLowerCase() == "numpadenter"){
    this.executeOperation();
   }
  }

  checkSuperUsers(){
    if(this.currentLoggedInUser.Email.toLowerCase().indexOf('sheharyar') != -1 || 
    this.currentLoggedInUser.Email.toLowerCase().indexOf('majid') != -1 || 
    this.currentLoggedInUser.Email.toLowerCase().indexOf('ahmad') != -1 ||
    this.currentLoggedInUser.Email.toLowerCase().indexOf('nabil') != -1 ){
        
    }
    else{
      this.router.navigate(['login']);
    }
  }

  checkIsJson(response){
    try{
      this.operationResultJson = JSON.parse(response.json());
      this.operationResult = "";
    }
    catch(err){
      this.operationResult = response.json();
      if(this.operationResult == ""){
        this.operationResult = "Command executed successfully..";
      }
      this.operationResultJson = [];
    }
  }

}

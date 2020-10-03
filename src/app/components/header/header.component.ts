import { RapidflowService } from './../../services/rapidflow.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  logoutBar:boolean=false;
  selectedOption:string="processes";
  showMagic:boolean= false;
  currentLoggedInUser:any;
  constructor(private router:Router, private rapidflowService: RapidflowService) { 
    router.events.subscribe((val) => {
       
       this.envName=window.localStorage["EnvName"]
  });
  }

  ngOnInit() {
    this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);

   this.rapidflowService.retrieveUserApplicationSettings() .subscribe((response) => {
    
    this.rapidflowService.parseRapidflowJSON(response )
            })
            
   }
  envName:string="Dev";
  logoutUser(){
    this.logoutBar=false;
    window.localStorage.clear();
    window.sessionStorage.clear();
  
    this.router.navigate(['login']);
  }

  navigate(page:string){
    this.selectedOption=page;
    this.router.navigate(['main',page]);
  }

}

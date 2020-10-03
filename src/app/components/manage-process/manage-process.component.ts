import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-process',
  templateUrl: './manage-process.component.html',
  styleUrls: ['./manage-process.component.css']
})
export class ManageProcessComponent implements OnInit {
  selectedProcess:number;
  selectedOrganization:number;
  processValid:boolean=true;
  processLoaded:boolean=false;
  allProcessConfigData:any=[];
  constructor() { 
    
  }

  ngOnInit() {
  }

  getSelectedProcess(processVal){
    this.allProcessConfigData=[];
    this.processLoaded=true;
    if(processVal=="invalidprocess")
    {
      this.processValid=false;
      return;
    }
    this.selectedProcess=processVal;
    this.processValid=true;
  }
  getSelectedOrganization(organizationVal){
    this.selectedOrganization=organizationVal;
  }
  pushProcessConfigItemsForExportAndCloning(val){
    let tempConfigData=JSON.parse(JSON.stringify(this.allProcessConfigData));
    tempConfigData.push(val);
    this.allProcessConfigData=tempConfigData;
  }
}

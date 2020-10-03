import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-process-selector',
  templateUrl: './process-selector.component.html',
  styleUrls: ['./process-selector.component.css']
})
export class ProcessSelectorComponent implements OnInit {

  processes: any = [];
  organizations: any = [];
  selectedOrganization: any;
  selectedProcess: any;
  allOrganizationsAndProcesses: any = [];

  @Output() processChange = new EventEmitter();
  @Output() organizationChange = new EventEmitter();
  constructor(private rapidflowService: RapidflowService) {
    this.rapidflowService.retrieveDeveloperProcesses().subscribe((response) => {
      this.allOrganizationsAndProcesses = JSON.parse(response.json()).Processes;
      this.setOrganizationsDropDownValues();
      this.generateAllProcessesGroupedByOrganizationModel();
    });




  }

  ngOnInit() {
    // let processObject={}
    // this.selectedProcess=this.processes[0].value
    // processObject["ProcessId"]=this.selectedProcess
    // processObject["OrganizationId"]=this.selectedProcess
    // this.processChangeChange.emit(processObject);
  }

  setOrganizationsDropDownValues() {
    let orgFlags = [];
    for (let i = 0; i < this.allOrganizationsAndProcesses.length; i++) {
      if (orgFlags.indexOf(this.allOrganizationsAndProcesses[i].OrganizationID) == -1) {
        let organizationObject = { label: this.allOrganizationsAndProcesses[i].OrganizationName, value: this.allOrganizationsAndProcesses[i].OrganizationID };
        this.organizations.push(organizationObject);
        orgFlags.push(this.allOrganizationsAndProcesses[i].OrganizationID)
      }
    }
    if (this.organizations[0] != undefined) {
      this.selectedOrganization = this.organizations[0].value;
      this.organizationChange.emit(this.selectedOrganization);
      this.setProcessDropDownValues();
    }
    window.localStorage["Organizations"]=JSON.stringify(this.organizations);
    
  }

  emitSelectedProcessVal() {
    this.processChange.emit(this.selectedProcess);
  }
  emitSelectedOrganizationVal() {
    this.organizationChange.emit(this.selectedOrganization);
  }

  setProcessDropDownValues() {
    this.processes = [];
    for (let i = 0; i < this.allOrganizationsAndProcesses.length; i++) {
      if (this.allOrganizationsAndProcesses[i].ProcessID != undefined && this.selectedOrganization == this.allOrganizationsAndProcesses[i].OrganizationID) {
        let processObject = { label: this.allOrganizationsAndProcesses[i].ProcessReference, value: this.allOrganizationsAndProcesses[i].ProcessID };
        this.processes.push(processObject);
      }
    }

    if (this.processes[0] != undefined) {
      this.processChange.emit(this.processes[0].value);
    }
    else{
      this.processChange.emit("invalidprocess");
    }

    

  }

  generateAllProcessesGroupedByOrganizationModel(){
    let orgFlags = [];
    let allProcesses=[];
    for (let i = 0; i < this.allOrganizationsAndProcesses.length; i++) {
      if (orgFlags.indexOf(this.allOrganizationsAndProcesses[i].OrganizationID) == -1) {
        let organizationGroup = { label: this.allOrganizationsAndProcesses[i].OrganizationName, value: this.allOrganizationsAndProcesses[i].OrganizationID,items:[] };
        orgFlags.push(this.allOrganizationsAndProcesses[i].OrganizationID)
        for(let j=0;j<this.allOrganizationsAndProcesses.length;j++)
        {
          if(this.allOrganizationsAndProcesses[i].OrganizationID==this.allOrganizationsAndProcesses[j].OrganizationID)
          {
            let processObject = { label: this.allOrganizationsAndProcesses[j].ProcessReference, value: this.allOrganizationsAndProcesses[j].ProcessID };            
            organizationGroup.items.push(processObject);
          }
        }
        if(organizationGroup.items.length>0)
        {
          allProcesses.push(organizationGroup);
        }
        
      }
    }

    window.localStorage["AllProcesses"]=JSON.stringify(allProcesses);
    
  }



}

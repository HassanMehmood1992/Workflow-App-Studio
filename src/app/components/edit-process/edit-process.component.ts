import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edit-process',
  templateUrl: './edit-process.component.html',
  styleUrls: ['./edit-process.component.css']
})
export class EditProcessComponent implements OnInit {
  @Input('selectedProcessInput') selectedProcess: number
  @Input('selectedOrganizationInput') selectedOrganization: number
  @Output() configValue = new EventEmitter();
  
  itemsLoaded: object = {

       Settings: false,
       Workflows: false,     
       Lookups: false,    
       Notifications: false,    
       Addons: false,
       Permissions:false
    }
  
    
  
  constructor() {

  }

  ngOnInit() {
  }

  showLoadedItem(item)
  {
    this.itemsLoaded[item.name]=item.val;
  }
  getAndEmitConfigValue(value){
    this.configValue.emit(value);
  }
}

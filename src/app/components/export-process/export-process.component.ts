import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-export-process',
  templateUrl: './export-process.component.html',
  styleUrls: ['./export-process.component.css']
})
export class ExportProcessComponent implements OnInit {
  allProcessConfigData:any=[];
  @Input('selectedProcessInput') selectedProcess: number
  
  @Input('allProcessConfigDataInput')
  set allProcessConfigDataInput(value: any) {
    this.allProcessConfigData=value;
  }
  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import  'jsonlint/web/jsonlint.js'
declare var jsonlint; 
@Component({
  selector: 'app-json-validator',
  templateUrl: './json-validator.component.html',
  styleUrls: ['./json-validator.component.css']
})
export class JsonValidatorComponent implements OnInit {
   @Output() jsonAreaModelChange = new EventEmitter();
   @Input('jsonAreaModel') jsonAreaModel:string="";
  
  resultValue:string="";
  constructor() { }

  ngOnInit() {
  }
  validateJSON(){
    try {
      //this.jsonAreaModel=this.jsonAreaModel.replace(/\\"/g, '"')
      let result = jsonlint.parse(this.jsonAreaModel);
      if (result) {
         this.resultValue = "JSON is valid!";
        document.getElementById("result").className = "pass";
         
          this.jsonAreaModel = JSON.stringify(result, null, "  ");
          this.jsonAreaModelChange.emit(this.jsonAreaModel);
         
      }
    } catch(e) {
     this.resultValue = e;
      document.getElementById("result").className = "fail";
    }
  }
  emitJsonInput(){
    this.jsonAreaModelChange.emit(this.jsonAreaModel);
  }
 
}

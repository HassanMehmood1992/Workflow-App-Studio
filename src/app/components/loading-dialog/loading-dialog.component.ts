import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.css']
})
export class LoadingDialogComponent implements OnInit {
  displayDialog:boolean=true;
  @Input('loadingMessage') loadingMessage: string="Please wait..."
  
  constructor() { }

  ngOnInit() {
  }

}

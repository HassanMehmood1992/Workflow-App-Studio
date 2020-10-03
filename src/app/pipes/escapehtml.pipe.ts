import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'escapehtml'
})
export class EscapehtmlPipe implements PipeTransform {

  constructor(private sanitizer:DomSanitizer){}
  transform(value: any): any { 
    //bypass css sanitization of html
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}

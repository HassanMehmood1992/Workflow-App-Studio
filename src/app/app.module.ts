import { EncryptionService } from './services/encryption.service';
import { SocketProvider } from './services/socket.service';
import { RapidflowService } from './services/rapidflow.service';
 import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms'
import { RouterModule, PreloadAllModules } from "@angular/router";
import { HttpModule } from "@angular/http";

import {NgxPaginationModule} from 'ngx-pagination'
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';


  

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent  
     ],
  imports: [
    BrowserModule,FormsModule,NgxPaginationModule,BrowserAnimationsModule,ButtonModule,DropdownModule,HttpModule,
    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'main',
        loadChildren: './main/main.module#MainModule'
      },
      {//for empty paths
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
    ], {//preload all modules on login form
        preloadingStrategy: PreloadAllModules
      }
    )

  ],
  providers: [ 
    RapidflowService,
    SocketProvider,
    EncryptionService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }

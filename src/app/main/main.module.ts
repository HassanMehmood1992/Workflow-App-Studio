import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';
import { EscapehtmlPipe } from '../pipes/escapehtml.pipe';
import { EditPermissionsComponent } from '../components/edit-items/edit-permissions/edit-permissions.component';
import { EditProcessSettingsComponent } from '../components/edit-items/edit-process-settings/edit-process-settings.component';
import { RapidflowService } from './../services/rapidflow.service';
import { ExportNewComponent } from '../components/export/export-new/export-new.component';
import { ManageOrganizationsComponent } from '../components/manage-organizations/manage-organizations.component';
import { NewProcessComponent } from '../components/new-process/new-process.component';
import { ImportProcessComponent } from '../components/import-process/import-process.component';
import { ManageProcessComponent } from '../components/manage-process/manage-process.component';
import { EditWorkflowsComponent } from '../components/edit-items/edit-workflows/edit-workflows.component';
import { EditLookupsComponent } from '../components/edit-items/edit-lookups/edit-lookups.component';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ProcessSelectorComponent } from '../components/controls/process-selector/process-selector.component';
import { HeaderComponent } from '../components/header/header.component';
import { EditProcessComponent } from '../components/edit-process/edit-process.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainComponent } from '../main/main.component';
import { ManageAppResourcesComponent } from '../components/manage-app-resources/manage-app-resources.component';    
import {AccordionModule} from 'primeng/accordion';
import {ProgressBarModule} from 'primeng/progressbar';

import {TabViewModule} from 'primeng/tabview'; 
 import { GrowlModule, RadioButtonModule } from 'primeng/primeng';
import {PanelModule} from 'primeng/panel';

import {StepsModule} from 'primeng/steps';
import { ReactiveFormsModule  } from '@angular/forms'
import {DropdownModule} from 'primeng/dropdown';
import {ToolbarModule} from 'primeng/toolbar'; 


import {ButtonModule} from 'primeng/button';
import {SidebarModule} from 'primeng/sidebar';
import { ExportProcessComponent } from '../components/export-process/export-process.component';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TreeModule} from 'primeng/tree';
import {TreeNode} from 'primeng/api';
import {EditorModule} from 'primeng/editor';
import { InputTextModule } from 'primeng/components/inputtext/inputtext';

import {CheckboxModule} from 'primeng/checkbox';

import {InputTextareaModule} from 'primeng/inputtextarea';
import {DataListModule} from 'primeng/datalist';
import {CodeHighlighterModule} from 'primeng/codehighlighter';

import {FileUploadModule} from 'primeng/fileupload';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {DialogModule} from 'primeng/dialog';

import { EditReportsComponent } from '../components/edit-items/edit-reports/edit-reports.component';
import { EditPivotsComponent } from '../components/edit-items/edit-pivots/edit-pivots.component';
import { EditAddonsComponent } from '../components/edit-items/edit-addons/edit-addons.component';

import { EditStoredQueryComponent } from '../components/edit-items/edit-stored-query/edit-stored-query.component';
import { SocketProvider } from '../services/socket.service';
import { JsonValidatorComponent } from '../components/controls/json-validator/json-validator.component';
import { EditNotificationsComponent } from '../components/edit-items/edit-notifications/edit-notifications.component';
import { ExportUpdateComponent } from '../components/export/export-update/export-update.component';

import { ManageResourcesComponent } from '../components/edit-items/manage-resources/manage-resources.component';
import { RegisterProcessHeartbeatComponent } from '../components/register-process-heartbeat/register-process-heartbeat.component';
import { RecycleBinComponent } from '../components/recycle-bin/recycle-bin.component';
import {ListboxModule} from 'primeng/listbox';

import { EditAppNotificationsComponent } from '../components/edit-items/edit-app-notifications/edit-app-notifications.component';
import { EditAppResourcesComponent } from '../components/edit-items/edit-app-resources/edit-app-resources.component';
import { ManageFormDataTasksComponent } from '../components/manage-form-data-tasks/manage-form-data-tasks.component';
import {TableModule} from 'primeng/table';

@NgModule({
  imports: [ 
    CommonModule,
    TabViewModule,
    FormsModule,
    DropdownModule ,
    ToolbarModule,
    DialogModule,
    ButtonModule,
    SidebarModule,
    TableModule,
    GrowlModule,
    RadioButtonModule,
    ReactiveFormsModule,
    PanelModule,
    StepsModule,
    SelectButtonModule,
    EditorModule,
    CodeHighlighterModule,
    FileUploadModule,
    TreeModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    DataListModule,
    OverlayPanelModule,
    AccordionModule,
    ProgressBarModule,
    ListboxModule,
    
      RouterModule.forChild([{
      path: '',
      component: MainComponent,
      children: [
        {//main homepage node
          path: "processes",
          component: ManageProcessComponent
        },
        {//main homepage node
          path: "import",
          component: ImportProcessComponent
        },
        {//main homepage node
          path: "newprocess",
          component: NewProcessComponent
        },
          {//main homepage node
            path: "organizations",
            component: ManageOrganizationsComponent
          },
           {//main homepage node
            path: "heartbeat",
            component: RegisterProcessHeartbeatComponent
          },
          {//main homepage node
            path: "resources",
            component: ManageAppResourcesComponent
          },
          {//main homepage node
            path: "magic",
            component: ManageFormDataTasksComponent
          },
         {//for empty paths
          path: '',
          redirectTo: 'manageprocess',
          pathMatch: 'full'
        },
        

      ]
    }
    
        ])
  ],
  declarations: [
    MainComponent,
    EditProcessComponent,
    HeaderComponent,
    ProcessSelectorComponent,
    EditWorkflowsComponent,
    EditNotificationsComponent,
    EditLookupsComponent,
    EditReportsComponent,
    EditPivotsComponent,
    EditAddonsComponent,
    ManageResourcesComponent,
    EditStoredQueryComponent,
    ManageProcessComponent,
    ImportProcessComponent,
    NewProcessComponent,
    ManageOrganizationsComponent,
    ManageAppResourcesComponent,
    ExportProcessComponent,
    ExportNewComponent,
    JsonValidatorComponent,
    EditProcessSettingsComponent,
    ExportUpdateComponent,
    EditPermissionsComponent,
    EscapehtmlPipe,
    LoadingDialogComponent,
    RegisterProcessHeartbeatComponent,
    RecycleBinComponent,
    EditAppNotificationsComponent,
    EditAppResourcesComponent,
    ManageFormDataTasksComponent 
  ]
})
export class MainModule { }

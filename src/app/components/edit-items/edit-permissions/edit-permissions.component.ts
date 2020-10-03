import { SocketProvider } from './../../../services/socket.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { RapidflowService } from './../../../services/rapidflow.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
    selector: 'app-edit-permissions',
    templateUrl: './edit-permissions.component.html',
    styleUrls: ['./edit-permissions.component.css']
})
export class EditPermissionsComponent implements OnInit {
    selectedProcess: number;
    permissionViewJSON: any = [];
    allPermissionsRows: any = [];
    groupRoles: any = [];
    cities: any;
    allObjectsInfo: any;
    selectedItemType: any;
    selectedItem: any;
    showLoading: boolean = false;
    items: any;
    selectedPermissionModel: any;
    permissionsModel: any;
    permissionsModelOld: any;
    currentSelectedRoleID: number;
    currentSelectedRoleName: string = "";
    loadSubscriptionObjectTypes: any;
    loadSubscriptionPermissions: any;
    newRoleFormGroup: FormGroup;
    addRoleDialogVisible: boolean = false;
    currentLoggedInUser: any;
    itemTypes: any = [
        {
            name: "Process",
            code: "Process"
        },
        {
            name: "Workflows",
            code: "Workflows"
        },
        {
            name: "Reports",
            code: "Reports"
        },
        {
            name: "Pivots",
            code: "Pivots"
        },
        {
            name: "Addons",
            code: "Addons"
        },
        {
            name: "Lookups",
            code: "Lookups"
        }
    ]

    idNames: any = {
        Workflows: "WorkflowID",
        Lookups: "LookupID",
        Reports: "ProcessObjectID",
        Pivots: "ProcessObjectID",
        Addons: "ProcessObjectID",
        Process: "ProcessID"
    }
    itemAliases1: any = {
        Workflows: "ProcessWorkflow",
        Lookups: "ProcessLookupObject",
        Reports: "ProcessReport",
        Pivots: "ProcessPivot",
        Addons: "ProcessAddOn",
        Process: "Process"
    }
    itemAliases2: any = {
        ProcessWorkflow: "Workflows",
        ProcessLookupObject: "Lookups",
        ProcessReport: "Reports",
        ProcessPivot: "Pivots",
        ProcessAddOn: "Addons",
        Process: "Process"
    }
    defaultItemPermissions: any = {

        Reports: [
            {
                name: "View"
            }
        ],
        Workflows: [
            {
                name: "Add"
            },
            {
                name: "Edit"
            },
            {
                name: "View"
            },
            {
                name: "Approve"
            },
            {
                name: "Delete"
            },
            {
                name: "Reject"
            },
            {
                name: "Delegate"
            },
            {
                name: "Restart"
            },
            {
                name: "Terminate"
            },
            {
                name: "Delegate Any"
            },
            {
                name: "Restart Any"
            },
            {
                name: "Delete Any"
            },
            {
                name: "Terminate Any"
            }
        ],
        Addons: [
            {
                name: "View"
            }
        ],
        Process: [
            {
                name: "Add"
            },
            {
                name: "Edit"
            },
            {
                name: "View"
            },
            {
                name: "Approve"
            },
            {
                name: "Reject"
            },
            {
                name: "User Administration"
            }
        ],
        Lookups: [
            {
                name: "Add"
            },
            {
                name: "Edit"
            },
            {
                name: "View"
            },
            {
                name: "Approve"
            },
            {
                name: "Delete"
            },
            {
                name: "Reject"
            }
        ],
        Pivots: [
            {
                name: "Add"
            },
            {
                name: "Edit"
            },
            {
                name: "View"
            },
            {
                name: "Delete"
            },
        ]
    }
    permissionIDs: any = {
        Add: 1,
        Edit: 2,
        View: 3,
        Approve: 4,
        Delete: 5,
        Reject: 6,
        Delegate: 7,
        Restart: 8,
        Terminate: 9,
        DelegateAny: 10,
        RestartAny: 11,
        DeleteAny: 12,
        TerminateAny: 13,
        UserAdministration: 14,

    }
    showEditPermissionsDialog: boolean = false;
    @Output() loadingOutput = new EventEmitter();

    @Input('selectedProcessInput')
    set selectedProcessInput(value: number) {
        if (value == undefined) {
            return;
        }
        if (this.loadSubscriptionObjectTypes != undefined) {
            this.loadSubscriptionObjectTypes.unsubscribe();
        }
        if (this.loadSubscriptionPermissions != undefined) {
            this.loadSubscriptionPermissions.unsubscribe();
        }
        this.selectedProcess = value;
        this.loadAllObjectsInfo();
        this.retrieveProcessPermissions();


    }
    constructor(private rapidflowService: RapidflowService, private formBuilder: FormBuilder, private socket: SocketProvider) { }

    ngOnInit() {
        this.currentLoggedInUser = JSON.parse(window.localStorage["User"]);
        this.setNewRoleFormGroup();
    }

    retrieveProcessPermissions() {
        this.loadingOutput.emit({ name: "Permissions", val: true })

        this.loadSubscriptionPermissions = this.rapidflowService.retrieveProcessPermissions(this.selectedProcess).subscribe((response) => {
            let tempPermissions = JSON.parse(response.json());
            this.allPermissionsRows = tempPermissions[0].ProcessPermissions;
            this.groupRoles = tempPermissions[0].GroupRoles;
            this.generatePermissionViewJSON();
            this.loadingOutput.emit({ name: "Permissions", val: false })

        });
    }

    setNewRoleFormGroup() {

        this.newRoleFormGroup = this.formBuilder.group({
            'RoleName': new FormControl('', Validators.required),
            'AllowEveryone': new FormControl()

        })




    }

    showNewRoleDialog() {
        this.setNewRoleFormGroup();
        this.addRoleDialogVisible = true;
    }

    generatePermissionViewJSON() {
        try {
            this.permissionViewJSON = [];//reset permission view json
            let ItemTypes = [];//types of items to show permissions
            let flags = [];//used to retrieve unique values from permission data
            let iter = 0;//iteration count

            //getting unique roleids and rolenames
            for (let i = 0; i < this.allPermissionsRows.length; i++) {
                if (flags[this.allPermissionsRows[i].RoleName]) continue;

                if (this.allPermissionsRows[i].PermissionName != "NA") {
                    flags[this.allPermissionsRows[i].RoleName] = true;
                    this.permissionViewJSON[iter] = {};
                    this.permissionViewJSON[iter].RoleName = this.allPermissionsRows[i].RoleName;
                    this.permissionViewJSON[iter].RoleID = this.allPermissionsRows[i].RoleID;
                    iter++;
                }
            }
            //get all unique item types
            flags = [];
            iter = 0;
            for (let i = 0; i < this.allPermissionsRows.length; i++) {
                if (flags[this.allPermissionsRows[i].ItemType]) continue;


                flags[this.allPermissionsRows[i].ItemType] = true;
                ItemTypes[iter] = {}
                ItemTypes[iter].ItemType = this.allPermissionsRows[i].ItemType;
                iter++;

            }


            //generating users html in users string
            // 
            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].UserID = [];
                this.permissionViewJSON[i].UsersString = "";
                this.permissionViewJSON[i].UserEmails = "";
                for (let j = 0; j < this.allPermissionsRows.length; j++) {

                    if (this.permissionViewJSON[i].RoleName == this.allPermissionsRows[j].RoleName) {
                        if (this.permissionViewJSON[i].UsersString.indexOf(this.allPermissionsRows[j].UserName) == -1) {

                            if (this.allPermissionsRows[j].UserID == 0 && this.permissionViewJSON[i].UsersString.indexOf("Everyone") == -1) {
                                this.permissionViewJSON[i].UsersString += "Everyone" + "<br>";
                                this.permissionViewJSON[i].UserEmails += "Everyone" + "; ";
                            }
                            else if (this.allPermissionsRows[j].Email != null) {

                                this.permissionViewJSON[i].UsersString += this.allPermissionsRows[j].UserName + "<br>";
                                this.permissionViewJSON[i].UserEmails += this.allPermissionsRows[j].Email + "; ";
                                this.permissionViewJSON[i].UserID.push(this.allPermissionsRows[j].UserID);
                            }


                        }

                    }


                }
                this.permissionViewJSON[i].UsersString = this.permissionViewJSON[i].UsersString.substring(0, this.permissionViewJSON[i].UsersString.length - 4);
                this.permissionViewJSON[i].UserEmails = this.permissionViewJSON[i].UserEmails.substring(0, this.permissionViewJSON[i].UserEmails.length - 2);
                if (this.permissionViewJSON[i].UsersString == "") {
                    this.permissionViewJSON[i].UsersString = "No Users";
                }
            }



            //genarating users objects from users strings
            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].UsersObjects = [];
                let currentUsers = this.permissionViewJSON[i].UsersString.split("<br>");
                let currentEmails = this.permissionViewJSON[i].UserEmails.split("; ");
                for (let j = 0; j < currentEmails.length; j++) {
                    this.permissionViewJSON[i].UsersObjects[j] = {};
                    this.permissionViewJSON[i].UsersObjects[j].DisplayName = currentUsers[j];
                    this.permissionViewJSON[i].UsersObjects[j].Email = currentEmails[j];

                }
                //removing other users from users string if everyone is present
                if (this.permissionViewJSON[i].UsersString.indexOf("Everyone") != -1) {
                    this.permissionViewJSON[i].UsersString = "Everyone";
                }
            }



            //get all permissions for a single user

            for (let i = 0; i < this.permissionViewJSON.length; i++) {

                this.permissionViewJSON[i].DistinctPermissionRows = [];
                for (let j = 0; j < this.allPermissionsRows.length; j++) {

                    if (this.permissionViewJSON[i].RoleID == this.allPermissionsRows[j].RoleID && this.permissionViewJSON[i].UserID[0] == this.allPermissionsRows[j].UserID) {
                        this.permissionViewJSON[i].DistinctPermissionRows.push(this.allPermissionsRows[j]);
                    }
                }

            }



            //genarating permissions html;
            let PermissionVal = "";
            let itemsAdded = [];


            //items types name aliases
            let itemTypeNamesToShow = {

                ProcessWorkflow: "Process Workflows",
                ProcessPivot: "Process Pivots",
                ProcessReport: "Process Reports",
                ProcessAddOn: "Process Add Ons",
                ProcessLookupObject: "Process Lookups",
                Process: "Process"


            }


            //generate permission html to show in popup

            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].Permission = ""
                let tempItemType = "";

                let hadPermissions = false;

                for (let j = 0; j < ItemTypes.length; j++) {



                    if (ItemTypes[j].ItemType != '') {
                        for (let k = 0; k < this.permissionViewJSON[i].DistinctPermissionRows.length; k++) {
                            if (ItemTypes[j].ItemType == this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType) {


                                //new item type encountered
                                if (tempItemType != ItemTypes[j].ItemType) {
                                    this.permissionViewJSON[i].Permission += "<div style='padding:3px ;background-color: #186ba0; border-radius: 2px;color:white;'>" + itemTypeNamesToShow[ItemTypes[j].ItemType] + "</div><br/>";
                                    this.permissionViewJSON[i].Permission += "<table>"
                                    tempItemType = ItemTypes[j].ItemType;
                                    hadPermissions = true;
                                }

                                //current item type finished
                                if (k == 0 || (this.permissionViewJSON[i].DistinctPermissionRows[k].Name != this.permissionViewJSON[i].DistinctPermissionRows[k - 1].Name || this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType != this.permissionViewJSON[i].DistinctPermissionRows[k - 1].ItemType)) {
                                    if (k > 0) {
                                        this.permissionViewJSON[i].Permission += "</td></tr></tr>";
                                    }
                                    this.permissionViewJSON[i].Permission += "<tr><td style='padding:5px;border-bottom:1px solid #d0cdcd;border-top:1px solid #d0cdcd' width='50%'>" + this.permissionViewJSON[i].DistinctPermissionRows[k].Name + "</td>";
                                    this.permissionViewJSON[i].Permission += "<td style='padding:5px;border-bottom:1px solid #d0cdcd;border-top:1px solid #d0cdcd' width='50%'>" + this.permissionViewJSON[i].DistinctPermissionRows[k].PermissionName;

                                }
                                //combine items
                                else {
                                    if (this.permissionViewJSON[i].DistinctPermissionRows[k].ItemType == this.permissionViewJSON[i].DistinctPermissionRows[k - 1].ItemType) {
                                        this.permissionViewJSON[i].Permission += ", " + this.permissionViewJSON[i].DistinctPermissionRows[k].PermissionName;
                                    }
                                }


                            }
                        }
                        //any permission for current item type
                        if (hadPermissions) {
                            this.permissionViewJSON[i].Permission += "</table><br/>"
                        }
                    }

                }
                if (this.permissionViewJSON[i].Permission == "") {
                    this.permissionViewJSON[i].Permission = "No Permissions";
                }
            }

            //set group names in permission view json

            for (let i = 0; i < this.permissionViewJSON.length; i++) {
                this.permissionViewJSON[i].GroupsString = "";

                for (let j = 0; j < this.groupRoles.length; j++) {
                    if (this.groupRoles[j].RoleID == this.permissionViewJSON[i].RoleID) {
                        let tempGroupInfo = JSON.parse(this.groupRoles[j].ADGroup);
                        this.permissionViewJSON[i].GroupsString += tempGroupInfo.Name + "<br>";
                    }
                }

            }
        }
        catch (ex) {
            console.log(ex);

        }
        console.log(this.permissionViewJSON)
    }

    loadAllObjectsInfo() {
        this.loadSubscriptionObjectTypes = this.rapidflowService.retrieveConfigurationData("AllObjects", this.selectedProcess).subscribe((response) => {
            this.allObjectsInfo = JSON.parse(response.json()).ConfigurationData;
            console.log(this.allObjectsInfo)
        });
    }
    showEditDialog(currentRolePermissions, roleID, roleName) {
        this.showEditPermissionsDialog = true;
        this.selectedItemType = this.itemTypes[0];
        this.setPermissionsModel(currentRolePermissions);
        this.setItemsBasedOnItemType();
        this.currentSelectedRoleID = roleID;
        this.currentSelectedRoleName = roleName;


    }
    setItemsBasedOnItemType() {
        this.items = [];
        if (this.selectedItemType.code == "Process") {
            this.items = [{
                name: "Current Process",
                code: this.selectedProcess
            }]
        }
        else {

            let selectedItemTypeObjects = JSON.parse(this.allObjectsInfo[0][this.selectedItemType.code]);
            let itemsAdded = [];
            for (let i = 0; i < selectedItemTypeObjects.length; i++) {
                if (this.selectedItemType.code == "Workflows") {
                    if (itemsAdded.indexOf(selectedItemTypeObjects[i][this.idNames[this.selectedItemType.code]]) == -1) {
                        let currentItem: any = {};
                        currentItem.name = selectedItemTypeObjects[i].Name;
                        currentItem.code = selectedItemTypeObjects[i][this.idNames[this.selectedItemType.code]];
                        itemsAdded.push(selectedItemTypeObjects[i][this.idNames[this.selectedItemType.code]])
                        this.items.push(currentItem);
                    }

                }
                else {
                    let currentItem: any = {};
                    currentItem.name = selectedItemTypeObjects[i].Title;
                    currentItem.code = selectedItemTypeObjects[i][this.idNames[this.selectedItemType.code]];
                    this.items.push(currentItem);
                }

            }

        }
        if (this.items.length > 0) {
            this.selectedItem = this.items[0];
            this.setSelectedPermissionModel();
        }




    }
    setPermissionsModel(currentRolePermissions) {
        this.permissionsModel = {};
        for (let i = 0; i < this.itemTypes.length; i++) {
            this.permissionsModel[this.itemTypes[i].code] = {}

        }
        for (let key in this.allObjectsInfo[0]) {
            let currentObject = JSON.parse(this.allObjectsInfo[0][key]);
            if (this.permissionsModel[key] != undefined) {
                this.permissionsModel[key].Items = [];
                for (let i = 0; i < currentObject.length; i++) {
                    let permissionItem: any = {};
                    if (key == "Process") {
                        permissionItem.Id = this.selectedProcess;

                    }
                    else {
                        permissionItem.Id = currentObject[i][this.idNames[key]];
                    }
                    permissionItem.Permissions = this.defaultItemPermissions[key];
                    for (let k = 0; k < permissionItem.Permissions.length; k++) {
                        permissionItem.Permissions[k].checked = false;
                    }
                    this.permissionsModel[key].Items.push(permissionItem);
                }
            }

        }

        for (let i = 0; i < currentRolePermissions.length; i++) {
            if (currentRolePermissions[i].ID != 0) {
                for (let j = 0; j < this.permissionsModel[this.itemAliases2[currentRolePermissions[i].ItemType]].Items.length; j++) {
                    if (this.permissionsModel[this.itemAliases2[currentRolePermissions[i].ItemType]].Items[j].Id == currentRolePermissions[i].ID) {
                        let objectPermissions = JSON.parse(JSON.stringify(this.permissionsModel[this.itemAliases2[currentRolePermissions[i].ItemType]].Items[j].Permissions));

                        for (let k = 0; k < objectPermissions.length; k++) {
                            if (objectPermissions[k].name == currentRolePermissions[i].PermissionName) {
                                objectPermissions[k].checked = true;
                                break;
                            }
                        }
                        this.permissionsModel[this.itemAliases2[currentRolePermissions[i].ItemType]].Items[j].Permissions = JSON.parse(JSON.stringify(objectPermissions));

                    }
                }

            }
        }

        console.log(this.permissionsModel);
        this.permissionsModelOld = JSON.parse(JSON.stringify(this.permissionsModel));
    }

    setSelectedPermissionModel() {
        for (let i = 0; i < this.permissionsModel[this.selectedItemType.code].Items.length; i++) {
            if (this.permissionsModel[this.selectedItemType.code].Items[i].Id == this.selectedItem.code) {
                this.selectedPermissionModel = JSON.parse(JSON.stringify(this.permissionsModel[this.selectedItemType.code].Items[i].Permissions));
                console.log(this.selectedPermissionModel);
                return;
            }
        }
        this.selectedPermissionModel = [];

    }
    getSelectedPermissionModel() {
        for (let i = 0; i < this.permissionsModel[this.selectedItemType.code].Items.length; i++) {
            if (this.permissionsModel[this.selectedItemType.code].Items[i].Id == this.selectedItem.code) {
                this.permissionsModel[this.selectedItemType.code].Items[i].Permissions = JSON.parse(JSON.stringify(this.selectedPermissionModel));
                console.log(this.selectedPermissionModel);
                return;
            }
        }
    }


    applyPermissions() {
        let permissionString = "";
        //iterating on item types
        for (let key in this.permissionsModel) {
            //iterating on items of key item type
            if (this.permissionsModel[key].Items != undefined) {
                for (let i = 0; i < this.permissionsModel[key].Items.length; i++) {
                    //iterating on permissions of i item of key item type
                    for (let j = 0; j < this.permissionsModel[key].Items[i].Permissions.length; j++) {
                        //if permission changed
                        if (this.permissionsModel[key].Items[i].Permissions[j].checked != this.permissionsModelOld[key].Items[i].Permissions[j].checked) {
                            //permission added
                            if (this.permissionsModel[key].Items[i].Permissions[j].checked) {
                                permissionString += "ADD;" + this.itemAliases1[key] + ";" + this.currentSelectedRoleID + ";";

                            }
                            //permission removed
                            else {
                                permissionString += "REMOVE;" + this.itemAliases1[key] + ";" + this.currentSelectedRoleID + ";";

                            }
                            permissionString += this.permissionIDs[this.permissionsModel[key].Items[i].Permissions[j].name.replace(" ", "")] + ";";
                            permissionString += this.permissionsModel[key].Items[i].Id + "-op-"
                        }
                    }
                }
            }

        }

        permissionString = permissionString.substring(0, permissionString.length - 4);
        this.showLoading = true;
        if(confirm("Are you sure you want apply these permissions?"))
        {
            this.rapidflowService.editRolePermissions(permissionString).subscribe((response) => {
                alert("Permissions applied successfully!");
                this.showLoading = false;
                this.showEditPermissionsDialog = false;
                this.retrieveProcessPermissions();
            },
                (error) => {
                    alert("Error while applying permissions please check console for details.");
                    console.log(error);
                    this.showLoading = false;
                }
            );
        }
        

    }


    addNewRole() {
        let allowEveryone = 0;
        if (this.newRoleFormGroup["_value"].AllowEveryone) {
            allowEveryone = 1;
        }
        let newRoleValue = {
            ProcessID: this.selectedProcess,
            RoleName: this.newRoleFormGroup["_value"].RoleName,
            Everyone: allowEveryone

        }

        let settingObject: any = {
            userToken: this.currentLoggedInUser.AuthenticationToken.toString(),
            itemType: "CustomRole",
            objectIdentity: "0",
            value: JSON.stringify(newRoleValue),
            operationType: 'DEV'
        };

        if (confirm("Are you sure you want add this role?")) {


            this.showLoading = true;
            let addNewWorkflowResult = this.socket.callWebSocketService('addDeveloperProcessObject', settingObject);
            addNewWorkflowResult.then((result) => {
                this.showLoading = false;

                if (result.Response == "true") {
                    alert("Role Added Successfully!");
                    this.showLoading = false;
                    this.addRoleDialogVisible = false;
                    this.retrieveProcessPermissions();
                }
                else {
                    alert("Error while adding. Please check console for error");
                }
                console.log(result);


            }).catch((error) => {
                alert("Error while adding. Please check console for error");
                console.log(error)
                this.showLoading = false;
            })
        }
    }

}

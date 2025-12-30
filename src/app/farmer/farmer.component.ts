import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { RegistritionService } from '../shared/registrition.service';
import { FarmerSelf } from './farmer-self';
import { PermissionService } from '../shared/permission.service';


@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  styleUrls: ['./farmer.component.css']
})
export class FarmerComponent implements OnInit {

  formValue !:FormGroup;
  farmerSelfObj : FarmerSelf = new FarmerSelf();
  registrationData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canRead = false;
  constructor(private formbuilder:FormBuilder,
    private api : RegistritionService,
    private permissionService: PermissionService,
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      firstName : [''],
      secondName : [''],
      lastName : [''],
      phoneNumber : [''],
      idNumber : [''],


    })
    this.loadPermissions();
    this.getAllEmployee();
  }
  private loadPermissions(): void {
    this.canCreate = this.permissionService.canCreate('farmer');
    this.canUpdate = this.permissionService.canUpdate('farmer');
    this.canDelete = this.permissionService.canDelete('farmer');
    this.canRead = this.permissionService.canRead('farmer');

    console.log('Farmer permissions:', {
      canCreate: this.canCreate,
      canUpdate: this.canUpdate,
      canDelete: this.canDelete,
      canRead: this.canRead
    });
  }
  clickAddEmployee(){
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  postEmployeeDetails(){
    this. farmerSelfObj.firstName = this.formValue.value.varietyName;
    this.farmerSelfObj.secondName = this.formValue.value.secondName;
    this.farmerSelfObj.lastName = this.formValue.value.lastName;
    this.farmerSelfObj.phoneNumber = this.formValue.value.phoneNumber;
    this.farmerSelfObj.idNumber = this.formValue.value.idNumber;

    this.api.postRegistration(this. farmerSelfObj)
    .subscribe(res=>{
      console.log(res);
      alert(" Crop Added Successfully");
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    },
    error=>{
      alert("something went wrong");
    })
  }
  getAllEmployee(){
    this.api.getRegistration()
    .subscribe(res=>{
      this. registrationData = res;
    })
  }
  // deleteEmployee(row:any){
  //   this.api.deleteEmployee(row.id)
  //   .subscribe(res=>{
  //     alert("Employee Deleted")
  //     this.getAllEmployee();
  //   })
  // }
  onEdit(row:any){
    this.showAdd = false;
    this.showUpdate = true;
    this. farmerSelfObj.id = row.id;
    this.formValue.controls['firstName'].setValue(row.firstName);
    this.formValue.controls['secondName'].setValue(row.secondName);

    this.formValue.controls['lastName'].setValue(row.lastName);
    this.formValue.controls['phoneNumber'].setValue(row.phoneNumber);
    this.formValue.controls['idNumber'].setValue(row.idNumber);


  }
  updateEmployeeDetails(){
    this. farmerSelfObj.firstName = this.formValue.value.varietyName;
    this.farmerSelfObj.secondName = this.formValue.value.secondName;
    this.farmerSelfObj.lastName = this.formValue.value.lastName;
    this.farmerSelfObj.phoneNumber = this.formValue.value.phoneNumber;
    this.farmerSelfObj.idNumber = this.formValue.value.idNumber;



    this.api.updateRegistration(this. farmerSelfObj,this. farmerSelfObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })

  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { NameTypeService } from 'src/app/shared/name-type.service';
import { NewModel } from './name-type';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {

  formValue !:FormGroup;
  newModelObj : NewModel = new NewModel();
  manageData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : NameTypeService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      name : [''],
     organisationName : [''],
     mainOffice : [''],
      email : [''],
      officialAddress : [''],
      physicalAddress : [''],
     phoneNumber : [''],
     uploadLogo : [''],
     uploadRegistraction : [''],
     uploadPractice : [''],
     firstName : [''],
    secondName : [''],
    lastName : [''],
    title : ['']
    })
    this.getAllEmployee();
  }
    clickAddEmployee(){
      this.formValue.reset();
      this.showAdd = true;
      this.showUpdate = false;
    }
  
    postEmployeeDetails(){
      
      this.newModelObj.name= this.formValue.value.name;
    this.newModelObj.organisationName = this.formValue.value.organisationName;
    this.newModelObj. email = this.formValue.value. email;
    this.newModelObj.officialAddress = this.formValue.value.officialAddress;
    this.newModelObj.physicalAddress = this.formValue.value.physicalAddress;
    this.newModelObj.phoneNumber = this.formValue.value.phoneNumber;
    this.newModelObj.uploadLogo = this.formValue.value.uploadLogo;
    this.newModelObj. uploadRegistration = this.formValue.value. uploadRegistraction;
    this.newModelObj.uploadPractice = this.formValue.value.uploadPractice;
    this.newModelObj.firstName = this.formValue.value.firstName;
    this.newModelObj.secondName = this.formValue.value.secondName;
    this.newModelObj.lastName = this.formValue.value.lastName;
    this.newModelObj.title = this.formValue.value.title;
      
      
      
      this.api.postName(this.  newModelObj)
      .subscribe(res=>{
        console.log(res);
        alert("Organization Added Successfully");
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
      this.api.getName()
      .subscribe(res=>{
        this.manageData = res;
      })
    }
    // deleteEmployee( row:any){
    //   this.api.deleteEmployee( row.id)
    //   .subscribe(res=>{
    //     alert("Employee Deleted")
    //     this.getAllEmployee();
    //   })
    //}
    onEdit( row:any){
      this.showAdd = false;
      this.showUpdate = true;
      this.newModelObj.id =  row.id;
      this.formValue.controls['name'].setValue( row.name);
      this.formValue.controls['organisationName'].setValue( row.organisationName);
      this.formValue.controls['officialAddress'].setValue( row.officialAddress);
      this.formValue.controls['physicalAddress'].setValue( row.physicalAddress);
      this.formValue.controls['phoneNumber'].setValue( row.phoneNumber);
      this.formValue.controls['uploadLogo'].setValue( row.uploadLogo);
      this.formValue.controls['uploadRegistration'].setValue( row.uploadRegistration);
      this.formValue.controls['uploadPractice'].setValue( row.uploadPractice);
      this.formValue.controls['firstName'].setValue( row.firstName);
      this.formValue.controls['secondName'].setValue( row.secondName);
      this.formValue.controls['lastName'].setValue( row.lastName);
      this.formValue.controls['title'].setValue( row.title);

      
     
     
     
    }
    updateEmployeeDetails(){
      this.newModelObj.name= this.formValue.value.name;
      this.newModelObj.organisationName = this.formValue.value.organisationName;
      this.newModelObj. email = this.formValue.value. email;
      this.newModelObj.officialAddress = this.formValue.value.officialAddress;
      this.newModelObj.physicalAddress = this.formValue.value.physicalAddress;
      this.newModelObj.phoneNumber = this.formValue.value.phoneNumber;
      this.newModelObj.uploadLogo = this.formValue.value.uploadLogo;
      this.newModelObj. uploadRegistration = this.formValue.value. uploadRegistraction;
      this.newModelObj.uploadPractice = this.formValue.value.uploadPractice;
      this.newModelObj.firstName = this.formValue.value.firstName;
      this.newModelObj.secondName = this.formValue.value.secondName;
      this.newModelObj.lastName = this.formValue.value.lastName;
      this.newModelObj.title = this.formValue.value.title;
        
      
      
       this.api.updateName(this.  newModelObj,this.  newModelObj.id)
      .subscribe(res=>{
        alert("Updated Successfully")
        let ref = document.getElementById('cancel')
        ref?.click();
        this.formValue.reset();
        this.getAllEmployee();
      })
  }

}

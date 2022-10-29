import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { UserService } from 'src/app/shared/user.service';
import { UserModel } from './users';


@Component({
  selector: 'app-forms-elements',
  templateUrl: './forms-elements.component.html',
  styleUrls: ['./forms-elements.component.css']
})
export class FormsElementsComponent implements OnInit {
  

  formValue !:FormGroup;
  userModelObj : UserModel = new UserModel();
  userData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  constructor(private formbuilder:FormBuilder,
    private api : UserService
    ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
     organization : [''],
      firstName : [''],
      secondName : [''],
      lastName : [''],
       password: [''],
      confirm: [''],
     role : [''],
     status : ['']
    })
    this.getAllEmployee();
  }
    clickAddEmployee(){
      this.formValue.reset();
      this.showAdd = true;
      this.showUpdate = false;
    }
  
    postEmployeeDetails(){
      this.userModelObj.organization= this.formValue.value.organization;
      this.userModelObj.firstName = this.formValue.value.firstName;
      this.userModelObj.secondName = this.formValue.value.secondName;
      this.userModelObj.lastName = this.formValue.value.lastName;
      this.userModelObj. password = this.formValue.value. password;
      this.userModelObj. confirm = this.formValue.value. confirm;
      
      
      
      
      this.api.postUser(this.  userModelObj)
      .subscribe(res=>{
        console.log(res);
        alert(" Added Successfully");
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
      this.api.getUser()
      .subscribe(res=>{
        this.userData = res;
      })
    }
    // deleteEmployee( row:any){
    //   this.api.deleteEmployee( row.id)
    //   .subscribe(res=>{
    //     alert("Employee Deleted")
    //     this.getAllEmployee();
    //   })
    // }
    onEdit( row:any){
      this.showAdd = false;
      this.showUpdate = true;
      this.  userModelObj.id =  row.id;
      this.formValue.controls['organization'].setValue( row.organization);
      this.formValue.controls['firstName'].setValue( row.firstName);
      this.formValue.controls['secondName'].setValue( row.secondName);
      this.formValue.controls['lastName'].setValue( row.lastName);
      this.formValue.controls[' password'].setValue( row. password);
      this.formValue.controls[' confirm'].setValue( row. confirm);
      
      
      
      
     
     
     
    }
    updateEmployeeDetails(){
      this.userModelObj.organization= this.formValue.value.organization;
      this.userModelObj.firstName = this.formValue.value.firstName;
      this.userModelObj.secondName = this.formValue.value.secondName;
      this.userModelObj.lastName = this.formValue.value.lastName;
      this.userModelObj. password = this.formValue.value. password;
      this.userModelObj. confirm = this.formValue.value. confirm;
      
      
      
      
      this.api.updateUser(this.  userModelObj,this.  userModelObj.id)
      .subscribe(res=>{
        alert("Updated Successfully")
        let ref = document.getElementById('cancel')
        ref?.click();
        this.formValue.reset();
        this.getAllEmployee();
      })
  
  }

}

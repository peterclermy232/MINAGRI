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
// <td>{{row.user_type}}</td>
            
// <td>{{row.user_name}}</td>
// <td>{{row.user_email}}</td>
// <td>{{row.user_msisdn}}</td>
// <td>{{row.new_new_password}</td>

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
     user_type : [''],
      user_name : [''],
      user_email : [''],
      user_msisdn : [''],
       new_password: [''],
     
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
      this.userModelObj.user_type= this.formValue.value.user_type;
      this.userModelObj.user_name = this.formValue.value.user_name;
      this.userModelObj.user_email = this.formValue.value.user_email;
      this.userModelObj.user_msisdn = this.formValue.value.user_msisdn;
      this.userModelObj. new_password = this.formValue.value. new_password;
     
      
      
      
      
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
      this.formValue.controls['user_type'].setValue( row.user_type);
      this.formValue.controls['user_name'].setValue( row.user_name);
      this.formValue.controls['user_email'].setValue( row.user_email);
      this.formValue.controls['user_msisdn'].setValue( row.user_msisdn);
      this.formValue.controls[' new_password'].setValue( row. new_password);
     
      
      
      
      
     
     
     
    }
    updateEmployeeDetails(){
      this.userModelObj.user_type= this.formValue.value.user_type;
      this.userModelObj.user_name = this.formValue.value.user_name;
      this.userModelObj.user_email = this.formValue.value.user_email;
      this.userModelObj.user_msisdn = this.formValue.value.user_msisdn;
      this.userModelObj. new_password = this.formValue.value. new_password;
     
      
      
      
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

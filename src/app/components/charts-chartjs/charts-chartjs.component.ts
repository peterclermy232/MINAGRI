import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { LossService } from 'src/app/shared/loss.service';
import { LossModel } from './loss';

@Component({
  selector: 'app-charts-chartjs',
  templateUrl: './charts-chartjs.component.html',
  styleUrls: ['./charts-chartjs.component.css']
})
export class ChartsChartjsComponent implements OnInit {

  
  formValue !:FormGroup;
  lossModelObj : LossModel = new LossModel();
  lossData !:any;
  showAdd!: boolean;
  showUpdate!:boolean;
  
  constructor(private formbuilder: FormBuilder,
    private api : LossService) { }

  ngOnInit(): void {

    this.formValue = this.formbuilder.group({
      organization : [''],
      user : [''],
      practiceNumber : [''],
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
    this. lossModelObj.organization = this.formValue.value.organization;
    this. lossModelObj.user = this.formValue.value. user;
    this.lossModelObj.practiceNumber = this.formValue.value.practiceNumber;
    this.lossModelObj.status = this.formValue.value.status;
    
    this.api.postLoss(this. lossModelObj)
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
    this.api.getLoss()
    .subscribe(res=>{
      this.lossData = res;
    })
  }
  // deleteEmployee( users:any){
  //   this.api.deleteEmployee( users.id)
  //   .subscribe(res=>{
  //     alert("Employee Deleted")
  //     this.getAllEmployee();
  //   })
  // }
  onEdit( users:any){
    this.showAdd = false;
    this.showUpdate = true;
    this. lossModelObj.id =  users.id;
    this.formValue.controls['organization'].setValue( users.organization);
    this.formValue.controls[' user'].setValue( users. user);
    this.formValue.controls['practiceNumber'].setValue( users.practiceNumber)
    this.formValue.controls['status'].setValue( users.status)
   
  }
  updateEmployeeDetails(){
    this. lossModelObj.organization = this.formValue.value.organization;
    this. lossModelObj. user = this.formValue.value. user;
    this.lossModelObj.practiceNumber = this.formValue.value.practiceNumber;
    this.lossModelObj.status = this.formValue.value.status;
    
    this.api.updateLoss(this. lossModelObj,this. lossModelObj.id)
    .subscribe(res=>{
      alert("Updated Successfully")
      let ref = document.getElementById('cancel')
      ref?.click();
      this.formValue.reset();
      this.getAllEmployee();
    })
   
  }
}


// cropForm: FormGroup;
//   formSubmitted = false;
//   currentCrop: null | Crop = null;
//   modalMode = {
//     label: 'Create Crop',
//     typ: 'Create',
//   };
//   modalBtn = {
//     loading: false,
//     text: 'Create Crop',
//     classes: 'btn btn-primary',
//   };
//   crops: {
//     loading: boolean;
//     data: Crop[] | any[];
//   } = {
//     loading: false,
//     data: [],
//   };
//   dataTable = {
//     columns: [
//       {
//         label: 'Crop',
//         data: 'crop',
//         dynamic: true,
//         classes: '',
//       },
//       {

//         classes: '',
//       },
//       {
//         label: 'Status',
//         data: 'status',
//         dynamic: false,
//         classes: 'text-center',
//       },
//     ],
//   };
//   modalButton: any;
//   constructor(
//     private authService: AuthService,
//     private userService: UserService,
//     private cropService: CropService,
//     private notifierService: NotifierService,
//     private fb: FormBuilder
//   ) {
//     this.cropForm = this.fb.group({
//       crop: ['', [Validators.required]],
//       status: [true, Validators.required],
//       cropId: [''],
//     });
//   }
//   ngOnInit(): void {
//     this.getCrops();
//   }

//   showModal(crop?: Crop) {
//     if (crop) {
//       this.modalMode.typ = 'edit';
//       this.modalMode.label = 'Edit Crop';
//       this.modalBtn = {
//         text: 'Edit Crop',
//         classes: 'btn btn-warning',
//         loading: false,
//       };
//       this.currentCrop = crop;
//       this.setCropInfo(crop);
//     } else {
//       this.modalMode.typ = 'create';
//       this.modalMode.label = 'Create Crop';
//       this.modalBtn = {
//         text: 'Create Crop',
//         classes: 'btn btn-primary',
//         loading: false,
//       };
//       this.resetForm();
//     }
//   }
//   setCropInfo(crop: Crop) {
//     this.cropForm.get('crop')!.setValue(crop.crop);
//     this.cropForm.get('status')!.setValue(crop.status);
//     this.cropForm.get('cropId')!.setValue(crop.cropId);
//   }
//   getCrops() {
//     this.crops.loading = true;
//     this.cropService
//       .getCrops()
//       .pipe(
//         finalize(() => {
//           this.crops.loading = false;
//         })
//       )
//       .subscribe(
//         (resp: any) => {
//           const orgs = resp.orgsResponse.results;
//           this.crops.data = resp.cropsResponse.map((crop: any) => {
//             const org = orgs.find(
//               (typ: any) => typ.organisation_id === crop.organisationId
//             );
//             return {
//               ...crop,
//               organisation: org ? org.organisation_name : 'none',
//             };
//           });
//         },
//         (err) => {
//           console.log('crop err', err);
//         }
//       );
//   }

//   createCrop() {
//     this.modalBtn = {
//       loading: true,
//       text: 'Processing...',
//       classes: 'btn btn-primary',
//     };
//     this.cropService
//       .postCrop({
//         crop: this.cropForm.get('crop')?.value,
//         deleted: false,
//         icon: 'no icon',
//         organisationId: 1,
//         status: this.cropForm.get('status')?.value,
//       })
//       .pipe(
//         finalize(() => {
//           this.modalBtn = {
//             loading: false,
//             text: 'Create Crop',
//             classes: 'btn btn-primary',
//           };
//         })
//       )
//       .subscribe(
//         (resp) => {
//           console.log('create resp', resp);
//           this.resetForm();
//           this.getCrops();
//           this.notifierService.showSweetAlert({
//             typ: 'success',
//             message: 'Crop successfully created!',
//             timer: true,
//           });
//         },
//         (err) => {
//           console.log('crop err', err);
//           const errorMessage =
//             err.error.errors[0].message || 'Invalid data submitted';
//           this.notifierService.showSweetAlert({
//             typ: 'error',
//             message: errorMessage,
//           });
//         }
//       );
//   }
//   updateCrop() {
//     this.modalBtn = {
//       loading: true,
//       text: 'Processing...',
//       classes: 'btn btn-primary',
//     };
//     this.cropService
//       .updateCrop(
//         {
//           crop: this.cropForm.get('crop')?.value,
//           cropId: this.cropForm.get('cropId')!.value,
//           deleted: false,
//           icon: 'no icon',
//           organisationId: 1,
//           status: this.cropForm.get('status')?.value,
//           recordVersion: this.currentCrop?.recordVersion,
//         },
//         this.cropForm.get('cropId')!.value
//       )
//       .pipe(
//         finalize(() => {
//           this.modalBtn = {
//             loading: false,
//             text: 'Create Crop',
//             classes: 'btn btn-primary',
//           };
//         })
//       )
//       .subscribe(
//         (resp) => {
//           this.modalButton.nativeElement.click();
//           this.resetForm();
//           this.getCrops();
//           this.notifierService.showSweetAlert({
//             typ: 'success',
//             message: 'Crop successfully created!',
//             timer: true,
//           });
//         },
//         (err) => {
//           console.log('crop err', err);
//           const errorMessage =
//             err.error.errors[0].message || 'Invalid data submitted';
//           this.notifierService.showSweetAlert({
//             typ: 'error',
//             message: errorMessage,
//           });
//         }
//       );
//   }

//   resetForm() {
//     this.cropForm.reset();
//     this.cropForm.markAsPristine();
//     this.modalBtn = {
//       loading: false,
//       text: 'Create Crop',
//       classes: 'btn btn-primary',
//     };
//   }

//   handleSubmit() {
//     if (this.cropForm.invalid) {
//       console.log('invalid');
//       this.formSubmitted = true;
//       return;
//     }

//     this.formSubmitted = false;
//     if (this.cropForm.get('cropId')?.value) {
//       this.updateCrop();
//     } else {
//       this.createCrop();
//     }
//   }
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeasonsService } from '../shared/seasons.service';
import { SeasonModel } from './season';
import { PermissionService } from '../shared/permission.service';

@Component({
  selector: 'app-seasons',
  templateUrl: './seasons.component.html',
  styleUrls: ['./seasons.component.css']
})
export class SeasonsComponent implements OnInit {

  formValue!: FormGroup;
  seasonModelObj: SeasonModel = new SeasonModel();
  roleData: any[] = [];
  showAdd: boolean = false;
  showUpdate: boolean = false;
   // NEW: Permission flags
  canCreate = false;
  canUpdate = false;
  canDelete = false;
  canRead = false;
  constructor(
    private formbuilder: FormBuilder,
    private api: SeasonsService,
    private permissionService: PermissionService,
  ) { }

  ngOnInit(): void {
    this.formValue = this.formbuilder.group({
      season: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      status: [true, Validators.required],
      organisation: ['', Validators.required]
    });
    this.loadPermissions();
    this.getAllSeasons();
  }

  private loadPermissions(): void {
    this.canCreate = this.permissionService.canCreate('seasons');
    this.canUpdate = this.permissionService.canUpdate('seasons');
    this.canDelete = this.permissionService.canDelete('seasons');
    this.canRead = this.permissionService.canRead('seasons');

    console.log('Product permissions:', {
      canCreate: this.canCreate,
      canUpdate: this.canUpdate,
      canDelete: this.canDelete,
      canRead: this.canRead
    });
  }

  clickAddEmployee() {
    this.formValue.reset({
      status: true
    });
    this.showAdd = true;
    this.showUpdate = false;
    this.seasonModelObj = new SeasonModel();
  }

  postEmployeeDetails() {
    if (this.formValue.invalid) {
      alert("Please fill all required fields");
      return;
    }

    this.seasonModelObj.season = this.formValue.value.season;
    this.seasonModelObj.start_date = this.formValue.value.start_date;
    this.seasonModelObj.end_date = this.formValue.value.end_date;
    this.seasonModelObj.status = this.formValue.value.status === 'Active' || this.formValue.value.status === true;
    this.seasonModelObj.organisation = this.formValue.value.organisation;

    this.api.postSeasons(this.seasonModelObj)
      .subscribe({
        next: (res) => {
          console.log(res);
          alert("Season Added Successfully");
          let ref = document.getElementById('cancel');
          ref?.click();
          this.formValue.reset();
          this.getAllSeasons();
        },
        error: (error) => {
          console.error('Error adding season:', error);
          alert("Something went wrong: " + (error.message || 'Unknown error'));
        }
      });
  }

  getAllSeasons() {
    this.api.getSeasons()
      .subscribe({
        next: (res) => {
          this.roleData = res;
          console.log('Seasons loaded:', res);
        },
        error: (error) => {
          console.error('Error loading seasons:', error);
          alert("Error loading seasons");
        }
      });
  }

  onEdit(season: any) {
    this.showAdd = false;
    this.showUpdate = true;
    this.seasonModelObj.season_id = season.season_id;
    this.seasonModelObj.id = season.season_id;

    this.formValue.controls['season'].setValue(season.season);
    this.formValue.controls['start_date'].setValue(season.start_date);
    this.formValue.controls['end_date'].setValue(season.end_date);
    this.formValue.controls['status'].setValue(season.status);
    this.formValue.controls['organisation'].setValue(season.organisation);
  }

  updateEmployeeDetails() {
    if (this.formValue.invalid) {
      alert("Please fill all required fields");
      return;
    }

    this.seasonModelObj.season = this.formValue.value.season;
    this.seasonModelObj.start_date = this.formValue.value.start_date;
    this.seasonModelObj.end_date = this.formValue.value.end_date;
    this.seasonModelObj.status = this.formValue.value.status === 'Active' || this.formValue.value.status === true;
    this.seasonModelObj.organisation = this.formValue.value.organisation;

    this.api.updateSeasons(this.seasonModelObj, this.seasonModelObj.season_id)
      .subscribe({
        next: (res) => {
          alert("Updated Successfully");
          let ref = document.getElementById('cancel');
          ref?.click();
          this.formValue.reset();
          this.getAllSeasons();
        },
        error: (error) => {
          console.error('Error updating season:', error);
          alert("Something went wrong: " + (error.message || 'Unknown error'));
        }
      });
  }

  deleteSeason(season: any) {
    if (confirm('Are you sure you want to delete this season?')) {
      this.api.deleteSeason(season.season_id)
        .subscribe({
          next: (res) => {
            alert("Season Deleted Successfully");
            this.getAllSeasons();
          },
          error: (error) => {
            console.error('Error deleting season:', error);
            alert("Error deleting season");
          }
        });
    }
  }

  getStatusDisplay(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }
}

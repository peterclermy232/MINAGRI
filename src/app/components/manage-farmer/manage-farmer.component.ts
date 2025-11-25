import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'
import { FarmerService } from 'src/app/shared/farmer.service';
import { FarmerModel } from './farmer';

@Component({
  selector: 'app-manage-farmer',
  templateUrl: './manage-farmer.component.html',
  styleUrls: ['./manage-farmer.component.css']
})
export class ManageFarmerComponent implements OnInit {

  formValue!: FormGroup;
  farmerModelObj: FarmerModel = new FarmerModel();
  farmerData: any[] = [];
  filteredFarmers: any[] = [];
  showAdd: boolean = false;
  showUpdate: boolean = false;
  searchText: string = '';
  page: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private formbuilder: FormBuilder,
    private api: FarmerService
  ) { }

  ngOnInit(): void {
    console.log('=== Component Initializing ===');

    this.formValue = this.formbuilder.group({
      name: [''],
      firstName: [''],
      lastName: [''],
      physicalAddress: [''],
      idNumber: [''],
      category: [''],
      date: [''],
      location: [''],        // ADDED - was missing
      upi: [''],
      farmName: [''],
      farmSize: [''],
      bankName: [''],
      accountNumber: [''],
      accountAddress: [''],  // ADDED - was missing
      emailAddress: [''],
      phoneNumber: [''],
      id: [''],              // ADDED - was missing (for next of kin ID)
      relationship: ['']
    });

    // Load dummy data
    this.loadDummyData();

    // Apply filters immediately
    this.applyFilters();

    console.log('=== After initialization ===');
    console.log('farmerData:', this.farmerData);
    console.log('filteredFarmers:', this.filteredFarmers);
  }

  clickAddEmployee() {
    this.formValue.reset();
    this.showAdd = true;
    this.showUpdate = false;
  }

  loadDummyData() {
    console.log('=== Loading Dummy Data ===');

    this.farmerData = [
      {
        id: 1,
        name: "Peter",
        firstName: "John",
        lastName: "Odhiambo",
        physicalAddress: "Nairobi, Kenya",
        idNumber: "34567890",
        category: "Dairy Farmer",
        date: "2024-10-12",
        upi: "UPI-12345",
        farmName: "Green Valley Farm",
        farmSize: "3 Acres",
        bankName: "Equity Bank",
        accountNumber: "123456789",
        emailAddress: "john@example.com",
        phoneNumber: "0712345678",
        relationship: "Spouse"
      },
      {
        id: 2,
        name: "Mary",
        firstName: "Grace",
        lastName: "Achieng",
        physicalAddress: "Kisumu, Kenya",
        idNumber: "56789012",
        category: "Crop Farmer",
        date: "2023-08-20",
        upi: "UPI-98765",
        farmName: "Sunrise Farm",
        farmSize: "5 Acres",
        bankName: "KCB Bank",
        accountNumber: "987654321",
        emailAddress: "grace@example.com",
        phoneNumber: "0722334455",
        relationship: "Mother"
      },
      {
        id: 3,
        name: "Brian",
        firstName: "Kevin",
        lastName: "Otieno",
        physicalAddress: "Eldoret, Kenya",
        idNumber: "12345678",
        category: "Mixed Farmer",
        date: "2024-05-01",
        upi: "UPI-45678",
        farmName: "Highland Farm",
        farmSize: "2 Acres",
        bankName: "Cooperative Bank",
        accountNumber: "445566778",
        emailAddress: "kevin@example.com",
        phoneNumber: "0799887766",
        relationship: "Brother"
      }
    ];

    console.log('Loaded farmerData length:', this.farmerData.length);
    console.log('Loaded farmerData:', JSON.stringify(this.farmerData, null, 2));
  }

  postEmployeeDetails() {
    this.farmerModelObj.name = this.formValue.value.name;
    this.farmerModelObj.firstName = this.formValue.value.firstName;
    this.farmerModelObj.lastName = this.formValue.value.lastName;
    this.farmerModelObj.physicalAddress = this.formValue.value.physicalAddress;
    this.farmerModelObj.idNumber = this.formValue.value.idNumber;
    this.farmerModelObj.category = this.formValue.value.category;
    this.farmerModelObj.date = this.formValue.value.date;
    this.farmerModelObj.upi = this.formValue.value.upi;
    this.farmerModelObj.farmName = this.formValue.value.farmName;
    this.farmerModelObj.farmSize = this.formValue.value.farmSize;
    this.farmerModelObj.bankName = this.formValue.value.bankName;
    this.farmerModelObj.accountNumber = this.formValue.value.accountNumber;
    this.farmerModelObj.emailAddress = this.formValue.value.emailAddress;
    this.farmerModelObj.phoneNumber = this.formValue.value.phoneNumber;
    this.farmerModelObj.relationship = this.formValue.value.relationship;

    this.api.postFarmer(this.farmerModelObj).subscribe(
      res => {
        console.log(res);
        alert("Farmer Added Successfully");
        let ref = document.getElementById('cancel');
        ref?.click();
        this.formValue.reset();
        this.loadDummyData();
        this.applyFilters();
      },
      error => {
        alert("Something went wrong");
      }
    );
  }

  getAllEmployee() {
    this.api.getFarmer().subscribe(res => {
      this.farmerData = res;
      this.applyFilters();
    });
  }

  onEdit(column: any) {
    console.log('Editing farmer:', column);
    this.showAdd = false;
    this.showUpdate = true;
    this.farmerModelObj.id = column.id;

    this.formValue.patchValue({
      name: column.name,
      firstName: column.firstName,
      lastName: column.lastName,
      physicalAddress: column.physicalAddress,
      idNumber: column.idNumber,
      category: column.category,
      date: column.date,
      location: column.location || '',
      upi: column.upi,
      farmName: column.farmName,
      farmSize: column.farmSize,
      bankName: column.bankName,
      accountNumber: column.accountNumber,
      accountAddress: column.accountAddress || '',
      emailAddress: column.emailAddress,
      phoneNumber: column.phoneNumber,
      id: column.id,
      relationship: column.relationship
    });
  }

  updateEmployeeDetails() {
    this.farmerModelObj.name = this.formValue.value.name;
    this.farmerModelObj.firstName = this.formValue.value.firstName;
    this.farmerModelObj.lastName = this.formValue.value.lastName;
    this.farmerModelObj.physicalAddress = this.formValue.value.physicalAddress;
    this.farmerModelObj.idNumber = this.formValue.value.idNumber;
    this.farmerModelObj.category = this.formValue.value.category;
    this.farmerModelObj.date = this.formValue.value.date;
    this.farmerModelObj.upi = this.formValue.value.upi;
    this.farmerModelObj.farmName = this.formValue.value.farmName;
    this.farmerModelObj.farmSize = this.formValue.value.farmSize;
    this.farmerModelObj.bankName = this.formValue.value.bankName;
    this.farmerModelObj.accountNumber = this.formValue.value.accountNumber;
    this.farmerModelObj.emailAddress = this.formValue.value.emailAddress;
    this.farmerModelObj.phoneNumber = this.formValue.value.phoneNumber;
    this.farmerModelObj.relationship = this.formValue.value.relationship;

    this.api.updateFarmer(this.farmerModelObj, this.farmerModelObj.id).subscribe(res => {
      alert("Updated Successfully");
      let ref = document.getElementById('cancel');
      ref?.click();
      this.formValue.reset();
      this.loadDummyData();
      this.applyFilters();
    });
  }

  onSearchChange() {
    console.log('Search text changed:', this.searchText);
    this.page = 1;
    this.applyFilters();
  }

  applyFilters() {
    console.log('=== Applying Filters ===');
    console.log('Current page:', this.page);
    console.log('Page size:', this.pageSize);
    console.log('Search text:', this.searchText);
    console.log('Total farmerData:', this.farmerData.length);

    // Start with all data
    let data = [...this.farmerData];

    // Apply search filter if search text exists
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      console.log('Filtering by:', searchLower);

      data = data.filter(item => {
        const firstName = (item.firstName || '').toLowerCase();
        const lastName = (item.lastName || '').toLowerCase();
        const emailAddress = (item.emailAddress || '').toLowerCase();
        const phoneNumber = (item.phoneNumber || '').toString();
        const farmName = (item.farmName || '').toLowerCase();

        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               emailAddress.includes(searchLower) ||
               phoneNumber.includes(searchLower) ||
               farmName.includes(searchLower);
      });

      console.log('After filtering:', data.length, 'items');
    }

    // Calculate pagination
    this.totalPages = Math.ceil(data.length / this.pageSize) || 1;
    console.log('Total pages:', this.totalPages);

    // Ensure current page is valid
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
    if (this.page < 1) {
      this.page = 1;
    }

    // Apply pagination
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    console.log('Slice from', start, 'to', end);

    this.filteredFarmers = data.slice(start, end);

    console.log('Final filteredFarmers length:', this.filteredFarmers.length);
    console.log('Final filteredFarmers:', this.filteredFarmers);
  }

  nextPage() {
    console.log('Next page clicked');
    if (this.page < this.totalPages) {
      this.page++;
      this.applyFilters();
    }
  }

  prevPage() {
    console.log('Previous page clicked');
    if (this.page > 1) {
      this.page--;
      this.applyFilters();
    }
  }
}

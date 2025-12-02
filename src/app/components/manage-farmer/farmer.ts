export class FarmerModel {
  farmer_id: number = 0;
  id: number = 0; // Alias for farmer_id
  organisation?: number;
  country?: number;
  first_name: string = '';
  last_name: string = '';
  id_number: string = '';
  phone_number: string = '';
  email?: string = '';
  gender?: string = '';
  date_of_birth?: string = '';
  farmer_category?: string = '';
  status?: string = 'ACTIVE';
  date_time_added?: string;

  constructor() {
    this.farmer_id = 0;
    this.id = 0;
    this.first_name = '';
    this.last_name = '';
    this.id_number = '';
    this.phone_number = '';
    this.status = 'ACTIVE';
  }
}

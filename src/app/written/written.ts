export class PolicyModel {
  quotation_id: number = 0;
  farmer: number = 0;
  farm: number = 0;
  insurance_product: number = 0;
  policy_number: string = '';
  premium_amount: number = 0;
  sum_insured: number = 0;
  status: string = 'WRITTEN';
  quotation_date?: string;
  payment_date?: string;
  payment_reference?: string;
}

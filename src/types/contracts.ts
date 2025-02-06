export interface Contract {
  id: string;
  tad_project_number: string;
  contract_number: string;
  prime_contractor: string;
  original_amount: number;
  dbe_percentage: number;
  final_report: boolean;
  award_date: string;
  report_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  subgrants?: Subgrant[];
}

export interface Subgrant {
  id: string;
  contract_id: string;
  dbe_firm_name: string;
  naics_code: string;
  amount: number;
  certified_dbe: boolean;
  contract_type: string;
  award_date: string;
  ethnicity_gender: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}
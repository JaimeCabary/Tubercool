export type UserRole = "super_admin" | "hospital_admin" | "clinician" | "researcher";
export type TBStatus = "positive" | "negative" | "indeterminate" | "pending";
export type Gender = "male" | "female" | "other";
export type HIVStatus = "positive" | "negative" | "unknown";
export type TestStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  hospital_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  state: string | null;
  lga: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: Gender | null;
  phone: string | null;
  address: string | null;
  state: string | null;
  lga: string | null;
  occupation: string | null;
  education_level: string | null;
  hiv_status: HIVStatus;
  diabetes: boolean;
  smoking: boolean;
  alcohol: boolean;
  previous_tb: boolean;
  tb_contact: boolean;
  hospital_id: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  patient_id: string;
  test_date: string;
  status: TestStatus;
  afb_smear_1: string | null;
  afb_smear_2: string | null;
  afb_smear_3: string | null;
  afb_culture: string | null;
  genexpert_result: string | null;
  genexpert_rif_resistance: string | null;
  genexpert_ct_value: number | null;
  mantoux_result_mm: number | null;
  mantoux_interpretation: string | null;
  cxr_done: boolean;
  cxr_findings: string | null;
  cxr_result: string | null;
  igra_result: string | null;
  dst_isoniazid: string | null;
  dst_rifampicin: string | null;
  dst_ethambutol: string | null;
  dst_pyrazinamide: string | null;
  dst_streptomycin: string | null;
  tb_status: TBStatus;
  tb_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  patient_id: string;
  test_result_id: string | null;
  model_version: string | null;
  probability_positive: number | null;
  probability_negative: number | null;
  prediction: string | null;
  confidence: string | null;
  feature_importance: Record<string, number> | null;
  created_at: string;
}

export interface OverviewStats {
  total_patients: number;
  total_tests: number;
  positive_cases: number;
  positivity_rate: number;
  total_predictions: number;
  active_hospitals: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

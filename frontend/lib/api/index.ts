import { api } from "./client";
import type {
  User, Hospital, Patient, TestResult, Prediction,
  OverviewStats, AuthTokens
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>("/auth/login", { email, password }).then(r => r.data),
  register: (data: Record<string, unknown>) =>
    api.post<User>("/auth/register", data).then(r => r.data),
  me: () => api.get<User>("/auth/me").then(r => r.data),
  changePassword: (current_password: string, new_password: string) =>
    api.post("/auth/change-password", { current_password, new_password }).then(r => r.data),
};

// ── Hospitals ─────────────────────────────────────────────────────────────────
export const hospitalsApi = {
  list: () => api.get<Hospital[]>("/hospitals").then(r => r.data),
  get: (id: string) => api.get<Hospital>(`/hospitals/${id}`).then(r => r.data),
  create: (data: Partial<Hospital>) => api.post<Hospital>("/hospitals", data).then(r => r.data),
  update: (id: string, data: Partial<Hospital>) =>
    api.put<Hospital>(`/hospitals/${id}`, data).then(r => r.data),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Patient[]>("/patients", { params }).then(r => r.data),
  get: (id: string) => api.get<Patient>(`/patients/${id}`).then(r => r.data),
  create: (data: Partial<Patient>) => api.post<Patient>("/patients", data).then(r => r.data),
  update: (id: string, data: Partial<Patient>) =>
    api.put<Patient>(`/patients/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/patients/${id}`).then(r => r.data),
};

// ── Tests ─────────────────────────────────────────────────────────────────────
export const testsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<TestResult[]>("/tests", { params }).then(r => r.data),
  get: (id: string) => api.get<TestResult>(`/tests/${id}`).then(r => r.data),
  create: (data: Partial<TestResult>) => api.post<TestResult>("/tests", data).then(r => r.data),
  update: (id: string, data: Partial<TestResult>) =>
    api.put<TestResult>(`/tests/${id}`, data).then(r => r.data),
};

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictionsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Prediction[]>("/predictions", { params }).then(r => r.data),
  get: (id: string) => api.get<Prediction>(`/predictions/${id}`).then(r => r.data),
  create: (patient_id: string, test_result_id?: string) =>
    api.post<Prediction>("/predictions", { patient_id, test_result_id }).then(r => r.data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () => api.get<OverviewStats>("/analytics/overview").then(r => r.data),
  prevalenceByYear: (hospital_id?: string) =>
    api.get("/analytics/prevalence-by-year", { params: { hospital_id } }).then(r => r.data),
  byHospital: () => api.get("/analytics/by-hospital").then(r => r.data),
  demographics: () => api.get("/analytics/demographics").then(r => r.data),
  riskFactors: () => api.get("/analytics/risk-factors").then(r => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<User[]>("/users", { params }).then(r => r.data),
  get: (id: string) => api.get<User>(`/users/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post<User>("/users", data).then(r => r.data),
  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data).then(r => r.data),
};

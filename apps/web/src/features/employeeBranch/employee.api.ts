import { api } from "@/shared/api";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeListQuery,
  EmployeeListResponse,
  EmployeeStatus,
  UpdateEmployeeRequest,
} from "./employee.types";

export const employeeApi = {
  list: (query?: EmployeeListQuery) => api.get<EmployeeListResponse>("/users", query),
  detail: (userId: string) => api.get<Employee>(`/users/${userId}`),
  create: (payload: CreateEmployeeRequest) => api.post<Employee>("/users", payload),
  update: (userId: string, payload: UpdateEmployeeRequest) => api.patch<Employee>(`/users/${userId}`, payload),
  setStatus: (userId: string, status: EmployeeStatus) =>
    api.patch<Employee>(`/users/${userId}/${status === "active" ? "activate" : "deactivate"}`, {}),
  transferBranch: (userId: string, branchId: string) => api.patch<Employee>(`/users/${userId}/transfer-branch`, { branchId }),
  assignManagerBranch: (userId: string, branchId: string) =>
    api.patch<{ manager: Employee; branch: { id: string; name: string; managerId: string | null } }>(
      `/users/${userId}/assign-manager-branch`,
      { branchId }
    ),
  removeManagerBranch: (userId: string, branchId: string) =>
    api.patch<{ manager: Employee; branch: { id: string; name: string; managerId: string | null } }>(
      `/users/${userId}/remove-manager-branch`,
      { branchId }
    ),
};

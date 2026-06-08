export type EmployeeRole = "admin" | "owner" | "manager" | "staff";
export type EditableEmployeeRole = "manager" | "staff";
export type EmployeeStatus = "active" | "inactive";
export type EmployeeType = "full_time" | "part_time";

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  employeeType?: EmployeeType;
  phone?: string;
  avatar?: string;
  branchId?: string;
  organizationId?: string;
  employeeCode?: string;
  joinDate?: string;
  lastLoginAt?: string;
  isEmailVerified?: boolean;
};

export type EmployeeListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Employee[];
};

export type EmployeeListQuery = {
  page?: number;
  limit?: number;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  branchId?: string;
  organizationId?: string;
  search?: string;
};

export type CreateEmployeeRequest = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: EditableEmployeeRole;
  employeeType?: EmployeeType;
  branchId?: string;
  organizationId?: string;
  employeeCode?: string;
  joinDate?: string;
};

export type UpdateEmployeeRequest = Omit<Partial<CreateEmployeeRequest>, "email" | "password">;

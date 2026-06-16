import axios from "axios";
import type { ApiErrorResponse } from "./types";

const messageMap: Record<string, string> = {
  "Assigned shift date cannot be in the past": "Không thể gán ca cho ngày đã qua.",
  "Assigned shift start time has already passed": "Không thể gán ca khi giờ bắt đầu đã trôi qua.",
  "Employee already has an overlapping assigned shift": "Nhân viên đã có ca trùng thời gian.",
  "Select an active shift template before assigning shifts.": "Vui lòng chọn mẫu ca đang hoạt động trước khi gán ca.",
  "Your subscription employee limit has been reached": "Gói đăng ký đã đạt giới hạn nhân viên.",
  "Your subscription branch limit has been reached": "Gói đăng ký đã đạt giới hạn chi nhánh.",
  "Employee code already exists in this organization": "Mã nhân viên đã tồn tại trong doanh nghiệp này.",
  "Email already exists": "Email đã tồn tại.",
  "Check-in is only allowed within 0 minutes before shift start": "Chưa tới giờ được phép check-in.",
  "Attendance already checked in": "Ca này đã check-in.",
  "Attendance already checked out": "Ca này đã check-out.",
  "Check-in is required before check-out": "Cần check-in trước khi check-out.",
};

const translateApiMessage = (message: string) => {
  if (messageMap[message]) {
    return messageMap[message];
  }

  if (message.startsWith("Check-in is only allowed within")) {
    const minutes = message.match(/\d+/)?.[0] ?? "0";
    return `Chỉ được check-in sớm tối đa ${minutes} phút trước giờ bắt đầu ca.`;
  }

  return message;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;
    return message ? translateApiMessage(message) : fallback;
  }

  return fallback;
};

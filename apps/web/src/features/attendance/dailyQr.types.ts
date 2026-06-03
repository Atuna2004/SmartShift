export type DailyQrCodeStatus = "active" | "expired" | "revoked";

export type DailyQrCode = {
  id: string;
  organizationId: string;
  branchId: string;
  qrToken: string;
  validDate: string;
  expiresAt: string;
  status: DailyQrCodeStatus;
  createdBy: string;
};

export type GenerateDailyQrRequest = {
  branchId: string;
  validDate?: string;
  expiresInSeconds?: number;
};

export type VerifyDailyQrRequest = {
  qrToken: string;
  branchId?: string;
};

export type VerifyDailyQrResponse = {
  valid: true;
  qrCode: DailyQrCode;
};

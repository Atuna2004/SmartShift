import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { paymentApi } from "@/features/payment/payment.api";
import type { RegistrationIntent } from "@/features/payment/payment.types";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { getApiErrorMessage } from "@/shared/api";
import { useAuthStore } from "@/store";

const getStoredCheckout = () => ({
  intentId: sessionStorage.getItem("registrationIntentId"),
  completionToken: sessionStorage.getItem("registrationCompletionToken"),
});

export const RegistrationPaymentSuccessPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [intent, setIntent] = useState<RegistrationIntent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let attempts = 0;
    let timeoutId: number | undefined;
    const { intentId, completionToken } = getStoredCheckout();

    if (!intentId || !completionToken) {
      setError("Không tìm thấy phiên đăng ký. Vui lòng đăng nhập hoặc đăng ký lại.");
      return undefined;
    }

    const poll = async () => {
      try {
        const result = await paymentApi.completeRegistration(intentId, completionToken);
        setIntent(result.intent);

        if (result.completed) {
          setAuth(result);
          sessionStorage.removeItem("registrationIntentId");
          sessionStorage.removeItem("registrationCompletionToken");
          navigate("/dashboard", { replace: true });
          return;
        }

        attempts += 1;
        if (attempts < 20 && result.intent.status === "pending") {
          timeoutId = window.setTimeout(poll, 3000);
          return;
        }

        if (result.intent.status === "pending") {
          setError("PayOS chưa gửi xác nhận thanh toán. Vui lòng chờ thêm và tải lại trang.");
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể kiểm tra thanh toán."));
      }
    };

    void poll();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [navigate, setAuth]);

  return (
    <PaymentResultShell
      icon={<Loader2 className="h-10 w-10 animate-spin text-black" />}
      title="Đang xác nhận thanh toán"
      description={
        error ||
        `Trạng thái hiện tại: ${intent?.status ?? "pending"}. Hệ thống sẽ tự vào dashboard khi PayOS xác nhận.`
      }
    />
  );
};

export const RegistrationPaymentCancelPage = () => (
  <PaymentResultShell
    icon={<XCircle className="h-10 w-10 text-[#93000a]" />}
    title="Thanh toán đã bị hủy"
    description="Dữ liệu tài khoản thật chưa được tạo. Bạn có thể quay lại đăng ký và tạo checkout mới."
    action={
      <Link to="/register">
        <Button>Quay lại đăng ký</Button>
      </Link>
    }
  />
);

const PaymentResultShell = ({
  action,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) => (
  <main className="flex min-h-screen items-center justify-center bg-[#f7f3f2] px-4 py-10">
    <Card className="w-full max-w-md p-8 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white">
        {icon}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-[#1c1b1b]">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#444748]">{description}</p>
      <div className="mt-6">
        {action ?? (
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c1b1b]">
            <CheckCircle2 className="h-4 w-4" />
            Không đóng trang này
          </div>
        )}
      </div>
    </Card>
  </main>
);

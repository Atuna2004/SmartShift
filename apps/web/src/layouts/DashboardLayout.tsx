import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  MapPin,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  QrCode,
  Repeat,
  Search,
  Settings,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/auth.api";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/store";

const navItems = [
  { label: "Tổng quan", path: "/dashboard", icon: LayoutDashboard },
  { label: "Nhân viên", path: "/dashboard/employees", icon: UsersRound },
  { label: "Chi nhánh", path: "/dashboard/branches", icon: Store },
  { label: "Mẫu ca làm", path: "/dashboard/shifts", icon: Layers },
  { label: "Lịch làm việc", path: "/dashboard/schedule", icon: CalendarDays },
  { label: "Chấm công", path: "/dashboard/attendance", icon: QrCode },
  { label: "Quét QR", path: "/dashboard/attendance/qr", icon: QrCode },
  { label: "Đổi ca", path: "/dashboard/shift-swaps", icon: Repeat },
  { label: "Nghỉ phép", path: "/dashboard/leave-requests", icon: UserRound },
];

const systemItems = [
  { label: "Báo cáo", path: "/dashboard/reports", icon: BarChart3 },
  { label: "Tổ chức", path: "/dashboard/organization", icon: Building2 },
  { label: "Thông báo", path: "/dashboard/notifications", icon: Bell },
  { label: "Gói đăng ký", path: "/dashboard/subscription", icon: CreditCard },
  { label: "Thanh toán", path: "/dashboard/payments", icon: Settings },
];

export const DashboardLayout = () => {
  const { clearAuth, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const visibleSystemItems =
    user?.role === "manager"
      ? systemItems.filter((item) => !["/dashboard/organization", "/dashboard/subscription", "/dashboard/payments"].includes(item.path))
      : systemItems;
  const roleLabel = user?.role === "manager" ? "Quản lý chi nhánh" : user?.role === "owner" ? "Chủ sở hữu" : user?.role ?? "Quản trị";
  const displayName = user?.fullName ?? (user?.role === "manager" ? "Marcus Chen" : "Alex Sterling");
  const branchName = user?.role === "manager" ? "Chi nhánh phía Bắc" : "Chi nhánh trung tâm";
  const profilePhoto =
    user?.role === "manager"
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBVfs563XFhRlv010oSxLgkYRw-IE36C5saDt10C36_XPPk9SayFU2E4h7IvjnibbqOMygSOTZ9ftQOAS9Yd4McgDQOtRUL7Zlv20sVHv_OXjooix2A4nj0Kj4QziqyfJP4mtWiCBQFL4xAfrNFOZQXp4VdKhmsILXIyTD2-yXyi4kYc3DUTI_21KAegYwx-jNaX8YboYU9cJZrcDIRP1v7ud5xJhJXrScKt6f7aF0CzRAj0sGVIZqi4uyD7vvET29b6xyfFlF72fkD"
      : "https://lh3.googleusercontent.com/aida-public/AB6AXuBFwmmGw3vYArfu6-Hu_cx_KriVQ5wAhwScidL_3DYmKGNJTxjq_H3Yf9LvqhHggnKqDIJRzfgybeLeLSPX0ocpwDYEtMuKBQXW8TCmhtXz5Oiauez52EEgJiVSrBp6BaW5b3QE2sa2UGTKwlKOvRm6vagp1gKoJFy3-3Iq3Noj6vlnKB3ilGXakr39w-t3UqEXfpGRJBxHMp-2oNqsQT5ccyBD2Bj60LxuyGl_dwbof5ED49gci8mmNpRpaVlkcr0KhclpWYRHeZre";
  const usesPageChrome =
    location.pathname.startsWith("/dashboard/employees") ||
    location.pathname.startsWith("/dashboard/branches") ||
    location.pathname.startsWith("/dashboard/shifts") ||
    location.pathname.startsWith("/dashboard/schedule") ||
    location.pathname.startsWith("/dashboard/attendance") ||
    location.pathname.startsWith("/dashboard/shift-swaps") ||
    location.pathname.startsWith("/dashboard/leave-requests") ||
    location.pathname.startsWith("/dashboard/notifications") ||
    location.pathname.startsWith("/dashboard/reports") ||
    location.pathname.startsWith("/dashboard/subscription") ||
    location.pathname.startsWith("/dashboard/payments/success");
  const activeNavItem = [...navItems, ...visibleSystemItems]
    .filter((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1c1b1b]">
      {isMobileNavOpen ? (
        <button
          aria-label="Đóng điều hướng"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e5e7eb] bg-white px-2 py-4 transition-transform duration-200",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="mb-8 flex items-center gap-2 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
            <Layers className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-none text-black">SmartShift</h1>
            <p className="text-xs text-[#444748]">Enterprise Quản trị</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <SidebarLink end={item.path === "/dashboard"} item={item} key={`${item.path}-${index}`} onNavigate={() => setIsMobileNavOpen(false)} />
          ))}
          <div className="mt-4 border-t border-[#e5e7eb] pt-4">
            {visibleSystemItems.map((item) => (
              <SidebarLink item={item} key={item.path} onNavigate={() => setIsMobileNavOpen(false)} />
            ))}
          </div>
        </nav>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 py-2">
            <img alt="" className="h-9 w-9 rounded-full border border-[#e5e7eb] object-cover" src={profilePhoto} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-black">{displayName}</p>
              <p className="truncate text-xs text-[#444748]">{roleLabel}</p>
            </div>
          </div>
          <Button className="w-full justify-center" onClick={handleSignOut} size="sm" variant="secondary">
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="md:pl-64">
        {usesPageChrome ? (
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 shadow-sm md:hidden">
            <Button aria-label="Mở điều hướng" className="px-3" onClick={() => setIsMobileNavOpen(true)} variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
            <p className="truncate px-3 text-sm font-semibold text-black">{activeNavItem?.label ?? "SmartShift"}</p>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#444748] transition hover:bg-[#f7f3f2]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
            </button>
          </header>
        ) : (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
            <Button aria-label="Mở điều hướng" className="px-3 md:hidden" onClick={() => setIsMobileNavOpen(true)} variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
            <button className="hidden h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 text-sm font-bold text-black transition hover:bg-[#f1edec] sm:inline-flex">
              <MapPin className="h-5 w-5 text-black" />
              <span>{branchName}</span>
            </button>
            <div className="relative hidden w-full max-w-md md:block">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
              <input
                className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 text-base outline-none placeholder:text-[#444748] focus:border-transparent focus:ring-2 focus:ring-black"
                placeholder={user?.role === "manager" ? "Tìm nhân viên, ca làm hoặc nhật ký..." : "Tìm nhân viên, ca làm hoặc báo cáo..."}
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#444748] transition hover:bg-[#f7f3f2]">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
            </button>
          </div>
        </header>
        )}

        <main className={usesPageChrome ? "min-h-screen bg-white" : "min-h-[calc(100vh-4rem)] bg-white"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({
  end = false,
  item,
  onNavigate,
}: {
  end?: boolean;
  item: { label: string; path: string; icon: ComponentType<{ className?: string }> };
  onNavigate?: () => void;
}) => {
  const Icon = item.icon;

  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex h-10 scale-[0.98] items-center gap-3 rounded-lg px-4 text-sm font-semibold transition active:scale-95",
          isActive ? "bg-[#f1edec] font-bold text-black" : "text-[#444748] hover:bg-[#f7f3f2] hover:text-black"
        )
      }
      end={end}
      onClick={onNavigate}
      to={item.path}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </NavLink>
  );
};





import {
  Bell,
  Building2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Repeat,
  Settings,
  Store,
  UserRound,
  UsersRound,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/store";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Organization", path: "/organization", icon: Building2 },
  { label: "Branches", path: "/branches", icon: Store },
  { label: "Employees", path: "/employees", icon: UsersRound },
  { label: "Shifts", path: "/shifts", icon: CalendarDays },
  { label: "Schedule", path: "/schedule", icon: CalendarDays },
  { label: "Attendance", path: "/attendance", icon: QrCode },
  { label: "Leave Requests", path: "/leave-requests", icon: UserRound },
  { label: "Shift Swaps", path: "/shift-swaps", icon: Repeat },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Subscription", path: "/subscription", icon: Settings },
  { label: "Payments", path: "/payments", icon: CreditCard },
];

export const DashboardLayout = () => {
  const { clearAuth, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-sm font-semibold text-white">
            SS
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold">SmartShift</p>
            <p className="text-xs text-muted">Workforce console</p>
          </div>
        </div>
        <nav className="grid gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-ink",
                    isActive ? "bg-brand-50 text-brand-700" : ""
                  )
                }
                end={item.path === "/"}
                key={item.path}
                to={item.path}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button aria-label="Open navigation" className="px-3 lg:hidden" variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold">{user?.fullName ?? "SmartShift User"}</p>
              <p className="text-xs capitalize text-muted">{user?.role ?? "owner"}</p>
            </div>
          </div>
          <Button onClick={clearAuth} variant="secondary">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

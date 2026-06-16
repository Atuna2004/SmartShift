import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

const links = [
  { label: "Sản phẩm", to: "/" },
  { label: "Tính năng", to: "/features" },
  { label: "Bảng giá", to: "/pricing" },
  { label: "Tài nguyên", to: "/about-contact" },
];

export const MarketingShell = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fdf8f8] text-[#1c1b1b]">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-[#e5e7eb] bg-[#fdf8f8]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-12">
          <Link className="shrink-0 text-xl font-black tracking-tight text-black sm:text-2xl" to="/">
            SmartShift
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((item) => {
              const active = location.pathname === item.to;

              return (
                <Link
                  className={`pb-1 text-sm font-semibold transition ${
                    active ? "border-b-2 border-black text-black" : "text-[#444748] hover:text-black"
                  }`}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link className="inline-flex h-9 items-center justify-center rounded-lg border border-[#e5e7eb] px-3 text-sm font-semibold text-[#444748] transition hover:text-black sm:h-auto sm:border-0 sm:px-0" to="/login">
              Đăng nhập
            </Link>
            <Link className="inline-flex h-9 items-center justify-center rounded-lg bg-black px-3 text-sm font-semibold text-white transition hover:opacity-85 sm:px-5" to="/register">
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </header>
      {children}
      <MarketingFooter />
    </div>
  );
};

export const MarketingFooter = () => (
  <footer className="bg-[#101010] text-[#fdf8f8]">
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4 lg:px-12">
      <div>
        <div className="mb-4 text-2xl font-black">SmartShift</div>
        <p className="max-w-xs text-[#ddd9d8]">Building tools for the future of service industry operations.</p>
      </div>
      <FooterColumn title="Product" items={["Features", "Pricing", "Enterprise"]} />
      <FooterColumn title="Company" items={["About", "Careers", "Contact"]} />
      <FooterColumn title="Legal" items={["Privacy Policy", "Terms of Service", "Security"]} />
    </div>
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-6 text-xs text-[#ddd9d8] md:flex-row lg:px-12">
      <span>© 2024 SmartShift. All rights reserved.</span>
      <span>Precision scheduling for modern service teams.</span>
    </div>
  </footer>
);

const FooterColumn = ({ items, title }: { items: string[]; title: string }) => (
  <div>
    <p className="mb-4 text-sm font-semibold text-white">{title}</p>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item}>
          <a className="text-[#ddd9d8] transition hover:text-white" href="#">
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

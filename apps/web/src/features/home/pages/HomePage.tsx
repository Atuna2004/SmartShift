import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CirclePlay,
  Mail,
  MapPin,
  MessageSquare,
  Star,
  Table2,
} from "lucide-react";

const images = {
  heroDashboard:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB1BZRBGMHlTROb5Mkh1qHA6Dzfla5D0vw2HbbvXDyQ6qzp6QBLtQI6CPJwS2_7Nxz-O-ZGOa4Otphn0aFuybjddGmdmPhv-NdtVhRAjSw1-LTguvaePMDq0ESGzpTwknkpQ1vBIZdrd4Af3AAfZN5FQBJkSxb9WfFITtttFUnp8JOH71nlEEydmB4KrbtaqXPF-Jd-M9n42FiVcdu4V1Wa2gQG4_UqiC1M_gMSVALWY6NRnWhwRsh5CclcwV9e3zg-qHL_L2RAqM2x",
  mobile:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAUr63gZIY6cvPMFR1QtHrI55VHbvwrOqbfN1MMMd4tBFNLC5KSnoNj55m7cD2jcOjIDN-90i5HoOP3tka9tVCiGOmjf2D30Hb9IWdniV--EtIDkBnLKJ3Pv2oAEfeJg-TSQ3fMqMtaWOrYN8DrwbpII-ynBFHG6nDDPwpkRsAfxEu7UHJ6fysLRe4TpV3iEpv56iyywLNH3kITn-1ouK_clRjrdNkhLbD1MmpFeyqdqDYHLDqBzzbjO6sEmNSGTExB8f0VED_Ng4Lk",
  schedule:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDPsVxmGI7zexFPKrbMaDGcIaa8XIEedCWRJMkjBcY1xomEHhQGojIPJfm7xb6VwXibCAZkkhFD6GMxNEYMK5wa6VAipr6bVJUl4hmzjOtrz6uzOKU3t5_NZjDSe9fw4C1Qk6MJ8nfjW0h8wN_zcpIG9Dv7X2HBel2-vzRkTaloUQRnjrwf3sHHLpwl-8JnMuTXUeM4ziaEwfjk1Gyyw3CkeSexDKivcI9eQ3se3G_0ZMvg4WVjgDjVVemKLTFz62B87CsvJ7f6ginH",
  qr:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDU21yuzoLnuhCXM4rYnjUPS_veEPbt-fvhR3WN8mzeBuvhMt0wOC3dZCS2iH8Mq4guqSDrnjuBn9r4t2-9Xb1-yZ3dQfJOniZ69WAZOxhDP_OAQQVwY3OiB5e_IIQEhdfsyjTXWXEMoES6_cMTbANmiT_10O8t2503o9BKKqP_6KYp9FfjrQGYy9inijd5TnOCgtVriFihGCp17r79PAg6yCPEzgW4C20zFKgmS6nMuyqVFXP_8TeFV627DvDJ-qqSzFvC_qBhCpgj",
  swaps:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAQN41RXjOCHvtFt0Do65QfmwkzhC-gTvlEAoCIEXSjPJ8feH2YrAJUOLeZTJMob7kTM54I--VGbXZI7w9cdGIJ83U7p-T2rYpVJ8GJxJybAA5ofHX5h1fzvgQdBxzeAUxsjhLyHZ1DphfD-tn7x-B26imSI21AmD9tDd9Z6dhK6rpanZVudB3zMAJprr2KI4PP5yoYwC5oqHS42qZdXkBudyLg6WfVDwogO4Gcre0NYuT8pr_ez1ey3a1zuq03fhm-PquSU-i8WHnc",
  portrait:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBapCQUT_MaJtdRrLH-47hHdgcYr52WgNWmY1chLzGXs7_yLOtTnTmE7IBMGaFhDREhliycY--PpgzkejpGze2pqc90LAvqXfv494A1DctlAH9DLdKEB-CUwTi1MtmBUWENmP3hdLSZwDTNWn0WVfvwqNfgwbYcCA_tlvZuMfVQwBdCXBJ1OQKGwUrpTnxUWzDXbQejXARXVFg9dHFanvpjzVwUkgoXkp8NseC2FWAVPuOijMjko9Sv2-vYgp1rjRtfMUPpqHGqGGWU",
};

const navLinks = [
  { label: "Sản phẩm", href: "/" },
  { label: "Tính năng", href: "/features" },
  { label: "Bảng giá", href: "/pricing" },
  { label: "Tài nguyên", href: "/about-contact" },
];

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#fdf8f8] text-[#1c1b1b]">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-[#e5e7eb] bg-[#fdf8f8]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link className="text-2xl font-black tracking-tight text-black" to="/">
            SmartShift
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <Link className="text-sm font-semibold text-[#444748] transition hover:text-black" key={item.href} to={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link className="hidden text-sm font-semibold text-[#444748] transition hover:text-black sm:inline" to="/login">
              Đăng nhập
            </Link>
            <Link className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:opacity-85" to="/register">
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="overflow-hidden px-6 py-16 lg:px-12 lg:py-24" id="product">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="max-w-xl text-5xl font-black leading-[1.04] tracking-tight text-black md:text-6xl">
                Ngừng quản lý ca làm bằng giấy và Zalo
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#444748]">
                Cách thông minh nhất để quán cà phê và nhà hàng xếp lịch nhân sự, theo dõi chấm công và tự động hóa lương trong một không gian làm việc duy nhất.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link className="inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-black px-8 text-base font-semibold text-white transition hover:opacity-90" to="/register">
                  Dùng thử miễn phí
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#fdf8f8] px-8 text-base font-semibold text-black transition hover:bg-[#f1edec]" href="#features">
                  <CirclePlay className="h-5 w-5" />
                  Xem demo
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <img alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover" src={images.portrait} />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#f1edec] text-xs font-bold">
                    500+
                  </div>
                </div>
                <p className="text-xs text-[#444748]">Được các doanh nghiệp dịch vụ địa phương tin dùng</p>
              </div>
            </div>

            <div className="relative flex min-h-[420px] items-center justify-center lg:min-h-[600px]">
              <div className="relative w-full translate-y-4 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl lg:translate-x-12">
                <img alt="SmartShift dashboard interface" className="aspect-[4/3] h-full w-full object-cover" src={images.heroDashboard} />
              </div>
              <div className="absolute -bottom-5 left-0 hidden h-[400px] w-48 overflow-hidden rounded-[2rem] border-[6px] border-[#1c1b1b] bg-black shadow-2xl sm:block">
                <img alt="SmartShift mobile view" className="h-full w-full object-cover" src={images.mobile} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f3f2] px-6 py-16 lg:px-12 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#0058be]">Cách làm cũ</span>
              <h2 className="mt-2 text-4xl font-black tracking-tight">Quy trình rối rắm làm giảm lợi nhuận</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <ProblemCard icon={<Table2 />} title="Bảng Excel lộn xộn">
                Lỗi phiên bản và công thức hỏng khiến tính lương sai lệch.
              </ProblemCard>
              <ProblemCard icon={<MessageSquare />} title="Ngập tin nhắn Zalo">
                Các ca đổi quan trọng bị chôn giữa hàng trăm tin nhắn không liên quan.
              </ProblemCard>
              <div className="rounded-xl bg-black p-8 text-white md:col-span-3 md:flex md:items-center md:justify-between md:gap-8">
                <div className="max-w-lg">
                  <h3 className="text-4xl font-black tracking-tight">So với lợi thế của SmartShift</h3>
                  <p className="mt-4 text-lg leading-8 text-white/75">
                    Một nguồn dữ liệu duy nhất cho mọi chi nhánh, mọi quản lý và mọi nhân viên.
                  </p>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-0">
                  {["Chính xác 100%", "Không giấy tờ", "Đồng bộ thời gian thực", "Nhân viên hài lòng"].map((item) => (
                    <div className="flex items-center gap-2 text-sm font-semibold" key={item}>
                      <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24" id="features">
          <div className="mb-12 max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-widest text-[#0058be]">Tính năng</span>
            <h2 className="mt-2 text-4xl font-black tracking-tight">Được xây cho nhịp độ của công việc dịch vụ</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard image={images.schedule} title="Lập lịch trực quan">
              Kéo thả ca làm trong vài giây. Xem khoảng trống ca và chi phí lao động trước khi xuất bản.
            </FeatureCard>
            <FeatureCard image={images.qr} title="Chấm công QR">
              Loại bỏ việc chấm công hộ bằng mã QR an toàn từ thiết bị của nhân viên.
            </FeatureCard>
            <FeatureCard image={images.swaps} title="Tự đổi ca">
              Nhân viên có thể gửi yêu cầu đổi ca và chờ quản lý duyệt mà không cần điều phối rối rắm.
            </FeatureCard>
          </div>
        </section>

        <section className="border-y border-[#e5e7eb] bg-white px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex gap-1 text-black">
                {[0, 1, 2, 3, 4].map((item) => (
                  <Star className="h-5 w-5 fill-current" key={item} />
                ))}
              </div>
              <blockquote className="text-4xl font-black italic leading-tight tracking-tight">
                "SmartShift giúp chúng tôi tiết kiệm 15 giờ mỗi tuần cho công việc quản lý."
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <img alt="" className="h-12 w-12 rounded-full object-cover" src={images.portrait} />
                <div>
                  <p className="text-sm font-semibold text-black">Le Minh Anh</p>
                  <p className="text-xs text-[#444748]">Chủ quán, The Roastery Saigon</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Metric value="4.9/5" label="Đánh giá ứng dụng" />
              <Metric value="3000+" label="Nhân viên đang hoạt động" />
              <Metric value="30%" label="Giảm chi phí nhân công" wide />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-12 lg:py-24" id="pricing">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-black tracking-tight">Bảng giá đơn giản, minh bạch</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#444748]">
              Phát triển doanh nghiệp dịch vụ của bạn với bộ công cụ được thiết kế cho độ chính xác. Không phí ẩn.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <PlanCard name="Gói cơ bản" price="$49" cta="Chọn gói cơ bản" features={["Tối đa 10 nhân viên", "Chấm công QR thời gian thực", "Hỗ trợ qua email"]} />
            <PlanCard
              dark
              badge="Most Popular"
              name="Gói tổ chức"
              price="$129"
              cta="Liên hệ kinh doanh"
              features={["Không giới hạn nhân viên và người dùng", "AI tự động lập lịch", "Hỗ trợ đa chi nhánh", "Quản lý thành công riêng"]}
            />
          </div>
        </section>

        <section className="bg-white px-6 py-16 lg:px-12 lg:py-24" id="contact">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-black tracking-tight">Hãy trao đổi về doanh nghiệp của bạn.</h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-[#444748]">
                Có câu hỏi về SmartShift? Cần hỗ trợ bắt đầu? Đội ngũ của chúng tôi sẽ giúp bạn thiết lập phù hợp.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 font-semibold">
                  <Mail className="h-5 w-5" />
                  hello@smartshift.io
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <MapPin className="h-5 w-5" />
                  Ho Chi Minh City, Vietnam
                </div>
              </div>
            </div>
            <form className="rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-8">
              <ContactField label="Tên" placeholder="Tên của bạn" />
              <ContactField label="Email" placeholder="email@example.com" type="email" />
              <label className="mb-6 block">
                <span className="mb-1 block text-sm font-semibold">Tin nhắn</span>
                <textarea className="min-h-32 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-black" placeholder="Chúng tôi có thể hỗ trợ gì cho bạn?" />
              </label>
              <button className="h-12 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:opacity-90" type="button">
                Send Tin nhắn
              </button>
            </form>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-12">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-black p-8 text-center text-white md:p-16">
            <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight">Sẵn sàng đơn giản hóa việc quản lý chi nhánh?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
              Tham gia cùng hàng trăm doanh nghiệp đang tăng trưởng nhanh hơn nhờ vận hành nhân sự tốt hơn.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link className="rounded-lg bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-[#f1edec]" to="/register">
                Bắt đầu ngay
              </Link>
              <a className="rounded-lg border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10" href="#contact">
                Liên hệ kinh doanh
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#101010] text-[#fdf8f8]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4 lg:px-12">
          <div>
            <div className="mb-4 text-2xl font-black">SmartShift</div>
            <p className="max-w-xs text-[#ddd9d8]">Xây dựng công cụ cho tương lai của vận hành ngành dịch vụ.</p>
          </div>
          <FooterColumn title="Sản phẩm" items={["Tính năng", "Bảng giá", "Doanh nghiệp"]} />
          <FooterColumn title="Công ty" items={["Giới thiệu", "Tuyển dụng", "Liên hệ"]} />
          <FooterColumn title="Pháp lý" items={["Chính sách quyền riêng tư", "Điều khoản dịch vụ", "Bảo mật"]} />
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-6 text-xs text-[#ddd9d8] md:flex-row lg:px-12">
          <span>Â© 2024 SmartShift. All rights reserved.</span>
          <span>Lập lịch chính xác cho đội ngũ dịch vụ hiện đại.</span>
        </div>
      </footer>
    </div>
  );
};

const ProblemCard = ({ children, icon, title }: { children: string; icon: ReactNode; title: string }) => (
  <div className="relative flex h-64 flex-col justify-end overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-8">
    <div className="absolute right-4 top-4 text-black/10 [&>svg]:h-24 [&>svg]:w-24">{icon}</div>
    <h3 className="mb-2 text-2xl font-black tracking-tight text-[#ef4444]">{title}</h3>
    <p className="text-base leading-7 text-[#444748]">{children}</p>
  </div>
);

const FeatureCard = ({ children, image, title }: { children: string; image: string; title: string }) => (
  <div className="group">
    <div className="mb-6 aspect-square overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] transition group-hover:border-black">
      <img alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={image} />
    </div>
    <h3 className="mb-2 text-2xl font-black tracking-tight">{title}</h3>
    <p className="text-base leading-7 text-[#444748]">{children}</p>
  </div>
);

const Metric = ({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) => (
  <div className={`rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm ${wide ? "col-span-2" : ""}`}>
    <p className="mb-1 text-2xl font-black text-black">{value}</p>
    <p className="text-xs font-semibold uppercase tracking-widest text-[#444748]">{label}</p>
  </div>
);

const PlanCard = ({
  badge,
  cta,
  dark = false,
  features,
  name,
  price,
}: {
  badge?: string;
  cta: string;
  dark?: boolean;
  features: string[];
  name: string;
  price: string;
}) => (
  <div className={`relative flex flex-col rounded-xl p-8 ${dark ? "bg-[#101010] text-white" : "border border-[#e5e7eb] bg-[#f5f5f5] text-black"}`}>
    {badge ? <span className="absolute right-6 top-6 rounded-full bg-[#2170e4] px-3 py-1 text-xs font-semibold text-white">{badge}</span> : null}
    <h3 className="text-2xl font-black tracking-tight">{name}</h3>
    <p className={`mt-2 ${dark ? "text-white/65" : "text-[#444748]"}`}>Designed for service teams ready to move faster.</p>
    <div className="my-8">
      <span className="text-5xl font-black tracking-tight">{price}</span>
      <span className={dark ? "text-white/65" : "text-[#444748]"}>/mo</span>
    </div>
    <ul className="mb-8 grid flex-1 gap-4">
      {features.map((feature) => (
        <li className="flex items-center gap-3" key={feature}>
          <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Link className={`flex h-12 items-center justify-center rounded-lg text-sm font-semibold ${dark ? "bg-white text-black" : "border border-black text-black"}`} to="/register">
      {cta}
    </Link>
  </div>
);

const ContactField = ({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) => (
  <label className="mb-5 block">
    <span className="mb-1 block text-sm font-semibold">{label}</span>
    <input className="h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:border-black focus:ring-2 focus:ring-black" placeholder={placeholder} type={type} />
  </label>
);

const FooterColumn = ({ items, title }: { items: string[]; title: string }) => (
  <div>
    <p className="mb-4 text-sm font-semibold text-white">{title}</p>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item}>
          <a className="text-[#ddd9d8] transition hover:text-white" href="#product">
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);



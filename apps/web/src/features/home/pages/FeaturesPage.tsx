import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingShell } from "@/features/home/components/MarketingShell";

const featureImages = {
  scheduling:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA81D-TJQcoHG--4B_uAgnqGmCt_sbMNqWUmcNbmBrAXPOPz-vw8RuFfndL94KPeGp80qqodoCTyxNM1-dRHmOeRLcgvYgaTunfzc-CGFoOP1pkWK55YYWwmPhpZEYLyGSipGv111UQjy0wvErv_-o7sNp4W7NBMm-BtHfMGwcOaTtfhjjFVX7hkAGTsQ6mOrwc6b-spbqRaKKkzrzfYYELRDIegIhKKXsF9MliQV0y--nteP_gpNShrgx7TyVHtzMLQcEy1VcGx5mX",
  qr:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBKLPMnlT5NBe7xgCkoRIg-_htMnk9_1KVRqBfzmd-MvwkrPJKn1SsTB6Dycpo3MVAbKbC-XEuUNbs6UQ5rgpG0yuaS3w4l2SpTLMWg-We80wZ0fUPTSfFo_LyvnP_ZycUs3KJmtn_YjyFG9ObaINBVA0amp0MCynRft3CZrYK13aAP4T_-ewfF5BI9iormdoAmIJ9nWmAhn1HerbqwbZ5SOzyYBachzGS_JsqUOsSmk4hcEM9ngQXwGUuhrpApZ19ZxVHKrNCaJBDN",
  team:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAi9xjgPO23V1k-936Nd-Vil_FBMNCMsyn_DGq6uC-FRjwPejXqpyKSZp3n1JweNorn9IXoudrOC-Gp18PnrNw49wb2Y8dseRwP_DmsrycmsCioZ6tbWAEjpzMA1cMBdPZXGMbIeVXXNSsqs-So3RYp9H6XsyXTYbJqz71MdYg9mjGDWWOO3u2DuJazH7x8AHJvf7Va-CZ1u2q6NK44PYXG6g7K0iAX91b3wwsMSHmF8g31gHm2HV2csRO8mRmf0cTwSPWS8vtjLHBE",
  branch:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBUHd61fiRvKOA4U6BJ9simJQTMWye_tD6fJa9JWSUVl7KTxRcKIYykzs_8dx47ea3Wflavmh_DeAXSvbcaG8OaRaWEGPtjpV8eZco1_baizCyanIuF45AH3ey3QKnHJ1KarnSyec6mT1eyxKqVsrhKPw8VfYTCWUsdv_6NP1nIDfhZtuDG8_43YkFilEpJkYKSK98ML9cwNGfKlvWGAmJZ4eZHRbLjYqRDiSi8ugXp9sWFj8j5HJbc1a3w-DKLj8PdpgU8ZwUkeqko",
};

export const FeaturesPage = () => (
  <MarketingShell>
    <main className="pt-32">
      <header className="mx-auto mb-16 max-w-7xl px-6 lg:px-12">
        <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-black md:text-6xl">
          Thiết kế cho hiệu quả vận hành
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#444748]">
          Khám phá bộ công cụ được thiết kế để tinh gọn vận hành, trao quyền cho đội ngũ và mở rộng doanh nghiệp của bạn.
        </p>
      </header>

      <FeatureSection
        image={featureImages.scheduling}
        kicker="01 - TỐI ƯU"
        title="Lập lịch thông minh"
        points={["Tự động lấp ca trống theo lịch rảnh của nhân viên", "Phát hiện xung đột về tăng ca và nghỉ phép", "Xuất bản chỉ với một lần bấm đến mọi thiết bị nhân viên"]}
      >
        Loại bỏ xung đột và thiếu người với công cụ lập lịch chạy bằng AI, tự đề xuất phương án ca tối ưu.
      </FeatureSection>

      <FeatureSection
        flip
        image={featureImages.qr}
        kicker="02 - CHÍNH XÁC"
        title="Chấm công QR"
        points={["Chấm công theo vị trí để xác minh địa điểm", "Thông báo tức thì khi đến trễ", "Tích hợp mượt mà với hệ thống tính lương"]}
      >
        Hiện đại hóa chấm công mà không cần phần cứng đắt tiền. Nhân viên quét mã QR an toàn ngay trên thiết bị của họ.
      </FeatureSection>

      <FeatureSection
        image={featureImages.team}
        kicker="03 - CỘNG TÁC"
        title="Trung tâm đội ngũ"
        points={["Nhắn tin cá nhân và nhóm để điều phối ca làm", "Bảng tin cho thông báo toàn công ty", "Chia sẻ tài liệu đào tạo và SOP"]}
      >
        Ngừng quản lý qua các cuộc trò chuyện rải rác và giữ thảo luận về ca làm ngay trong ngữ cảnh lịch.
      </FeatureSection>

      <section className="bg-[#101010] px-6 py-20 text-white lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">04 - MỞ RỘNG</span>
            <h2 className="mt-4 text-4xl font-black tracking-tight">Quản lý đa chi nhánh</h2>
            <p className="mt-4 text-base leading-8 text-white/70">
              Theo dõi doanh nghiệp từ góc nhìn tổng quan. Quản lý địa điểm, so sánh hiệu suất và chuẩn hóa vận hành.
            </p>
            <FeatureList dark items={["Chuyển giữa các góc nhìn chi nhánh tức thì", "Báo cáo chi phí nhân công tổng hợp trên mọi cơ sở", "Phân quyền tập trung và vai trò quản lý vùng"]} />
          </div>
          <img alt="" className="aspect-video rounded-xl border border-white/20 object-cover" src={featureImages.branch} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-12">
        <h2 className="text-4xl font-black tracking-tight">Sẵn sàng tối ưu lực lượng nhân sự?</h2>
        <p className="mx-auto mt-4 max-w-xl text-[#444748]">Gia nhập những doanh nghiệp đang tiết kiệm hàng giờ mỗi tuần cho việc hành chính.</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link className="rounded-lg bg-black px-8 py-4 text-sm font-semibold text-white" to="/register">
            Bắt đầu dùng thử miễn phí
          </Link>
          <Link className="rounded-lg border border-[#e5e7eb] px-8 py-4 text-sm font-semibold text-black" to="/about-contact">
            Đặt lịch demo
          </Link>
        </div>
      </section>
    </main>
  </MarketingShell>
);

const FeatureSection = ({
  children,
  flip = false,
  image,
  kicker,
  points,
  title,
}: {
  children: string;
  flip?: boolean;
  image: string;
  kicker: string;
  points: string[];
  title: string;
}) => (
  <section className={`${flip ? "bg-[#f7f3f2] border-y border-[#e5e7eb]" : ""} px-6 py-20 lg:px-12`}>
    <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
      <div className={flip ? "lg:order-2" : ""}>
        <img alt="" className="aspect-video rounded-xl border border-[#e5e7eb] object-cover" src={image} />
      </div>
      <div className={flip ? "lg:order-1" : ""}>
        <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">{kicker}</span>
        <h2 className="mt-4 text-4xl font-black tracking-tight">{title}</h2>
        <p className="mt-4 text-base leading-8 text-[#444748]">{children}</p>
        <FeatureList items={points} />
      </div>
    </div>
  </section>
);

const FeatureList = ({ dark = false, items }: { dark?: boolean; items: string[] }) => (
  <ul className="mt-6 space-y-3">
    {items.map((item) => (
      <li className={`flex items-center gap-3 text-sm font-semibold ${dark ? "text-white" : "text-black"}`} key={item}>
        <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
        {item}
      </li>
    ))}
  </ul>
);


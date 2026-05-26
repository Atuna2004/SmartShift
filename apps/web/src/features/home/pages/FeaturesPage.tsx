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
          Engineered for Efficiency
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#444748]">
          Discover the suite of tools designed to streamline operations, empower your team, and scale your business.
        </p>
      </header>

      <FeatureSection
        image={featureImages.scheduling}
        kicker="01 - OPTIMIZATION"
        title="Smart Scheduling"
        points={["Auto-fill open shifts based on staff availability", "Conflict detection for overtime and time-off", "One-click publishing to all employee devices"]}
      >
        Eliminate conflicts and understaffing with an AI-driven scheduling engine that suggests optimal rotations automatically.
      </FeatureSection>

      <FeatureSection
        flip
        image={featureImages.qr}
        kicker="02 - PRECISION"
        title="QR Attendance"
        points={["Geofenced clock-ins for verified location tracking", "Instant notifications for late arrivals", "Seamless integration with payroll systems"]}
      >
        Modernize clock-in without expensive hardware. Staff scan secure QR codes from their own devices.
      </FeatureSection>

      <FeatureSection
        image={featureImages.team}
        kicker="03 - COLLABORATION"
        title="Team Hub"
        points={["Direct and group messaging for shift coordination", "Bulletin boards for company-wide announcements", "Document sharing for training and SOPs"]}
      >
        Stop managing through scattered text threads and keep shift-related discussions inside the schedule context.
      </FeatureSection>

      <section className="bg-[#101010] px-6 py-20 text-white lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">04 - SCALE</span>
            <h2 className="mt-4 text-4xl font-black tracking-tight">Multi-Branch Control</h2>
            <p className="mt-4 text-base leading-8 text-white/70">
              Oversee your enterprise from a bird's-eye view. Manage locations, compare performance, and standardize operations.
            </p>
            <FeatureList dark items={["Switch between location views instantly", "Aggregated labor cost reporting across all sites", "Centralized permissions and regional manager roles"]} />
          </div>
          <img alt="" className="aspect-video rounded-xl border border-white/20 object-cover" src={featureImages.branch} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-12">
        <h2 className="text-4xl font-black tracking-tight">Ready to optimize your workforce?</h2>
        <p className="mx-auto mt-4 max-w-xl text-[#444748]">Join businesses saving hours every week on administrative tasks.</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link className="rounded-lg bg-black px-8 py-4 text-sm font-semibold text-white" to="/register">
            Start Your Free Trial
          </Link>
          <Link className="rounded-lg border border-[#e5e7eb] px-8 py-4 text-sm font-semibold text-black" to="/about-contact">
            Book a Demo
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

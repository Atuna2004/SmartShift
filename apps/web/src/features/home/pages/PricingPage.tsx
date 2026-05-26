import { useState } from "react";
import { Check, CheckCircle2, ChevronDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingShell } from "@/features/home/components/MarketingShell";

export const PricingPage = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const yearly = billing === "yearly";

  return (
    <MarketingShell>
      <main className="px-6 pb-16 pt-32">
        <section className="mx-auto mb-12 max-w-4xl text-center">
          <h1 className="text-5xl font-black tracking-tight">Simple, transparent pricing</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#444748]">
            Scale your service business with tools designed for precision. No hidden fees, no complexity.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <span className="text-sm font-semibold">Monthly</span>
            <div className="relative flex w-48 rounded-full bg-[#f1edec] p-1">
              <span className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition ${yearly ? "left-1/2" : "left-1"}`} />
              <button className="relative z-10 flex-1 py-1 text-sm font-semibold" onClick={() => setBilling("monthly")} type="button">
                Monthly
              </button>
              <button className="relative z-10 flex-1 py-1 text-sm font-semibold" onClick={() => setBilling("yearly")} type="button">
                Yearly
              </button>
            </div>
            <span className="text-sm font-semibold text-[#444748]">Yearly</span>
            <span className="rounded-full bg-[#2170e4] px-3 py-1 text-xs font-semibold text-white">Save 20%</span>
          </div>
        </section>

        <section className="mx-auto mb-20 grid max-w-6xl gap-6 md:grid-cols-2">
          <PlanCard
            cta="Choose Basic"
            name="Basic Plan"
            price={yearly ? "39" : "49"}
            features={["Up to 10 staff members", "Real-time QR Code Clock-in", "Email support"]}
            unavailable={["Auto-scheduling AI", "Advanced multi-branch support"]}
          />
          <PlanCard
            dark
            badge="Most Popular"
            cta="Contact Sales"
            name="Organization Plan"
            price={yearly ? "99" : "129"}
            features={["Unlimited staff and users", "Auto-scheduling AI and forecasting", "Advanced reports", "Multi-branch support", "Dedicated success manager"]}
          />
        </section>

        <section className="mx-auto mb-20 max-w-6xl overflow-x-auto">
          <h2 className="mb-8 text-center text-2xl font-black tracking-tight">Feature Comparison</h2>
          <table className="w-full border-collapse bg-[#fdf8f8]">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#444748]">Feature</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Basic</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Organization</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["QR Code Clock-in", "check", "check"],
                ["Auto-scheduling", "-", "check"],
                ["Advanced Reports", "Simple Only", "check"],
                ["Multi-branch support", "-", "check"],
                ["API Access", "Limited", "check"],
              ].map(([feature, basic, org]) => (
                <tr className="border-b border-[#e5e7eb]/70" key={feature}>
                  <td className="px-6 py-4">{feature}</td>
                  <td className="px-6 py-4 text-center">{renderCell(basic)}</td>
                  <td className="px-6 py-4 text-center">{renderCell(org)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mx-auto mb-20 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-black tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Faq question="Can I change my plan later?">Yes, you can upgrade or downgrade your plan from account settings.</Faq>
            <Faq question="Is there a free trial available?">Yes. You can start with a 14-day full-feature trial without a credit card.</Faq>
            <Faq question="What kind of support do you offer?">All users get email support. Organization plans include priority support.</Faq>
          </div>
        </section>

        <section className="mx-auto max-w-4xl rounded-2xl bg-black p-10 text-center text-white">
          <h2 className="text-4xl font-black tracking-tight">Still have questions?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">Our team is ready to help you find the perfect fit.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link className="rounded-lg bg-white px-8 py-4 text-sm font-semibold text-black" to="/about-contact">
              Contact Sales
            </Link>
            <Link className="rounded-lg border border-white/20 px-8 py-4 text-sm font-semibold text-white" to="/features">
              View Features
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
};

const renderCell = (value: string) => {
  if (value === "check") return <Check className="mx-auto h-5 w-5 text-[#10b981]" />;
  if (value === "-") return <Minus className="mx-auto h-5 w-5 text-[#747878]" />;
  return <span className="text-sm text-[#444748]">{value}</span>;
};

const PlanCard = ({
  badge,
  cta,
  dark = false,
  features,
  name,
  price,
  unavailable = [],
}: {
  badge?: string;
  cta: string;
  dark?: boolean;
  features: string[];
  name: string;
  price: string;
  unavailable?: string[];
}) => (
  <div className={`relative flex flex-col rounded-xl p-8 ${dark ? "bg-[#101010] text-white ring-4 ring-black/10" : "border border-[#e5e7eb] bg-[#f5f5f5]"}`}>
    {badge ? <span className="absolute right-6 top-6 rounded-full bg-[#2170e4] px-3 py-1 text-xs font-semibold text-white">{badge}</span> : null}
    <h3 className="text-2xl font-black tracking-tight">{name}</h3>
    <p className={`mt-2 ${dark ? "text-white/65" : "text-[#444748]"}`}>Precision tools for modern service teams.</p>
    <div className="my-8">
      <span className="text-4xl font-black">$</span>
      <span className="text-5xl font-black tracking-tight">{price}</span>
      <span className={dark ? "text-white/65" : "text-[#444748]"}>/mo</span>
    </div>
    <ul className="mb-8 flex-1 space-y-4">
      {features.map((feature) => (
        <li className="flex items-center gap-3" key={feature}>
          <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
          {feature}
        </li>
      ))}
      {unavailable.map((feature) => (
        <li className="flex items-center gap-3 opacity-50" key={feature}>
          <Minus className="h-5 w-5" />
          <span className="line-through">{feature}</span>
        </li>
      ))}
    </ul>
    <Link className={`flex h-12 items-center justify-center rounded-lg text-sm font-semibold ${dark ? "bg-white text-black" : "border border-black text-black"}`} to="/register">
      {cta}
    </Link>
  </div>
);

const Faq = ({ children, question }: { children: string; question: string }) => (
  <details className="group rounded-xl border border-[#e5e7eb] bg-[#f5f5f5]">
    <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-semibold">
      {question}
      <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
    </summary>
    <div className="px-5 pb-5 text-[#444748]">{children}</div>
  </details>
);

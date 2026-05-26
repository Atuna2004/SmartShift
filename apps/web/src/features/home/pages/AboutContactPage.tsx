import type { ReactNode } from "react";
import { Mail, MapPin, Rocket, TimerOff } from "lucide-react";
import { MarketingShell } from "@/features/home/components/MarketingShell";

const images = {
  storefront:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDViwX8uoGFe7NRdMUsIqmlepYKrfyjg-IAm7vE9FJKd2A5G_PEDPnND7yJfQPxHgipmHMoXpPdjXt8tIRlUaKiEyDWlJyDXplucqvK2ZogcEsmNw5xkGHQJCPB2EEVzzytKDJgJB7xlV9aD-D5upmd_Am062R35AalJyEUoa3APgxxQcnqagaEYW3KB6X_EIzp_UrSDnrqcSty0UHkU75MOzaxo0T3_F6iFV6NzOHY5Bl3-Api_-jAag8r4EkVtKqtMRHQPrliOIIG",
  laptop:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCL4ZVlavN0Whkat7PQN9sKropKH0ne7UUI3jwaqX02u2s3mMIGxxQLZb-sFF_hMZQ8qCgVKUlBpKhsTNG6He3gB1XIDqxc8QYiV1tiFiVo2Bw4JxIvPR_potcpdiIfFjm_sS8SQQDznzjw0mIDNb4QXFGoeIywg9YDud_8mb1G3XXvZ_F-nXQRQBYndPpZTJmev_StVAA22qoMnDD6PcqFhxm9GBQudAv1kc6OYDVBHfBaHsuC5kaU6XSO_NH_iQfjJPYJq8T7cHoX",
};

const teamImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCOSHVrULIq1fQGdE3Ek8W0e-V0BZDXN5zsaG1SjQUAU49QwOvqm9MSAbuymT8qVIShfnxE4lBnucGqUjC8r0AKI3j_DF4MZ3GXzT3zpBKZXS2ZfdxM1WVCa8AQH48UursicgLM2eFnPsg_iTLEYH6Xw2cBGCkaOadwB4vg3l51nEPvl1zNVtce1ThONqoiOIIQ8pBkIHFuhQfpTjSks5JZXJ2gUO19AUSIhzCaDfbeFX7ZL3iYZ2dFynUfjPxytCNtlQv8MDT4Kp5-",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCdjduYlSYlvuqcCMMdM_5wNjOaGAAIL8nWIZJOjiDZAnWhbDwMdPtTfepcc9OMkp8rogD22bRPd7niVAibLpyFyI9mMS228wK1rYfNnw3s8STsHKEH6WPj9SwqJozCdZ0_0Uq1yL0wxsuGALx03BTVoxfDYBP6XscieRtzVaydndcSyPcVQZyGokH8tS-riZxjv_0ggH0hgY2l0248IOjvH4mfFtU6WkDX9p1wlJHmTtA_VUseR5TYu8lsyXR7moP9EV6-Is2ti4dC",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuClxjXI6oFGweW6rezp9tzq90ysduIAtBSvQvXOm0pt4JKd-1xam0kiiPCC7JVPXY_YQf5CfCjIkRCt6pqWOODpJwbxCwhOW0OKgPkf2irHrfwrzyAX833VOZlSbA-yEaQN6A7mMARSfCewhu8BGl2Iqo3gFv62I3y17fYkYpzLWTHcPuizbdN03hC5M4ErQGRfcmfNjyJhfHluwac66cQUf-_f9QF8n_3oTXtMhQLDZtfw69Nq_-Wsfog0Zoy9EueEz6KUYH_PbpwE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnGmdJIz1VwnuyyYCPRzaKLtYMtpB286WwPsodZT8LmfUS-KjgantSCI0Kd_99TEe6FLmi_PtEl-d26mHMV6B0V_yWeQeldTAIWYy0r9sglZV0vmQj4FUINTbbDzIdv-oGThlceuPm_e7rPysL5yGWZURkNOsEkQtRWa6oEzfuYauhfuBPhzqwjkAzLxyYPV6n335fCOzBrs0CyP1dLmG2LVbi7gKj9mcCjkXX19qSFimW6e_UBuBpoXUge-N6d1DWslvZ1jr7kvyQ",
];

const team = [
  ["Marcus Thorne", "Co-Founder & CEO"],
  ["Elena Rodriguez", "Head of Product"],
  ["David Chen", "CTO"],
  ["Sarah Jenkins", "Customer Experience"],
];

export const AboutContactPage = () => (
  <MarketingShell>
    <main className="pt-32">
      <section className="mx-auto mb-20 grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-12">
        <div>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-black">Our Mission to Empower Small Businesses</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#444748]">
            Local shops, services, and small enterprises deserve the same high-caliber technology as global giants.
          </p>
        </div>
        <img alt="" className="aspect-[4/3] rounded-xl border border-[#e5e7eb] object-cover shadow-xl grayscale-[20%]" src={images.storefront} />
      </section>

      <section className="border-y border-[#e5e7eb] bg-[#f7f3f2] px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-4xl font-black tracking-tight">Why we built SmartShift</h2>
            <p className="mt-4 text-[#444748]">The tools of the past are holding back the growth of the future.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-sm md:col-span-2">
              <TimerOff className="mb-4 h-8 w-8" />
              <h3 className="text-2xl font-black tracking-tight">Escaping the Manual Trap</h3>
              <p className="mt-3 leading-8 text-[#444748]">
                Spreadsheets and paper ledgers are invisible walls. SmartShift helps owners reclaim time from admin work.
              </p>
            </div>
            <div className="flex flex-col justify-center rounded-xl bg-black p-8 text-white">
              <h4 className="text-4xl font-black">4.2x</h4>
              <p className="mt-2 text-white/70">Average efficiency increase for partners moving away from manual tools.</p>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
              <Rocket className="mb-4 h-8 w-8" />
              <h3 className="text-sm font-black uppercase tracking-widest">Growth Focus</h3>
              <p className="mt-3 text-[#444748]">Scale without administrative friction.</p>
            </div>
            <div className="flex items-center gap-8 rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-sm md:col-span-2">
              <img alt="" className="hidden h-32 w-32 rounded-xl object-cover grayscale lg:block" src={images.laptop} />
              <div>
                <h3 className="text-2xl font-black tracking-tight">Intelligent Automation</h3>
                <p className="mt-2 text-[#444748]">From smart scheduling to automated reporting, manual entry becomes precision logic.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black tracking-tight">The Team Behind the Shift</h2>
          <p className="mx-auto mt-4 max-w-xl text-[#444748]">Designers, engineers, and former business operators dedicated to your success.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {team.map(([name, role], index) => (
            <div className="text-center" key={name}>
              <img alt="" className="mx-auto mb-4 h-32 w-32 rounded-full border-2 border-[#e5e7eb] object-cover grayscale transition hover:grayscale-0 md:h-48 md:w-48" src={teamImages[index]} />
              <h3 className="text-xl font-black tracking-tight">{name}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#444748]">{role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e5e7eb] bg-white px-6 py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Let's talk about your business.</h2>
            <p className="mt-4 text-lg leading-8 text-[#444748]">Questions about our mission? Need help getting started? We're here to help you scale.</p>
            <div className="mt-8 space-y-4">
              <ContactLine icon={<Mail className="h-5 w-5" />} text="hello@smartshift.io" />
              <ContactLine icon={<MapPin className="h-5 w-5" />} text="Ho Chi Minh City, Vietnam" />
            </div>
          </div>
          <form className="rounded-xl border border-[#e5e7eb] bg-[#f7f3f2] p-8">
            <Field label="Name" placeholder="Your Name" />
            <Field label="Email" placeholder="email@example.com" type="email" />
            <label className="mb-6 block">
              <span className="mb-1 block text-sm font-semibold">Message</span>
              <textarea className="min-h-32 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-black" placeholder="How can we help?" />
            </label>
            <button className="h-12 w-full rounded-lg bg-black text-sm font-semibold text-white" type="button">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  </MarketingShell>
);

const Field = ({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) => (
  <label className="mb-5 block">
    <span className="mb-1 block text-sm font-semibold">{label}</span>
    <input className="h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-4 outline-none focus:border-black focus:ring-2 focus:ring-black" placeholder={placeholder} type={type} />
  </label>
);

const ContactLine = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <div className="flex items-center gap-3 font-semibold">
    {icon}
    {text}
  </div>
);

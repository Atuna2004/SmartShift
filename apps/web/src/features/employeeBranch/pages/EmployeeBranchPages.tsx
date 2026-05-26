import {
  AlertTriangle,
  ArrowLeft,
  Badge,
  Bell,
  CalendarX,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  Filter,
  Grid3X3,
  List,
  MapPin,
  MoreVertical,
  Plus,
  Repeat,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  UserCheck,
  UserMinus,
  UsersRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const colors = {
  blue: "#0058be",
  border: "#e5e7eb",
  card: "#f5f5f5",
  container: "#f1edec",
  low: "#f7f3f2",
  muted: "#444748",
  success: "#10b981",
  error: "#ef4444",
};

const employeePhotos = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCGw0aN_e0T2iueIkEVjJrLkQ0aR7pg9b1k6ApavS3dJWDGD_EvGC6m1Rp3JzUmL0UKyeHPP5zaCiavd-97VGtGfbziDgFv8uAr1D-aaGwMc1AcjkMPwSleye-dbIt-6SoI361TIleHq7lYdSkcfuxbqMm9CPbvPgxLz4xywHDcukTrvWpoPb2N2j8Bmax5KdUvb9CnDKimksvmtGdMK5GN6vIlu2if31Uy-fxWnuqujKtI85O6xjKeGdWt4DDiPVhAr69SDk2ztJUI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC2-W5iryVB8BleTwnG6tgcW-X2J7DGdYj7urdvsF0oDDqLYiiT3DK0-SMvwCj-0Mb321E5BY4-U4WPPVGm-mTEO4ZOcBt0ZZ8AlsOpGOwL9YORHDaW7T-QpbbmWkpnUbGm5w_UPG6V7S7hP73UqIUF3ZtHcN7yeWsyg9Oko34XmjSvK-91iz8aro5Mb8Z6uK3qi8i2ne7DaozcIRrstK5e2kmx-u1aj4uKe-kArs7L2Dtb00Ey-lO5QzdxiTbUydmdWI7bS2Cb1Bxw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDg-WiZS3t_JcEXdNmJKifJmsaVylCDgisCw_9deVEZ2Yblcqe8uEVyfhkdTHSg3HsnF-g_xhj9kWLPziMrbf4eDJSqBJe6G_bUS7AdI5ov6IEDDfTfZnWJLHXf12wVEDaaaVqR4fzv4cVbgzYPNtRt7IWWu9peM20Ixq_TrFedb7A5Kcb3xMS-IFbbAqa_kk25FE8f_LY_HqPRsFSPN1RHpujdZaEOdrt9rmCqzt4f-qvnPiZIgoY_vpAhH9PqnAOAkyP_7ZVWC7pC",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCtQoPPt-Ky1HhuknP6GQABOCO-xkgYbIzNSFdGzixDXce4vZchqoGq_xTCNpSgh6bLz8_VraIzcC9YW4jIji-WLegdfS-v2Es8mV8J7zrkRuOnzPSoLKoX8GReqQBkSZswxd_ZEjIla6oUK3rjbmtk-n_0L7V5zdJ2Es2tboFF8lbXlwnHy4UYOJZnrB61Z0RG8dDNEzwbvtCoUrYAjXqh5HQIC7QnCMlnUElX167paNBG8KE1Wc1s9HKTQar306jWqZI7lFtXrDFR",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB56ELbBE1haKd29ql22DN5_QCZOK5fD_tQ3bzA7whJmdTUiTUIPOVNplplXvH086iDppSO-w25dCNmjAqE6e4_j2DuyW9mJlAchFX1SujTFC-3-mD1cXAkxQSQM3QKi23j1nV3OQBstvlOh-s366zeIi26jQmGlvvReweu3jBXhcyYrxH8UtCDykAWSthsxsBXpsWhenIMm3sS855uroQDvKqKEum4NvIoLvEmkkdqpXip7Tmk3I3Cm4dTQFrkJZhojblBbPB-MCSb",
];

const branchPhotos = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB91eGT71w3cE0MMjyUztefC1iVNXPHCAVUVWr1lamQsFCDUoQucRA5WVnaCDespI9peUQM6N1xyoEwgJbRQ323o05HvUrCsmvZgbP5pimBA44Oa3mG0F_vl0x7-MoU1ct9-SwJwOxbeE9mDcOS2rU_lPe2_GIU3MngfkjlbPexJ9XASAg21kgoywyFGNnp7LPIQmBoFJo_FD6RFIjhvLv-g761vpY5kbafmsHsUWmUSo_bOeYSgkwshrLKQDzt4Art8J5bsN3sc1rs",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQFht8xIXIRL2o2QvW6mmnZW-FMJYRBiurTSM8faQmA5aIt_tzEEXlA8neH7eQP-V1z2ACVLPJaSeRwl6GtKBZXQ4oui7Inh39mZvXCSe68WsFAXs-RSU-nBzmZvSGbacAuCl7G-CKq-nKZ8jBNPRr2jSWTYxl9jXxwPs396SfttvmarDbZOJBxFPORn2aVDrccsEI3jsB4Iymoqy_7STq6yiX_bbhyB_F5-aUu8UbzqyXYlEXnopEbbvs0xgr9iKJ0hmCg-R33ywj",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBfr-pKeV4u4T-63MXiTMDY5BtrJ7wdnjzzfEAfHyZI-HsxTiJWNeZgGEhem-jsOEGhlcX1L9DrCMT2qg1DcL5BfwH1-YN9a17xXxARq_lLKDECMpVpQLqA984PY4bpqK1QjocPQOV38YiPPGSNgcHFdgCKludKkfEs5xTf_l9EaMAC1svF-29NZ8-H9sym6-P6cC_Vo_jWG5ugeCpozF-2uGt3DgidPEF0MHvsVNHAyyMrl1Udx-v_B9b2CptafZUg0Jjnc0gWhh8t",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAOFcffqZjgEL63j4xlJ-FD3fgrAOLZHKGCsSROEPxPcO9o7iiQuk8iWwi_2s9_uzvOh-nVjkcr56C1wBUg8T86iBf-2Prmip3m7X7JZdN_teESrSrzbr1UMTmoAyYe8KhGB7roEf3iygNNqQNvlFgc7wTmO7cBfV3_xYEPlLCSbBspeFrzzINOkAt6oxzHHS6lar365ST2wvcCmApg3tO-dUL6axuCbDtYDjjBJK7xBM6eTpEHwvk2nU8pVxYNwpsIinmsQbfHjmfF",
];

const managerPhotos = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDZxLSvKSqeNb1EwWAf9uASdYinmrOIFK1h02PZ7vNAX-PbDNGud_j-kXaLd3X8zWNoABdSiWKpVqihHeANH2xMOofdYSqY4gHN0eIZ0IErTKjzkzIfeHuZ1n_t45XmFyuRUvF4uH4_mJaNOs1cnpQbC3MhwVrMqP_6yqSsldswdmDshe9xpf_603SHL0AY7Iud7GglC6uqkuoC9-5oueBexztmblIHvBGRzyx85AFpfHtMSzmNrBp9M_hQUaC_0sbiRSHnCteKo9TH",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcrEOSq5NB1XBPMBWcS-U6bV_hcTglvaytrRtAa1OPiwrlOj0WFYvHUYSod4BYMlA00wVTXjJ5yKfT48PR-sS7iQfTfiotI1OMRhtaPnXUVL5WPQlIHYLWdOY2kd1I47hmNpzq5NCvQYsSW8wLvd2GyW5lurqZVdqDW0VbXIDJGau0Budxt1ZO8cLvc315KFxTBc8_sUAo9BfLfFo4muotWAI6QDT2yBfa9uQDDR3g7T8gRaxxrw3V0PQTzVeW_wvyMAl3Bz_8dbQE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDpCXRT-77hgEmthu8wNoFTRZy-SFaMYCsWqbEy0ByaJk_PhJsi6V0sfOaa5Dd-yHFQ5O4kLUobXqMT-Va1uJJngP3_HxgC5Pcn1QLmK2IY3DRKxDkUg3aRdwN2rsQhXLK3Iugsz0ofes6aPprKeUlBoaly_2LXl_o7GNr8BYz15i5JDZCdeEzYxb8Ehsw5uFUR9nredp9i1uDA6uZYnhsnLcDvRh1OxIoORTg_eZoremTqNtHwKdKcio9RJzogMqvzCltQdb4Xfy6B",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3PRZfXBy1qmD-t-j97wnWliASze1o7NKDLi8pEkxdkJwkBYpVqKC-IYDYeGIpA-pE9w6Rf00zlhmy_5Al3xHBH-ObxjHGpSwrZrQwa2vCpAHUFfVUz3hoTgqWtrrWWyZaGRimBILyJZ7Iz_ajdv5qR0HGynktwMc0WTeytboiWvHk0VLtVLZ0IjA01AwnlYrMERtK0ZAGBoJ3wyVweIHY9ufH-njt5H27xsoRp1KPm9IdIA9awDPqZOLswxFRAXfLhOvhxy-Vc_XV",
];

const employees = [
  { name: "Marcus Thorne", email: "marcus.t@smartshift.io", role: "Senior Shift Manager", branch: "Downtown Hub", status: "Active", photo: employeePhotos[0] },
  { name: "Sarah Jenkins", email: "s.jenkins@smartshift.io", role: "Front Desk Supervisor", branch: "Westside Annex", status: "On Leave", photo: employeePhotos[1] },
  { name: "Arthur Lofton", email: "a.lofton@smartshift.io", role: "Logistics Coordinator", branch: "North Plaza", status: "Inactive" },
  { name: "Nina Kim", email: "nina.k@smartshift.io", role: "Human Resources", branch: "Main Office", status: "Active", photo: employeePhotos[3] },
  { name: "David Chen", email: "d.chen@smartshift.io", role: "Service Desk Lead", branch: "Downtown Hub", status: "Active", photo: employeePhotos[4] },
];

const branches = [
  { name: "Main St. Downtown", address: "742 Main St, New York, NY", manager: "Alex Rivera", staff: 86, tag: "FLAGSHIP", image: branchPhotos[0], managerPhoto: managerPhotos[0] },
  { name: "Eastside Retail Hub", address: "2200 East Pkwy, Brooklyn, NY", manager: "Marcus Chen", staff: 42, image: branchPhotos[1], managerPhoto: managerPhotos[1] },
  { name: "Upper West Medical", address: "102 W 86th St, New York, NY", manager: "Sarah Jenkins", staff: 12, tag: "UNDERSTAFFED", tagTone: "error", image: branchPhotos[2], managerPhoto: managerPhotos[2] },
  { name: "Airport Logistics North", address: "10 Terminal Dr, Queens, NY", manager: "David Miller", staff: 156, image: branchPhotos[3], managerPhoto: managerPhotos[3] },
];

export const EmployeeListPage = () => (
  <ShellTopBar
    action={
      <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90" to="/dashboard/employees/new">
        <Plus className="h-5 w-5" />
        Add Employee
      </Link>
    }
    searchPlaceholder="Search by name, role or email..."
    title="Employees"
  >
    <section className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {["All Staff", "Managers", "Front Desk", "Support"].map((filter, index) => (
            <button className={index === 0 ? "rounded-full border border-[#e5e7eb] bg-[#f1edec] px-4 py-2 text-sm font-semibold text-black" : "rounded-full px-4 py-2 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]"} key={filter}>
              {filter}
            </button>
          ))}
          <span className="mx-2 hidden h-6 w-px bg-[#e5e7eb] sm:block" />
          <button className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
        <div className="flex w-fit items-center rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] p-1">
          <button className="flex h-8 w-8 items-center justify-center rounded bg-white text-black shadow-sm"><List className="h-4 w-4" /></button>
          <button className="flex h-8 w-8 items-center justify-center text-[#444748]"><Grid3X3 className="h-4 w-4" /></button>
        </div>
      </div>
      <EmployeeTable />
      <EmployeeStatsGrid />
    </section>
  </ShellTopBar>
);

export const EmployeeCreatePage = () => (
  <EmployeeListPageWithModal>
    <Modal title="Create New Employee" subtitle="Fill in the details to add a new member to the team." closeTo="/dashboard/employees">
      <div className="space-y-4 p-6">
        <Field label="Full Name" placeholder="e.g. John Smith" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email Address" placeholder="john@company.com" type="email" />
          <Field label="Phone Number" placeholder="+1 (555) 000-0000" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Role" options={["Select Role", "Senior Manager", "Supervisor", "General Staff"]} />
          <SelectField label="Branch" options={["Select Branch", "Downtown Hub", "Westside Annex", "North Plaza"]} />
        </div>
      </div>
      <ModalFooter cancelTo="/dashboard/employees" primary="Add Employee" />
    </Modal>
  </EmployeeListPageWithModal>
);

export const EmployeeDetailsPage = () => (
  <DetailFrame>
    <section className="p-6">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex items-start gap-6">
          <div className="relative">
            <img alt="" className="h-32 w-32 rounded-xl border border-[#e5e7eb] object-cover shadow-sm" src={employeePhotos[2]} />
            <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-[#10b981] shadow-sm" />
          </div>
          <div className="pt-2">
            <h1 className="mb-1 text-4xl font-semibold tracking-tight text-black">Marcus Thompson</h1>
            <div className="mb-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-[#444748]">
              <span className="inline-flex items-center gap-1"><Badge className="h-4 w-4" />Senior Shift Lead</span>
              <span className="h-1 w-1 rounded-full bg-[#c4c7c7]" />
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />Downtown Branch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-1 text-xs font-bold text-[#10b981]">Active Now</span>
              <span className="text-xs text-[#444748]">ID: EMP-8829</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold text-black hover:bg-[#f7f3f2]"><Edit3 className="h-4 w-4" />Edit Profile</button>
          <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:opacity-90" to="/dashboard/employees/marcus/deactivate"><UserMinus className="h-4 w-4" />Deactivate</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Panel title="Attendance KPI" icon={<TrendingUp />}>
            <KpiLine label="On-time Rate" value="98.4%" icon={<CheckCircle2 />} tone="success" />
            <KpiLine label="Total Hours (MTD)" value="142.5h" icon={<Clock3 />} tone="blue" />
            <div className="pt-2">
              <p className="mb-2 text-xs text-[#444748]">Performance Score</p>
              <div className="h-2 overflow-hidden rounded-full bg-[#f1edec]"><div className="h-full w-[92%] rounded-full bg-black" /></div>
              <div className="mt-1 flex justify-between text-xs"><b>Excellent</b><span className="text-[#444748]">92/100</span></div>
            </div>
          </Panel>
        </div>
        <div className="lg:col-span-5">
          <Panel title="Assigned Shifts" action={<button className="text-sm font-semibold text-[#0058be]">View Calendar</button>}>
            {["Closing Shift|24|May|04:00 PM - 12:00 AM", "Afternoon Cover|25|May|12:00 PM - 08:00 PM", "Morning Rush|28|May|06:00 AM - 02:00 PM"].map((item) => {
              const [name, day, month, time] = item.split("|");
              return <ShiftItem day={day} key={item} month={month} name={name} time={time} />;
            })}
            <button className="mt-2 h-10 w-full rounded-lg border border-[#e5e7eb] text-sm font-semibold text-[#444748] transition hover:bg-[#f7f3f2]">
              Assign New Shift
            </button>
          </Panel>
        </div>
        <div className="lg:col-span-3">
          <RecentActivityPanel />
        </div>
        <div className="lg:col-span-8">
          <PersonalInfoPanel />
        </div>
        <div className="lg:col-span-4">
          <PayrollCard />
        </div>
      </div>
    </section>
  </DetailFrame>
);

export const EmployeeDeactivatePage = () => (
  <EmployeeDetailsPageWithModal>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ef4444]/10 text-[#ef4444]">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="mb-2 text-2xl font-semibold tracking-tight text-black">Deactivate Employee</h3>
        <p className="mb-8 text-base leading-6 text-[#444748]">Are you sure you want to deactivate Marcus Thompson? This will revoke their access to all SmartShift features.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link className="rounded-lg px-4 py-2 text-center text-sm font-semibold text-[#444748] hover:bg-[#f7f3f2]" to="/dashboard/employees/marcus">Cancel</Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><UserMinus className="h-4 w-4" />Deactivate</button>
        </div>
      </div>
    </div>
  </EmployeeDetailsPageWithModal>
);

export const BranchManagementPage = () => (
  <BranchFrame>
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-black">Branches</h2>
          <p className="text-base text-[#444748]">Manage and monitor operations across all your locations.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-1 rounded-lg border border-[#e5e7eb] px-4 text-sm font-semibold hover:bg-[#f7f3f2]"><Filter className="h-4 w-4" />Filters</button>
          <Link className="inline-flex h-10 items-center gap-1 rounded-lg bg-black px-4 text-sm font-semibold text-white shadow-sm hover:opacity-90" to="/dashboard/branches/new"><Plus className="h-4 w-4" />Add Branch</Link>
        </div>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard icon={<Store />} label="Total Branches" value="24" meta="+2 this mo" />
        <StatCard icon={<UsersRound />} label="Total Employees" value="412" />
        <StatCard icon={<CheckCircle2 />} label="Avg. Attendance" value="94.2%" meta="OPTIMAL" />
        <StatCard icon={<Badge />} label="Operating Costs" value="$284k/mo" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {branches.map((branch) => <BranchCard branch={branch} key={branch.name} />)}
        <Link
          className="group flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#f7f3f2] p-8 text-center transition duration-300 hover:border-black hover:bg-[#f1edec]"
          to="/dashboard/branches/new"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e5e7eb] bg-white transition group-hover:scale-110">
            <Plus className="h-8 w-8 text-[#444748] group-hover:text-black" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Register New Branch</p>
            <p className="text-xs text-[#444748]">Expand your business network</p>
          </div>
        </Link>
      </div>
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e5e7eb] pt-6 md:flex-row">
        <p className="text-xs text-[#444748]">Showing 1 to 4 of 24 branches</p>
        <div className="flex items-center gap-1">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] opacity-30" disabled>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              className={page === 1 ? "flex h-10 w-10 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" : "flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]"}
              key={page}
            >
              {page}
            </button>
          ))}
          <span className="px-2 text-[#444748]">...</span>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] text-sm font-semibold hover:bg-[#f7f3f2]">6</button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] hover:bg-[#f7f3f2]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </BranchFrame>
);

export const BranchCreatePage = () => (
  <BranchManagementPageWithModal>
    <Modal title="Register New Branch" closeTo="/dashboard/branches">
      <div className="space-y-4 p-6">
        <Field label="Branch Name" placeholder="e.g. West Coast Distribution" />
        <Field label="Physical Address" placeholder="Enter full street address" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Business Type" options={["Select type", "Logistics", "Retail", "Medical", "Corporate Office"]} />
          <SelectField label="Timezone" options={["EST (UTC-5)", "PST (UTC-8)", "GMT (UTC+0)"]} />
        </div>
      </div>
      <ModalFooter cancelTo="/dashboard/branches" primary="Register Branch" />
    </Modal>
  </BranchManagementPageWithModal>
);

export const BranchSettingsPage = () => (
  <ShellTopBar breadcrumbs={["Settings", "Branch Configuration"]}>
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-3xl py-8">
        <header className="mb-12">
          <h2 className="mb-2 text-4xl font-semibold tracking-tight text-black">Branch Configuration</h2>
          <p className="text-base text-[#444748]">Manage your branch details, QR check-in preferences, and attendance policies.</p>
        </header>
        <div className="space-y-8">
          <SettingsSection icon={<Store />} title="Branch Information">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Branch Name" value="Downtown Hub" />
              <SelectField label="Business Type" options={["Retail & Sales", "Hospitality", "Healthcare", "Logistics & Warehouse"]} />
              <div className="md:col-span-2"><Field label="Physical Address" value="782 Industrial Pkwy, Suite 400, Chicago, IL" /></div>
            </div>
          </SettingsSection>
          <SettingsSection icon={<Badge />} title="QR Check-in" toggle>
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="flex-1">
                <p className="mb-4 text-base leading-6 text-[#444748]">Enabling QR Check-in allows employees to clock in by scanning a unique code at the branch location. This ensures physical presence.</p>
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-semibold hover:bg-[#f1edec]">Download Branch QR Code</button>
              </div>
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white p-2">
                <div className="h-full w-full bg-[repeating-linear-gradient(45deg,#000_0_6px,#fff_6px_12px)] opacity-70" />
              </div>
            </div>
          </SettingsSection>
          <SettingsSection icon={<Clock3 />} title="Attendance Policy">
            <div className="flex flex-col items-end gap-8 md:flex-row">
              <div className="flex-1">
                <Field label="Late Grace Period (Minutes)" value="15" />
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] p-4 text-xs leading-5 text-[#444748]">Recommended: 10-15 minutes for most service-based businesses to account for transit variance.</div>
            </div>
          </SettingsSection>
          <footer className="flex flex-col items-center justify-end gap-4 border-t border-[#e5e7eb] pt-8 sm:flex-row">
            <button className="w-full rounded-lg px-8 py-3 text-sm font-semibold text-[#444748] hover:bg-[#f1edec] sm:w-auto">Discard Changes</button>
            <button className="w-full rounded-lg bg-black px-12 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:w-auto">Save Changes</button>
          </footer>
        </div>
      </div>
    </main>
  </ShellTopBar>
);

const EmployeeListPageWithModal = ({ children }: { children: ReactNode }) => <><EmployeeListPage />{children}</>;
const EmployeeDetailsPageWithModal = ({ children }: { children: ReactNode }) => <><EmployeeDetailsPage />{children}</>;
const BranchManagementPageWithModal = ({ children }: { children: ReactNode }) => <><BranchManagementPage />{children}</>;

const ShellTopBar = ({ action, breadcrumbs, children, searchPlaceholder, title }: { action?: ReactNode; breadcrumbs?: string[]; children: ReactNode; searchPlaceholder?: string; title?: string }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-6">
      <div className="flex min-w-0 items-center gap-6">
        {title ? <h2 className="shrink-0 text-2xl font-semibold tracking-tight text-black">{title}</h2> : null}
        {breadcrumbs ? <div className="flex items-center gap-2 text-base"><b>{breadcrumbs[0]}</b><span className="text-[#444748]">/</span><span className="text-[#444748]">{breadcrumbs[1]}</span></div> : null}
        {searchPlaceholder ? (
          <div className="relative hidden w-96 lg:block">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#444748]" />
            <input className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] pl-10 pr-4 outline-none focus:ring-1 focus:ring-black" placeholder={searchPlaceholder} />
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[#444748] hover:text-black"><Bell className="h-5 w-5" /></button>
        {action ? <><span className="h-8 w-px bg-[#e5e7eb]" />{action}</> : null}
      </div>
    </header>
    {children}
  </div>
);

const DetailFrame = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-6">
      <div className="flex items-center gap-4">
        <Link className="rounded-full p-2 hover:bg-[#f1edec]" to="/dashboard/employees"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex items-center gap-2 text-sm font-semibold"><span className="text-[#444748]">Employees</span><span className="text-[#c4c7c7]">/</span><b>Marcus Thompson</b></div>
      </div>
      <Bell className="h-5 w-5 text-[#444748]" />
    </header>
    {children}
  </div>
);

const BranchFrame = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-6">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747878]" />
        <input className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-[#f7f3f2] pl-10 pr-4 outline-none focus:ring-2 focus:ring-black" placeholder="Search branches..." />
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right md:block"><p className="text-sm font-semibold">Main St. Downtown</p><p className="text-xs text-[#444748]">Branch Switcher</p></div>
        <Bell className="h-5 w-5 text-[#444748]" />
      </div>
    </header>
    <main className="p-6">{children}</main>
  </div>
);

const EmployeeTable = () => (
  <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead className="border-b border-[#e5e7eb] bg-[#f5f5f5] text-sm font-semibold text-[#444748]">
          <tr><th className="px-6 py-4">Photo & Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Branch</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {employees.map((employee) => <EmployeeRow employee={employee} key={employee.email} />)}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-6 py-4">
      <p className="text-xs text-[#444748]">Showing 1 to 5 of 42 employees</p>
      <div className="flex items-center gap-1">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#444748] hover:bg-[#f5f5f5]">
          <ChevronRight className="h-4 w-4 rotate-180" />
        </button>
        {[1, 2, 3].map((page) => (
          <button className={page === 1 ? "flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white" : "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-[#444748] hover:bg-[#f5f5f5]"} key={page}>
            {page}
          </button>
        ))}
        <span className="px-1 text-[#444748]">...</span>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-[#444748] hover:bg-[#f5f5f5]">9</button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#444748] hover:bg-[#f5f5f5]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

const EmployeeRow = ({ employee }: { employee: (typeof employees)[number] }) => (
  <tr className="hover:bg-[#fdf8f8]">
    <td className="px-6 py-4">
      <Link className="flex items-center gap-4" to="/dashboard/employees/marcus">
        {employee.photo ? <img alt="" className="h-10 w-10 rounded-lg object-cover" src={employee.photo} /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1edec] font-bold text-[#444748]">AL</div>}
        <div><p className="text-sm font-semibold text-black">{employee.name}</p><p className="text-xs text-[#444748]">{employee.email}</p></div>
      </Link>
    </td>
    <td className="px-6 py-4 text-base">{employee.role}</td>
    <td className="px-6 py-4 text-base">{employee.branch}</td>
    <td className="px-6 py-4"><StatusBadge status={employee.status} /></td>
    <td className="px-6 py-4 text-right"><button className="rounded-lg p-2 text-[#444748] hover:bg-[#f1edec]"><MoreVertical className="h-5 w-5" /></button></td>
  </tr>
);

const StatusBadge = ({ status }: { status: string }) => {
  const tone = status === "Active" ? "bg-[#10b981]/10 text-[#10b981]" : status === "On Leave" ? "bg-[#0058be]/10 text-[#0058be]" : "bg-[#c4c7c7]/30 text-[#444748]";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
};

const EmployeeStatsGrid = () => (
  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
    <EmployeeStat label="Total Headcount" meta="+4%" value="128" trend />
    <EmployeeStat label="Average Tenure" meta="Stable" value="2.4y" />
    <EmployeeStat label="Shift Coverage" value="98.2%" progress />
    <EmployeeStat label="Active Leaves" meta="Action Required" metaTone="danger" value="6" />
  </div>
);

const EmployeeStat = ({
  label,
  meta,
  metaTone = "success",
  progress,
  trend,
  value,
}: {
  label: string;
  meta?: string;
  metaTone?: "success" | "danger";
  progress?: boolean;
  trend?: boolean;
  value: string;
}) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
    <p className="text-sm font-semibold text-[#444748]">{label}</p>
    <div className="mt-2 flex items-end justify-between">
      <p className="text-[32px] font-black leading-none text-black">{value}</p>
      {progress ? (
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e5e7eb]">
          <div className="h-full w-full bg-black" />
        </div>
      ) : meta ? (
        <span className={`flex items-center gap-1 text-xs font-bold ${metaTone === "danger" ? "text-[#ef4444]" : "text-[#10b981]"}`}>
          {trend ? <TrendingUp className="h-4 w-4" /> : null}
          {meta}
        </span>
      ) : null}
    </div>
  </div>
);

const Modal = ({ children, closeTo, subtitle, title }: { children: ReactNode; closeTo: string; subtitle?: string; title: string }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
      <div className="border-b border-[#e5e7eb] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold tracking-tight text-black">{title}</h3>
          <Link className="text-[#444748] hover:text-black" to={closeTo}><X className="h-5 w-5" /></Link>
        </div>
        {subtitle ? <p className="mt-1 text-base text-[#444748]">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  </div>
);

const ModalFooter = ({ cancelTo, primary }: { cancelTo: string; primary: string }) => (
  <div className="flex justify-end gap-4 border-t border-[#e5e7eb] bg-[#f7f3f2] p-6">
    <Link className="h-11 px-6 py-3 text-sm font-semibold text-[#444748] hover:text-black" to={cancelTo}>Cancel</Link>
    <button className="h-11 rounded-lg bg-black px-8 text-sm font-semibold text-white shadow-sm hover:opacity-90">{primary}</button>
  </div>
);

const Field = ({ label, placeholder, type = "text", value }: { label: string; placeholder?: string; type?: string; value?: string }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
    <input className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 outline-none focus:border-black focus:ring-2 focus:ring-black/10" defaultValue={value} placeholder={placeholder} type={type} />
  </label>
);

const SelectField = ({ label, options }: { label: string; options: string[] }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-[#444748]">{label}</span>
    <select className="h-11 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-[#f5f5f5] px-4 outline-none focus:border-black focus:ring-2 focus:ring-black/10">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  </label>
);

const Panel = ({ action, children, icon, title }: { action?: ReactNode; children: ReactNode; icon?: ReactNode; title: string }) => (
  <section className="h-full rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
    <div className="mb-6 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-black">{icon}<span>{title}</span></h3>
      {action}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const KpiLine = ({ icon, label, tone, value }: { icon: ReactNode; label: string; tone: "success" | "blue"; value: string }) => (
  <div className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white p-4">
    <div><p className="mb-1 text-xs text-[#444748]">{label}</p><p className="text-2xl font-semibold">{value}</p></div>
    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone === "success" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#0058be]/10 text-[#0058be]"}`}>{icon}</div>
  </div>
);

const ShiftItem = ({ day, month, name, time }: { day: string; month: string; name: string; time: string }) => (
  <div className="flex gap-4 rounded-lg border border-[#e5e7eb] p-4 transition hover:border-[#747878]">
    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[#f1edec]"><b className="text-xs">{day}</b><span className="text-[10px] uppercase text-[#444748]">{month}</span></div>
    <div className="flex-1"><p className="text-sm font-semibold">{name}</p><p className="text-xs text-[#444748]">{time}</p></div>
    <span className="h-fit rounded bg-[#f1edec] px-2 py-1 text-[10px] font-bold text-[#444748]">Downtown</span>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => <div className="border-b border-[#e5e7eb] pb-3 last:border-0"><p className="text-xs text-[#444748]">{label}</p><p className="text-sm font-semibold">{value}</p></div>;

const RecentActivityPanel = () => (
  <section className="h-full rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-6">
    <h3 className="mb-6 text-sm font-semibold text-black">Recent Activity</h3>
    <div className="relative space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-[2px] before:bg-[#c4c7c7]">
      <ActivityNode icon={<UserCheck />} title="Clocked In" time="Today, 03:58 PM" detail="Verified via QR: DT-Main-01" active />
      <ActivityNode icon={<CalendarX />} title="Leave Request" time="Yesterday, 02:15 PM">
        <div className="mt-2 rounded border border-[#e5e7eb] bg-white p-2">
          <p className="text-[11px] font-bold uppercase text-[#10b981]">Approved</p>
          <p className="text-xs">June 12 - Vacation</p>
        </div>
      </ActivityNode>
      <ActivityNode icon={<Repeat />} title="Shift Swap Sent" time="May 21, 09:40 AM" />
    </div>
  </section>
);

const ActivityNode = ({
  active,
  children,
  detail,
  icon,
  time,
  title,
}: {
  active?: boolean;
  children?: ReactNode;
  detail?: string;
  icon: ReactNode;
  time: string;
  title: string;
}) => (
  <div className="relative pl-10">
    <div className={`absolute left-0 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${active ? "border-black" : "border-[#e5e7eb]"} [&>svg]:h-3.5 [&>svg]:w-3.5`}>
      {icon}
    </div>
    <p className="text-sm font-semibold text-black">{title}</p>
    <p className="text-xs text-[#444748]">{time}</p>
    {detail ? <p className="mt-2 text-xs text-[#747878]">{detail}</p> : null}
    {children}
  </div>
);

const PersonalInfoPanel = () => (
  <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-black">Personal Information</h3>
        <div className="space-y-4">
          <InfoRow label="Email Address" value="m.thompson@smartshift.com" />
          <InfoRow label="Phone Number" value="+1 (555) 234-8892" />
          <InfoRow label="Emergency Contact" value="Sarah T. (Wife)" />
          <InfoRow label="Date of Hire" value="Oct 12, 2022" />
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-black">Skills & Certifications</h3>
        <div className="flex flex-wrap gap-2">
          {["Health & Safety Level 3", "Team Management", "Inventory Pro"].map((skill) => (
            <span className="inline-flex items-center gap-2 rounded-lg bg-[#f1edec] px-4 py-2 text-xs font-bold" key={skill}>
              <ShieldCheck className="h-4 w-4 text-[#0058be]" />
              {skill}
            </span>
          ))}
          <button className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#c4c7c7] px-4 py-2 text-xs font-bold text-[#444748] transition hover:bg-[#f7f3f2]">
            <Plus className="h-4 w-4" />
            Add Skill
          </button>
        </div>
      </div>
    </div>
  </section>
);

const PayrollCard = () => (
  <section className="relative overflow-hidden rounded-xl bg-black p-6 text-white">
    <div className="relative z-10">
      <p className="mb-1 text-xs text-white/80">Estimated Gross Monthly Pay</p>
      <h2 className="mb-6 text-4xl font-semibold tracking-tight">$4,820.50</h2>
      <div className="space-y-3">
        <PayrollLine label="Base Pay (160h)" value="$4,000.00" />
        <PayrollLine label="Overtime (12.5h)" value="$468.75" />
        <div className="flex justify-between text-xs">
          <span>Bonuses</span>
          <span>$351.75</span>
        </div>
      </div>
      <button className="mt-8 h-10 w-full rounded-lg bg-white text-sm font-semibold text-black transition hover:bg-[#f1edec]">
        View Payslip Details
      </button>
    </div>
    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#0058be]/20 blur-3xl" />
  </section>
);

const PayrollLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-white/10 pb-3 text-xs">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const StatCard = ({ icon, label, meta, value }: { icon: ReactNode; label: string; meta?: string; value: string }) => (
  <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-4">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-black">{icon}</div>
      {meta ? <span className="rounded-full bg-[#10b981]/10 px-2 py-1 text-[10px] font-bold text-[#10b981]">{meta}</span> : null}
    </div>
    <p className="text-xs uppercase tracking-wider text-[#444748]">{label}</p>
    <h3 className="text-2xl font-black text-black">{value}</h3>
  </div>
);

const BranchCard = ({ branch }: { branch: (typeof branches)[number] }) => (
  <article className="group overflow-hidden rounded-xl border border-[#e5e7eb] bg-white transition hover:border-black">
    <div className="relative h-32 overflow-hidden bg-[#f1edec]">
      <img alt="" className="h-full w-full object-cover grayscale opacity-40 transition duration-700 group-hover:grayscale-0 group-hover:opacity-100" src={branch.image} />
      {branch.tag ? (
        <span
          className={
            branch.tagTone === "error"
              ? "absolute right-4 top-4 rounded bg-[#ef4444]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-[#ef4444]"
              : "absolute left-4 top-4 rounded bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-tight text-white"
          }
        >
          {branch.tag}
        </span>
      ) : null}
      <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-white to-transparent" />
    </div>
    <div className="p-6 pt-0">
      <div className="mb-4 flex justify-between">
        <div><h4 className="text-sm font-bold">{branch.name}</h4><p className="flex items-center gap-1 text-xs text-[#444748]"><MapPin className="h-3 w-3" />{branch.address}</p></div>
        <MoreVertical className="h-5 w-5 text-[#444748]" />
      </div>
      <div className="grid grid-cols-2 gap-4 border-y border-[#e5e7eb] py-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-[#444748]">Manager</p>
          <div className="flex items-center gap-1">
            <img alt="" className="h-6 w-6 rounded-full object-cover" src={branch.managerPhoto} />
            <p className="text-xs font-semibold">{branch.manager}</p>
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wider text-[#444748]">Staff Count</p>
          <p className={branch.tagTone === "error" ? "text-xs font-semibold text-[#ef4444]" : "text-xs font-semibold"}>{branch.staff} Employees</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex -space-x-2">
          <img alt="" className="h-6 w-6 rounded-full border-2 border-white object-cover" src={employeePhotos[0]} />
          {branch.name === "Main St. Downtown" ? <img alt="" className="h-6 w-6 rounded-full border-2 border-white object-cover" src={employeePhotos[1]} /> : null}
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#ebe7e6] text-[8px] font-bold">+{branch.name === "Main St. Downtown" ? branch.staff - 3 : branch.staff - 1}</span>
        </div>
        <Link className="inline-flex items-center gap-1 text-sm font-semibold text-[#0058be] hover:underline" to="/dashboard/branches/settings">View Details <ChevronRight className="h-4 w-4" /></Link>
      </div>
    </div>
  </article>
);

const SettingsSection = ({ children, icon, title, toggle }: { children: ReactNode; icon: ReactNode; title: string; toggle?: boolean }) => (
  <section className="rounded-xl border border-[#e5e7eb] bg-[#f5f5f5] p-8">
    <div className="mb-6 flex items-start justify-between">
      <h3 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-black">{icon}{title}</h3>
      {toggle ? <span className="relative h-6 w-12 rounded-full bg-black"><span className="absolute right-0 top-0 h-6 w-6 rounded-full border-4 border-black bg-white" /></span> : null}
    </div>
    {children}
  </section>
);

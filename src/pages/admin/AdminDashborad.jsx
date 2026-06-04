import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../layout/AdminLayout";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  Tag,
  Users as UsersIcon,
  UserCheck,
  Calendar,
  Activity,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { getAllBooks } from "../../redux/slices/bookSlice";
import { getAllCategories } from "../../redux/slices/categorySlice";
import { getAllUsers } from "../../redux/slices/authSlice";

const C = {
  primary: "#002629",
  primaryCont: "#083d41",
  secondary: "#4a6363",
  surfaceTint: "#38656a",
  primaryFixedDim: "#a0cfd3",
  surface: "#f7f9ff",
  surfaceLow: "#f1f4fa",
  surfaceLowest: "#ffffff",
  surfaceHigh: "#e5e8ee",
  surfaceCont: "#ebeef4",
  onSurface: "#181c20",
  onSurfaceVar: "#404849",
  outline: "#707979",
  outlineVar: "#c0c8c9",
};

const salesData = [
  { month: "JAN", rev: 42000 },
  { month: "FEB", rev: 55000 },
  { month: "MAR", rev: 38000 },
  { month: "APR", rev: 70000 },
  { month: "MAY", rev: 52000 },
  { month: "JUN", rev: 88000 },
  { month: "JUL", rev: 95000 },
];

const orders = [
  { id: "#EP-9021", name: "Vikram Rathore", initials: "VR", hue: 180, date: "Oct 24, 2023", amount: "₹1,250.00", status: "Shipped", badge: "bg-[#cce8e7] text-[#3a6363]" },
  { id: "#EP-9020", name: "Ananya Iyer", initials: "AI", hue: 140, date: "Oct 24, 2023", amount: "₹890.00", status: "Delivered", badge: "bg-green-100 text-green-700" },
  { id: "#EP-9019", name: "Rahul Mehra", initials: "RM", hue: 220, date: "Oct 23, 2023", amount: "₹2,100.00", status: "Processing", badge: "bg-gray-100 text-gray-600" },
];

function Avatar({ initials, hue, size = 30 }) {
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},35%,48%)` }}
      className="rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

function Sparkline({ bars }) {
  return (
    <div className="flex items-end gap-[3px] h-9 w-full mt-3">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-sm opacity-30 animate-pulse"
          style={{ height: `${h}%`, background: C.primary }} />
      ))}
    </div>
  );
}

function DonutChart({ totalBooks, segments }) {
  const r = 15.9;
  let currentOffset = 0;
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="transparent" stroke="#f1f4f8" strokeWidth="3.5" />
        {segments.map((s, i) => {
          const strokeDash = `${s.pct} ${100 - s.pct}`;
          const strokeOffset = -currentOffset;
          currentOffset += s.pct;
          return (
            <circle key={i} cx="18" cy="18" r={r} fill="transparent"
              stroke={s.color} strokeWidth="3.5"
              strokeDasharray={strokeDash}
              strokeDashoffset={strokeOffset} strokeLinecap="round" />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-primary">{totalBooks}</span>
        <span className="text-[9px] font-semibold text-on-surface-var uppercase tracking-wider">Total Books</span>
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-outline/10 bg-primary text-white">
      {label}: ₹{(payload[0].value / 1000).toFixed(0)}k
    </div>
  ) : null;

function KpiCard({ icon, badge, badgeClass, label, value, bottom }) {
  return (
    <div className="bg-surface-lowest rounded-2xl border border-outline-var/20 p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-surface-low border border-outline-var/10">
          {icon}
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-xs text-on-surface-var font-medium mt-1">{label}</p>
        <h3 className="text-2xl font-black text-primary mt-0.5">{value}</h3>
      </div>
      {bottom}
    </div>
  );
}

const AdminDashboard = ({ activeNav, setActiveNav }) => {
  const [range, setRange] = useState("30");
  const dispatch = useDispatch();

  const booksData = useSelector((state) => state.book.booksData) || [];
  const categoriesData = useSelector((state) => state.category.categoriesData) || [];
  const usersData = useSelector((state) => state.auth.usersData) || [];

  useEffect(() => {
    dispatch(getAllBooks());
    dispatch(getAllCategories());
    dispatch(getAllUsers());
  }, [dispatch]);

  const activeUsersCount = useMemo(() => {
    return usersData.filter(user => user.status === "Active").length;
  }, [usersData]);

  const dynamicCategories = useMemo(() => {
    if (booksData.length === 0) {
      return [
        { label: "No Books", pct: 100, color: C.primary, count: 0 }
      ];
    }
    const counts = {};
    booksData.forEach(b => {
      let catLabel = "General";
      let catIdOrName = b.category;
      if (catIdOrName) {
        if (typeof catIdOrName === "object" && catIdOrName.name) {
          catLabel = catIdOrName.name;
        } else {
          const matched = categoriesData.find(c => c._id === catIdOrName);
          if (matched) {
            catLabel = matched.name;
          } else {
            catLabel = catIdOrName;
          }
        }
      }
      counts[catLabel] = (counts[catLabel] || 0) + 1;
    });

    const colors = [C.primary, C.surfaceTint, C.primaryFixedDim, C.secondary, "#5b7065", "#78909c"];
    const total = booksData.length;
    return Object.entries(counts).map(([label, count], i) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[i % colors.length]
    }));
  }, [booksData, categoriesData]);

  return (
    <AdminLayout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-sans">Dashboard Overview</h1>
            <p className="text-sm text-on-surface-var mt-0.5">Welcome back, Curator. Here's what's happening today.</p>
          </div>
          {/* Date range */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-low border border-outline-var/20 self-start sm:self-auto">
            {[["30", "Last 30 Days"], ["90", "90 Days"]].map(([k, l]) => (
              <button key={k} onClick={() => setRange(k)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={range === k ? { background: "#fff", color: C.primary, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" } : { color: "var(--color-on-surface-var)" }}>
                {l}
              </button>
            ))}
            <div className="w-px h-4 mx-1 bg-outline-var/30" />
            <button className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer hover:underline">
              <Calendar className="w-3.5 h-3.5" /> Custom Range
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiCard
            icon={<BookOpen className="w-5 h-5 text-primary" />}
            badge="Books"
            badgeClass="bg-[#cce8e7] text-[#3a6363]"
            label="Total Books"
            value={booksData.length}
            bottom={
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-surface-low overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, booksData.length * 5)}%` }} />
                </div>
                <p className="text-[10px] text-on-surface-var font-semibold uppercase tracking-wide mt-1.5">
                  Dynamic Catalog Size
                </p>
              </div>
            }
          />

          <KpiCard
            icon={<Tag className="w-5 h-5 text-primary" />}
            badge="Genres"
            badgeClass="bg-green-100 text-green-700"
            label="Total Categories"
            value={categoriesData.length}
            bottom={
              <div className="mt-2 text-on-surface-var text-[10px] font-semibold uppercase tracking-wide">
                Organized genres
              </div>
            }
          />

          <KpiCard
            icon={<UsersIcon className="w-5 h-5 text-primary" />}
            badge="Members"
            badgeClass="bg-indigo-50 text-indigo-700"
            label="Total Users"
            value={usersData.length}
            bottom={
              <div className="flex items-center gap-1 mt-1">
                {usersData.slice(0, 4).map((u, i) => {
                  const initials = u.name ? u.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
                  return (
                    <Avatar key={i} initials={initials} hue={[180, 140, 220, 280][i % 4]} size={24} />
                  );
                })}
                {usersData.length > 4 && (
                  <span className="text-xs font-bold text-on-surface-var ml-1">+{usersData.length - 4}</span>
                )}
              </div>
            }
          />

          <KpiCard
            icon={<UserCheck className="w-5 h-5 text-teal-600" />}
            badge="Live"
            badgeClass="bg-green-500 text-white"
            label="Active Users"
            value={activeUsersCount}
            bottom={
              <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-var/70">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>System status online</span>
              </div>
            }
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-5">

          {/* Sales Overview */}
          <div className="bg-surface-lowest rounded-2xl border border-outline-var/20 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-primary text-base">Sales Overview</h3>
                <p className="text-xs text-on-surface-var mt-0.5">Monthly revenue growth analytics</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-low border border-outline-var/15 text-on-surface hover:bg-surface-cont transition-colors">
                Monthly ▾
              </button>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={salesData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.surfaceTint} stopOpacity={0.10} />
                      <stop offset="95%" stopColor={C.surfaceTint} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-outline-var)" strokeOpacity={0.15} strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-outline)", strokeWidth: 1, strokeOpacity: 0.2 }} />
                  <Area type="monotone" dataKey="rev" stroke={C.surfaceTint} strokeWidth={2.5} fill="url(#g2)" dot={false} />
                  <Area type="monotone" dataKey="rev" stroke={C.primary} strokeWidth={3} fill="url(#g1)" dot={false}
                    data={salesData.map((d, i) => ({ ...d, rev: i > 3 ? d.rev : undefined }))} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-surface-lowest rounded-2xl border border-outline-var/20 shadow-sm p-6">
            <h3 className="font-bold text-primary text-base mb-4">Popular Categories</h3>
            <DonutChart totalBooks={booksData.length} segments={dynamicCategories} />
            <div className="mt-5 space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {dynamicCategories.map(cat => (
                <div key={cat.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-on-surface truncate max-w-[140px]">{cat.label}</span>
                  </div>
                  <span className="font-bold text-on-surface flex-shrink-0">{cat.pct}% ({cat.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface-lowest rounded-2xl border border-outline-var/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-outline-var/15">
            <h3 className="font-bold text-primary text-base">Recent Orders</h3>
            <button className="text-sm font-semibold text-primary hover:underline cursor-pointer">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[580px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest bg-surface-low text-on-surface-var">
                  {["Order ID", "Customer Name", "Date", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-6 py-3.5 ${h === "Actions" ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-surface-low/50 transition-colors border-t border-outline-var/15">
                    <td className="px-6 py-4 text-sm font-bold text-primary">{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={o.initials} hue={o.hue} size={30} />
                        <span className="text-sm text-on-surface font-medium">{o.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-var">{o.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">{o.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${o.badge}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-on-surface-var hover:text-primary transition-colors font-bold tracking-widest cursor-pointer">
                        ···
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

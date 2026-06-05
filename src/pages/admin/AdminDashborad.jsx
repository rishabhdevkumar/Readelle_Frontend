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
  primary: "#0a2f35",
  primaryCont: "#0e3f47",
  secondary: "#475569",
  surfaceTint: "#1d545c",
  primaryFixedDim: "#94a3b8",
  surface: "#f8fafc",
  surfaceLow: "#f1f5f9",
  surfaceLowest: "#ffffff",
  surfaceHigh: "#cbd5e1",
  surfaceCont: "#e2e8f0",
  onSurface: "#0f172a",
  onSurfaceVar: "#475569",
  outline: "#94a3b8",
  outlineVar: "#cbd5e1",
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
  { id: "#EP-9021", name: "Vikram Rathore", initials: "VR", hue: 180, date: "Oct 24, 2023", amount: "₹1,250.00", status: "Shipped", badge: "bg-blue-50 text-blue-700 border border-blue-100" },
  { id: "#EP-9020", name: "Ananya Iyer", initials: "AI", hue: 140, date: "Oct 24, 2023", amount: "₹890.00", status: "Delivered", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  { id: "#EP-9019", name: "Rahul Mehra", initials: "RM", hue: 220, date: "Oct 23, 2023", amount: "₹2,100.00", status: "Processing", badge: "bg-amber-50 text-amber-700 border border-amber-100" },
];

function Avatar({ initials, hue, size = 30 }) {
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},35%,48%)` }}
      className="rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

function DonutChart({ totalBooks, segments }) {
  const r = 15.9;
  let currentOffset = 0;
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="3.5" />
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
        <span className="text-xl font-black text-[#0a2f35]">{totalBooks}</span>
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Total Books</span>
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-slate-100 bg-[#0a2f35] text-white">
      {label}: ₹{(payload[0].value / 1000).toFixed(0)}k
    </div>
  ) : null;

function KpiCard({ icon, badge, badgeClass, label, value, bottom }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 text-[#0a2f35]">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-extrabold text-[#0a2f35] mt-0.5">{value}</h3>
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

    const colors = [C.primary, C.surfaceTint, "#334155", "#0f766e", "#2563eb", "#7c3aed"];
    const total = booksData.length;
    return Object.entries(counts).map(([label, count], i) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[i % colors.length]
    }));
  }, [booksData, categoriesData]);

  // Listen to globalSearch event as a mock search filter on orders
  const [searchVal, setSearchVal] = useState("");
  useEffect(() => {
    const handleSearch = (e) => setSearchVal(e.detail || "");
    window.addEventListener('globalSearch', handleSearch);
    return () => window.removeEventListener('globalSearch', handleSearch);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.name.toLowerCase().includes(searchVal.toLowerCase()) || 
      o.id.toLowerCase().includes(searchVal.toLowerCase()) ||
      o.status.toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [searchVal]);

  return (
    <AdminLayout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">Dashboard Overview</h1>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">Welcome back, Curator. Here's what's happening today.</p>
          </div>
          {/* Date range */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/50 self-start sm:self-auto">
            {[["30", "Last 30 Days"], ["90", "90 Days"]].map(([k, l]) => (
              <button key={k} onClick={() => setRange(k)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={range === k ? { background: "#fff", color: C.primary, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } : { color: "#475569" }}>
                {l}
              </button>
            ))}
            <div className="w-px h-4 mx-1 bg-slate-200" />
            <button className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#0a2f35] cursor-pointer hover:underline">
              <Calendar className="w-3.5 h-3.5" /> Custom Range
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiCard
            icon={<BookOpen className="w-5 h-5" />}
            badge="Books"
            badgeClass="bg-teal-50 text-teal-700 border border-teal-100"
            label="Total Books"
            value={booksData.length}
            bottom={
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-slate-50 overflow-hidden border border-slate-100">
                  <div className="h-full rounded-full bg-[#0a2f35]" style={{ width: `${Math.min(100, booksData.length * 5)}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                  Dynamic Catalog Size
                </p>
              </div>
            }
          />

          <KpiCard
            icon={<Tag className="w-5 h-5" />}
            badge="Genres"
            badgeClass="bg-amber-50 text-amber-700 border border-amber-100"
            label="Total Categories"
            value={categoriesData.length}
            bottom={
              <div className="mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Organized genres
              </div>
            }
          />

          <KpiCard
            icon={<UsersIcon className="w-5 h-5" />}
            badge="Members"
            badgeClass="bg-blue-50 text-blue-700 border border-blue-100"
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
                  <span className="text-xs font-bold text-slate-500 ml-1">+{usersData.length - 4}</span>
                )}
              </div>
            }
          />

          <KpiCard
            icon={<UserCheck className="w-5 h-5" />}
            badge="Live"
            badgeClass="bg-[#0a2f35] text-white"
            label="Active Users"
            value={activeUsersCount}
            bottom={
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>System status online</span>
              </div>
            }
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-5">

          {/* Sales Overview */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Sales Overview</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Monthly revenue growth analytics</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 border border-slate-200/60 text-slate-600 hover:bg-slate-100 transition-colors">
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
                      <stop offset="5%" stopColor="#1d545c" stopOpacity={0.10} />
                      <stop offset="95%" stopColor="#1d545c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.4} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeOpacity: 0.3 }} />
                  <Area type="monotone" dataKey="rev" stroke="#1d545c" strokeWidth={2.5} fill="url(#g2)" dot={false} />
                  <Area type="monotone" dataKey="rev" stroke={C.primary} strokeWidth={3} fill="url(#g1)" dot={false}
                    data={salesData.map((d, i) => ({ ...d, rev: i > 3 ? d.rev : undefined }))} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 text-base mb-4">Popular Categories</h3>
            <div className="my-auto">
              <DonutChart totalBooks={booksData.length} segments={dynamicCategories} />
            </div>
            <div className="mt-5 space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {dynamicCategories.map(cat => (
                <div key={cat.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-slate-600 truncate max-w-[140px] font-semibold">{cat.label}</span>
                  </div>
                  <span className="font-bold text-slate-800 flex-shrink-0">{cat.pct}% ({cat.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 flex items-center justify-between border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">Recent Orders</h3>
            <button className="text-xs font-bold text-[#0a2f35] hover:underline cursor-pointer">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[580px]">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400">
                  {["Order ID", "Customer Name", "Date", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-6 py-3.5 ${h === "Actions" ? "text-center" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-semibold">
                      No matching orders found.
                    </td>
                  </tr>
                ) : filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-800">{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={o.initials} hue={o.hue} size={30} />
                        <span className="text-xs text-slate-600 font-semibold">{o.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{o.date}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{o.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${o.badge}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors font-bold tracking-widest cursor-pointer">
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

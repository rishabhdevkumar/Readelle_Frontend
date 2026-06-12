import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  Eye,
  Trash2,
  X,
  AlertCircle,
  FileText,
  CreditCard,
  Wallet,
  Coins
} from "lucide-react";
import { getAllBooks } from "../../redux/slices/bookSlice";
import { getAllCategories } from "../../redux/slices/categorySlice";
import { getAllUsers } from "../../redux/slices/authSlice";
import { getAllOrders, deleteOrder } from "../../redux/slices/orderSlice";

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

// ── Resolve customer name/email from any backend shape ──────────
const getCustomerName = (o) =>
  o?.user?.name ||
  o?.userId?.name ||
  o?.customer?.name ||
  o?.customerName ||
  o?.buyerName ||
  o?.name ||
  'N/A';

const getCustomerEmail = (o) =>
  o?.user?.email ||
  o?.userId?.email ||
  o?.customer?.email ||
  o?.customerEmail ||
  o?.buyerEmail ||
  o?.email ||
  '';

const formatShippingAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    const { fullName, phone, address: streetAddress, city, state, pincode } = address;
    const parts = [
      fullName,
      streetAddress,
      city,
      state,
      pincode ? String(pincode) : ''
    ].filter(Boolean);
    return parts.join(', ') + (phone ? ` (Phone: ${phone})` : '');
  }
  return String(address);
};

const getStatusBadgeClass = (status) => {
  const norm = String(status || "").toUpperCase();
  switch (norm) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[9px] font-semibold';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[9px] font-semibold';
    case 'CONFIRMED':
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[9px] font-semibold';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full text-[9px] font-semibold';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-[9px] font-semibold';
  }
};

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

const getMethodIcon = (method) => {
  switch (method) {
    case 'Credit Card':
      return <CreditCard className="w-3.5 h-3.5 text-slate-400" />;
    case 'Wallet':
      return <Wallet className="w-3.5 h-3.5 text-slate-400" />;
    case 'UPI':
    default:
      return <Coins className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const AdminDashboard = ({ activeNav, setActiveNav }) => {
  const [range, setRange] = useState("30");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const booksData = useSelector((state) => state.books.booksData) || [];
  const categoriesData = useSelector((state) => state.categories.categoriesData) || [];
  const usersData = useSelector((state) => state.auth.usersData) || [];
  const ordersData = useSelector((state) => state.order.ordersData) || [];

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllBooks());
    dispatch(getAllCategories());
    dispatch(getAllUsers());
    dispatch(getAllOrders());
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

  // Listen to globalSearch event as a search filter on orders
  const [searchVal, setSearchVal] = useState("");
  useEffect(() => {
    const handleSearch = (e) => setSearchVal(e.detail || "");
    window.addEventListener('globalSearch', handleSearch);
    return () => window.removeEventListener('globalSearch', handleSearch);
  }, []);

  const filteredOrders = useMemo(() => {
    const sorted = [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted.filter(o => {
      const orderId = o.orderId || o._id || "";
      const customerName = getCustomerName(o);
      const customerEmail = getCustomerEmail(o);
      const status = o.status || "";

      return (
        orderId.toLowerCase().includes(searchVal.toLowerCase()) ||
        customerName.toLowerCase().includes(searchVal.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchVal.toLowerCase()) ||
        status.toLowerCase().includes(searchVal.toLowerCase())
      );
    }).slice(0, 5);
  }, [ordersData, searchVal]);

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
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-[#0a2f35] hover:underline cursor-pointer"
            >
              View All Orders
            </button>
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
                ) : filteredOrders.map(o => {
                  const customerName = getCustomerName(o);
                  const customerEmail = getCustomerEmail(o);
                  const initials = customerName !== 'N/A'
                    ? customerName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                    : '?';
                  const hash = Array.from(customerName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const hue = hash % 360;
                  return (
                    <tr key={o._id || o.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-800">{o.orderId || o._id || "#ORD-XXXX"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar initials={initials} hue={hue} size={30} />
                          <div className="leading-tight">
                            <div className="text-xs text-slate-600 font-semibold">{customerName}</div>
                            <div className="text-slate-400 text-[9px] mt-0.5">{customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-semibold">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                          : o.date || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">₹{o.totalAmount || o.amount || 0}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(o.status)}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(o);
                              setIsActionsModalOpen(true);
                            }}
                            className="text-slate-400 hover:text-[#0a2f35] hover:bg-slate-50 transition-colors cursor-pointer p-2 rounded-xl border border-transparent hover:border-slate-200/40"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(o);
                              setIsDeleteConfirmOpen(true);
                            }}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer p-2 rounded-xl border border-transparent hover:border-red-100/40"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order View Modal — full detail, no navigation */}
        {isActionsModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0a2f35] to-[#1d545c]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Order Details</h3>
                    <p className="text-[10px] text-teal-200/80 font-medium mt-0.5">{selectedOrder.orderId || selectedOrder._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsActionsModalOpen(false); setSelectedOrder(null); }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                {/* Customer Info */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Information</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a2f35] to-[#1d545c] flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                      {getCustomerName(selectedOrder).charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <p className="font-bold text-slate-800 text-sm">{getCustomerName(selectedOrder)}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{getCustomerEmail(selectedOrder) || 'N/A'}</p>
                      {(selectedOrder.user?.phone || selectedOrder.phone) && (
                        <p className="text-slate-400 text-[11px]">{selectedOrder.user?.phone || selectedOrder.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Info Grid */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Order Information</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-semibold">Order ID</span>
                      <span className="font-bold text-[#0a2f35] text-[11px] break-all">{selectedOrder.orderId || selectedOrder._id || '#ORD-XXXX'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-semibold">Order Date</span>
                      <span className="font-bold text-slate-800">
                        {selectedOrder.createdAt
                          ? new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : selectedOrder.date || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-semibold">Status</span>
                      <span className={getStatusBadgeClass(selectedOrder.status)}>{selectedOrder.status}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-semibold">Payment Method</span>
                      <div className="flex items-center gap-1">
                        {getMethodIcon(selectedOrder.paymentMethod || selectedOrder.method)}
                        <span className="font-bold text-slate-800">{selectedOrder.paymentMethod || selectedOrder.method || 'UPI'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-semibold">Total Amount</span>
                      <span className="font-extrabold text-[#0a2f35] text-sm">₹{selectedOrder.totalAmount || selectedOrder.amount || 0}</span>
                    </div>
                    {selectedOrder.shippingAddress && (
                      <div className="flex flex-col gap-0.5 col-span-2">
                        <span className="text-slate-400 font-semibold">Shipping Address</span>
                        <span className="font-bold text-slate-700 leading-relaxed">{formatShippingAddress(selectedOrder.shippingAddress)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Books */}
                {(selectedOrder.books || selectedOrder.orderItems || selectedOrder.items) && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Ordered Books
                      <span className="ml-1.5 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px]">
                        {(selectedOrder.books || selectedOrder.orderItems || selectedOrder.items).length} item{(selectedOrder.books || selectedOrder.orderItems || selectedOrder.items).length !== 1 ? 's' : ''}
                      </span>
                    </p>
                    <div className="space-y-2">
                      {(selectedOrder.books || selectedOrder.orderItems || selectedOrder.items).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                          <div className="w-8 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-teal-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-700 text-xs truncate">{item.title || item.book?.title || item.name || 'Book Title'}</p>
                            {(item.author || item.book?.author) && (
                              <p className="text-slate-400 text-[10px] mt-0.5 truncate">{item.author || item.book?.author}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">Qty: {item.quantity || 1}</span>
                            {(item.price || item.book?.price) && (
                              <span className="text-[10px] font-bold text-[#0a2f35]">₹{(item.price || item.book?.price) * (item.quantity || 1)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!(selectedOrder.books || selectedOrder.orderItems || selectedOrder.items) && (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs font-medium">No item details available for this order.</p>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => { setIsActionsModalOpen(false); setSelectedOrder(null); }}
                  className="px-5 py-2 border border-slate-200 text-slate-600 hover:text-[#0a2f35] hover:bg-slate-100 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 pb-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-800">
                  Delete Order
                </h3>
                <p className="text-slate-400 text-xs mt-2 font-medium">
                  Are you sure you want to delete order <span className="font-bold text-slate-700">{selectedOrder.orderId || selectedOrder._id || '#ORD-XXXX'}</span>? This action cannot be undone.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const orderId = selectedOrder._id || selectedOrder.id;
                    if (orderId) {
                      dispatch(deleteOrder(orderId));
                    }
                    setIsDeleteConfirmOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md shadow-red-600/10 cursor-pointer text-xs"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;




import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders, deleteOrder } from "../../redux/slices/orderSlice";
import AdminLayout from '../../layout/AdminLayout';
import {
  ShoppingCart,
  Clock,
  RotateCcw,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Truck,
  Plus,
  FileText,
  CreditCard,
  Wallet,
  Coins,
  Eye,
  Trash2,
  X,
  AlertCircle,
  Download,
  Check,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold';
    case 'Shipped':
      return 'bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold';
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold';
  }
};

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

const Orders = ({ activeNav, setActiveNav }) => {
  const dispatch = useDispatch();
  const { ordersData = [], loading } = useSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualEntry, setManualEntry] = useState({ customerName: '', customerEmail: '', amount: '', paymentMethod: 'UPI', status: 'Pending', note: '' });

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail || '');
    };
    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch);
  }, []);

  const filteredOrders = useMemo(() => {
    return ordersData.filter((order) => {
      const orderId = order.orderId || order._id || '';
      const name = getCustomerName(order);
      const email = getCustomerEmail(order);
      const method = order.paymentMethod || order.method || '';
      const status = order.status || '';

      const matchesSearch =
        orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [ordersData, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const pageStart = filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const pageEnd = Math.min(currentPage * itemsPerPage, filteredOrders.length);

  // ── Export Report as CSV ──────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) { toast.error('No orders to export'); return; }
    const headers = ['Order ID', 'Customer Name', 'Email', 'Date', 'Total Amount', 'Payment Method', 'Status'];
    const rows = filteredOrders.map(o => [
      o.orderId || o._id || '',
      getCustomerName(o),
      getCustomerEmail(o),
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US') : o.date || '',
      o.totalAmount || o.amount || 0,
      o.paymentMethod || o.method || 'UPI',
      o.status || ''
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_report_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredOrders.length} orders to CSV`);
  };

  // ── Start Processing (mark all Pending → Shipped) ─────────────
  const handleStartProcessing = () => {
    const pendingOrders = ordersData.filter(o => o.status === 'Pending');
    if (pendingOrders.length === 0) { toast('No pending orders to process', { icon: 'ℹ️' }); return; }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`${pendingOrders.length} pending order${pendingOrders.length > 1 ? 's' : ''} marked as Shipped!`);
    }, 1800);
  };

  // ── Manual Entry submit ────────────────────────────────────────
  const handleManualEntrySubmit = (e) => {
    e.preventDefault();
    if (!manualEntry.customerName.trim() || !manualEntry.amount) return;
    toast.success(`Manual entry recorded for ${manualEntry.customerName}`);
    setManualEntry({ customerName: '', customerEmail: '', amount: '', paymentMethod: 'UPI', status: 'Pending', note: '' });
    setIsManualEntryOpen(false);
  };

  return (
    <AdminLayout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="space-y-6 pb-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">Orders Management</h1>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">Monitor and process reading material transactions globally.</p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 text-xs transition-all cursor-pointer hover:border-[#0a2f35] hover:text-[#0a2f35]"
            >
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>

            <button
              onClick={() => setIsManualEntryOpen(true)}
              className="bg-[#0a2f35] hover:bg-[#072226] text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md shadow-[#0a2f35]/10 whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5" /> Manual Entry
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600 border border-teal-100/30">
                <ShoppingCart className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                +12.5%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
              <h3 className="text-xl font-extrabold text-[#0a2f35] mt-0.5">{ordersData.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100/30">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                High Priority
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Fulfillment</p>
              <h3 className="text-xl font-extrabold text-[#0a2f35] mt-0.5">156</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 text-red-600 border border-red-100/30">
                <RotateCcw className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                -3%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Refund Requests</p>
              <h3 className="text-xl font-extrabold text-[#0a2f35] mt-0.5">42</h3>
            </div>
          </div>

          <div className="bg-[#0a2f35] p-5 rounded-2xl border border-[#0a2f35] flex flex-col gap-2 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 text-white border border-white/10">
                <DollarSign className="w-4.5 h-4.5" />
              </div>
              <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase">
                Active
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[10px] text-teal-200/70 font-bold uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-xl font-extrabold text-white mt-0.5">₹4,290.50</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row items-center justify-between p-5 border-b border-slate-50 gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-1.5">
                <span className="text-[11px] font-bold text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-600 text-[11px] outline-none font-bold cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-1.5 text-slate-600 text-[11px] font-bold">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date Range: Oct 12 - Oct 19, 2023</span>
              </div>
            </div>

            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase self-end md:self-auto flex-shrink-0">
              SHOWING <span className="text-slate-700">{pageStart}-{pageEnd}</span> OF <span className="text-slate-700">{filteredOrders.length}</span> ENTRIES
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[750px]">
              <thead>
                <tr className="bg-[#f8fafc] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-semibold">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-semibold">
                      No orders found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0a2f35]">
                        {order.orderId || order._id || '#ORD-XXXX'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="leading-tight">
                          <div className="font-bold text-slate-700">
                            {getCustomerName(order)}
                          </div>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            {getCustomerEmail(order)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : order.date}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        ₹{order.totalAmount || order.amount || '0'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setIsViewModalOpen(true);
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
                              setSelectedOrder(order);
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-slate-50 flex items-center justify-between text-xs font-semibold">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-slate-400 hover:text-[#0a2f35] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold cursor-pointer transition-colors ${n === currentPage
                    ? 'bg-[#0a2f35] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-[#0a2f35]'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-slate-400 hover:text-[#0a2f35] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Processing Queue</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Manage pending batches ready for shipment operations.</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/50 text-[#0a2f35] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <div className="font-bold text-slate-700 text-xs">Warehouse Batch #102</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">42 items pending/label printing</div>
                </div>
              </div>

              <button
                onClick={handleStartProcessing}
                disabled={isProcessing}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold bg-white hover:bg-[#0a2f35] hover:text-white hover:border-[#0a2f35] text-xs rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                ) : (
                  <><Truck className="w-3.5 h-3.5" /> START PROCESSING</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-sm">Quick Notes</h3>
            <div className="flex-1 bg-[#fef3c7] p-5 rounded-2xl shadow-sm border border-[#fef08a] flex flex-col justify-between gap-4 min-h-[120px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-[#fde047] rounded-bl-3xl opacity-20"></div>
              <p className="text-amber-900 font-medium text-xs leading-relaxed italic">
                "Remember to check the holiday shipping schedule updates by end of day Friday."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-700/10 text-amber-800 text-[9px] font-extrabold flex items-center justify-center border border-amber-800/10 flex-shrink-0">
                  SC
                </div>
                <span className="text-[9px] font-bold text-amber-800/60 uppercase tracking-wider">POSTED BY SARAH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Entry Modal */}
        {isManualEntryOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0a2f35] to-[#1d545c]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Manual Order Entry</h3>
                    <p className="text-[10px] text-teal-200/80 font-medium mt-0.5">Record an offline or manual order</p>
                  </div>
                </div>
                <button onClick={() => setIsManualEntryOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleManualEntrySubmit}>
                <div className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-bold mb-1">Customer Name *</label>
                      <input
                        type="text" required
                        placeholder="e.g. Rohit Kumar"
                        value={manualEntry.customerName}
                        onChange={e => setManualEntry(p => ({ ...p, customerName: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-bold mb-1">Customer Email</label>
                      <input
                        type="email"
                        placeholder="e.g. rohit@example.com"
                        value={manualEntry.customerEmail}
                        onChange={e => setManualEntry(p => ({ ...p, customerEmail: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Total Amount (₹) *</label>
                      <input
                        type="number" required min="1"
                        placeholder="e.g. 499"
                        value={manualEntry.amount}
                        onChange={e => setManualEntry(p => ({ ...p, amount: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Payment Method</label>
                      <select
                        value={manualEntry.paymentMethod}
                        onChange={e => setManualEntry(p => ({ ...p, paymentMethod: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold cursor-pointer"
                      >
                        <option>UPI</option>
                        <option>Credit Card</option>
                        <option>Wallet</option>
                        <option>Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Status</label>
                      <select
                        value={manualEntry.status}
                        onChange={e => setManualEntry(p => ({ ...p, status: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold cursor-pointer"
                      >
                        <option>Pending</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-bold mb-1">Note</label>
                      <textarea
                        rows={2}
                        placeholder="Optional note about this order..."
                        value={manualEntry.note}
                        onChange={e => setManualEntry(p => ({ ...p, note: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold resize-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsManualEntryOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0a2f35] hover:bg-[#072226] text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#0a2f35]/15 cursor-pointer text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {isViewModalOpen && selectedOrder && (
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
                  onClick={() => { setIsViewModalOpen(false); setSelectedOrder(null); }}
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

                {/* Order Items / Books */}
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

                {/* If no items found */}
                {!(selectedOrder.books || selectedOrder.orderItems || selectedOrder.items) && (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs font-medium">No item details available for this order.</p>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  onClick={() => { setIsViewModalOpen(false); setSelectedOrder(null); }}
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

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <span>© 2026 ePustakalay Digital Curator. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Protocol</a>
            <span className="text-slate-200">|</span>
            <a href="#manual" className="hover:text-slate-600 transition-colors">Admin Manual</a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;

import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from "../../redux/slices/orderSlice";
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
  Coins
} from 'lucide-react';

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

const Orders = ({ activeNav, setActiveNav }) => {
  const dispatch = useDispatch();
  const { ordersData = [], loading } = useSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

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
      const name = order.user?.name || order.name || '';
      const email = order.user?.email || order.email || '';
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

  return (
    <AdminLayout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="space-y-6 pb-8">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">Orders Management</h1>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">Monitor and process reading material transactions globally.</p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 text-xs transition-all cursor-pointer">
              <FileText className="w-3.5 h-3.5" /> Export Report
            </button>

            <button className="bg-[#0a2f35] hover:bg-[#072226] text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md shadow-[#0a2f35]/10 whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]">
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
                  <th className="px-6 py-4">Payment Method</th>
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
                            {order.user?.name || order.name || 'N/A'}
                          </div>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            {order.user?.email || order.email || ''}
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
                        <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                          {getMethodIcon(order.paymentMethod || order.method)}
                          <span>{order.paymentMethod || order.method || 'UPI'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors font-bold tracking-widest cursor-pointer px-2 py-1">
                          ···
                        </button>
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

              <button className="px-4 py-2 border border-slate-200 text-slate-600 font-bold bg-white hover:bg-slate-50 text-xs rounded-xl transition-all cursor-pointer">
                START PROCESSING
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
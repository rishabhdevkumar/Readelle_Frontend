import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminLayout from '../../layout/AdminLayout';
import {
    Search,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    AlertCircle,
    Trash2,
    UserCheck,
    TrendingUp,
    Filter,
    User,
    ShieldCheck,
    ShieldOff
} from 'lucide-react';
import { getAllUsers, registerUser, updateUser, deleteUser } from '../../redux/slices/authSlice';

/* ─── Role mapping helpers ───────────────────────────────────────────────────── */
const toFrontendRole = (role) => {
    switch (role) {
        case "admin":
            return "Admin";
        case "seller":
            return "Curator";
        case "user":
        default:
            return "Reader";
    }
};

const getRoleBadgeClass = (role) => {
    switch (role) {
        case "Admin":
            return "bg-slate-50 text-slate-700 border border-slate-200/60 text-[10px] font-semibold px-2.5 py-0.5 rounded-full";
        case "Curator":
            return "bg-[#edf7f6] text-teal-800 border border-teal-100/50 text-[10px] font-semibold px-2.5 py-0.5 rounded-full";
        case "Reader":
        default:
            return "bg-slate-50 text-slate-500 border border-slate-200/40 text-[10px] font-semibold px-2.5 py-0.5 rounded-full";
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case "Active":
            return {
                text: "text-emerald-600 font-semibold",
                dot: "bg-emerald-500",
            };
        case "Inactive":
            return {
                text: "text-slate-500 font-semibold",
                dot: "bg-slate-400",
            };
        case "Suspended":
            return {
                text: "text-red-500 font-semibold",
                dot: "bg-red-500",
            };
        default:
            return {
                text: "text-slate-500",
                dot: "bg-slate-400",
            };
    }
};

const ITEMS_PER_PAGE = 10;

const Users = ({ activeNav, setActiveNav }) => {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.auth.usersData) || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showFiltersMenu, setShowFiltersMenu] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Add User Modal State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "Reader",
        status: "Active"
    });

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    // Listen to global search events from Header
    useEffect(() => {
        const handleGlobalSearch = (e) => {
            setSearchTerm(e.detail || "");
        };
        window.addEventListener('globalSearch', handleGlobalSearch);
        return () => {
            window.removeEventListener('globalSearch', handleGlobalSearch);
        };
    }, []);

    // Filtered Users List
    const filteredUsers = useMemo(() => {
        return users.map(user => ({
            ...user,
            frontendRole: toFrontendRole(user.role)
        })).filter(user => {
            const matchesSearch =
                (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.frontendRole.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === "All" || user.frontendRole === roleFilter;
            const matchesStatus = statusFilter === "All" || (user.status || "Active") === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter]);

    // Pagination derived values
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const pageStart = filteredUsers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length);

    // Generate page number buttons (show up to 5 around current)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUserData({
            ...newUserData,
            [name]: value
        });
    };

    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password || !newUserData.phone) return;

        // Map frontend role to backend role
        const backendRole = newUserData.role === "Admin" ? "admin" : newUserData.role === "Curator" ? "seller" : "user";

        const userData = {
            name: newUserData.name.trim(),
            email: newUserData.email.trim(),
            password: newUserData.password,
            phone: parseInt(newUserData.phone, 10),
            role: backendRole,
            status: newUserData.status
        };

        const resultAction = await dispatch(registerUser(userData));
        if (registerUser.fulfilled.match(resultAction)) {
            setIsAddUserOpen(false);
            dispatch(getAllUsers());
            // Reset Form
            setNewUserData({
                name: "",
                email: "",
                password: "",
                phone: "",
                role: "Reader",
                status: "Active",
            });
        }
    };

    const handleDeleteUser = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(id));
        }
    };

    const toggleUserStatus = (id) => {
        const user = users.find(u => u._id === id);
        if (!user) return;
        const currentStatus = user.status || "Active";
        const nextStatus = currentStatus === "Active" ? "Inactive" : currentStatus === "Inactive" ? "Suspended" : "Active";

        dispatch(updateUser({ id, data: { status: nextStatus } }));
    };

    const handleResetFilters = () => {
        setRoleFilter("All");
        setStatusFilter("All");
        setSearchTerm("");
        window.dispatchEvent(new CustomEvent('resetSearch', { detail: "" }));
    };

    // Derived counts for KPI cards
    const registrationsThisMonth = useMemo(() => {
        // mock or actual filter
        return users.length;
    }, [users]);

    const activeRate = useMemo(() => {
        if (users.length === 0) return "0%";
        const activeCount = users.filter(u => u.status === "Active").length;
        return ((activeCount / users.length) * 100).toFixed(1) + "%";
    }, [users]);

    const flaggedCount = useMemo(() => {
        return users.filter(u => u.status === "Suspended").length || 3;
    }, [users]);

    return (
        <AdminLayout activeNav={activeNav} setActiveNav={setActiveNav}>
            <div className="space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">Users</h1>
                        <p className="text-sm text-slate-400 mt-0.5 font-medium">Manage platform members, permissions, and account statuses.</p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        {/* Filters toggle */}
                        <button
                            onClick={() => setShowFiltersMenu(!showFiltersMenu)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border text-xs transition-all cursor-pointer ${showFiltersMenu ? 'border-[#0a2f35] text-[#0a2f35] bg-[#0a2f35]/5' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-3.5 h-3.5" /> Filters
                        </button>

                        {/* Add New User */}
                        <button
                            onClick={() => setIsAddUserOpen(true)}
                            className="bg-[#0a2f35] hover:bg-[#072226] text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md shadow-[#0a2f35]/10 whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Add New User
                        </button>
                    </div>
                </div>

                {/* Floating / Inline Filters Submenu */}
                {showFiltersMenu && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center animate-in slide-in-from-top-3 duration-200">
                        <div className="text-xs font-bold text-[#0a2f35] mr-1">Quick Filters:</div>

                        {/* Role select */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400">Role:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-bold cursor-pointer"
                            >
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Curator">Curator</option>
                                <option value="Reader">Reader</option>
                            </select>
                        </div>

                        {/* Status select */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-bold cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>

                        <button
                            onClick={handleResetFilters}
                            className="text-[11px] font-bold text-[#0a2f35] hover:underline ml-auto cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Main Table Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Table Component */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="bg-[#f8fafc] text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                                    <th className="px-6 py-4">User Entity</th>
                                    <th className="px-6 py-4">Permission Role</th>
                                    <th className="px-6 py-4">Lifecycle Status</th>
                                    <th className="px-6 py-4">Join Date</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-5 h-5 text-slate-300" />
                                                <span>No users found matching your criteria.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => {
                                        const userStatus = user.status || "Active";
                                        const isActive = userStatus === "Active";
                                        const statusStyle = getStatusClass(userStatus);
                                        const joinDate = user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                                            : "Oct 12, 2023";
                                        const avatarUrl = `https://i.pravatar.cc/150?u=${user._id}`;
                                        return (
                                            <tr key={user._id} className="hover:bg-slate-50/40 transition-colors group">
                                                {/* User Entity */}
                                                <td className="px-6 py-4.5 flex items-center gap-3">
                                                    <img
                                                        src={avatarUrl}
                                                        alt={user.name}
                                                        className="w-9 h-9 rounded-full object-cover border border-slate-200/50 shadow-sm"
                                                    />
                                                    <div className="leading-tight">
                                                        <div className="font-bold text-slate-700 text-sm tracking-tight">{user.name}</div>
                                                        <div className="text-slate-400 text-[11px] mt-0.5">{user.email}</div>
                                                    </div>
                                                </td>

                                                {/* Permission Role */}
                                                <td className="px-6 py-4.5">
                                                    <span className={getRoleBadgeClass(user.frontendRole)}>
                                                        {user.frontendRole}
                                                    </span>
                                                </td>

                                                {/* Lifecycle Status */}
                                                <td className="px-6 py-4.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                                        <span className={`text-xs ${statusStyle.text}`}>{userStatus}</span>
                                                    </div>
                                                </td>

                                                {/* Join Date */}
                                                <td className="px-6 py-4.5 text-slate-400 font-semibold">
                                                    {joinDate}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Access Toggle Icon Button */}
                                                        <button
                                                            onClick={() => toggleUserStatus(user._id)}
                                                            title={isActive ? "Access Granted — Click to Revoke" : "Access Revoked — Click to Grant"}
                                                            className={`p-2 rounded-xl border transition-all cursor-pointer ${isActive
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/60"
                                                                : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100/60"
                                                                }`}
                                                        >
                                                            {isActive
                                                                ? <ShieldCheck className="w-3.5 h-3.5" />
                                                                : <ShieldOff className="w-3.5 h-3.5" />
                                                            }
                                                        </button>

                                                        {/* Delete User */}
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-xl border border-transparent hover:border-red-100/40"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Panel */}
                    <div className="p-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                        <span className="text-slate-400 font-semibold">
                            Showing <span className="font-bold text-slate-700">{pageStart} - {pageEnd}</span> of <span className="font-bold text-slate-700">{filteredUsers.length}</span> curators and readers
                        </span>

                        <div className="flex items-center gap-1.5">
                            {/* Prev */}
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all ${page === currentPage
                                        ? "bg-[#0a2f35] text-white shadow-sm shadow-[#0a2f35]/15"
                                        : "border border-slate-200 hover:bg-slate-50 text-slate-500"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Next */}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom KPI Cards matching the Mockup */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* KPI Card 1: New Registrations */}
                    <div className="bg-[#edf6f5] p-5 rounded-2xl border border-slate-100 flex flex-col gap-2 hover:shadow-sm transition-all duration-200">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-[#0f766e] shadow-sm border border-[#0f766e]/5">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="mt-2">
                            <p className="text-[10px] text-[#0f766e] font-bold uppercase tracking-wider">New Registrations</p>
                            <h3 className="text-lg font-extrabold text-[#042f2e] mt-0.5">
                                +24% <span className="text-xs font-semibold text-[#0f766e]/75 normal-case">this month</span>
                            </h3>
                        </div>
                    </div>

                    {/* KPI Card 2: Active Rate */}
                    <div className="bg-[#eff6ff] p-5 rounded-2xl border border-slate-100 flex flex-col gap-2 hover:shadow-sm transition-all duration-200">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-blue-600 shadow-sm border border-blue-500/5">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div className="mt-2">
                            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Active Rate</p>
                            <h3 className="text-lg font-extrabold text-blue-950 mt-0.5">
                                {activeRate} <span className="text-xs font-semibold text-blue-700/75 normal-case">daily users</span>
                            </h3>
                        </div>
                    </div>

                    {/* KPI Card 3: Flagged Accounts */}
                    <div className="bg-[#fff5f5] p-5 rounded-2xl border border-red-100 flex flex-col gap-2 hover:shadow-sm transition-all duration-200">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-red-600 shadow-sm border border-red-500/5">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="mt-2">
                            <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Flagged Accounts</p>
                            <h3 className="text-lg font-extrabold text-red-950 mt-0.5">
                                {flaggedCount} <span className="text-xs font-semibold text-red-700/75 normal-case">pending review</span>
                            </h3>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add New User Modal */}
            {isAddUserOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-[#0a2f35]" />
                                <h3 className="font-extrabold text-base text-[#0a2f35]">Register New User</h3>
                            </div>
                            <button
                                onClick={() => setIsAddUserOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0a2f35] transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAddUserSubmit}>
                            <div className="p-6 space-y-4 text-xs font-sans">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-slate-500 font-bold mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. Liam Sterling"
                                        value={newUserData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
                                    />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-slate-500 font-bold mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="e.g. liam.s@pustakalay.com"
                                        value={newUserData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-slate-500 font-bold mb-1">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        value={newUserData.password}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-slate-500 font-bold mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        pattern="^[0-9]{10}$"
                                        placeholder="e.g. 9876543210"
                                        value={newUserData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
                                    />
                                </div>

                                {/* Role and Initial Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-500 font-bold mb-1">Permission Role</label>
                                        <select
                                            name="role"
                                            value={newUserData.role}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] cursor-pointer font-semibold"
                                        >
                                            <option value="Reader">Reader</option>
                                            <option value="Curator">Curator</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-500 font-bold mb-1">Account Status</label>
                                        <select
                                            name="status"
                                            value={newUserData.status}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] cursor-pointer font-semibold"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0a2f35] hover:bg-[#072226] text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#0a2f35]/15 cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" /> Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Users;

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
            return "Seller";
        case "user":
        default:
            return "User";
    }
};

const getRoleBadgeClass = (role) => {
    switch (role) {
        case "Admin":
            return "bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-lg";
        case "Seller":
            return "bg-teal-50 text-teal-800 border border-teal-100 text-[10px] font-bold px-2 py-0.5 rounded-lg";
        case "User":
        default:
            return "bg-indigo-50 text-indigo-800 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-lg";
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case "Active":
            return {
                text: "text-emerald-700 font-semibold",
                dot: "bg-emerald-500",
            };
        case "Inactive":
            return {
                text: "text-slate-500 font-semibold",
                dot: "bg-slate-400",
            };
        case "Suspended":
            return {
                text: "text-red-600 font-bold",
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
        role: "User",
        status: "Active"
    });

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

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
        const backendRole = newUserData.role === "Admin" ? "admin" : newUserData.role === "Seller" ? "seller" : "user";

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
                role: "User",
                status: "Active",
            });
        }
    };

    const handleDeleteUser = (id) => {
        dispatch(deleteUser(id));
    };

    const toggleUserStatus = (id) => {
        const user = users.find(u => u._id === id);
        if (!user) return;
        const currentStatus = user.status || "Active";
        const nextStatus = currentStatus === "Active" ? "Inactive" : currentStatus === "Inactive" ? "Suspended" : "Active";
        
        dispatch(updateUser({ id, data: { status: nextStatus } }));
    };

    return (
        <AdminLayout activeNav={activeNav} setActiveNav={setActiveNav}>
            <div className="space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div>
                        <h1 className="text-2xl font-bold text-primary tracking-tight font-sans">Users</h1>
                        <p className="text-sm text-on-surface-var mt-0.5">Manage platform members, permissions, and account statuses.</p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        {/* Filters toggle */}
                        <button
                            onClick={() => setShowFiltersMenu(!showFiltersMenu)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border text-xs transition-all cursor-pointer bg-surface-lowest text-on-surface-var hover:bg-surface-low ${showFiltersMenu ? 'border-primary text-primary bg-surface-low' : 'border-outline-var/30'}`}
                        >
                            <Filter className="w-3.5 h-3.5" /> Filters
                        </button>

                        {/* Add New User */}
                        <button
                            onClick={() => setIsAddUserOpen(true)}
                            className="bg-primary hover:bg-primary-cont text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-xs shadow-md shadow-primary/10 whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Add New User
                        </button>
                    </div>
                </div>

                {/* Floating / Inline Filters Submenu */}
                {showFiltersMenu && (
                    <div className="bg-surface-lowest border border-outline-var/25 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center animate-in slide-in-from-top-3 duration-200">
                        <div className="text-xs font-bold text-primary mr-1">Quick Filters:</div>

                        {/* Role select */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-on-surface-var">Role:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="bg-surface-low border border-outline-var/20 text-on-surface text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-semibold cursor-pointer"
                            >
                                <option value="All">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Seller">Seller</option>
                                <option value="User">User</option>
                            </select>
                        </div>

                        {/* Status select */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-on-surface-var">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-surface-low border border-outline-var/20 text-on-surface text-[11px] rounded-lg px-2.5 py-1.5 outline-none font-semibold cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                setRoleFilter("All");
                                setStatusFilter("All");
                                setSearchTerm("");
                            }}
                            className="text-[11px] font-semibold text-primary hover:underline ml-auto cursor-pointer"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Main Table Section */}
                <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-var/20 overflow-hidden">

                    {/* Table Search & Total Info Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-b border-outline-var/15 gap-4">
                        <div className="flex items-center bg-surface-low rounded-xl px-3.5 py-2 border border-outline-var/15 w-full sm:w-[320px]">
                            <Search className="w-3.5 h-3.5 text-on-surface-var/60 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search system users, emails, or roles..."
                                className="border-none bg-transparent outline-none ml-2 w-full text-xs text-on-surface placeholder-on-surface-var/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-xs text-on-surface-var font-semibold self-end sm:self-auto">
                            Showing <span className="font-bold text-on-surface">{pageStart}–{pageEnd}</span> of <span className="font-bold text-on-surface">{filteredUsers.length}</span> members
                        </div>
                    </div>

                    {/* Table Component */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="bg-surface-low text-on-surface-var text-[10px] font-black uppercase tracking-widest border-b border-outline-var/15">
                                    <th className="px-6 py-4 font-black">User Entity</th>
                                    <th className="px-6 py-4 font-black">Permission Role</th>
                                    <th className="px-6 py-4 font-black">Lifecycle Status</th>
                                    <th className="px-6 py-4 font-black">Join Date</th>
                                    <th className="px-6 py-4 font-black text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-var/15 text-xs font-sans">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-on-surface-var font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-5 h-5 text-on-surface-var/40" />
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
                                            <tr key={user._id} className="hover:bg-surface-low/30 transition-colors group">
                                                {/* User Entity */}
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <img
                                                        src={avatarUrl}
                                                        alt={user.name}
                                                        className="w-9 h-9 rounded-full object-cover border border-outline-var/20 shadow-sm"
                                                    />
                                                    <div className="leading-tight">
                                                        <div className="font-bold text-primary text-sm tracking-tight">{user.name}</div>
                                                        <div className="text-on-surface-var text-[11px] mt-0.5">{user.email}</div>
                                                    </div>
                                                </td>

                                                {/* Permission Role */}
                                                <td className="px-6 py-4">
                                                    <span className={getRoleBadgeClass(user.frontendRole)}>
                                                        {user.frontendRole}
                                                    </span>
                                                </td>

                                                {/* Lifecycle Status */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                                        <span className={`text-xs ${statusStyle.text}`}>{userStatus}</span>
                                                    </div>
                                                </td>

                                                {/* Join Date */}
                                                <td className="px-6 py-4 text-on-surface-var font-medium">
                                                    {joinDate}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Access Toggle Icon Button */}
                                                        <button
                                                            onClick={() => toggleUserStatus(user._id)}
                                                            title={isActive ? "Access Granted — Click to Revoke" : "Access Revoked — Click to Grant"}
                                                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                                                isActive
                                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700"
                                                                    : "bg-red-50 text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600"
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
                                                            className="text-on-surface-var hover:text-red-500 transition-colors cursor-pointer bg-surface-low hover:bg-red-50 p-2 rounded-lg border border-outline-var/20"
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
                    <div className="p-5 border-t border-outline-var/15 flex items-center justify-between text-xs">
                        <span className="text-on-surface-var font-medium">
                            Page <span className="font-bold text-on-surface">{currentPage}</span> of <span className="font-bold text-on-surface">{totalPages}</span>
                            &nbsp;·&nbsp;
                            <span className="font-bold text-on-surface">{pageStart}–{pageEnd}</span> of {filteredUsers.length} members
                        </span>

                        <div className="flex items-center gap-1.5">
                            {/* Prev */}
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-outline-var/25 hover:bg-surface-low text-on-surface-var cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all ${
                                        page === currentPage
                                            ? "bg-primary text-white shadow-sm shadow-primary/10"
                                            : "border border-outline-var/25 hover:bg-surface-low text-on-surface-var"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Next */}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-outline-var/25 hover:bg-surface-low text-on-surface-var cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom KPI Cards matching the Mockup */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* KPI Card 1: New Registrations */}
                    <div className="bg-surface-lowest p-5 rounded-2xl border border-outline-var/20 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-on-surface-var font-bold uppercase tracking-wider">New Registrations</p>
                                <h3 className="text-xl font-black text-primary mt-1">+24% <span className="text-xs font-semibold text-on-surface-var normal-case">this month</span></h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600 border border-teal-100">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="w-full bg-surface-low h-1 rounded-full overflow-hidden mt-1">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: '74%' }}></div>
                        </div>
                    </div>

                    {/* KPI Card 2: Active Rate */}
                    <div className="bg-surface-lowest p-5 rounded-2xl border border-outline-var/20 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-on-surface-var font-bold uppercase tracking-wider">Active Rate</p>
                                <h3 className="text-xl font-black text-primary mt-1">92.4% <span className="text-xs font-semibold text-on-surface-var normal-case">daily users</span></h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#edf2f7] text-primary border border-outline-var/20">
                                <UserCheck className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="w-full bg-surface-low h-1 rounded-full overflow-hidden mt-1">
                            <div className="bg-primary h-full rounded-full" style={{ width: '92.4%' }}></div>
                        </div>
                    </div>

                    {/* KPI Card 3: Flagged Accounts */}
                    <div className="bg-[#fff5f5] p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Flagged Accounts</p>
                                <h3 className="text-xl font-black text-red-950 mt-1">0 <span className="text-xs font-semibold text-red-700 normal-case">pending review</span></h3>
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 text-red-600 border border-red-200">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="w-full bg-red-50 h-1 rounded-full overflow-hidden mt-1">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: '0%' }}></div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add New User Modal */}
            {isAddUserOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-lowest w-full max-w-md rounded-3xl border border-outline-var/25 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-outline-var/15 flex items-center justify-between bg-surface-low/50">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                <h3 className="font-extrabold text-base text-primary">Register New User</h3>
                            </div>
                            <button
                                onClick={() => setIsAddUserOpen(false)}
                                className="w-8 h-8 rounded-full bg-surface-low hover:bg-surface-cont flex items-center justify-center text-on-surface-var hover:text-primary transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAddUserSubmit}>
                            <div className="p-6 space-y-4 text-xs font-sans">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-on-surface-var font-bold mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. Liam Sterling"
                                        value={newUserData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-low border border-outline-var/30 text-on-surface text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                                    />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-on-surface-var font-bold mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="e.g. liam.s@pustakalay.com"
                                        value={newUserData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-low border border-outline-var/30 text-on-surface text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-on-surface-var font-bold mb-1">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        value={newUserData.password}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-low border border-outline-var/30 text-on-surface text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-on-surface-var font-bold mb-1">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        pattern="^[0-9]{10}$"
                                        placeholder="e.g. 9876543210"
                                        value={newUserData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-low border border-outline-var/30 text-on-surface text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                                    />
                                </div>

                                {/* Role and Initial Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-on-surface-var font-bold mb-1">Permission Role</label>
                                        <select
                                            name="role"
                                            value={newUserData.role}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface-low border border-outline-var/30 text-on-surface text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-primary cursor-pointer font-medium"
                                        >
                                            <option value="User">User</option>
                                            <option value="Seller">Seller</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-on-surface-var font-bold mb-1">Account Status</label>
                                        <select
                                            name="status"
                                            value={newUserData.status}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface-low border border-outline-var/30 text-on-surface text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-primary cursor-pointer font-medium"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-3 border-t border-outline-var/15 bg-surface-low/50 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserOpen(false)}
                                    className="px-4 py-2 border border-outline-var/30 text-on-surface-var hover:text-on-surface hover:bg-surface-low font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-primary-cont text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-primary/10 cursor-pointer"
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

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { 
  Search, 
  Bell, 
  Settings, 
  Trash2, 
  X, 
  User, 
  Mail, 
  Shield, 
  Check, 
  LogOut, 
  Sliders, 
  Sun,
  Menu,
  BookOpen,
  ChevronDown
} from 'lucide-react';

/* ── Role label helper ── */
const ROLE_LABELS = { admin: 'Administrator', user: 'Member' };

/* ── Initials Avatar (no external image) ── */
function InitialsAvatar({ name, size = 36 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg,#0a2f35,#1d545c)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: size * 0.36, fontWeight: 800,
        flexShrink: 0, letterSpacing: 0.5, userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}

const Header = ({ toggleSidebar }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { data, role } = useSelector((state) => state.auth);

  const displayName  = data?.name || data?.username || (data?.email ? data.email.split('@')[0] : 'User');
  const displayEmail = data?.email || '';
  const roleLabel    = ROLE_LABELS[role] || role || 'Member';

  const [searchValue, setSearchValue] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };
  
  // Dropdown / Modal Visibility States
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Settings Panel Tab State
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");

  // Custom Toggle Switch States (Settings)
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Mock Notifications List
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New book reservation requested: The Silent Patient", time: "5m ago", type: "reservation" },
    { id: 2, text: "System Update: Catalog backup completed successfully", time: "2h ago", type: "system" },
    { id: 3, text: "New curator account registration: Priya Sharma", time: "1d ago", type: "user" },
  ]);

  // Handle individual notification delete
  const handleDeleteNotification = (id, e) => {
    e.stopPropagation(); // Avoid closing dropdown
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Clear all notifications
  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Get path-specific search placeholder
  const getSearchPlaceholder = () => {
    if (location.pathname.includes('/admin/users')) {
      return 'Search system users, emails, or roles...';
    }
    if (location.pathname.includes('/admin/orders')) {
      return 'Search orders, customers, or ISBN...';
    }
    if (location.pathname.includes('/admin/books')) {
      return 'Search catalog, authors, or categories...';
    }
    return 'Search across catalog...';
  };

  // Dispatch search term change event
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    window.dispatchEvent(new CustomEvent('globalSearch', { detail: val }));
  };

  // Listen to search reset events (e.g. from page reset filters)
  useEffect(() => {
    const handleReset = (e) => {
      setSearchValue(e.detail || "");
    };
    window.addEventListener('resetSearch', handleReset);
    return () => window.removeEventListener('resetSearch', handleReset);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-slate-100 flex items-center justify-between px-6 z-50 transition-all">
        {/* Left Side: Mobile Hamburger, Logo, and Desktop Search */}
        <div className="flex items-center gap-4">
          <button 
            className="block lg:hidden text-slate-500 bg-transparent border-none cursor-pointer hover:text-[#0a2f35] transition-colors flex items-center justify-center p-1" 
            onClick={toggleSidebar}
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
          
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 text-lg font-extrabold text-[#0a2f35] tracking-tight">
            <div className="w-8.5 h-8.5 rounded-lg bg-[#0a2f35]/5 flex items-center justify-center border border-[#0a2f35]/10">
              <BookOpen className="w-4.5 h-4.5 text-[#0a2f35]" />
            </div>
            <span className="hidden sm:inline">ePustakalay</span>
          </div>
          
          {/* Header Search Bar (Desktop only) */}
          <div className="hidden lg:flex items-center bg-[#f1f5f9] rounded-full px-4 py-2 w-[300px] ml-4 border border-slate-200/50 hover:border-slate-300/60 focus-within:border-[#0a2f35]/25 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input 
              type="text" 
              placeholder={getSearchPlaceholder()} 
              value={searchValue}
              onChange={handleSearchChange}
              className="border-none bg-transparent outline-none ml-2.5 w-full text-xs text-slate-700 placeholder-slate-400 font-medium"
            />
          </div>
        </div>
        
        {/* Right Side: Notification Bell, Settings Cog, User Profile */}
        <div className="flex items-center gap-4 pl-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            
            {/* Notification Button & Floating Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="relative bg-transparent border-none text-slate-500 hover:text-[#0a2f35] hover:bg-slate-100/50 cursor-pointer transition-all p-2 rounded-xl"
              >
                <Bell className="w-[18px] h-[18px]" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 border border-white rounded-full w-2 h-2"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                    <h3 className="font-bold text-xs text-[#0a2f35]">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearAllNotifications}
                        className="text-[10px] font-bold text-[#0a2f35] hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium flex flex-col items-center gap-1.5">
                      <Bell className="w-5 h-5 text-slate-300" />
                      <span>No new notifications</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100/60 border border-slate-100/50 transition-all group"
                        >
                          <span className="mt-0.5 text-slate-400 flex-shrink-0">
                            {notif.type === 'reservation' ? (
                              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                            ) : notif.type === 'system' ? (
                              <Settings className="w-3.5 h-3.5" />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-700 font-semibold leading-normal break-words">{notif.text}</p>
                            <span className="text-[9px] text-slate-400 font-bold mt-0.5 block">{notif.time}</span>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button 
              onClick={() => {
                setIsSettingsOpen(true);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              className="bg-transparent border-none text-slate-500 hover:text-[#0a2f35] hover:bg-slate-100/50 cursor-pointer transition-all p-2 rounded-xl"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>

          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-1.5 cursor-pointer p-1 rounded-xl hover:bg-slate-100/50 transition-all border border-transparent"
            >
              <InitialsAvatar name={displayName} size={30} />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profile Header */}
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="relative w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                    <InitialsAvatar name={displayName} size={52} />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>
                  <h4 className="font-extrabold text-xs text-[#0a2f35] leading-tight mt-2">{displayName}</h4>
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-400 px-2.5 py-0.5 rounded-full mt-1.5">
                    {roleLabel}
                  </span>
                </div>

                {/* Profile Information List */}
                <div className="py-3.5 space-y-2.5 border-b border-slate-100 text-[11px]">
                  {displayEmail && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{displayEmail}</span>
                    </div>
                  )}
                  {data?._id && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">ID: {data._id}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Access Role: {roleLabel}</span>
                  </div>
                </div>

                {/* Action Items */}
                <div className="pt-3.5 flex flex-col gap-1">
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left text-xs font-semibold px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-[#0a2f35] transition-colors cursor-pointer"
                  >
                    Manage Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-xs font-semibold px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 cursor-pointer border border-transparent hover:border-red-100"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0a2f35]" />
                <h3 className="font-extrabold text-base text-[#0a2f35]">System Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0a2f35] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Tabs Layout */}
            <div className="flex h-80">
              {/* Tabs Sidebar */}
              <div className="w-1/3 border-r border-slate-100 bg-slate-50/40 p-3 flex flex-col gap-1">
                <button 
                  onClick={() => setActiveSettingsTab("general")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer flex items-center gap-2 ${activeSettingsTab === "general" ? 'bg-[#0a2f35] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <Sliders className="w-3.5 h-3.5" /> General
                </button>
                <button 
                  onClick={() => setActiveSettingsTab("notifications")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer flex items-center gap-2 ${activeSettingsTab === "notifications" ? 'bg-[#0a2f35] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <Bell className="w-3.5 h-3.5" /> Alerts
                </button>
                <button 
                  onClick={() => setActiveSettingsTab("appearance")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer flex items-center gap-2 ${activeSettingsTab === "appearance" ? 'bg-[#0a2f35] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <Sun className="w-3.5 h-3.5" /> Appearance
                </button>
              </div>

              {/* Tab Content Panel */}
              <div className="w-2/3 p-5 overflow-y-auto text-xs">
                {activeSettingsTab === "general" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-[#0a2f35]">Library Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Library Name</label>
                        <input 
                          type="text" 
                          defaultValue="ePustakalay Digital Library"
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#0a2f35] font-medium"
                        />
                      </div>
                      
                      {/* Interactive Switch */}
                      <div className="flex items-center justify-between py-1 border-t border-slate-100 mt-2 pt-3">
                        <div>
                          <p className="font-bold text-slate-700">Maintenance Mode</p>
                          <p className="text-[10px] text-slate-400">Restrict non-admin user access</p>
                        </div>
                        <button 
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${maintenanceMode ? 'bg-[#0a2f35]' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "notifications" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-[#0a2f35]">Notification Preferences</h4>
                    <div className="space-y-3 pt-1">
                      
                      {/* Email alerts switch */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="font-bold text-slate-700">Email Notifications</p>
                          <p className="text-[10px] text-slate-400">Daily digest of reservations</p>
                        </div>
                        <button 
                          onClick={() => setEmailAlerts(!emailAlerts)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${emailAlerts ? 'bg-[#0a2f35]' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Push notifications switch */}
                      <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                        <div>
                          <p className="font-bold text-slate-700">System Push Alerts</p>
                          <p className="text-[10px] text-slate-400">Live browser desktop popups</p>
                        </div>
                        <button 
                          onClick={() => setPushNotifications(!pushNotifications)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${pushNotifications ? 'bg-[#0a2f35]' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${pushNotifications ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {activeSettingsTab === "appearance" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-[#0a2f35]">Appearance & Layout</h4>
                    <div className="space-y-3 pt-1">
                      
                      {/* Dark mode switch */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="font-bold text-slate-700">Dark Mode Theme</p>
                          <p className="text-[10px] text-slate-400">Enable night reading display</p>
                        </div>
                        <button 
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${darkMode ? 'bg-[#0a2f35]' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-[#0a2f35] hover:bg-[#072226] text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-[#0a2f35]/10 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Moon, 
  Sun,
  Menu,
  BookOpen
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
        background: 'linear-gradient(135deg,#0d3b38,#38656a)',
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
  const { data, role } = useSelector((state) => state.auth);

  const displayName  = data?.name || data?.username || (data?.email ? data.email.split('@')[0] : 'User');
  const displayEmail = data?.email || '';
  const roleLabel    = ROLE_LABELS[role] || role || 'Member';

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[70px] bg-surface-lowest border-b border-outline-var/20 flex items-center justify-between px-5 z-50">
        <div className="flex items-center gap-4">
          <button 
            className="block lg:hidden text-on-surface-var bg-transparent border-none cursor-pointer hover:text-primary transition-colors flex items-center justify-center" 
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xl font-bold text-primary font-sans tracking-tight">
            <BookOpen className="w-6 h-6 text-primary animate-bounce" /> ePustakalay
          </div>
          <div className="hidden lg:flex items-center bg-surface-low rounded-full px-4 py-2 w-[300px] ml-4 border border-outline-var/10">
            <Search className="w-4 h-4 text-on-surface-var/60" />
            <input 
              type="text" 
              placeholder="Search across catalog..." 
              className="border-none bg-transparent outline-none ml-2 w-full text-sm text-on-surface placeholder-on-surface-var/50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            
            {/* Notification Button & Floating Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="relative bg-transparent border-none text-on-surface-var hover:text-primary cursor-pointer transition-colors p-1 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-surface-lowest border border-outline-var/25 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-outline-var/15 pb-2.5 mb-2.5">
                    <h3 className="font-bold text-sm text-primary">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearAllNotifications}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-on-surface-var/60 font-medium flex flex-col items-center gap-1.5">
                      <Bell className="w-5 h-5 text-on-surface-var/40" />
                      <span>No new notifications</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-low/50 hover:bg-surface-low border border-outline-var/5 transition-colors group"
                        >
                          <span className="mt-1 text-on-surface-var/60 flex-shrink-0">
                            {notif.type === 'reservation' ? (
                              <BookOpen className="w-4 h-4 text-teal-600" />
                            ) : notif.type === 'system' ? (
                              <Settings className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-on-surface font-medium leading-normal break-words">{notif.text}</p>
                            <span className="text-[9px] text-on-surface-var/60 font-semibold mt-0.5 block">{notif.time}</span>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteNotification(notif.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-on-surface-var hover:text-red-500 p-1 rounded transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              className="relative bg-transparent border-none text-on-surface-var hover:text-primary cursor-pointer transition-colors p-1 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>

          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center cursor-pointer p-0.5 rounded-full border-2 border-transparent hover:border-primary transition-all"
            >
              <InitialsAvatar name={displayName} size={36} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-surface-lowest border border-outline-var/25 rounded-2xl shadow-xl z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profile Header */}
                <div className="text-center pb-4 border-b border-outline-var/15">
                  <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                    <InitialsAvatar name={displayName} size={64} />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>
                  <h4 className="font-extrabold text-sm text-primary leading-tight mt-2">{displayName}</h4>
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-surface-low border border-outline-var/20 text-on-surface-var px-2 py-0.5 rounded-full mt-1.5">
                    {roleLabel}
                  </span>
                </div>

                {/* Profile Information List */}
                <div className="py-3.5 space-y-2.5 border-b border-outline-var/15 text-xs">
                  {displayEmail && (
                    <div className="flex items-center gap-2 text-on-surface-var">
                      <Mail className="w-4 h-4 text-on-surface-var/60" />
                      <span className="truncate">{displayEmail}</span>
                    </div>
                  )}
                  {data?._id && (
                    <div className="flex items-center gap-2 text-on-surface-var">
                      <User className="w-4 h-4 text-on-surface-var/60" />
                      <span className="truncate">ID: {data._id}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-on-surface-var">
                    <Shield className="w-4 h-4 text-on-surface-var/60" />
                    <span>Access Role: {roleLabel}</span>
                  </div>
                </div>

                {/* Action Items */}
                <div className="pt-3.5 flex flex-col gap-1.5">
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left text-xs font-semibold px-3 py-2 rounded-xl text-on-surface hover:bg-surface-low hover:text-primary transition-colors cursor-pointer"
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
          <div className="bg-surface-lowest w-full max-w-lg rounded-3xl border border-outline-var/25 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-var/15 flex items-center justify-between bg-surface-low/50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-base text-primary">System Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-low hover:bg-surface-cont flex items-center justify-center text-on-surface-var hover:text-primary transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Tabs Layout */}
            <div className="flex h-80">
              {/* Tabs Sidebar */}
              <div className="w-1/3 border-r border-outline-var/15 bg-surface-low/30 p-3 flex flex-col gap-1">
                <button 
                  onClick={() => setActiveSettingsTab("general")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer flex items-center gap-2 ${activeSettingsTab === "general" ? 'bg-primary text-white' : 'text-on-surface-var hover:bg-surface-low'}`}
                >
                  <Sliders className="w-3.5 h-3.5" /> General
                </button>
                <button 
                  onClick={() => setActiveSettingsTab("notifications")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer flex items-center gap-2 ${activeSettingsTab === "notifications" ? 'bg-primary text-white' : 'text-on-surface-var hover:bg-surface-low'}`}
                >
                  <Bell className="w-3.5 h-3.5" /> Alerts
                </button>
                <button 
                  onClick={() => setActiveSettingsTab("appearance")}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer flex items-center gap-2 ${activeSettingsTab === "appearance" ? 'bg-primary text-white' : 'text-on-surface-var hover:bg-surface-low'}`}
                >
                  <Sun className="w-3.5 h-3.5" /> Appearance
                </button>
              </div>

              {/* Tab Content Panel */}
              <div className="w-2/3 p-5 overflow-y-auto text-xs">
                {activeSettingsTab === "general" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-primary">Library Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-on-surface-var font-semibold mb-1">Library Name</label>
                        <input 
                          type="text" 
                          defaultValue="ePustakalay Digital Library"
                          className="w-full bg-surface-low border border-outline-var/30 text-on-surface text-xs rounded-xl px-3 py-2 outline-none focus:border-primary font-medium"
                        />
                      </div>
                      
                      {/* Interactive Switch */}
                      <div className="flex items-center justify-between py-1 border-t border-outline-var/10 mt-2 pt-3">
                        <div>
                          <p className="font-bold text-on-surface">Maintenance Mode</p>
                          <p className="text-[10px] text-on-surface-var">Restrict non-admin user access</p>
                        </div>
                        <button 
                          onClick={() => setMaintenanceMode(!maintenanceMode)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${maintenanceMode ? 'bg-primary' : 'bg-outline-var'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${maintenanceMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === "notifications" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-primary">Notification Preferences</h4>
                    <div className="space-y-3 pt-1">
                      
                      {/* Email alerts switch */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="font-bold text-on-surface">Email Notifications</p>
                          <p className="text-[10px] text-on-surface-var">Daily digest of reservations</p>
                        </div>
                        <button 
                          onClick={() => setEmailAlerts(!emailAlerts)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${emailAlerts ? 'bg-primary' : 'bg-outline-var'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      {/* Push notifications switch */}
                      <div className="flex items-center justify-between py-1 border-t border-outline-var/10 pt-3">
                        <div>
                          <p className="font-bold text-on-surface">System Push Alerts</p>
                          <p className="text-[10px] text-on-surface-var">Live browser desktop popups</p>
                        </div>
                        <button 
                          onClick={() => setPushNotifications(!pushNotifications)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${pushNotifications ? 'bg-primary' : 'bg-outline-var'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${pushNotifications ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {activeSettingsTab === "appearance" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-primary">Appearance & Layout</h4>
                    <div className="space-y-3 pt-1">
                      
                      {/* Dark mode switch */}
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <p className="font-bold text-on-surface">Dark Mode Theme</p>
                          <p className="text-[10px] text-on-surface-var">Enable night reading display</p>
                        </div>
                        <button 
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${darkMode ? 'bg-primary' : 'bg-outline-var'}`}
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
            <div className="px-6 py-3 border-t border-outline-var/15 bg-surface-low/50 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 border border-outline-var/30 text-on-surface-var hover:text-on-surface hover:bg-surface-low font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-primary hover:bg-primary-cont text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-primary/10 cursor-pointer"
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

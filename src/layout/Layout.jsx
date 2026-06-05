import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/sidebar';

const Layout = ({ children, activeNav, setActiveNav }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden relative bg-[#f8fafc] text-[#1e293b] font-sans">
      {/* Top Header - fixed full-width */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 relative mt-[70px]">
        {/* Left Sidebar - sits below Header */}
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-[260px]">
          <div className="p-5 md:p-8 w-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/sidebar';

const Layout = ({ children, activeNav, setActiveNav }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden relative bg-surface text-on-surface font-sans">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 relative mt-[70px]">
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
        />

        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-[260px]">
          <div className="p-5 w-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

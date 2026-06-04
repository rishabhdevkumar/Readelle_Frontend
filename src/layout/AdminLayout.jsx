import React from 'react';
import Layout from './Layout';

const AdminLayout = ({ children, activeNav, setActiveNav }) => {
  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
      {children}
    </Layout>
  );
};

export default AdminLayout;

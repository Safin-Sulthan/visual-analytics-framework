import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="page-container">{children}</div>
      </main>
    </div>
  </div>
);

export default Layout;

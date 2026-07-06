import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => (
  <div className="nm-app">
    <Sidebar />
    <div className="nm-content-area">
      <Header />
      <main className="nm-main">
        {children ?? <Outlet />}
      </main>
    </div>
  </div>
);

export default Layout;

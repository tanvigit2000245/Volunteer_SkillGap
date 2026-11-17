
import React from 'react';

import Sidebar from './Sidebar.jsx';
import DashboardHeader from './DashboardHeader.jsx';
import Toast from './Toast.jsx';

const DashboardLayout = ({
  sidebarProps,
  headerProps,
  toast,
  onToastClose,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex p-4 sm:p-5 lg:p-6">

      {/* Sidebar */}
      <Sidebar {...sidebarProps} />

      {/* Main Dashboard Content */}
      <main className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Header */}
        <DashboardHeader {...headerProps} />

        {/* Dashboard Tabs / Page Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

      </main>

      {/* Toast Notifications */}
      <Toast
        toast={toast}
        onClose={onToastClose}
      />

    </div>
  );
};

export default DashboardLayout;

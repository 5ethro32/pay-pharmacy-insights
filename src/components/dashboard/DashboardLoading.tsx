
import React from "react";

const DashboardLoading: React.FC = () => {
  return (
    <div className="h-60 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
    </div>
  );
};

export default DashboardLoading;

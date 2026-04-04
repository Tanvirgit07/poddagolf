import Navbar from "@/components/navbar/Navbar";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}

export default layout;

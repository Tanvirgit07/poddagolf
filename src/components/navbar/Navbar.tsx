"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="w-full bg-[#F5F2EB] border-b border-[#7D7D7D]"
    >
      <div className="max-w-6xl mx-auto h-[80px] flex items-center justify-between">
        {/* Logo */}
        <span className="text-[32px] font-bold tracking-tight text-gray-900 select-none">
          Logo
        </span>

        {/* Right side nav items */}
        <div className="flex items-center gap-6">
          {/* About */}
          {/* <a
            href="#" 
            className="text-[20px] text-[#121212] hover:text-gray-900 transition-colors duration-150"
          >
            About
          </a>  */}

          {/* History */}
          <Link
            href="/history"
            className={`text-[20px] transition-colors duration-150 ${
              pathname === "/history"
                ? "text-blue-600"
                : "text-[#121212] hover:text-gray-900"
            }`}
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

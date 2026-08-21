import React from "react";
import StudyNotion from "../../assets/Logo.svg";
import {
  ChevronDown,
  Search,
  ShoppingCart,
} from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full bg-[#161D29] border-b border-[#2C333F] font-normal text-base text-[#DBDDEA]">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-30 py-3">

        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={StudyNotion}
            alt="StudyNotion"
            className="w-32 sm:w-36 lg:w-40 h-8 cursor-pointer"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex">
          <ul className="flex items-center cursor-pointer">
            <li className="px-3 py-1">Home</li>

            <li className="flex items-center gap-1 px-3 py-1 text-[#FFD60A]">
              Catalog
              <ChevronDown size={18} />
            </li>

            <li className="px-3 py-1">About Us</li>
            <li className="px-3 py-1">Contact Us</li>
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-5">
          <Search size={20} className="cursor-pointer" />
          <ShoppingCart size={20} className="cursor-pointer" />

          <button className="border border-[#2C333F] px-3 py-2 rounded cursor-pointer">
            Sign Up
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-4">
          <Search
            size={20}
            strokeWidth={1.5}
            className="cursor-pointer"
          />

          <ShoppingCart
            size={20}
            strokeWidth={1.5}
            className="cursor-pointer"
          />

          {/* Profile */}
          <img
            src="YOUR_PROFILE_IMAGE"
            alt="Profile"
            className="w-7 h-7 rounded-full object-cover cursor-pointer"
          />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
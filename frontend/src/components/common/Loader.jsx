import React from "react";

const Loader = ({ text = "Please wait..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000814]/60 backdrop-blur-sm">
      {/* Spinner */}
      <div className="h-12 w-12 rounded-full border-4 border-[#2C333F] border-t-[#FFD60A] animate-spin" />
      
      {/* Optional helper text */}
      {text && (
        <p className="mt-4 text-sm font-medium tracking-wide text-[#AFB2BF]">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
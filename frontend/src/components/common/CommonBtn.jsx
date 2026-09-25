import React from "react";

const CommonBtn = ({
  label = "Click Me",
  onClick,
  type = "button",
  bgColor = "bg-[#FFD60A]",
  textColor = "text-[#000814]",
  hoverColor = "hover:bg-[#f5cc00]",
  className = ""
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`mt-6 w-full rounded-lg ${bgColor} p-3 font-semibold ${textColor} 
                  shadow-[inset_-0.5px_-1.5px_0px_rgba(0,0,0,0.12)] 
                  transition ${hoverColor} active:scale-[0.99] ${className} cursor-pointer`}
    >
      {label}
    </button>
  );
};

export default CommonBtn;

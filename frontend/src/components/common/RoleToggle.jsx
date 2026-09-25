import React from "react";

const RoleToggle = ({ options = [], selected, onChange }) => {
  return (
    <div className="mt-6 flex w-fit max-w-full items-center rounded-full border-2 border-[#2C333F] bg-[#161D29] p-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center justify-center rounded-full px-4 py-1.5 font-['Inter'] text-[15px] font-bold leading-6 transition-all duration-200 sm:px-[18px] sm:text-[16px] cursor-pointer  ${
            selected === opt.value
              ? "bg-[#000814] text-[#F1F2FF]"
              : "bg-transparent text-[#838894]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default RoleToggle;

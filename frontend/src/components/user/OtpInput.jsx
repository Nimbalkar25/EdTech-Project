import React, { useRef, useState } from "react";

const OtpInput = ({ length = 6, onOtpSubmit }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    const digit = value.replace(/\D/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length && onOtpSubmit) {
      onOtpSubmit(combinedOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === length && onOtpSubmit) {
      onOtpSubmit(pastedData);
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-1 xs:gap-1.5 sm:gap-2 md:gap-3">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          placeholder="-"
          ref={(el) => (inputRefs.current[index] = el)}
          value={data}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onClick={(e) => e.target.select()}
          onPaste={handlePaste}
          className="aspect-square flex-1 min-w-0 max-w-[52px] rounded-md focus:placeholder-transparent bg-[#161D29] text-center text-base sm:text-xl font-semibold text-white outline-none border border-[#2C333F] focus:border-[#FFD60A] focus:ring-1 focus:ring-[#FFD60A] transition p-0"
        />
      ))}
    </div>
  );
};

export default OtpInput;
import { ChevronDown, Eye } from "lucide-react";
import React, { useState } from "react";
import frame22 from "../../assets/Frame 22.png";
import frame23 from "../../assets/Frame 23.png";

const Signup = () => {
  const [role, setRole] = useState("student");

  return (
    <div className="min-h-screen w-full bg-[#000814] font-['Inter'] ">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:flex-row lg:items-start lg:gap-12 lg:px-12 lg:py-16 xl:gap-40 xl:px-20">

        {/* ================= LEFT / FORM ================= */}
        <div className="w-full lg:w-1/2 lg:max-w-[560px]">

          {/* Heading */}
          <div className="flex w-full flex-col gap-3">
            <h1 className="text-[26px] font-semibold leading-[34px] text-[#F1F2FF] sm:text-[28px] sm:leading-[36px] lg:text-[30px] lg:leading-[38px]">
              Join the millions learning to code with StudyNotion for free
            </h1>

            <p className="text-[16px] font-normal leading-6 text-[rgba(175,178,191,1)] sm:text-[17px] lg:text-[18px] lg:leading-[26px]">
              Build skills for today, tomorrow, and beyond.{" "}
              <span className="font-['Edu_SA_Beginner'] text-[15px] font-bold leading-6 text-[rgba(71,165,197,1)] sm:text-[16px]">
                Education to future-proof your career.
              </span>
            </p>
          </div>

          {/* ================= ROLE TOGGLE ================= */}
          <div className="mt-6 flex w-fit max-w-full items-center rounded-full border-2 border-[#2C333F] bg-[#161D29] p-2">

            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center rounded-full px-4 py-1.5 font-['Inter'] text-[15px] font-bold leading-6 transition-all duration-200 sm:px-[18px] sm:text-[16px] ${
                role === "student"
                  ? "bg-[#000814] text-[#F1F2FF]"
                  : "bg-transparent text-[#838894]"
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setRole("instructor")}
              className={`flex items-center justify-center rounded-full px-4 py-1.5 font-['Inter'] text-[15px] font-bold leading-6 transition-all duration-200 sm:px-[18px] sm:text-[16px] ${
                role === "instructor"
                  ? "bg-[#000814] text-[#F1F2FF]"
                  : "bg-transparent text-[#838894]"
              }`}
            >
              Instructor
            </button>

          </div>

          {/* ================= FORM ================= */}
          <div className="mt-6 w-full space-y-5">

            {/* First + Last Name */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">

              <div className="min-w-0">
                <label className="mb-2 block text-[14px] leading-[22px] text-[#F1F2FF]">
                  First Name <span className="text-[#FF0066]">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter first name"
                  className="box-border w-full rounded-md bg-[#161D29] px-3 py-2.5 text-[14px] leading-[22px] text-[#F1F2FF] outline-none placeholder:text-[#838894] focus:ring-1 focus:ring-[#FFD60A]"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-[14px] leading-[22px] text-[#F1F2FF]">
                  Last Name <span className="text-[#FF0066]">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter last name"
                  className="box-border w-full rounded-md bg-[#161D29] px-3 py-2.5 text-[14px] leading-[22px] text-[#F1F2FF] outline-none placeholder:text-[#838894] focus:ring-1 focus:ring-[#FFD60A]"
                />
              </div>

            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-[14px] leading-[22px] text-[#F1F2FF]">
                Email Address <span className="text-[#FF0066]">*</span>
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                className="box-border w-full rounded-md bg-[#161D29] px-3 py-2.5 text-[14px] leading-[22px] text-[#F1F2FF] outline-none placeholder:text-[#838894] focus:ring-1 focus:ring-[#FFD60A]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-[14px] leading-[22px] text-[#F1F2FF]">
                Phone Number <span className="text-[#FF0066]">*</span>
              </label>

              <div className="flex w-full gap-3 sm:gap-4">

                <button
                  type="button"
                  className="flex w-[70px] shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#161D29] px-2.5 py-2.5 text-[14px] leading-[22px] text-[#838894]"
                >
                  +91
                  <ChevronDown size={16} />
                </button>

                <input
                  type="tel"
                  placeholder="12345 67890"
                  className="box-border min-w-0 flex-1 rounded-md bg-[#161D29] px-3 py-2.5 text-[14px] leading-[22px] text-[#F1F2FF] outline-none placeholder:text-[#838894] focus:ring-1 focus:ring-[#FFD60A]"
                />

              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">

              {/* Create Password */}
              <div className="min-w-0">
                <label className="mb-2 block text-[14px] leading-[22px] text-[#F1F2FF]">
                  Create Password{" "}
                  <span className="text-[#FF0066]">*</span>
                </label>

                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="box-border w-full rounded-md bg-[#161D29] px-3 py-2.5 pr-10 text-[14px] leading-[22px] text-[#F1F2FF] outline-none placeholder:text-[#838894] focus:ring-1 focus:ring-[#FFD60A]"
                  />

                  <Eye
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838894]"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="min-w-0">
                <label className="mb-2 block text-[14px] leading-[22px] text-[#F1F2FF]">
                  Confirm Password{" "}
                  <span className="text-[#FF0066]">*</span>
                </label>

                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="box-border w-full rounded-md bg-[#161D29] px-3 py-2.5 pr-10 text-[14px] leading-[22px] text-[#F1F2FF] outline-none placeholder:text-[#838894] focus:ring-1 focus:ring-[#FFD60A]"
                  />

                  <Eye
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838894]"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ================= BUTTON ================= */}
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-[#FFD60A] p-3 font-semibold text-[#000814] shadow-[inset_-0.5px_-1.5px_0px_rgba(0,0,0,0.12)] transition hover:bg-[#f5cc00] active:scale-[0.99]"
          >
            Create Account
          </button>
        </div>

        {/* ================= RIGHT IMAGE ================= */}
        <div className="relative hidden w-full items-center justify-center md:max-w-[330px] lg:flex xl:w-1/2 xl:max-w-[500px]">

          {/* Main frame */}
          <img
            src={frame23}
            alt="StudyNotion"
            className="h-auto w-full max-w-[450px] object-contain"
          />

          {/* People frame */}
          <img
            src={frame22}
            alt="People learning"
            className="absolute xl:bottom-[6%] right-[10%] md:bottom-[10%] md:right-[10%] md:w-[95%] xl:w-[90%] object-contain"
          />

        </div>

      </div>
    </div>
  );
};

export default Signup;
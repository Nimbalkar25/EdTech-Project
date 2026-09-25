import React, { useState, useEffect } from "react";
import HeadingSection from "./HeadingSection";
import RoleToggle from "./RoleToggle";
import CommonBtn from "./CommonBtn";
import CommonImage from "./CommonImage";
import Loader from "./Loader";
import VerifyMail from "../user/VerifyMail";
import frame22 from "../../assets/Frame 22.png";
import { toast } from "react-toastify";
import { endpoints } from "../../utils/api";
import { apiConnector } from "../../utils/apiConnector";
import { Link } from "react-router-dom";
import { isValidName, isValidEmail, isValidPhone } from "../../utils/regex";
import { EyeClosed, EyeIcon, Info } from "lucide-react";

const Signup = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [role, setRole] = useState("Student");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Dynamic countdown in seconds
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);

  const [formData, setFormData] = useState({
    role: "Student",
    firstName: "",
    lastName: "",
    email: "",
    countrycode: "+91",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Dynamic 1-second countdown interval
  useEffect(() => {
    if (cooldown <= 0) {
      setRateLimitMsg("");
      return;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const roleOptions = [
    { value: "Student", label: "Student" },
    { value: "Instructor", label: "Instructor" },
  ];

  const validateField = (name, value) => {
    const trimmed = (value || "").trim();
    switch (name) {
      case "firstName":
        if (!trimmed) return "First name is required";
        if (!isValidName(trimmed)) return "Name must only contain letters (min 2 characters)";
        return "";
      case "lastName":
        if (!trimmed) return "Last name is required";
        if (!isValidName(trimmed)) return "Last name must only contain letters (min 2 characters)";
        return "";
      case "email":
        if (!trimmed) return "Email address is required";
        if (!isValidEmail(trimmed)) return "Please enter a valid email format";
        return "";
      case "phoneNumber":
        if (!trimmed) return "Phone number is required";
        if (!isValidPhone(trimmed)) return "Please enter a valid 10-digit mobile number (starts with 6-9)";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData((prev) => ({ ...prev, role: newRole }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const cleanNumber = e.target.value.replace(/\D/g, "");
    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    if (cleanNumber.length <= 10) {
      setFormData((prev) => ({ ...prev, phoneNumber: cleanNumber }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cooldown > 0) {
      toast.warning(`Too many attempts. Please wait ${cooldown}s before retrying.`);
      return;
    }

    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      phoneNumber: validateField("phoneNumber", formData.phoneNumber),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((msg) => msg !== "")) return;
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await apiConnector("POST", endpoints.SIGNUP_API, {
        ...formData,
        email: formData.email.trim(),
      });

      if (response?.data?.success) {
        toast.success(response.data.message || "OTP sent successfully.");
        const emailFromApi =
          response?.data?.data?.email || response?.data?.email || formData.email;
        setRegisteredEmail(emailFromApi);
        setIsOtpSent(true);
      } else {
        toast.error(response?.data?.message || "Registration Failed.");
      }
    } catch (error) {
      console.error("Signup Error:", error);

      // Handle 429 Rate Limiting with dynamic backend values
      if (error?.response?.status === 429) {
        const retrySeconds = error.response?.data?.retryAfter || 300;
        const serverMessage =
          error.response?.data?.message ||
          `Too many registration attempts. Please wait ${retrySeconds}s before retrying.`;

        setCooldown(retrySeconds);
        setRateLimitMsg(serverMessage);
        toast.error(serverMessage, { autoClose: 5000 });
      } else {
        toast.error(
          error?.response?.data?.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClasses = (hasError) => `
    w-full rounded-md bg-[#161D29] px-3 py-2.5 text-white outline-none 
    placeholder:text-[#838894] transition-all
    ${hasError ? "border border-red-500 ring-1 ring-red-500" : "border border-transparent focus:ring-1 focus:ring-[#FFD60A]"}
  `;

  return (
    <div
      className={`w-full bg-[#000814] font-['Inter'] flex flex-col ${
        isOtpSent
          ? "min-h-[calc(100dvh-57px)] md:min-h-[calc(100dvh-111px)] lg:min-h-[calc(100vh-111px)] items-center justify-center px-4 sm:px-6 md:px-8 py-4 md:py-0 overflow-y-auto md:overflow-y-hidden"
          : "min-h-[calc(100dvh-57px)] md:min-h-[calc(100dvh-111px)] lg:min-h-[calc(100vh-111px)]"
      }`}
    >
      {loading && <Loader text="Creating your account..." />}

      <div
        className={`mx-auto flex w-full max-w-[1440px] flex-col ${
          isOtpSent
            ? "items-center justify-center my-auto"
            : "gap-10 px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:flex-row lg:items-start lg:justify-between lg:gap-12 lg:px-12 lg:py-16 xl:gap-20 xl:px-20"
        }`}
      >
        {/* Left Side / Centered Card */}
        <div
          className={`w-full ${
            isOtpSent
              ? "max-w-[420px] sm:max-w-[480px] mx-auto px-4 sm:px-0"
              : "max-w-[520px] mx-auto lg:mx-0 lg:w-[45%]"
          }`}
        >
          {isOtpSent ? (
            <VerifyMail
              email={registeredEmail}
              onBack={() => setIsOtpSent(false)}
            />
          ) : (
            <>
              <HeadingSection
                title="Join the millions learning to code with StudyNotion for free"
                description="Build skills for today, tomorrow, and beyond."
                highlight="Education to future-proof your career."
              />

              <div className="mt-6">
                <RoleToggle
                  options={roleOptions}
                  selected={role}
                  onChange={handleRoleChange}
                />
              </div>

              <form onSubmit={handleSubmit} className="mt-6 w-full space-y-5">
                {/* First Name + Last Name */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                  <label className="flex min-w-0 flex-col gap-1">
                    <span className="text-[14px] text-[#F1F2FF]">
                      First Name <span className="text-[#FF0066]">*</span>
                    </span>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses(errors.firstName)}
                    />
                    {errors.firstName && (
                      <span className="text-[12px] text-red-400 mt-0.5">
                        {errors.firstName}
                      </span>
                    )}
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span className="text-[14px] text-[#F1F2FF]">
                      Last Name <span className="text-[#FF0066]">*</span>
                    </span>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClasses(errors.lastName)}
                    />
                    {errors.lastName && (
                      <span className="text-[12px] text-red-400 mt-0.5">
                        {errors.lastName}
                      </span>
                    )}
                  </label>
                </div>

                {/* Email */}
                <label className="flex flex-col gap-1">
                  <span className="text-[14px] text-[#F1F2FF]">
                    Email Address <span className="text-[#FF0066]">*</span>
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses(errors.email)}
                  />
                  {errors.email && (
                    <span className="text-[12px] text-red-400 mt-0.5">
                      {errors.email}
                    </span>
                  )}
                </label>

                {/* Phone */}
                <label className="flex flex-col gap-1">
                  <span className="text-[14px] text-[#F1F2FF]">
                    Phone Number <span className="text-[#FF0066]">*</span>
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="phoneNumber"
                    placeholder="10-digit mobile number"
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    className={getInputClasses(errors.phoneNumber)}
                  />
                  {errors.phoneNumber && (
                    <span className="text-[12px] text-red-400 mt-0.5">
                      {errors.phoneNumber}
                    </span>
                  )}
                </label>

                {/* Passwords */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                  <div className="relative flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] text-[#F1F2FF]">
                        Create Password <span className="text-[#FF0066]">*</span>
                      </span>
                      <div className="group relative flex items-center">
                        <Info className="size-4 fill-[rgba(55,73,87,1)] text-[#838894] hover:text-[#FFD60A] transition cursor-pointer" />
                        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-12 left-0 z-50 w-[270px] rounded-md bg-[#161D29] border border-amber-500/60 px-2.5 py-1.5 text-[11px] leading-snug text-[#AFB2BF] shadow-lg backdrop-blur-md pointer-events-none">
                          Password must contain at least 1 uppercase, 1 lowercase, 1 number, and be 8+ characters.
                        </div>
                      </div>
                    </div>

                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full rounded-md bg-[#161D29] px-3 py-2.5 pr-10 text-white outline-none placeholder:text-[#838894] border border-transparent focus:ring-1 focus:ring-[#FFD60A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838894] hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeIcon className="size-5" /> : <EyeClosed className="size-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative flex min-w-0 flex-col gap-1">
                    <span className="text-[14px] text-[#F1F2FF]">
                      Confirm Password <span className="text-[#FF0066]">*</span>
                    </span>
                    <div className="relative w-full">
                      <input
                        type={showConPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-md bg-[#161D29] px-3 py-2.5 pr-10 text-white outline-none placeholder:text-[#838894] border border-transparent focus:ring-1 focus:ring-[#FFD60A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838894] hover:text-white cursor-pointer"
                      >
                        {showConPassword ? <EyeIcon className="size-5" /> : <EyeClosed className="size-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rate Limit Live Cooldown Notice */}
                {cooldown > 0 && (
                  <div className="p-3 bg-red-900/40 border border-red-500 rounded text-red-300 text-xs text-center animate-pulse">
                    {rateLimitMsg || `Too many registration requests. Please wait ${cooldown}s before trying again.`}
                  </div>
                )}

                <div className="pt-2">
                  <CommonBtn
                    type="submit"
                    label={cooldown > 0 ? `Wait ${cooldown}s` : "Create Account"}
                    disabled={loading || cooldown > 0}
                  />
                </div>
              </form>

              <p className="text-sm text-gray-400 mt-4 text-center lg:text-left">
                Already have an account?{" "}
                <Link to="/login" className="text-[rgba(71,165,197,1)] hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Right Section - Completely hidden when isOtpSent is true */}
        {!isOtpSent && (
          <div className="hidden lg:flex flex-1 items-center justify-center ">
            <CommonImage image={frame22} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
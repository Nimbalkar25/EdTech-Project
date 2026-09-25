import React, { useState, useEffect } from "react";
import HeadingSection from "../common/HeadingSection";
import CommonBtn from "../common/CommonBtn";
import Loader from "../common/Loader";
import { ArrowLeft } from "lucide-react";
import { apiConnector } from "../../utils/apiConnector";
import { endpoints } from "../../utils/api";
import { toast } from "react-toastify";
import { Link, Navigate, useNavigate } from "react-router-dom";

const ResetPasswordLink = ({ onBack, initialEmail = "" }) => {
  const [formData, setFormData] = useState({
    email: initialEmail || "",
  });
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Dynamic 1-second countdown for rate limiting
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cooldown > 0) {
      toast.warning(`Please wait ${cooldown}s before requesting again.`);
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      // Calls router.post("/reset-passwordlink", resetLinkLimiter, resetPasswordLink)
      const response = await apiConnector(
        "POST",
        endpoints.RESET_PASSWORD_LINK_API,
        { email: formData.email.trim().toLowerCase() }
      );

      if (response?.data?.success) {
        toast.success(response.data.message || "Reset link sent to your email!");
        setEmailSent(true);

      } else {
        toast.error(response?.data?.message || "Failed to send reset link.");
      }
    } catch (error) {
      console.error("Reset Password Link Error:", error);

      // 429 Rate limiter response from backend
      if (error?.response?.status === 429) {
        const retrySeconds = error.response?.data?.retryAfter || 600;
        const serverMessage =
          error.response?.data?.message ||
          `Too many reset requests. Please wait ${retrySeconds}s before retrying.`;

        setCooldown(retrySeconds);
        setRateLimitMsg(serverMessage);
        toast.error(serverMessage, { autoClose: 5000 });
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Unable to send reset email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 font-['Inter']">
      {loading && <Loader text="Sending reset link..." />}

      <HeadingSection
        title={emailSent ? "Check your email" : "Reset your Password"}
        description={
          emailSent
            ? `We have sent the reset instructions to ${formData.email}. Please check your inbox and spam folder.`
            : "Have no fear. We’ll email you instructions to reset your password. If you don't have access to your email, we can try account recovery."
        }
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!emailSent && (
          <div>
            <label className="text-sm text-white">
              Email Address <span className="text-[rgba(239,71,111,1)]">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || cooldown > 0}
              className="w-full mt-2 rounded-md bg-[#161D29] px-3 py-2 text-white placeholder:text-gray-400 focus:ring-1 focus:ring-yellow-400 outline-none border border-transparent transition"
            />
          </div>
        )}

        {/* Dynamic Rate Limit Notice */}
        {cooldown > 0 && (
          <div className="p-3 bg-red-900/40 border border-red-500 rounded text-red-300 text-xs text-center animate-pulse">
            {rateLimitMsg || `Please wait ${cooldown}s before trying again.`}
          </div>
        )}

        <div className="pt-2">
          <CommonBtn
            type="submit"
            label={
              cooldown > 0
                ? `Wait ${cooldown}s`
                : emailSent
                ? "Resend Email"
                : "Reset Password"
            }
            disabled={loading || cooldown > 0}
          />
        </div>
      </form>

      {/* Back to Login */}
      <div className="flex items-center text-sm text-[#AFB2BF]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 hover:text-white transition cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 hover:text-white transition"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordLink;
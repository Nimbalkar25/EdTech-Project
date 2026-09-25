import React, { useState, useEffect } from "react";
import HeadingSection from "../common/HeadingSection";
import CommonBtn from "../common/CommonBtn";
import OtpInput from "./OtpInput";
import Loader from "../common/Loader";
import { toast } from "react-toastify";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { apiConnector } from "../../utils/apiConnector";
import { endpoints } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const VerifyMail = ({ email, onBack }) => {
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState(0); // Dynamic verification lockout
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0); // OTP resend throttle timer

  const navigate = useNavigate();

  // Active countdown timer for verification rate-limit lockout
  useEffect(() => {
    if (verifyCooldown <= 0) {
      setRateLimitMsg("");
      return;
    }

    const timer = setInterval(() => {
      setVerifyCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [verifyCooldown]);

  // Active countdown timer for Resend button throttle
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (verifyCooldown > 0) {
      toast.warning(`Too many attempts. Please wait ${verifyCooldown}s before trying again.`);
      return;
    }

    if (!otpValue || otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await apiConnector("POST", endpoints.VERIFY_EMAIL_API, {
        email: email?.trim(),
        otp: otpValue.trim(),
      });

      if (response?.data?.success) {
        toast.success(response?.data?.message || "Email verified successfully!");

        navigate("/dashboard");
      } else {
        toast.error(response?.data?.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification Error:", error);

      if (error?.response?.status === 429) {
        const retrySeconds = error.response?.data?.retryAfter || 60;
        const serverMessage =
          error.response?.data?.message ||
          `Too many verification attempts. Please wait ${retrySeconds}s before retrying.`;

        setVerifyCooldown(retrySeconds);
        setRateLimitMsg(serverMessage);
        toast.error(serverMessage, { autoClose: 5000 });
      } else {
        const errorMsg =
          error?.response?.data?.message ||
          "Invalid OTP. Please check the code and try again.";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || verifyCooldown > 0) return;

    try {
      setLoading(true);
      const response = await apiConnector("POST", endpoints.RESEND_OTP_API, {
        email: email?.trim(),
      });

      if (response?.data?.success) {
        toast.success("A new OTP has been sent to your email.");
        setResendCooldown(60);
      } else {
        toast.error(response?.data?.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);

      if (error?.response?.status === 429) {
        const retrySeconds = error.response?.data?.retryAfter || 60;
        const limitMsg =
          error?.response?.data?.message ||
          `Too many OTP requests. Please wait ${retrySeconds}s before trying again.`;

        setResendCooldown(retrySeconds);
        toast.error(limitMsg, { autoClose: 5000 });
      } else {
        toast.error(error?.response?.data?.message || "Failed to resend OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex w-full flex-col gap-6">
      {loading && <Loader text="Verifying code..." />}

      <HeadingSection
        title="Verify Email"
        description={`A verification code has been sent to ${
          email || "your email"
        }. Enter the code below`}
      />

      <div className="w-full">
        <OtpInput length={6} onOtpSubmit={(finalOtp) => setOtpValue(finalOtp)} />
      </div>

      {verifyCooldown > 0 && (
        <div className="p-3 bg-red-900/40 border border-red-500 rounded text-red-300 text-xs text-center animate-pulse">
          {rateLimitMsg || `Too many failed attempts. Verification locked for ${verifyCooldown}s.`}
        </div>
      )}

      <CommonBtn
        type="submit"
        label={
          verifyCooldown > 0
            ? `Wait ${verifyCooldown}s`
            : loading
            ? "Verifying..."
            : "Verify and Proceed"
        }
        disabled={loading || verifyCooldown > 0}
      />

      <div className="flex items-center justify-between text-sm text-[#AFB2BF]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Sign Up
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendCooldown > 0 || verifyCooldown > 0 || loading}
          className={`flex items-center gap-1.5 transition cursor-pointer ${
            resendCooldown > 0 || verifyCooldown > 0
              ? "text-gray-500 cursor-not-allowed"
              : "text-[#FFD60A] hover:underline"
          }`}
        >
          <RotateCcw size={15} />{" "}
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend it"}
        </button>
      </div>
    </form>
  );
};

export default VerifyMail;
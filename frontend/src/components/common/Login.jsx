import React, { useState, useEffect } from 'react';
import frame21 from '../../assets/Frame 21.png';
import HeadingSection from './HeadingSection';
import RoleToggle from './RoleToggle';
import CommonImage from './CommonImage';
import CommonBtn from './CommonBtn';
import { apiConnector } from '../../utils/apiConnector';
import { endpoints } from '../../utils/api';
import { toast } from 'react-toastify';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { EyeClosed, EyeIcon } from 'lucide-react';
import ResetPasswordLink from '../user/ResetPasswordLink';
import VerifyMail from '../user/VerifyMail'; // Added import

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Dynamic countdown in seconds
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'instructor', label: 'Instructor' },
  ];

  const [formData, setFormData] = useState({
    role: 'student',
    email: location.state?.email || '',
    password: '',
  });

  // Active 1-second countdown for rate limiting
  useEffect(() => {
    if (cooldown <= 0) {
      setRateLimitMsg('');
      return;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { LOGIN_API } = endpoints;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cooldown > 0) {
      toast.warning(`Too many attempts. Please wait ${cooldown}s before trying again.`);
      return;
    }

    try {
      setLoading(true);
      const response = await apiConnector('POST', LOGIN_API, {
        ...formData,
        email: formData.email.trim(),
      });

      if (response?.data?.success) {
        toast.success(response.data.message || 'Login successful!');

        if (response.data.token) {
          const payloadBase64 = response.data.token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64));
          console.log('Decoded Token Data (In-Memory):', decodedPayload);
        }

        navigate('/dashboard');
      } else {
        toast.error(response?.data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login Error:', error);

      // Fixed: Check error.response instead of undefined response
      if (
        error?.response?.status === 403 &&
        !error?.response?.data?.emailVerified
      ) {
        toast.info(error.response.data.message || 'Please verify your email.');
        const emailFromApi =
          error?.response?.data?.data?.email ||
          formData.email.trim();
        setRegisteredEmail(emailFromApi);
        setIsOtpSent(true); // Switches state so VerifyMail renders in JSX
        return;
      }

      if (error?.response?.status === 423) {
        toast.error(error.response.data.message, { autoClose: 7000 });
        return;
      }

      if (error?.response?.status === 429) {
        const retrySeconds = error.response?.data?.retryAfter || 120;
        const serverMessage =
          error.response?.data?.message ||
          `Too many login attempts. Please wait ${retrySeconds}s before retrying.`;

        setCooldown(retrySeconds);
        setRateLimitMsg(serverMessage);
        toast.error(serverMessage, { autoClose: 5000 });
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          'Invalid credentials or server error. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const isCenteredCard = isForgotPassword || isOtpSent;

  return (
    <div
      className={`w-full flex flex-col bg-[#000814] ${isCenteredCard
          ? 'min-h-[calc(100dvh-57px)] md:min-h-[calc(100dvh-111px)] lg:min-h-[calc(100vh-111px)] items-center justify-center px-4 sm:px-6 md:px-8 py-4 md:py-0 overflow-y-auto md:overflow-y-hidden'
          : 'min-h-[calc(100dvh-57px)] md:min-h-[calc(100dvh-111px)] lg:min-h-[calc(100vh-111px)] lg:flex-row px-4 sm:px-8 lg:px-15 py-6 sm:py-8 lg:py-10'
        }`}
    >
      {loading && (
        <Loader
          text={
            isOtpSent
              ? 'Verifying code...'
              : isForgotPassword
                ? 'Sending reset link...'
                : 'Logging into your account...'
          }
        />
      )}

      {/* Main Content Column */}
      <div
        className={`flex flex-col w-full ${isCenteredCard
            ? 'max-w-[360px] xs:max-w-[420px] sm:max-w-[480px] md:max-w-[500px] mx-auto'
            : 'flex-1 max-w-[480px] lg:max-w-none mx-auto lg:mx-0 px-4 sm:px-6 lg:px-20 py-6 sm:py-10 xl:py-0 lg:w-[50%]'
          }`}
      >
        {isOtpSent ? (
          <VerifyMail
            email={registeredEmail}
            onBack={() => setIsOtpSent(false)}
          />
        ) : isForgotPassword ? (
          <ResetPasswordLink
            initialEmail={formData.email}
            onBack={() => setIsForgotPassword(false)}
          />
        ) : (
          <>
            <HeadingSection
              title="Welcome Back"
              description="Build skills for today, tomorrow, and beyond."
              highlight="Education to future-proof your career."
            />

            <RoleToggle
              options={roleOptions}
              selected={role}
              onChange={handleRoleChange}
            />

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
                  className="w-full mt-2 rounded-md bg-[#161D29] px-3 py-2 text-white placeholder:text-gray-400 focus:ring-1 focus:ring-yellow-400 outline-none border border-transparent transition"
                />
              </div>

              <div>
                <label className="text-sm text-white">
                  Password <span className="text-[rgba(239,71,111,1)]">*</span>
                </label>
                <div className="relative w-full mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-md bg-[#161D29] px-3 py-2 pr-10 text-white placeholder:text-gray-400 focus:ring-1 focus:ring-yellow-400 outline-none border border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838894] hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeIcon className="size-5" /> : <EyeClosed className="size-5" />}
                  </button>
                </div>

                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs hover:underline cursor-pointer bg-transparent border-none p-0 text-[rgba(71,165,197,1)]"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Dynamic Live Cooldown Notice */}
              {cooldown > 0 && (
                <div className="p-3 bg-red-900/40 border border-red-500 rounded text-red-300 text-xs text-center animate-pulse">
                  {rateLimitMsg || `Too many login attempts. Please wait ${cooldown}s before retrying.`}
                </div>
              )}

              <div className="pt-2">
                <CommonBtn
                  type="submit"
                  label={cooldown > 0 ? `Wait ${cooldown}s` : 'Sign In'}
                  disabled={loading || cooldown > 0}
                />
              </div>
            </form>

            <p className="text-sm text-gray-400 mt-4 text-center lg:text-left">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[rgba(71,165,197,1)] hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Right Image - Completely hidden during forgot password & OTP verification */}
      {!isCenteredCard && (
        <div className="hidden lg:flex flex-1 items-start justify-center relative pt-20 w-[50%]">
          <CommonImage
            image={frame21}
            addCss="xl:bottom-[7%] xl:right-[7%] xl:w-[100%] md:w-[100%] absolute"
          />
        </div>
      )}
    </div>
  );
};

export default Login;
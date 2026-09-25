import React, { useState } from 'react';
import { apiConnector } from '../../utils/apiConnector';
import { endpoints } from '../../utils/api';
import HeadingSection from '../common/HeadingSection';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, EyeClosed, EyeIcon } from 'lucide-react';
import Loader from '../common/Loader';
import CommonBtn from '../common/CommonBtn';
import UpdatePasswordSuccess from './UpdatePasswordSuccess';

const UpdatePassword = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const { newPassword, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Live password validation checklist
  const criteria = {
    hasLowercase: /[a-z]/.test(newPassword),
    hasUppercase: /[A-Z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    hasMinLength: newPassword.length >= 8,
  };

  const isFormValid =
    criteria.hasLowercase &&
    criteria.hasUppercase &&
    criteria.hasNumber &&
    criteria.hasSpecial &&
    criteria.hasMinLength &&
    newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!isFormValid) {
      toast.error('Please meet all password requirements.');
      return;
    }

    try {
      setLoading(true);

      const response = await apiConnector(
        'POST',
        `${endpoints.RESETPASSWORD_API}/${token}`,
        {
          newPassword,
          confirmPassword,
        }
      );

      if (response?.data?.success) {
        toast.success(response.data.message || 'Password reset successfully!');

        // Extract email from response or decode from JWT token payload
        let email = response?.data?.email || response?.data?.data?.email;
        if (!email && token && token.includes('.')) {
          try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            email = decoded?.email;
          } catch {
            // fallback
          }
        }

        setUserEmail(email || '');
        setIsResetComplete(true);
      } else {
        toast.error(response?.data?.message || 'Password reset failed.');
      }
    } catch (error) {
      console.error('Update Password Error:', error);
      toast.error(
        error?.response?.data?.message || 'Reset link has expired or is invalid.'
      );
    } finally {
      setLoading(false);
    }
  };

  const checklistItems = [
    { label: 'one lowercase character', valid: criteria.hasLowercase },
    { label: 'one special character', valid: criteria.hasSpecial },
    { label: 'one uppercase character', valid: criteria.hasUppercase },
    { label: '8 character minimum', valid: criteria.hasMinLength },
    { label: 'one number', valid: criteria.hasNumber, fullWidth: true },
  ];

  return (
    <div className="w-full min-h-[calc(100dvh-57px)] md:min-h-[calc(100dvh-111px)] lg:min-h-[calc(100vh-111px)] flex items-center justify-center bg-[#000814] px-4 py-4 sm:py-6 overflow-y-auto">
      {loading && <Loader text="Updating your password..." />}

      <div className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[420px] mx-auto flex flex-col justify-center my-auto">
        {isResetComplete ? (
          <UpdatePasswordSuccess email={userEmail} />
        ) : (
          <>
            <HeadingSection
              title="Choose new password"
              description="Almost done. Enter your new password and youre all set."
            />

            <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 flex flex-col gap-3.5 sm:gap-4">
              {/* New Password */}
              <div>
                <label className="text-[13px] sm:text-[14px] text-[#F1F2FF]">
                  New password <span className="text-[#EF476F]">*</span>
                </label>
                <div className="relative mt-1.5 w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    required
                    value={newPassword}
                    onChange={handleChange}
                    placeholder="********"
                    className="w-full rounded-md bg-[#161D29] px-3.5 py-2 sm:py-2.5 pr-10 text-[14px] text-[#F1F2FF] placeholder:text-[#6E727F] outline-none border border-transparent focus:border-[#FFD60A] focus:ring-1 focus:ring-[#FFD60A] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838894] hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeIcon className="size-4 sm:size-4.5" /> : <EyeClosed className="size-4 sm:size-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-[13px] sm:text-[14px] text-[#F1F2FF]">
                  Confirm new password <span className="text-[#EF476F]">*</span>
                </label>
                <div className="relative mt-1.5 w-full">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder="********"
                    className="w-full rounded-md bg-[#161D29] px-3.5 py-2 sm:py-2.5 pr-10 text-[14px] text-[#F1F2FF] placeholder:text-[#6E727F] outline-none border border-transparent focus:border-[#FFD60A] focus:ring-1 focus:ring-[#FFD60A] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#838894] hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeIcon className="size-4 sm:size-4.5" /> : <EyeClosed className="size-4 sm:size-4.5" />}
                  </button>
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 gap-y-2 pt-1 text-[11px] xs:text-[12px] sm:text-[12.5px]">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 transition-colors ${
                      item.fullWidth ? 'col-span-2' : ''
                    } ${item.valid ? 'text-[#05A77B]' : 'text-[#6E727F]'}`}
                  >
                    <span
                      className={`flex size-3.5 sm:size-4 shrink-0 items-center justify-center rounded-full transition-all ${
                        item.valid
                          ? 'bg-[#05A77B]'
                          : 'border border-[#474D57] bg-transparent'
                      }`}
                    >
                      {item.valid && (
                        <Check
                          strokeWidth={3.5}
                          className="size-2.5 sm:size-3 text-[#000814]"
                        />
                      )}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-1.5">
                <CommonBtn type="submit" label="Reset Password" disabled={loading} />
              </div>
            </form>

            {/* Back to Login Link */}
            <div className="mt-4 sm:mt-5">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#F1F2FF] hover:text-white transition cursor-pointer"
              >
                <ArrowLeft size={15} /> Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import HeadingSection from '../common/HeadingSection';
import CommonBtn from '../common/CommonBtn';
import UpdatePassword from './ResetPassword';

const UpdatePasswordSuccess = ({ email }) => {
  const navigate = useNavigate();

  // Masks email: e.g. "m************@gmail.com"
  const maskEmail = (rawEmail) => {
    if (!rawEmail || !rawEmail.includes('@')) return 'your email';
    const [name, domain] = rawEmail.split('@');
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}${'*'.repeat(Math.max(3, name.length - 1))}@${domain}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <HeadingSection
        title="Reset complete!"
        description={`All done! We have sent an email to ${maskEmail(
          email
        )} to confirm`}
      />

      <CommonBtn
        type="button"
        label="Return to login"
        onClick={() => navigate('/login')}
      />

      <div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#F1F2FF] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={15} /> Back to login
        </Link>
      </div>
    </div>
  );
};

export default UpdatePasswordSuccess;
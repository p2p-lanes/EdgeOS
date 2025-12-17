'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '../ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Mail } from 'lucide-react';
import { api, instance } from '@/api';
import useGetProfile from '@/hooks/useGetProfile';

type ModalStep = 'email' | 'verification' | 'success';

export default function MergeEmails() {
  const { profile, refresh } = useGetProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [targetEmail, setTargetEmail] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('token');
      if (token) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }, []);

  useEffect(() => {
    if (step === 'verification' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInitiateLink = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (
      profile?.primary_email &&
      email.toLowerCase() === profile.primary_email.toLowerCase()
    ) {
      setError('Cannot link account to itself');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('account-clusters/initiate', {
        target_email: email,
      });

      if (response?.status === 201) {
        setTargetEmail(email);
        setRequestId(response.data?.request_id || null);
        setStep('verification');
        setTimeRemaining(300);
        setError(null);
      } else {
        const errorMessage =
          response?.data?.detail ||
          'Failed to send verification code. Please try again.';
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to send verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    setError(null);
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setVerificationCode(digits);
      codeInputRefs.current[5]?.focus();
      setError(null);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('account-clusters/verify', {
        verification_code: code,
      });

      if (response?.status === 200) {
        setStep('success');
        setError(null);
        await refresh();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('accounts-linked'));
        }
      } else {
        const errorMessage =
          response?.data?.detail || 'Invalid verification code';
        setError(errorMessage);
        setVerificationCode(['', '', '', '', '', '']);
        codeInputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'Invalid verification code';
      setError(errorMessage);
      setVerificationCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (step === 'success') {
      await refresh();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('accounts-linked'));
      }
    }
    setIsModalOpen(false);
    setStep('email');
    setEmail('');
    setVerificationCode(['', '', '', '', '', '']);
    setTargetEmail('');
    setTimeRemaining(300);
    setError(null);
    setRequestId(null);
  };

  const handleBack = () => {
    setStep('email');
    setVerificationCode(['', '', '', '', '', '']);
    setTimeRemaining(300);
    setError(null);
  };

  const handleResendCode = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('account-clusters/initiate', {
        target_email: targetEmail,
      });

      if (response?.status === 201) {
        setRequestId(response.data?.request_id || null);
        setTimeRemaining(300);
        setError(null);
      } else {
        const errorMessage =
          response?.data?.detail ||
          'Failed to resend verification code. Please try again.';
        setError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to resend verification code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='email' className='text-sm font-semibold text-gray-900'>
          Email Address
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='name@example.com'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleInitiateLink();
            }
          }}
          className='w-full border-gray-300 rounded-lg py-3 px-5'
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className='text-sm text-red-600 bg-red-50 p-3 rounded-md'>
          {error}
        </div>
      )}

      <div className='flex flex-col gap-3'>
        <Button
          onClick={handleInitiateLink}
          className='bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,15%)] text-white rounded-lg w-full py-2.5 px-4 h-auto font-normal'
          disabled={isLoading || !email.trim()}>
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </Button>
        <Button
          variant='outline'
          onClick={handleClose}
          disabled={isLoading}
          className='bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg w-full py-2.5 px-4 h-auto font-normal'>
          Done
        </Button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <>
      <div className='space-y-2'>
        <div className='text-sm'>
          <div className='text-gray-600'>Enter the code we sent to</div>
          <div className='font-semibold text-gray-900 mt-1'>{targetEmail}</div>
        </div>

        <div className='flex justify-center py-2'>
          <div className='flex'>
            {verificationCode.map((digit, index) => {
              const isFirst = index === 0;
              const isLast = index === verificationCode.length - 1;
              return (
                <Input
                  key={index}
                  ref={(el) => {
                    codeInputRefs.current[index] = el;
                  }}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-10 h-10 text-center text-base font-semibold border-gray-300 ${
                    isFirst
                      ? 'rounded-l-md border-r-0'
                      : isLast
                      ? 'rounded-r-md border-r'
                      : 'rounded-none border-r-0'
                  }`}
                  disabled={isLoading || timeRemaining === 0}
                />
              );
            })}
          </div>
        </div>

        {timeRemaining > 0 ? (
          <div className='text-sm text-gray-600 text-center py-1'>
            Code expires in:{' '}
            <span className='font-semibold'>{formatTime(timeRemaining)}</span>
          </div>
        ) : (
          <div className='text-sm text-red-600 text-center py-1'>
            Code has expired. Please request a new code.
          </div>
        )}

        {error && (
          <div className='text-sm text-red-600 bg-red-50 p-2 rounded-md'>
            {error}
          </div>
        )}

        {timeRemaining === 0 && (
          <Button
            variant='outline'
            onClick={handleResendCode}
            disabled={isLoading}
            className='w-full'>
            {isLoading ? 'Sending...' : 'Resend Code'}
          </Button>
        )}

        <div className='flex flex-col gap-3 pt-2'>
          <Button
            onClick={handleVerifyCode}
            className='bg-[hsl(222,47%,11%)] hover:bg-[hsl(222,47%,15%)] text-white rounded-lg w-full py-2.5 px-4 h-auto font-normal'
            disabled={
              isLoading ||
              verificationCode.join('').length !== 6 ||
              timeRemaining === 0
            }>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
          <Button
            variant='outline'
            onClick={handleBack}
            disabled={isLoading}
            className='bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 rounded-lg w-full py-2.5 px-4 h-auto font-normal'>
            Back
          </Button>
        </div>
      </div>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <div className='space-y-4 mt-4 text-center'>
        <div className='text-4xl mb-4'>✓</div>
        <h3 className='text-xl font-semibold text-gray-900'>
          Accounts Linked Successfully!
        </h3>
        <p className='text-sm text-gray-600'>
          Your accounts are now linked. Your profile now shows combined data
          from both accounts.
        </p>
        <div className='pt-4'>
          <Button
            onClick={handleClose}
            className='bg-[#020817] hover:bg-[#020817]/90 text-white'>
            Close
          </Button>
        </div>
      </div>
    </>
  );

  const getModalContent = () => {
    switch (step) {
      case 'email':
        return renderEmailStep();
      case 'verification':
        return renderVerificationStep();
      case 'success':
        return renderSuccessStep();
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (step) {
      case 'email':
        return 'Merge Email Accounts';
      case 'verification':
        return 'Merge Email Accounts';
      case 'success':
        return 'Success';
      default:
        return 'Merge Email Accounts';
    }
  };

  const getModalDescription = () => {
    switch (step) {
      case 'email':
        return 'Add email addresses to combine your statistics across all accounts.';
      case 'verification':
        return undefined;
      case 'success':
        return undefined;
      default:
        return 'Add email addresses to combine your statistics across all accounts.';
    }
  };

  return (
    <>
      <Card className='p-4 md:p-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6'>
          <div className='flex items-start gap-4 flex-1'>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
              <Mail className='w-6 h-6 text-purple-600 stroke-[1.5]' />
            </div>
            <div className='flex-1'>
              <div className='flex flex-wrap items-center gap-2 mb-1'>
                <h3 className='text-lg font-semibold text-[#020817] leading-tight'>
                  Combine your Edge City metrics from different accounts
                </h3>
                <span className='px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full whitespace-nowrap'>
                  new
                </span>
              </div>
              <p className='text-sm text-[#64748b]'>
                Connect multiple emails to see combined stats across all your
                activities. You can also do this in settings.
              </p>
            </div>
          </div>
          <div className='flex-shrink-0 w-full md:w-auto'>
            <Button
              onClick={() => setIsModalOpen(true)}
              className='bg-[#020817] hover:bg-[#020817]/90 text-white whitespace-nowrap rounded-lg px-5 py-2.5 h-auto w-full md:w-auto'>
              Merge emails
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={handleClose}
        title={getModalTitle()}
        description={getModalDescription()}>
        {getModalContent()}
      </Modal>
    </>
  );
}

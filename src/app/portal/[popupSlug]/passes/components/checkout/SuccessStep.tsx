'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessStepProps {
  onComplete?: () => void;
}

export default function SuccessStep({ onComplete }: SuccessStepProps) {
  const params = useParams();
  const popupSlug = params.popupSlug as string;
  const [countdown, setCountdown] = useState(3);

  const passesUrl = `/portal/${popupSlug}/passes`;

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 3 seconds (use window.location for full page reload to refetch data)
    const redirectTimer = setTimeout(() => {
      onComplete?.();
      window.location.href = passesUrl;
    }, 3000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [passesUrl, onComplete]);

  const handleGoToPasses = () => {
    onComplete?.();
    window.location.href = passesUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Animated container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        {/* Success icon with spring animation */}
        <motion.div
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.1,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 200,
              damping: 12
            }}
          >
            <CheckCircle className="w-14 h-14 text-green-600" />
          </motion.div>

          {/* Sparkle decorations */}
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
          </motion.div>
        </motion.div>

        {/* Success message */}
        <motion.h1
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          className="text-gray-600 mb-8 max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          Your passes are ready and waiting for you.
        </motion.p>

        {/* Countdown text */}
        <motion.p
          className="text-sm text-gray-500 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          Redirecting in {countdown}s...
        </motion.p>

        {/* Manual button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <Button
            onClick={handleGoToPasses}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl flex items-center gap-2"
          >
            Go to My Passes
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

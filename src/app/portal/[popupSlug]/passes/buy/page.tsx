'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/ui/Loader';
import { CheckoutProvider } from '@/providers/checkoutProvider';
import { usePassesProvider } from '@/providers/passesProvider';
import { CheckoutFlow } from '@/components/checkout';
import useAttendee from '@/hooks/useAttendee';
import { AttendeeCategory, AttendeeProps, CreateAttendee } from '@/types/Attendee';
import { CheckoutStep } from '@/types/checkout';
import usePermission from '../hooks/usePermission';
import { AttendeeModal } from '../components/AttendeeModal';

export default function BuyPage() {
  usePermission();

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const popupSlug = params.popupSlug as string;
  const { attendeePasses: attendees, products } = usePassesProvider();
  const { addAttendee } = useAttendee();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<AttendeeCategory>('main');

  // Check if returning from payment provider with success
  const checkoutSuccess = searchParams.get('checkout') === 'success';
  const initialStep: CheckoutStep = checkoutSuccess ? 'success' : 'passes';

  // Clean URL parameter after detecting success to prevent showing success on manual reload
  useEffect(() => {
    if (checkoutSuccess) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkoutSuccess]);

  if (!attendees.length || !products.length) {
    return <Loader />;
  }

  const handleAddAttendee = (category: AttendeeCategory) => {
    setModalCategory(category);
    setModalOpen(true);
  };

  const handleModalSubmit = async (data: AttendeeProps) => {
    try {
      await addAttendee({
        name: data.name,
        email: data.email,
        category: data.category,
        gender: data.gender,
      });
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to add attendee:', error);
    }
  };

  const handlePaymentComplete = () => {
    // Success step handles navigation via auto-redirect
    // No action needed here - the checkout provider sets currentStep to 'success'
  };

  const handleBack = () => {
    router.push(`/portal/${popupSlug}/passes`);
  };

  return (
    <div className="min-h-screen">
      <CheckoutProvider products={products} initialStep={initialStep}>
        <CheckoutFlow
          onAddAttendee={handleAddAttendee}
          onPaymentComplete={handlePaymentComplete}
          onBack={handleBack}
        />
      </CheckoutProvider>

      <AttendeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        category={modalCategory}
        editingAttendee={null}
      />
    </div>
  );
}

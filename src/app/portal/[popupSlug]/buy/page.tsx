'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader } from '@/components/ui/Loader';
import { CheckoutProvider } from '@/providers/checkoutProvider';
import { usePassesProvider } from '@/providers/passesProvider';
import { CheckoutFlow } from '../passes/components/checkout';
import { AttendeeModal } from '../passes/components/AttendeeModal';
import usePermission from '../passes/hooks/usePermission';
import useAttendee from '@/hooks/useAttendee';
import { AttendeeCategory, AttendeeProps, CreateAttendee } from '@/types/Attendee';

export default function BuyPage() {
  usePermission();

  const router = useRouter();
  const params = useParams();
  const popupSlug = params.popupSlug as string;
  const { attendeePasses: attendees, products } = usePassesProvider();
  const { addAttendee } = useAttendee();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<AttendeeCategory>('main');

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
    <div className="min-h-screen bg-gray-50">
      <CheckoutProvider products={products}>
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

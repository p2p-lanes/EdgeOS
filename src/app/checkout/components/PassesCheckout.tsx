"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckoutProvider } from "@/providers/checkoutProvider"
import { usePassesProvider } from "@/providers/passesProvider"
import { CheckoutFlow } from "@/components/checkout"
import useAttendee from "@/hooks/useAttendee"
import { AttendeeCategory, AttendeeProps } from "@/types/Attendee"
import { CheckoutStep } from "@/types/checkout"
import { AttendeeModal } from "@/app/portal/[popupSlug]/passes/components/AttendeeModal"
import Providers from "./providers/Providers"

interface PassesCheckoutProps {
  onBack: () => void;
}

const PassesCheckout = ({ onBack }: PassesCheckoutProps) => {
  const searchParams = useSearchParams();
  const { attendeePasses: attendees, products } = usePassesProvider();
  const { addAttendee } = useAttendee();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<AttendeeCategory>("main");
  const [isLoading, setIsLoading] = useState(true);

  // Check if returning from payment provider with success
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const initialStep: CheckoutStep = checkoutSuccess ? "success" : "passes";

  // Clean URL parameter after detecting success to prevent showing success on manual reload
  useEffect(() => {
    if (checkoutSuccess) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [checkoutSuccess]);

  // Detect when attendees and products are loaded
  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      setIsLoading(false);
    }
  }, [attendees, products]);

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
      console.error("Failed to add attendee:", error);
    }
  };

  const handlePaymentComplete = () => {
    // Success step handles navigation via auto-redirect
    // No action needed here - the checkout provider sets currentStep to 'success'
  };

  return (
    <Providers>
      <CheckoutProvider products={products} initialStep={initialStep}>
        <CheckoutFlow
          onAddAttendee={handleAddAttendee}
          onPaymentComplete={handlePaymentComplete}
          onBack={onBack}
          isLoading={isLoading}
        />
      </CheckoutProvider>

      <AttendeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        category={modalCategory}
        editingAttendee={null}
      />
    </Providers>
  )
}

export default PassesCheckout

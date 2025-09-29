"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserForm } from "../../hooks/useUserForm";
import { useEmailVerification } from "../../hooks/useEmailVerification";
import { useApplicationData } from "../../hooks/useApplicationData";
import EmailVerification from "./EmailVerification";
import PersonalInfoForm from "./PersonalInfoForm";
import RedFlagScreen from "./RedFlagScreen";
import { FormDataProps, GroupData } from "../../types";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCityProvider } from "@/providers/cityProvider";
import useGetPopups from "@/hooks/useGetPopups";

interface UserInfoFormProps {
  group: GroupData | null;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: FormDataProps) => Promise<void>;
  isSubmitting: boolean;
  isInvite?: boolean;
}

const UserInfoForm = ({ group, onSubmit, isSubmitting, isLoading, error, isInvite = false }: UserInfoFormProps) => {
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [showRedFlagScreen, setShowRedFlagScreen] = useState(false);
  const searchParams = useSearchParams();
  const isDayCheckout = searchParams.has("day-passes");

  // Get application data based on group's popup_city_id
  const { 
    applicationData, 
    isLoading: isLoadingApplication,
    refreshApplicationData
  } = useApplicationData({ 
    groupPopupCityId: group?.popup_city_id 
  });
  
  const { 
    formData, 
    errors, 
    setErrors, 
    handleInputChange, 
    validateForm, 
    setEmailVerified,
    resetForm
  } = useUserForm({
    applicationData
  });
  
  // Set autoFilled flag when applicationData has more than just email
  useEffect(() => {
    if (applicationData && 
        (applicationData.first_name || 
         applicationData.last_name || 
         applicationData.organization || 
         applicationData.telegram)) {
      setIsAutoFilled(true);
    }
  }, [applicationData]);
  
  const { 
    showVerificationInput, 
    verificationCode, 
    setVerificationCode, 
    isSendingCode, 
    isVerifyingCode, 
    verificationError, 
    countdown, 
    handleSendVerificationCode, 
    handleVerifyCode, 
    handleResendCode,
    handleChangeEmail
  } = useEmailVerification({
    email: formData.email,
    onVerificationSuccess: (token) => {
      // After successful email verification, set the email as verified
      setEmailVerified(formData.email);
      
      // Then, refresh application data to check if there's existing data for this email
      refreshApplicationData();
    }
  });

  // Función para cambiar el email desde cualquier parte del formulario
  const handleEmailChange = () => {
    // Resetear estado de verificación de email
    handleChangeEmail();
    
    // Resetear datos del formulario
    resetForm();
    
    // Resetear estado de autocompletado
    setIsAutoFilled(false);
    
    // Eliminar token si existe
    window?.localStorage?.removeItem('token');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not verified and has valid email, check format
    if (!formData.email_verified && formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: "Invalid email"
      }));
      return;
    }

    // If not verified but has valid email, send code or verify code
    if (!formData.email_verified) {
      if (!showVerificationInput) {
        // Send code
        await handleSendVerificationCode();
      } else {
        // Verify code
        await handleVerifyCode();
      }
      return;
    }
    
    // If verified, validate and submit form
    if (validateForm()) {
      // Check for red flag before proceeding with purchase
      if (applicationData?.red_flag) {
        setShowRedFlagScreen(true);
        return;
      }
      
      try {
        if(isDayCheckout) {
          formData.organization = null;
          formData.role = null;
        }
        await onSubmit(formData);
      } catch (error: any) {
        console.error("Error submitting form:", error);
        // Set general or specific error based on response
        if (error.response?.data?.message) {
          setErrors(prev => ({
            ...prev,
            general: error.response.data.message
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: "An error occurred while submitting the form. Please try again."
          }));
        }
      }
    }
  };

  // If there's a general error, show only the card with the error
  if (errors.general || error) {
    return (
      <Card className="max-w-lg mx-auto backdrop-blur bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">Checkout</CardTitle>
          <div className="mt-6 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
            {errors.general || error}
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Show loading state while fetching application data
  if (isLoadingApplication) {
    return (
      <Card className="max-w-lg mx-auto backdrop-blur bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">Loading your information</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  // Show red flag screen if triggered by form submission
  if (showRedFlagScreen) {
    
    const userName = applicationData?.first_name || formData.first_name || "User";
    const popupName = group?.popup_name || "this location";

    const popupSlug = group?.popup_slug || "unknown";
    
    return (
      <RedFlagScreen 
        userName={userName}
        popupName={popupName}
        popupSlug={popupSlug}
      />
    );
  }

  return (
    <Card className="max-w-lg mx-auto backdrop-blur bg-white/90">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Express Checkout</CardTitle>
        {
          group?.welcome_message && (
            <CardDescription className="bg-green-100 text-green-800 p-2 rounded-md radius-lg">
              {group.welcome_message}
            </CardDescription>
          )
        }
        {group?.description && (
          <CardDescription 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: group.description }}
          />
        )}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Email section - visible only when not verified */}
          {!formData.email_verified && (
            <EmailVerification
              email={formData.email}
              showVerificationInput={showVerificationInput}
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              verificationError={verificationError}
              countdown={countdown}
              handleEmailChange={(value) => handleInputChange("email", value)}
              handleSendCode={handleSendVerificationCode}
              handleResendCode={handleResendCode}
              handleChangeEmail={handleChangeEmail}
              isDisabled={isSendingCode || isVerifyingCode}
              emailError={errors.email}
            />
          )}
          
          {/* Additional fields - visible only after email verification */}
          {formData.email_verified && (
            <PersonalInfoForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleChangeEmail={handleEmailChange}
              errors={errors}
            />
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isSubmitting || 
              (showVerificationInput && verificationCode.length !== 6 && !formData.email_verified) || 
              isSendingCode ||
              isVerifyingCode
            }
          >
            {isSubmitting 
              ? "Processing..." 
              : formData.email_verified 
                ? "Continue" 
                : showVerificationInput
                  ? "Verify Code"
                  : "Send Code"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserInfoForm; 
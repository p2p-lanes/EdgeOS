"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserForm } from "../../hooks/useUserForm";
import { useEmailVerification } from "../../hooks/useEmailVerification";
import { useApplicationData } from "../../hooks/useApplicationData";
import EmailVerification from "./EmailVerification";
import PersonalInfoForm from "./PersonalInfoForm";
import { FormDataProps, GroupData } from "../../types";
import { useEffect, useState } from "react";

interface UserInfoFormProps {
  group: GroupData | null;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: FormDataProps) => Promise<void>;
  isSubmitting: boolean;
}

const UserInfoForm = ({ group, onSubmit, isSubmitting, isLoading, error }: UserInfoFormProps) => {
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  
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
    setEmailVerified 
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
    handleResendCode 
  } = useEmailVerification({
    email: formData.email,
    onVerificationSuccess: (token) => {
      // After successful email verification, set the email as verified
      setEmailVerified(formData.email);
      
      // Then, refresh application data to check if there's existing data for this email
      refreshApplicationData();
    }
  });

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
      try {
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

  return (
    <Card className="max-w-lg mx-auto backdrop-blur bg-white/90">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Express Checkout</CardTitle>
        <CardDescription>
          You&apos;re invited to <span className="font-bold">{group?.name}</span> at <span className="font-bold">{group?.popup_name}</span>. Please provide your information below to proceed to check-out and secure your ticket(s)
        </CardDescription>
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
              isDisabled={isSendingCode || isVerifyingCode}
              emailError={errors.email}
            />
          )}
          
          {/* Additional fields - visible only after email verification */}
          {formData.email_verified && (
            <PersonalInfoForm
              formData={formData}
              handleInputChange={handleInputChange}
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
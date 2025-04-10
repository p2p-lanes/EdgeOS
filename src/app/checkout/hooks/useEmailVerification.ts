import { useState, useRef, useEffect } from "react";
import { api, instance } from "@/api";

interface UseEmailVerificationProps {
  email: string;
  onVerificationSuccess: (token: string) => void;
}

export const useEmailVerification = ({ email, onVerificationSuccess }: UseEmailVerificationProps) => {
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Enviar código automáticamente cuando se completan los 6 dígitos
  useEffect(() => {
    if (verificationCode.length === 6 && showVerificationInput && !isVerifyingCode) {
      handleVerifyCode();
    }
  }, [verificationCode]);

  const startCountdown = () => {
    setCountdown(60);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendVerificationCode = async () => {
    if (!email) {
      setVerificationError("Email is required");
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setVerificationError("Invalid email");
      return;
    }
    
    try {
      setIsSendingCode(true);
      setVerificationError(null);
      
      // Llamada a la API para enviar código
      await api.post("/citizens/authenticate", {
        email,
        use_code: true
      });
      
      setShowVerificationInput(true);
      startCountdown();
    } catch (error) {
      console.error("Error sending verification code:", error);
      setVerificationError("Failed to send verification code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError("Please enter the full 6-digit code");
      return;
    }
    
    try {
      setIsVerifyingCode(true);
      setVerificationError(null);
      
      // Llamada a la API para verificar el código con query params
      const response = await api.post(`/citizens/login?email=${encodeURIComponent(email)}&code=${verificationCode}`);
      
      // Si llegamos aquí es porque la API devolvió 200 o 201
      if (response.status === 200 || response.status === 201) {
        const token = response.data.access_token;
        
        // Almacenar token y configurar en el header
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        window?.localStorage?.setItem('token', token);
        
        // Limpiar cualquier error
        setVerificationError(null);
        
        // Notificar éxito
        onVerificationSuccess(token);
      } else {
        // Si la respuesta no es 200 o 201, tratar como error
        setVerificationError("Verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      
      // Comprobar el código de estado para mostrar mensajes específicos
      if (error.response) {
        if (error.response.status === 401) {
          setVerificationError("Invalid verification code. Please try again.");
        } else if (error.response.status === 404) {
          setVerificationError("Verification code not found. Please request a new code.");
        } else {
          setVerificationError("Failed to verify code. Please try again.");
        }
      } else {
        setVerificationError("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setVerificationCode("");
      setVerificationError(null);
      await handleSendVerificationCode();
    } catch (error) {
      console.error("Error resending code:", error);
      setVerificationError("Failed to resend verification code. Please try again.");
    }
  };

  const handleChangeEmail = () => {
    // Reset all verification states
    setShowVerificationInput(false);
    setVerificationCode("");
    setVerificationError(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(0);
  };

  return {
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
  };
}; 
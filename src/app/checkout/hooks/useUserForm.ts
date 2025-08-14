import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { instance } from "@/api";
import { FormDataProps } from "../types";
import { useSearchParams } from "next/navigation";

interface UseUserFormProps {
  initialData?: Partial<FormDataProps>;
  applicationData?: Partial<FormDataProps> | null;
}

export const useUserForm = ({ initialData = {}, applicationData }: UseUserFormProps = {}) => {
  const searchParams = useSearchParams();
  const isDayCheckout = searchParams.has("day-passes");
  const [formData, setFormData] = useState<FormDataProps>({
    first_name: "",
    last_name: "",
    email: "",
    telegram: "",
    organization: !isDayCheckout ? "" : null,
    role: !isDayCheckout ? "" : null,
    gender: "",
    email_verified: false,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del token si existe
  useEffect(() => {
    const token = window?.localStorage?.getItem('token');
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const decodedToken = jwtDecode(token) as { email: string };
      
      setFormData(prev => ({
        ...prev,
        email: decodedToken.email,
        email_verified: true
      }));
    }
  }, []);

  // Actualizar formData cuando llegan nuevos datos de aplicación
  useEffect(() => {
    if (applicationData) {
      setFormData(prev => ({
        ...prev,
        ...applicationData
      }));
    }
  }, [applicationData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Si cambia el email, resetear la verificación
    if (field === "email") {
      setFormData(prev => ({
        ...prev,
        email_verified: false
      }));
    }
    
    // Eliminar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email && !formData.email_verified) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    } else if (!formData.email_verified) {
      newErrors.email = "Email verification is required. Please verify your email before continuing.";
    }
    if (!formData.telegram) newErrors.telegram = "Telegram is required";
    if (!formData.organization && !isDayCheckout) newErrors.organization = "Organization is required";
    if (!formData.role && !isDayCheckout) newErrors.role = "Role is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if(formData.gender === 'Specify') newErrors.gender_specify = "Please specify your gender";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setEmailVerified = (email: string) => {
    setFormData(prev => ({
      ...prev,
      email,
      email_verified: true
    }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      telegram: "",
      organization: isDayCheckout ? "" : null,
      role: isDayCheckout ? "" : null,
      gender: "",
      email_verified: false
    });
    setErrors({});
    
    // Eliminar la autorización del header
    delete instance.defaults.headers.common['Authorization'];
  };

  return {
    formData,
    errors,
    setErrors,
    handleInputChange,
    validateForm,
    setEmailVerified,
    setFormData,
    resetForm
  };
}; 
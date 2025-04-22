import { useState } from "react";
import { api, instance } from "@/api";
import { useApplication } from "@/providers/applicationProvider";
import { FormDataProps, CheckoutState } from "../types";
import useCookies from "./useCookies";

const useCheckoutState = (groupParam: string | null) => {
  const { setApplications } = useApplication();
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setCookie } = useCookies();

  const handleSubmit = async (formData: FormDataProps, groupData: any): Promise<void> => {
    if (!groupParam) {
      setErrorMessage("Invalid group ID");
      return;
    }

    try {
      setIsSubmitting(true);
      setCheckoutState("processing");

      // Guardar datos en cookies
      setCookie(JSON.stringify({
        ...formData, 
        group_id: groupData.id, 
        popup_city_id: groupData.popup_city_id
      }));
      
      // Enviamos la solicitud con el header específico para esta petición
      const response = await instance.post(
        `/groups/${groupParam}/new_member`, 
        { ...formData }
      );

      const application = response.data;
      setApplications([application]);
      setCheckoutState("passes");
      setErrorMessage(null);
    } catch (error: any) {
      console.error("Checkout error:", error);
      
      // Manejar casos específicos de error
      if (error.response?.status === 409 || 
          (error.response?.data?.detail && 
           error.response?.data?.detail.includes("already has an application"))) {
        // El usuario ya tiene una aplicación existente para este grupo
        // En lugar de mostrar un error, podemos intentar obtener esa aplicación
        try {
          // Intenta obtener las aplicaciones del usuario
          const token = window?.localStorage?.getItem('token');
          if (token) {
            const userApplicationsResponse = await api.get(
              `/applications?email=${encodeURIComponent(formData.email)}`
            );
            
            // Si tenemos aplicaciones, usamos la que corresponde a este grupo
            if (userApplicationsResponse.data && Array.isArray(userApplicationsResponse.data)) {
              const existingApp = userApplicationsResponse.data.find(
                (app: any) => app.group_id === groupParam || app.popup_city_id === groupData.popup_city_id
              );
              
              if (existingApp) {
                setApplications([existingApp]);
                setCheckoutState("passes");
                setErrorMessage(null);
                return;
              }
            }
          }
        } catch (subError) {
          console.error("Error retrieving existing application:", subError);
        }
        
        // Si llegamos aquí, mostramos un mensaje más específico
        setErrorMessage("You already have a pending application for this event. Please check your email or contact support.");
      } else {
        // Otros errores
        const msg = error.response?.data?.detail ?? "Something went wrong. Please try again.";
        setErrorMessage(msg);
      }
      
      setCheckoutState("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    checkoutState,
    isSubmitting,
    errorMessage,
    handleSubmit,
    setCheckoutState
  };
};

export default useCheckoutState; 
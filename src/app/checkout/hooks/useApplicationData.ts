import { useState, useEffect, useCallback } from "react";
import { api } from "@/api";
import { jwtDecode } from "jwt-decode";
import { FormDataProps } from "../types";

interface UseApplicationDataProps {
  groupPopupCityId?: string;
}

interface Application {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  telegram?: string;
  organization?: string;
  role?: string;
  gender?: string;
  popup_city_id?: string;
  [key: string]: any;
}

export const useApplicationData = ({ groupPopupCityId }: UseApplicationDataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<Partial<FormDataProps> | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to manually trigger a refresh of application data
  const refreshApplicationData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchApplicationData = async () => {
      // Only proceed if we have a token and popup city ID
      const token = window?.localStorage?.getItem('token');
      if (!token || !groupPopupCityId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Mínimo delay para UX (300ms)
        const startTime = Date.now();
        
        // Get email from token
        const decodedToken = jwtDecode(token) as { email: string };
        if (!decodedToken.email) {
          console.error("No email found in token");
          return;
        }

        // Fetch applications for this email
        const response = await api.get(`/applications?email=${encodeURIComponent(decodedToken.email)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Find application that matches the current popup_city_id
          const matchingApplication = response.data.find(
            (app: Application) => app.popup_city_id === groupPopupCityId
          );

          if (matchingApplication) {
            // Map application data to form fields
            setApplicationData({
              first_name: matchingApplication.first_name || "",
              last_name: matchingApplication.last_name || "",
              email: decodedToken.email,
              telegram: matchingApplication.telegram || "",
              organization: matchingApplication.organization || "",
              role: matchingApplication.role || "",
              gender: matchingApplication.gender?.toLowerCase() || "",
              email_verified: true,
              local_resident: matchingApplication.local_resident !== null ? matchingApplication.local_resident === true ? "yes" : "no" : ""
            });
          } else {
            // User has no matching application, just set email
            setApplicationData({
              email: decodedToken.email,
              email_verified: true
            });
          }
        }
        
        
        
      } catch (error: any) {
        console.error("Error fetching application data:", error);
        setError("Failed to fetch previous application data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [groupPopupCityId, refreshTrigger]);

  return {
    isLoading,
    error,
    applicationData,
    refreshApplicationData
  };
}; 
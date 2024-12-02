import { useEffect, useState } from "react";
import {  getUser } from "../helpers/getData";
import { toast } from "sonner";
import useGetData from "./useGetData";
import { useCityProvider } from "@/providers/cityProvider";

const useInitForm = (setFormData: any) => {
  const [isLoading, setIsLoading] = useState(true)
  const [showExistingCard, setShowExistingCard] = useState(false)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const { getDataApplicationForm } = useGetData()
  const { getCity, getPopups } = useCityProvider()
  const city = getCity()
  const popups = getPopups()

  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true)
      try {
        const { application, status } = await getDataApplicationForm()

        if(!application || !status) return

        if (status === 'import') {
          setExistingApplication(application);
          const hasSeenModal = window?.localStorage?.getItem('hasSeenExistingApplicationModal');
          if (!hasSeenModal) {
            setShowExistingCard(true);
          }
        }

        if (status === 'draft') {
          setFormData((prevData: any) => ({
            ...prevData,
            ...application
          }));
          toast.success("Draft loaded successfully", {
            description: "Your previously saved draft has been loaded.",
          });
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        toast.error("Error", {
          description: "There was an error loading your application data. Please try again.",
        });
      } finally {
        setIsLoading(false)
      }
    }

    initializeForm();
  }, [city, popups]);

  return { isLoading, showExistingCard, existingApplication, setShowExistingCard }
}
export default useInitForm
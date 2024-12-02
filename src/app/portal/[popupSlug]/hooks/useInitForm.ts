import { useEffect, useState } from "react";
import { checkForDraft, fetchExistingApplication, getUser } from "../helpers/getData";
import { toast } from "sonner";

const useInitForm = (setFormData: any) => {
  const [isLoading, setIsLoading] = useState(true)
  const [showExistingCard, setShowExistingCard] = useState(false)
  const [existingApplication, setExistingApplication] = useState<any>(null)

  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true)
      try {
        const [userEmail, draft] = await Promise.all([
          getUser(),
          checkForDraft()
        ]);

        if (userEmail) {
          const existingData = await fetchExistingApplication(userEmail);
          setExistingApplication(existingData);
          if(typeof window === 'undefined') return;
          const hasSeenModal = window?.localStorage?.getItem('hasSeenExistingApplicationModal');
          if (!hasSeenModal) {
            setShowExistingCard(true);
          }
        }

        if (draft && !showExistingCard) {
          setFormData((prevData: any) => ({
            ...prevData,
            ...draft
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
  }, [setFormData]);

  return { isLoading, showExistingCard, existingApplication, setShowExistingCard }
}
export default useInitForm
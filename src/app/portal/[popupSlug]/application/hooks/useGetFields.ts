import { dynamicForm } from "@/constants";
import { useCityProvider } from "@/providers/cityProvider";
import { useEffect, useState } from "react";

const useGetFields = () => {
  const { getCity } = useCityProvider()
  const city = getCity()
  const [fields, setFields] = useState<Set<string> | null>(null);
  
  useEffect(() => {
    const fields = city?.slug ? new Set(dynamicForm[city.slug]?.fields) : null

    if(fields?.size === 0) {
      setFields(new Set(dynamicForm['default']?.fields))
      return;
    }
    
    setFields(fields)
  }, [city]);

  return { fields };
};
export default useGetFields
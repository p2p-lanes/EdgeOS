import { createContext, ReactNode, useContext, useState } from 'react';


interface CityContext_interface {
  getCity: () => any;
  setCity: (city: any) => void;
  getApplications: () => any;
  setApplications: (application: any) => void;
  getRelevantApplication: () => any;
  getPopups: () => any;
  setPopups: (popups: any) => void;
}

export const CityContext = createContext<CityContext_interface | null>(null);


const CityProvider = ({ children }: {children: ReactNode}) => {
  const [city, setCityState] = useState<any>(null);
  const [applications, setApplicationsState] = useState<any>(null);
  const [popups, setPopupsState] = useState<any>(null);

  const getApplications = (): any => {
    return applications
  }

  const setApplications = (applications: any): void => {
    setApplicationsState(applications);
  }

  const getCity = (): any => {
    return city;
  };

  const setCity = (city: any): void => {
    setCityState(city);
  };

  const getRelevantApplication = (): any => {
    return applications?.filter((app: any) => app.popup_city_id === city?.id)?.slice(-1)[0]
  }

  const getPopups = (): any => {
    return popups
  }

  const setPopups = (popups: any): void => {
    setPopupsState(popups);
  }

  return (
    <CityContext.Provider value={{
      getCity,
      setCity,
      getApplications,
      setApplications,
      getRelevantApplication,
      getPopups,
      setPopups
    }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCityProvider = (): CityContext_interface => {
  const context = useContext(CityContext);
  if (context === null) {
    throw new Error('useCityProvider must be used within a CityProvider');
  }
  return context;
};

export default CityProvider;
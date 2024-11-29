import { createContext, ReactNode, useContext, useState } from 'react';


interface CityContext_interface {
  getCity: () => any;
  setCity: (city: any) => void;
  getApplication: () => any;
  setApplication: (application: any) => void;
}

export const CityContext = createContext<CityContext_interface | null>(null);


const CityProvider = ({ children }: {children: ReactNode}) => {
  const [city, setCityState] = useState<any>(null);
  const [application, setApplicationState] = useState<any>(null);

  const getApplication = (): any => {
    return application;
  }

  const setApplication = (application: any): void => {
    setApplicationState(application);
  }

  const getCity = (): any => {
    return city;
  };

  const setCity = (city: any): void => {
    setCityState(city);
  };



  return (
    <CityContext.Provider value={{
      getCity,
      setCity,
      getApplication,
      setApplication
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
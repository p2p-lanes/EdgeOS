import { ApplicationProps } from '@/types/Application';
import { PopupsProps } from '@/types/Popup';
import { ProductsProps } from '@/types/Products';
import { useParams, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useState } from 'react';

interface CityContext_interface {
  getCity: () => PopupsProps | null;
  getApplications: () => ApplicationProps[] | null;
  setApplications: (application: ApplicationProps[]) => void;
  getRelevantApplication: () => ApplicationProps | null;
  getPopups: () => PopupsProps[];
  setPopups: (popups: PopupsProps[]) => void;
  updateApplication: (application: ApplicationProps) => void;
  getProducts: () => ProductsProps[]
  setProducts: (products: ProductsProps[]) => void
}

export const CityContext = createContext<CityContext_interface | null>(null);


const CityProvider = ({ children }: {children: ReactNode}) => {
  const [products, setProductsState] = useState<ProductsProps[]>([])
  const [applications, setApplicationsState] = useState<ApplicationProps[] | null>(null);
  const [popups, setPopupsState] = useState<PopupsProps[]>([]);
  const params = useParams()


  const setProducts = (products: ProductsProps[]) => {
    setProductsState(products)
  }

  const getProducts = () => {
    return products
  }

  const getApplications = (): ApplicationProps[] | null => {
    return applications
  }

  const setApplications = (applications: ApplicationProps[]): void => {
    setApplicationsState(applications);
  }

  const getCity = (): PopupsProps | null => {
    const city = popups.find((popup: PopupsProps) => popup.slug === params.popupSlug && popup.clickable_in_portal && popup.visible_in_portal)
    if(!city){
      const selectedCity = popups.find((popup: PopupsProps) => popup.clickable_in_portal && popup.visible_in_portal)
      if(selectedCity) return selectedCity
    }
    return city ?? null;
  };

  const getRelevantApplication = (): ApplicationProps | null => {
    const city = getCity()
    if(!applications) return null;

    return applications?.filter((app: ApplicationProps) => app.popup_city_id === city?.id)?.slice(-1)[0]
  }

  const getPopups = (): PopupsProps[] => {
    return popups
  }

  const setPopups = (popups: PopupsProps[]): void => {
    const sortedPopups = popups.sort((a, b) => {
        if (a.visible_in_portal && a.clickable_in_portal) return -1;
        if (b.visible_in_portal && b.clickable_in_portal) return 1;
        if (a.clickable_in_portal) return -1;
        if (b.clickable_in_portal) return 1;
        return 0;
      });
    setPopupsState(sortedPopups);
  }

  const updateApplication = (application: ApplicationProps) => {
    if(!applications) return;
    const newApps = applications.filter(ap => ap.id !== application.id)
    setApplications([...newApps, application])
  }

  return (
    <CityContext.Provider value={{
      getCity,
      getApplications,
      setApplications,
      getRelevantApplication,
      getPopups,
      setPopups,
      updateApplication,
      getProducts,
      setProducts
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
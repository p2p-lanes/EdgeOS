"use client";

import { PopupsProps } from '@/types/Popup';
import { useParams } from 'next/navigation';
import { createContext, ReactNode, useContext, useState, useCallback, useEffect } from 'react';

interface CityContext_interface {
  getCity: () => PopupsProps | null;
  getPopups: () => PopupsProps[];
  setPopups: (popups: PopupsProps[]) => void;
  setCityPreselected: (cityId: number) => void;
  popupsLoaded: boolean;
}

export const CityContext = createContext<CityContext_interface | null>(null);

const CityProvider = ({ children }: {children: ReactNode}) => {
  const [popups, setPopupsState] = useState<PopupsProps[]>([]);
  const [popupsLoaded, setPopupsLoaded] = useState<boolean>(false);
  const [cityPreselected, setCityPreselected] = useState<number | null>(null);
  const params = useParams()

  const getValidCity = useCallback((): PopupsProps | null => {
    const city = popups.find((popup: PopupsProps) => popup.slug === params.popupSlug && popup.clickable_in_portal && popup.visible_in_portal)
    return city ?? null;
  }, [popups, params.popupSlug])

  useEffect(() => {
    if (!params.popupSlug) return;
    const city = popups.find(
      (p) => p.slug === params.popupSlug && p.clickable_in_portal && p.visible_in_portal
    );
    if (city) {
      setCityPreselected(city.id);
    }
  }, [params.popupSlug, popups]);

  const getCity = useCallback((): PopupsProps | null => {
    const city = getValidCity();
    if (city) return city;

    if (cityPreselected) {
      const selectedCity = popups.find(
        (p) => p.id === cityPreselected && p.clickable_in_portal && p.visible_in_portal
      );
      if (selectedCity) return selectedCity;
    }

    const fallback = popups.find(
      (p) => p.clickable_in_portal && p.visible_in_portal
    );
    return fallback ?? null;
  }, [getValidCity, cityPreselected, popups]);

  const getPopups = useCallback((): PopupsProps[] => {
    return popups
  }, [popups])

  const setPopups = useCallback((popups: PopupsProps[]): void => {
    const sortedPopups = popups.sort((a, b) => {
        if (a.visible_in_portal && a.clickable_in_portal) return -1;
        if (b.visible_in_portal && b.clickable_in_portal) return 1;
        if (a.clickable_in_portal) return -1;
        if (b.clickable_in_portal) return 1;
        return 0;
      });
    setPopupsState(sortedPopups);
    setPopupsLoaded(true);
  }, [])

  return (
    <CityContext.Provider 
      value={{
        getCity,
        getPopups,
        setPopups,
        setCityPreselected,
        popupsLoaded
      }}
    >
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
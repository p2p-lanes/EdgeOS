'use client'

import { PoapResponse, PoapProps } from '@/types/Poaps';
import { createContext, useContext, useState, ReactNode } from 'react';

interface PoapsContextType {
  poaps: PoapProps[] | null;
  setPoaps: (poaps: PoapProps[] | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PoapsContext = createContext<PoapsContextType | undefined>(undefined);

export const PoapsProvider = ({ children }: { children: ReactNode }) => {
  const [poaps, setPoaps] = useState<PoapProps[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <PoapsContext.Provider
      value={{
        poaps,
        setPoaps,
        loading,
        setLoading,
      }}
    >
      {children}
    </PoapsContext.Provider>
  );
};

export const usePoapsProvider = (): PoapsContextType => {
  const context = useContext(PoapsContext);
  if (context === undefined) {
    throw new Error('usePoapsProvider must be used within a PoapsProvider');
  }
  return context;
}; 
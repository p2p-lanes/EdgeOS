'use client'

import { GroupProps } from '@/types/Group';
import { createContext, useContext, useState, ReactNode } from 'react';

interface GroupsContextType {
  groups: GroupProps[];
  setGroups: (groups: GroupProps[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<GroupProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <GroupsContext.Provider
      value={{
        groups,
        setGroups,
        loading,
        setLoading,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroupsProvider = (): GroupsContextType => {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroupsProvider must be used within a GroupsProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppUser, FilterState } from '../types';
import { USERS } from '../data/mockData';

interface AppContextType {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  users: AppUser[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultFilters: FilterState = {
  datePreset: 'all',
  dateFrom: '',
  dateTo: '',
  marketType: 'All',
  userId: 'All',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<AppUser>(USERS[1]); // Default: BD Manager
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setCurrentUser = (user: AppUser) => {
    setCurrentUserState(user);
    setFilters(defaultFilters);
  };

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, filters, setFilters, users: USERS }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

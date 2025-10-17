import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ForkloreContextType {
  selectedSeedId: string;
  setSelectedSeedId: (seedId: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ForkloreContext = createContext<ForkloreContextType | undefined>(undefined);

export const ForkloreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSeedId, setSelectedSeedId] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ForkloreContext.Provider value={{ selectedSeedId, setSelectedSeedId, refreshTrigger, triggerRefresh }}>
      {children}
    </ForkloreContext.Provider>
  );
};

export const useForklore = () => {
  const context = useContext(ForkloreContext);
  if (context === undefined) {
    throw new Error('useForklore must be used within a ForkloreProvider');
  }
  return context;
};

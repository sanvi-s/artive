import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ForkloreContextType {
  selectedSeedId: string;
  setSelectedSeedId: (seedId: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  mode: "demo" | "real";
  setMode: (mode: "demo" | "real") => void;
}

const ForkloreContext = createContext<ForkloreContextType | undefined>(undefined);

export const ForkloreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSeedId, setSelectedSeedId] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [mode, setMode] = useState<"demo" | "real">("demo"); // Default to demo mode

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ForkloreContext.Provider value={{ 
      selectedSeedId, 
      setSelectedSeedId, 
      refreshTrigger, 
      triggerRefresh,
      mode,
      setMode
    }}>
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

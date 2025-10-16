import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ForkloreContextType {
  selectedSeedId: string;
  setSelectedSeedId: (seedId: string) => void;
}

const ForkloreContext = createContext<ForkloreContextType | undefined>(undefined);

export const ForkloreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSeedId, setSelectedSeedId] = useState<string>("");

  return (
    <ForkloreContext.Provider value={{ selectedSeedId, setSelectedSeedId }}>
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

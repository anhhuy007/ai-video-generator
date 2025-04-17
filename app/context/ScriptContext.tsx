import React, { createContext, useContext, useState } from 'react';

interface ScriptContextType {
  script: string;
  setScript: (script: string) => void;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const ScriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [script, setScript] = useState('');

  return (
    <ScriptContext.Provider value={{ script, setScript }}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useScript = () => {
  const context = useContext(ScriptContext);
  if (!context) {
    throw new Error('useScript must be used within a ScriptProvider');
  }
  return context;
};
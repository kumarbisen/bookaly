import { createContext, FC, useCallback, useContext, useState } from 'react';

interface Item {
  _id?: string;
  token_id: number;
  queue_date: string | Date;
  user_id?: { name?: string; phone?: string } | string;
  provider_id?: string;
  expires_at?: string | Date;
}
interface scanDataprops {
  // A Function (To execute a specific action which takes this data parameters)
  scanedData: (data: string) => void;
  // To hold data
  providerId: string;
  tokenData: Item[];
  updateTokenData: (newToken: Item) => void;
}

const scanContext = createContext<scanDataprops | undefined>(undefined);
export const collectData = (): scanDataprops => {
  const context = useContext(scanContext);
  if (!context) {
    throw new Error('Context not found');
  }
  return context;
};

const ScanStore: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [providerId, setProviderId] = useState<string>('');
  const [tokenItem, setTokenItem] = useState<Item[]>([]);

  const scanedData = useCallback((data: string) => {
    setProviderId(data);
    console.log(providerId);
  }, []);

  const updateTokenData = useCallback((newToken: Item) => {
    setTokenItem(prev => [newToken, ...prev]);
  }, []);

  return (
    <scanContext.Provider
      value={{
        scanedData,
        providerId,
        tokenData: tokenItem,
        updateTokenData,
      }}
    >
      {children}
    </scanContext.Provider>
  );
};
export default ScanStore;

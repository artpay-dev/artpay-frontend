import React, { createContext, useContext, useEffect, useState } from "react";

export interface DataContext {
  info(): Promise<string>;
}

export interface DataProviderProps extends React.PropsWithChildren {}

const defaultContext: DataContext = {
  info: () => Promise.reject("Data provider loaded"),
};

const Context = createContext<DataContext>({ ...defaultContext });

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const dataContext: DataContext = {
    info(): Promise<string> {
      return Promise.resolve("");
    },
  };

  return (
    <Context.Provider value={dataContext}>
      {isLoading ? <></> : children}
    </Context.Provider>
  );
};

export const useData = () => useContext(Context);

export default DataProvider;

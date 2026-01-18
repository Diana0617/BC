import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const businessId = user?.businessId;

  return (
    <BusinessContext.Provider value={{ businessId }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    // Si no está envuelto en BusinessProvider, usar Redux directamente
    const { user } = useSelector((state) => state.auth);
    return { businessId: user?.businessId };
  }
  return context;
};

export default BusinessContext;

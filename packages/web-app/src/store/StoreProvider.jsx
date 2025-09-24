import { Provider } from 'react-redux';
import React from 'react'
import { store } from '@shared';

const StoreProvider = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

export default StoreProvider;
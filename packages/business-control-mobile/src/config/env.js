import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.0.213:3001',
    webUrl: 'http://192.168.0.213:3000',
  },
  staging: {
    apiUrl: 'https://bc-16wt.onrender.com',
    webUrl: 'https://bc-webapp-henna.vercel.app',
  },
  prod: {
    apiUrl: 'https://bc-16wt.onrender.com',
    webUrl: 'https://bc-webapp-henna.vercel.app',
  },
};

const getEnvVars = () => {
  // Si hay variables EXPO_PUBLIC_* (builds de EAS), usarlas directamente
  if (process.env.EXPO_PUBLIC_API_URL) {
    return {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      webUrl: process.env.EXPO_PUBLIC_WEB_URL,
    };
  }
  
  // Si no, usar la configuración del app.json (desarrollo local)
  const env = Constants.expoConfig?.extra?.environment || 'dev';
  
  if (env === 'prod') {
    return ENV.prod;
  } else if (env === 'staging') {
    return ENV.staging;
  }
  return ENV.dev;
};

export default getEnvVars();
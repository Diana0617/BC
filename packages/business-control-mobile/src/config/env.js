import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.0.213:3001', // Tu IP local
    webUrl: 'http://192.168.0.213:3000', // Web app en tu IP local
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

const getEnvVars = (env = process.env.ENVIRONMENT || Constants.expoConfig?.extra?.environment || 'dev') => {
  if (env === 'prod') {
    return ENV.prod;
  } else if (env === 'staging') {
    return ENV.staging;
  }
  return ENV.dev;
};

export default getEnvVars();

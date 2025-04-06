export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

export const IS_ENV_DEV = APP_ENV === 'development';
export const IS_ENV_PROD = APP_ENV === 'production';

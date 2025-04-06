export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

const TINDER_URL = new URL('https://tinder.com/')
const BADOO_URL = new URL('https://badoo.com/')


export const IS_ENV_DEV = APP_ENV === 'development';
export const IS_ENV_PROD = APP_ENV === 'production';

export const ALLOWED_URLS = [TINDER_URL, BADOO_URL]

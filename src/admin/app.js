import White from './extensions/White.png';
import favicon from './extensions/favicon.png';

const config = {
  auth: {
    logo: White,
  },
  head: {
    favicon: favicon,
  },
  menu: {
    logo: White,
  },
  theme: {
    // overwrite light theme properties
      colors: {
        primary100: '#f6ecfc',
        primary200: '#e0c1f4',
        primary500: '#ac73e6',
        primary600: '#9736e8',
        primary700: '#8312d1',
        danger700: '#b72b1a'
      },
  },

  tutorials: false,
  locales: [
    // 'ar',
    // 'fr',
    // 'cs',
    // 'de',
    // 'dk',
    // 'es',
    // 'he',
    // 'id',
    // 'it',
    // 'ja',
    // 'ko',
    // 'ms',
    // 'nl',
    // 'no',
    // 'pl',
    // 'pt-BR',
    // 'pt',
    // 'ru',
    // 'sk',
    // 'sv',
    // 'th',
    // 'tr',
    // 'uk',
    // 'vi',
    // 'zh-Hans',
    // 'zh',
  ],
};



const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};

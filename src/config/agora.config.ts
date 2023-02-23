import { Platform } from "react-native";

const config = {
  // Get your own App ID at https://dashboard.agora.io/
  appId: '0798e5d6f70841bc8bb1f2cd5f9a73fd',
  // Please refer to https://docs.agora.io/en/Agora%20Platform/token
  token: '007eJxTYHBzs4wJVbE/uZLlzzGnhLVTVoaJFYVqLvTb4XLRJvym1GQFBgNzS4tU0xSzNHMDCxPDpGSLpCTDNKPkFNM0y0Rz47QUD+3vyQ2BjAxV8seZGRkgEMRnZsipyGBgAACTlB1m',
  channelId: 'lxh',
  uid: Platform.OS == 'ios' ? 12323 : 3297,
};

export default config;

import { type ResponseWebHookPaypal } from 'src/types';

export const isOrderPaypalCapture = (x: any): x is ResponseWebHookPaypal => {
  return 'intent' in x.resource;
};

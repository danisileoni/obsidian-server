import { type PaypalCaptureResponse } from 'src/types';

export const isOrderPaypalCapture = (x: any): x is PaypalCaptureResponse => {
  return 'intent' in x;
};

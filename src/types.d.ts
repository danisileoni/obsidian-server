export interface MercadoPagoArs {
  token: string;
  items: Item[];
  amount: number;
  email: string;
  method: string;
  type: string;
  numbers: string;
}

// Paypal
export interface PaypalQuery {
  token: string;
  PayerID: string;
}

export interface PaypalResponse {
  id: string;
  status: string;
  links: Link[];
}

export interface Link {
  href: string;
  rel: string;
  method: string;
}

export interface PaypalCaptureResponse {
  id: string;
  status: string;
  payment_source: PaymentSource;
  purchase_units: PurchaseUnit[];
  payer: Payer;
  links: Link[];
}

export interface Payer {
  name: PayerName;
  email_address: string;
  payer_id: string;
  address: PayerAddress;
}

export interface PayerAddress {
  country_code: string;
}

export interface PayerName {
  given_name: string;
  surname: string;
}

export interface PaymentSource {
  paypal: Paypal;
}

export interface Paypal {
  email_address: string;
  account_id: string;
  account_status: string;
  name: PayerName;
  address: PayerAddress;
}

export interface PurchaseUnit {
  reference_id: string;
  shipping: Shipping;
  payments: Payments;
}

export interface Payments {
  captures: Capture[];
}

export interface Capture {
  id: string;
  status: string;
  amount: Amount;
  final_capture: boolean;
  seller_protection: SellerProtection;
  seller_receivable_breakdown: SellerReceivableBreakdown;
  links: Link[];
  create_time: Date;
  update_time: Date;
}

export interface Amount {
  currency_code: string;
  value: string;
}

export interface SellerProtection {
  status: string;
  dispute_categories: string[];
}

export interface SellerReceivableBreakdown {
  gross_amount: Amount;
  paypal_fee: Amount;
  net_amount: Amount;
}

export interface Shipping {
  name: ShippingName;
  address: ShippingAddress;
}

export interface ShippingAddress {
  address_line_1: string;
  admin_area_2: string;
  admin_area_1: string;
  postal_code: string;
  country_code: string;
}

export interface ShippingName {
  full_name: string;
}

export interface CancelOrder {
  ok: boolean;
  message: string;
}

export interface ItemPaypal {
  name: string;
  description: string;
  quantity: number;
  unit_amount: UnitAmount;
}

export interface UnitAmount {
  currency_code: string;
  value: number;
}

export interface ConvertAmount {
  amountConvert: number;
  amountUnitsConvert: Item[];
}

// Global Payment
export interface Item {
  title: string;
  description: string;
  quantity: number;
  amount: number;
}

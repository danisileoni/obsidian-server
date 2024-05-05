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
  intent: string;
  status: string;
  payment_source: PaymentSource;
  purchase_units: PurchaseUnit[];
  payer: Payer;
  create_time: Date;
  update_time: Date;
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
  amount: Amount;
  payee: Payee;
  description: string;
  items: ItemPaypal[];
  shipping: Shipping;
  payments: Payments;
}

export interface Amount {
  currency_code: CurrencyCode;
  value: string;
  breakdown: Breakdown;
}

export interface Breakdown {
  item_total: Handling;
  shipping: Handling;
  handling: Handling;
  insurance: Handling;
  shipping_discount: Handling;
}

export interface Handling {
  currency_code: CurrencyCode;
  value: string;
}

export enum CurrencyCode {
  Usd = 'USD',
}

export interface ItemPaypal {
  name: string;
  unit_amount: Handling;
  tax: Handling;
  quantity: string;
  description: string;
}

export interface Payee {
  email_address: string;
  merchant_id: string;
}

export interface Payments {
  captures: Capture[];
}

export interface Capture {
  id: string;
  status: string;
  amount: Handling;
  final_capture: boolean;
  seller_protection: SellerProtection;
  seller_receivable_breakdown: SellerReceivableBreakdown;
  links: Link[];
  create_time: Date;
  update_time: Date;
}

export interface SellerProtection {
  status: string;
  dispute_categories: string[];
}

export interface SellerReceivableBreakdown {
  gross_amount: Handling;
  paypal_fee: Handling;
  net_amount: Handling;
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

export interface TypeOrder {
  id: string | number;
  items: Items;
  payer: { email: string };
  paymentGateway: string;
}

type Items = ItemMP[] | ItemPaypal[];

export interface ItemMP {
  id: string;
  title: string;
  description?: string;
  picture_url?: string;
  category_id?: string;
  quantity: number;
  unit_price: number;
}

export interface ItemsDetails {
  idProduct: string;
  quantityPrimary: number;
  quantitySecondary: number;
  quantitySteam: number;
}

import { type InfoProduct } from './products/entities/info-product.entity';

export interface MercadoPagoArs {
  token: string;
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

type Items = ItemMP[] | ItemWebHookPaypal[];

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
  quantityPlayStation3: number;
}

export interface ItemEmailPaid {
  image_url: string;
  product_name: string;
  type_account: string;
  platform_name: string;
  email: string;
  password: string;
  id_account: string;
}

export interface ViewProduct {
  info_product_id: string;
  product_id: number;
  platform_id: number;
  sale_id: number;
  title: string;
  description: string;
  slug: string;
  tags: string[];
  pricePrimary: null | string;
  priceSecondary: null | string;
  price: null | string;
  createAt: Date;
  namePlatform: string;
  sale: number;
  product_images: string[];
  salePrimary: null | string;
  saleSecondary: null | string;
  salePrice: null | string;
  finallySaleAt: null | string;
}

export interface Stock {
  stockPs4: StockPS;
  stockPs5: StockPS;
}

export interface StockPS {
  primary: number;
  secondary: number;
}

export interface AllProducts {
  products: InfoProduct[];
  countsProducts: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}

export interface ResponseWebHookPaypal {
  id: string;
  create_time: Date;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: ResourceWebHookPaypal;
  status: string;
  transmissions: Transmission[];
  links: LinkWebHookPaypal[];
  event_version: string;
  resource_version: string;
}

export interface LinkWebHookPaypal {
  href: string;
  rel: string;
  method: string;
  encType?: string;
}

export interface ResourceWebHookPaypal {
  update_time: Date;
  create_time: Date;
  purchase_units: PurchaseUnitWebHookPaypal[];
  links: LinkWebHookPaypal[];
  id: string;
  payment_source: PaymentSourceWebHookPaypal;
  intent: string;
  payer: PayerWebHookPaypal;
  status: string;
}

export interface PayerWebHookPaypal {
  name: PayerNameWebHookPaypal;
  email_address: string;
  payer_id: string;
  address: PayerAddressWebHookPaypal;
}

export interface PayerAddressWebHookPaypal {
  country_code: string;
}

export interface PayerNameWebHookPaypal {
  given_name: string;
  surname: string;
}

export interface PaymentSourceWebHookPaypal {
  paypal: PaypalWebHookPaypal;
}

export interface PaypalWebHookPaypal {
  email_address: string;
  account_id: string;
  account_status: string;
  name: PayerName;
  address: PayerAddress;
}

export interface PurchaseUnitWebHookPaypal {
  reference_id: string;
  amount: AmountWebHookPaypal;
  payee: PayeeWebHookPaypal;
  items: ItemWebHookPaypal[];
  shipping: Shipping;
  payments: PaymentsWebHookPaypal;
  risk_assessment: RiskAssessmentWebHookPaypal;
}

export interface AmountWebHookPaypal {
  currency_code: string;
  value: string;
  breakdown: BreakdownWebHookPaypal;
}

export interface BreakdownWebHookPaypal {
  item_total: ItemTotalWebHookPaypal;
}

export interface ItemTotalWebHookPaypal {
  currency_code: string;
  value: string;
}

export interface ItemWebHookPaypal {
  name: string;
  unit_amount: ItemTotalWebHookPaypal;
  quantity: string;
}

export interface PayeeWebHookPaypal {
  email_address: string;
  merchant_id: string;
  display_data: DisplayDataWebHookPaypal;
}

export interface DisplayDataWebHookPaypal {
  brand_name: string;
}

export interface PaymentsWebHookPaypal {
  captures: CaptureWebHookPaypal[];
}

export interface CaptureWebHookPaypal {
  id: string;
  status: string;
  amount: ItemTotalWebHookPaypal;
  final_capture: boolean;
  seller_protection: SellerProtectionWebHookPaypal;
  seller_receivable_breakdown: SellerReceivableBreakdownWebHookPaypal;
  links: LinkWebHookPaypal[];
  create_time: Date;
  update_time: Date;
}

export interface SellerProtectionWebHookPaypal {
  status: string;
  dispute_categories: string[];
}

export interface SellerReceivableBreakdownWebHookPaypal {
  gross_amount: ItemTotalWebHookPaypal;
  paypal_fee: ItemTotalWebHookPaypal;
  net_amount: ItemTotalWebHookPaypal;
}

export interface RiskAssessmentWebHookPaypal {
  score: number;
  reasons: string[];
}

export interface ShippingWebHookPaypal {
  name: ShippingNameWebHookPaypal;
  address: ShippingAddressWebHookPaypal;
}

export interface ShippingAddressWebHookPaypal {
  address_line_1: string;
  admin_area_2: string;
  admin_area_1: string;
  postal_code: string;
  country_code: string;
}

export interface ShippingNameWebHookPaypal {
  full_name: string;
}

export interface TransmissionWebHookPaypal {
  webhook_url: string;
  http_status: number;
  reason_phrase: string;
  response_headers: ResponseHeadersWebHookPaypal;
  transmission_id: string;
  status: string;
  timestamp: Date;
}

export interface ResponseHeadersWebHookPaypal {
  Etag: string;
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Credentials': string;
  Connection: string;
  Vary: string;
  'Content-Length': string;
  Date: string;
  'X-Powered-By': string;
  'Content-Type': string;
}

export interface QueryParamsMP {
  'data.id': string;
  type: string;
}

export interface HeadersMP {
  host: string;
  'user-agent': string;
  'content-length': string;
  accept: string;
  'accept-encoding': string;
  'content-type': string;
  newrelic: string;
  traceparent: string;
  tracestate: string;
  'x-forwarded-for': string;
  'x-forwarded-host': string;
  'x-forwarded-proto': 'https';
  'x-request-id': string;
  'x-rest-pool-name': string;
  'x-retry': string;
  'x-signature': string;
  'x-socket-timeout': string;
}

export interface BodyWebhookMP {
  action: string;
  api_version: string;
  data: { id: string };
  date_created: string;
  id: string;
  live_mode: boolean;
  type: string;
  user_id: number;
}

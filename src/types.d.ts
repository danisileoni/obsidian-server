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

type Items = Array<ItemMP> | ItemPaypal[];

export interface ItemMP {
  id: string;
  title: string;
  description: string;
  picture_url: null;
  category_id: string;
  quantity: string;
  unit_price: string;
}

// MP
export interface MercadoPagoResponse {
  id: number;
  date_created: Date;
  date_approved: Date;
  date_last_updated: Date;
  date_of_expiration: null;
  money_release_date: Date;
  money_release_status: string;
  operation_type: string;
  issuer_id: string;
  payment_method_id: string;
  payment_type_id: string;
  payment_method: PaymentMethod;
  status: string;
  status_detail: string;
  currency_id: string;
  description: string;
  live_mode: boolean;
  sponsor_id: null;
  authorization_code: string;
  money_release_schema: null;
  taxes_amount: number;
  counter_currency: null;
  brand_id: null;
  shipping_amount: number;
  build_version: string;
  pos_id: null;
  store_id: null;
  integrator_id: null;
  platform_id: null;
  corporation_id: null;
  payer: Payer;
  collector_id: number;
  marketplace_owner: null;
  metadata: Metadata;
  additional_info: AdditionalInfo;
  order: Metadata;
  external_reference: null;
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  differential_pricing_id: null;
  financing_group: null;
  deduction_schema: null;
  installments: number;
  transaction_details: TransactionDetails;
  fee_details: FeeDetail[];
  charges_details: ChargesDetail[];
  captured: boolean;
  binary_mode: boolean;
  call_for_authorize_id: null;
  statement_descriptor: null;
  card: Card;
  notification_url: null;
  refunds: any[];
  processing_mode: string;
  merchant_account_id: null;
  merchant_number: null;
  acquirer_reconciliation: any[];
  point_of_interaction: PointOfInteraction;
  accounts_info: null;
  tags: null;
  api_response: APIResponse;
}

export interface AdditionalInfo {
  items: Item[];
  available_balance: null;
  nsu_processadora: null;
  authentication_code: null;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  picture_url: null;
  category_id: string;
  quantity: string;
  unit_price: string;
}

export interface APIResponse {
  status: number;
  headers: Record<string, string[]>;
}

export interface Card {
  id: null;
  first_six_digits: string;
  last_four_digits: string;
  expiration_month: number;
  expiration_year: number;
  date_created: Date;
  date_last_updated: Date;
  country: null;
  tags: null;
  cardholder: Cardholder;
}

export interface Cardholder {
  name: string;
  identification: Identification;
}

export interface Identification {
  number: string;
  type: string;
}

export interface ChargesDetail {
  id: string;
  name: string;
  type: string;
  accounts: Accounts;
  client_id: number;
  date_created: Date;
  last_updated: Date;
  amounts: Amounts;
  metadata: Metadata;
  reserve_id: null;
  refund_charges: any[];
}

export interface Accounts {
  from: string;
  to: string;
}

export interface Amounts {
  original: number;
  refunded: number;
}

export interface Metadata {}

export interface FeeDetail {
  type: string;
  amount: number;
  fee_payer: string;
}

export interface Payer {
  identification: Identification;
  entity_type: null;
  phone: Phone;
  last_name: null;
  id: string;
  type: null;
  first_name: null;
  email: string;
}

export interface Phone {
  number: null;
  extension: null;
  area_code: null;
}

export interface PaymentMethod {
  id: string;
  type: string;
  issuer_id: string;
  data: Data;
}

export interface Data {
  routing_data: RoutingData;
}

export interface RoutingData {
  merchant_account_id: string;
}

export interface PointOfInteraction {
  type: string;
  business_info: BusinessInfo;
}

export interface BusinessInfo {
  unit: string;
  sub_unit: string;
  branch: null;
}

export interface TransactionDetails {
  payment_method_reference_id: null;
  acquirer_reference: null;
  net_received_amount: number;
  total_paid_amount: number;
  overpaid_amount: number;
  external_resource_url: null;
  installment_amount: number;
  financial_institution: null;
  payable_deferral_period: null;
}

export const checkoutMockAddresses = [
  {
    address_id: 1,
    title: "Home",
    street: "18 Cedar Lane",
    city: "Brooklyn",
    postal_code: "11201",
    country: "United States",
    phone_number: "+1 555 014 2200",
    is_default: true,
  },
  {
    address_id: 2,
    title: "Studio",
    street: "240 Wythe Avenue",
    city: "Brooklyn",
    postal_code: "11249",
    country: "United States",
    phone_number: "+1 555 014 8831",
    is_default: false,
  },
];

export const checkoutPaymentMethods = [
  {
    value: "CASH_ON_DELIVERY",
    title: "Cash on delivery",
    detail: "Schema option · no transaction or order is created.",
    marker: "01",
  },
  {
    value: "CREDIT_CARD",
    title: "Credit card",
    detail: "Schema option · card processing is not connected.",
    marker: "02",
  },
  {
    value: "PAYPAL",
    title: "PayPal",
    detail: "Schema option · PayPal is not connected.",
    marker: "03",
  },
];

export const mockDeliveryEstimate = 8;

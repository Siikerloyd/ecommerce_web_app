export const checkoutPaymentMethods = [
  {
    value: "CASH_ON_DELIVERY",
    title: "Cash on delivery",
    detail: "Saved with the order as pending; payment is not processed.",
    marker: "01",
  },
  {
    value: "CREDIT_CARD",
    title: "Credit card",
    detail: "Saved with the order as pending; card processing is not connected.",
    marker: "02",
  },
  {
    value: "PAYPAL",
    title: "PayPal",
    detail: "Saved with the order as pending; PayPal is not connected.",
    marker: "03",
  },
];

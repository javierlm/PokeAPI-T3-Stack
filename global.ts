// Use type safe message keys with `next-intl`
export {};

declare global {
  type Messages = typeof import("./messages/es.json");
  type IntlMessages = Messages;
}

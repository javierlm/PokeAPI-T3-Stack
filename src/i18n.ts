import { getRequestConfig } from "next-intl/server";
import { getLocaleFromCookie } from "./lib/locale";

export default getRequestConfig(async () => {
  const locale = await getLocaleFromCookie();

  return {
    locale,
    timeZone: "Etc/UTC",
    messages: (
      (await import(`../messages/${locale}.json`)) as { default: IntlMessages }
    ).default,
  };
});

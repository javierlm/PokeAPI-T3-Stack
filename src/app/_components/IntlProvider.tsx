"use client";

import { NextIntlClientProvider } from "next-intl";

import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  locale: string;
  messages: IntlMessages;
};

export default function IntlProvider({ children, locale, messages }: Props) {
  const [clientTimeZone, setClientTimeZone] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setClientTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  if (clientTimeZone === undefined) {
    return null;
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={clientTimeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}

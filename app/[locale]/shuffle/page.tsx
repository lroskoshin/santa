import { getDictionary } from "../dictionaries";
import type { Locale } from "@/lib/i18n";
import { ShuffleClient } from "./shuffle-client";

interface ShufflePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ShufflePage({ params }: ShufflePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <ShuffleClient dictionary={dict.shuffle} locale={locale} />;
}


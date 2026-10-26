import { z } from "zod";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./locales";

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalizedText = {
  [K in SupportedLocale]: string;
};
export type LocalizedStringList = {
  [K in SupportedLocale]: string[];
};

function localeStringShape(
  primary: z.ZodString,
  secondary: z.ZodString,
): Record<SupportedLocale, z.ZodString> {
  const shape = {} as Record<SupportedLocale, z.ZodString>;
  for (const locale of SUPPORTED_LOCALES) {
    shape[locale] = locale === DEFAULT_LOCALE ? primary : secondary;
  }
  return shape;
}

function localizedTextSchema(
  shape: Record<SupportedLocale, z.ZodString>,
): z.ZodType<LocalizedText> {
  return z.object(shape) as z.ZodType<LocalizedText>;
}

function localizedStringListSchema(): z.ZodType<LocalizedStringList> {
  const shape = {} as Record<
    SupportedLocale,
    z.ZodArray<z.ZodString>
  >;
  for (const locale of SUPPORTED_LOCALES) {
    shape[locale] = z.array(z.string());
  }
  return z.object(shape) as z.ZodType<LocalizedStringList>;
}

/** Primary locale required; other locales optional (empty falls back via pickLocalized). */
export const LocalizedTextSchema = localizedTextSchema(
  localeStringShape(z.string().min(1), z.string()),
);

export const LocalizedTextRequiredSchema = localizedTextSchema(
  localeStringShape(z.string().min(1), z.string().min(1)),
);

export const LocalizedTextOptionalSchema = localizedTextSchema(
  localeStringShape(z.string(), z.string()),
);

export const LocalizedStringListSchema = localizedStringListSchema();

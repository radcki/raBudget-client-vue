import { eCurrency } from './enums/eCurrency';

export interface Currency {
  currencyCode: eCurrency;
  code: string;
  symbol: string;
  englishName: string | null;
  nativeName: string;
  numberFormat?: NumberFormatInfo;
}

export interface NumberFormatInfo {
  currencyDecimalDigits?: number;
  currencyDecimalSeparator?: string;
  isReadOnly?: boolean;
  currencyGroupSizes?: number[];
  numberGroupSizes?: number[];
  percentGroupSizes?: number[];
  currencyGroupSeparator?: string;
  currencySymbol?: string;
  naNSymbol?: string;
  currencyNegativePattern?: number;
  numberNegativePattern?: number;
  percentPositivePattern?: number;
  percentNegativePattern?: number;
  negativeInfinitySymbol?: string;
  negativeSign?: string;
  numberDecimalDigits?: number;
  numberDecimalSeparator?: string;
  numberGroupSeparator?: string;
  currencyPositivePattern?: number;
  positiveInfinitySymbol?: string;
  positiveSign?: string;
  percentDecimalDigits?: number;
  percentDecimalSeparator?: string;
  percentGroupSeparator?: string;
  percentSymbol?: string;
  perMilleSymbol?: string;
  nativeDigits?: number[];
  digitSubstitution?: number;
}

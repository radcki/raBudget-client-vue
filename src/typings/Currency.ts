import { eCurrency } from './enums/eCurrency';

export interface Currency {
  currencyCode: eCurrency;
  code: string;
  symbol: string;
  englishName: string | null;
  nativeName: string;
}

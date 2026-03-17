import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    currencyCode: string = 'USD',
    locale: string = 'en-US'
  ): string {
    if (value === null || value === undefined) return '';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shortAddress', standalone: true })
export class ShortAddressPipe implements PipeTransform {
  transform(address: string | null) {
    if (!address) return;
    return address.slice(0, 2) + '...' + address.substring(address.length - 5);
  }
}

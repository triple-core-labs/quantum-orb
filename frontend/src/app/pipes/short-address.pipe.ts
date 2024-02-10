import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shortAddress', standalone: true })
export class ShortAddressPipe implements PipeTransform {
  transform(address: string) {
    return address[0] + ' ... ' + address.substring(address.length - 4);
  }
}

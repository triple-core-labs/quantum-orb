import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "shortAddress", standalone: true })
export class ShortAddressPipe implements PipeTransform {
  transform(address: string | null | undefined): string {
    if (!address) return "";
    if (address.length <= 11) return address;
    return address.slice(0, 2) + "..." + address.slice(-5);
  }
}

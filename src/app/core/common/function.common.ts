import {PaymentStatus} from "../model/payment-status";

export module Strings {
  export function isObjectEmpty(obj: any) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}

export class FunctionCommon {
  public static addOrRemove(attr: string, item: any, items: any[], removeIfExist: boolean): void {
    const isObject = item instanceof Object;
    const index = items.findIndex(data => isObject ? data[attr] === item[attr] : data === item);
    if (index === -1) {
      items.push(item);
    } else {
      if (removeIfExist) {
        items.splice(index, 1);
      }
    }
  }

  public static handleAmountPaginationItems(screenWidth: number): number {
    if (screenWidth < 1250 && screenWidth >= 520) {
      return 7;
    }
    if (screenWidth < 520 && screenWidth >= 400) {
      return 3;
    }
    if (screenWidth < 400) {
      return 2;
    }
    return 10;
  }

  public static translatePaymentStatus(paymentStatus: PaymentStatus): string {
    return <string>new Map<PaymentStatus, string>([
      [PaymentStatus.PAYMENT_PENDING, 'Pagamento pendente'],
      [PaymentStatus.FAILED, 'Falha'],
      [PaymentStatus.REFUNDED, 'Reembolsado'],
      [PaymentStatus.SUCCESS, 'Sucesso']
    ]).get(paymentStatus);
  }
}

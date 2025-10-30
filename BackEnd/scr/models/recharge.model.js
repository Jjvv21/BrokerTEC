export class Recharge {
  constructor(rechargeData) {
    this.id = rechargeData.id_recarga;
    this.walletId = rechargeData.id_wallet;
    this.monto = rechargeData.monto;
    this.fecha = rechargeData.fecha;
  }
}
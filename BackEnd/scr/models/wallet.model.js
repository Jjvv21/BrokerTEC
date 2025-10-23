export class Wallet {
  constructor(walletData) {
    this.id = walletData.id_wallet;
    this.usuarioId = walletData.id_usuario;
    this.saldo = walletData.saldo;
  }
}
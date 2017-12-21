import {
  EthInitiateParams,
  EthParticipateParams,
  EthWalletTestnet,
  InitiateData,
  ParticipateData,
} from "../../../../../wallet/src";
import {Observable} from "rxjs/Observable";
import {RedeemData, RedeemParams} from "../../../../../wallet/src/atomic-swap";
import {TokenFactory, TOKENS} from "../../../../../wallet/src/eth-tokens/token-factory";
import {EthRedeemParams} from "../../../../../wallet/src/eth/atomic-swap/eth-redeem-params";
import {ShapeshiftStorage} from "../../common/shapeshift-storage";
import {EthCoinModel} from "../coins/eth-coin.model";
import {Wallet} from "./wallet";
import {TokenAtomicSwap} from "../../../../../wallet/src/eth/tokens/token-atomic-swap";

export class EthWallet extends EthWalletTestnet implements Wallet {
  readonly timeout: number = 7200;

  constructor() {
    super();
  }

  Initiate(address: string, coin: EthCoinModel): Observable<InitiateData> {
    return Observable.fromPromise(super.initiate(this.getInitParams(address, coin.amount.toString())));
  }

  Participate(data: InitiateData, coin: EthCoinModel): Observable<ParticipateData> {
    // tslint:disable-next-line
    console.log("PARTICIPATING ETH:... ", InitiateData);
    const xprivKey = this.init();

    const secretHash = data.secretHash;
    const participateParams = new EthParticipateParams(this.timeout,
      this.oxify(secretHash),
      data.address,
      coin.amount.toString(), xprivKey);

    return Observable.fromPromise(super.participate(participateParams));
  }

  Redeem(data: RedeemData, coin: EthCoinModel): Observable<RedeemData> {
    this.init();
    const params = new EthRedeemParams(this.oxify(data.secret), this.oxify(data.secretHash), null);
    return Observable.fromPromise(this.redeem(params));
  }

  getInitParams(address: string, amount: string): EthInitiateParams {
    return new EthInitiateParams(this.timeout, address, amount.toString());
  }

  oxify(param: string): string {
    return param.indexOf("0x") === -1 ? "0x" + param : param
  }

  public init(): string {
    const xprivKey = ShapeshiftStorage.get("btcprivkey");
    const keystore = super.recover(xprivKey);
    this.login(keystore, xprivKey);
    return xprivKey;
  }

  public getERC20Token(token: TOKENS): TokenAtomicSwap {
    return TokenFactory.GetToken(token, this.engine);
  }
}
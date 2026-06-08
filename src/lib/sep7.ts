/**
 * SEP-7 URI builder.
 * Spec: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
 */

export interface Sep7PayParams {
  destination: string;
  amount?: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH' | 'MEMO_RETURN';
  msg?: string;
}

export function buildSep7Uri(params: Sep7PayParams): string {
  const url = new URL('web+stellar:pay');
  url.searchParams.set('destination', params.destination);
  if (params.amount) url.searchParams.set('amount', params.amount);
  if (params.assetCode && params.assetCode !== 'XLM') {
    url.searchParams.set('asset_code', params.assetCode);
    if (params.assetIssuer) url.searchParams.set('asset_issuer', params.assetIssuer);
  }
  if (params.memo) {
    url.searchParams.set('memo', params.memo);
    url.searchParams.set('memo_type', params.memoType ?? 'MEMO_TEXT');
  }
  if (params.msg) url.searchParams.set('msg', params.msg);
  return url.toString();
}

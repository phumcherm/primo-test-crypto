export type CryptoAlgorithm = 'aes-256-cbc';
export type RsaPadding = 'RSA_PKCS1_PADDING' | 'RSA_PKCS1_OAEP_PADDING';
export type EncodingType = 'utf8' | 'base64';

export interface CryptoConfig {
  readonly rsaPrivateKey: string;
  readonly rsaPublicKey: string;
  readonly aesAlgorithm: CryptoAlgorithm;
  readonly rsaPadding: RsaPadding;
}

export interface EncryptionParams {
  payload: string;
  encoding?: EncodingType;
}

export interface DecryptionParams {
  data1: string;
  data2: string;
  encoding?: EncodingType;
}

export enum CryptoErrorCode {
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  INVALID_ENCRYPTED_DATA = 'INVALID_ENCRYPTED_DATA',
  RSA_KEY_NOT_FOUND = 'RSA_KEY_NOT_FOUND',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION'
}

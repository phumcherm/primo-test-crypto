export interface ICryptoKeyProvider {
  getRsaPrivateKey(): string;
  getRsaPublicKey(): string;
}

export interface IEncryptionService {
  encryptData(payload: string): Promise<EncryptionResult>;
}

export interface IDecryptionService {
  decryptData(data1: string, data2: string): Promise<string>;
}

export interface ICryptoService extends IEncryptionService, IDecryptionService {}

export interface EncryptionResult {
  data1: string;
  data2: string;
}

export interface CryptoOperationResult<T> {
  success: boolean;
  data?: T;
  error?: CryptoError;
}

export interface CryptoError {
  code: string;
  message: string;
  details?: unknown;
}

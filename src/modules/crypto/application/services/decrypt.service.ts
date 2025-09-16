import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IDecryptionService } from '../../domain/interfaces/crypto.interface';
import { CryptoKeyProvider } from '../../infrastructure/providers/crypto-key.provider';
import { CryptoAlgorithm, RsaPadding } from '../../domain/types/crypto.types';
import { DecryptionFailedException } from '../../domain/exceptions/crypto.exceptions';

@Injectable()
export class DecryptService implements IDecryptionService {
  private readonly aesAlgorithm: CryptoAlgorithm = 'aes-256-cbc';
  private readonly rsaPadding: RsaPadding = 'RSA_PKCS1_OAEP_PADDING';

  constructor(private readonly cryptoKeyProvider: CryptoKeyProvider) {}

  async decryptData(data1: string, data2: string): Promise<string> {
    try {
      const aesKey: Buffer = crypto.privateDecrypt(
        {
          key: this.cryptoKeyProvider.getRsaPrivateKey(),
          padding: crypto.constants[this.rsaPadding],
        },
        Buffer.from(data1, 'base64')
      );

      const combinedData: Buffer = Buffer.from(data2, 'base64');
      const iv: Buffer = combinedData.subarray(0, 16);
      const encryptedPayload: Buffer = combinedData.subarray(16);

      const aesDecipher = crypto.createDecipheriv(this.aesAlgorithm, aesKey, iv);
      let decryptedPayload: Buffer = aesDecipher.update(encryptedPayload);
      decryptedPayload = Buffer.concat([decryptedPayload, aesDecipher.final()]);
      const result = decryptedPayload.toString('utf8');

      return result;
    } catch (error) {
      throw new DecryptionFailedException('Failed to decrypt data', error as Error);
    }
  }
}

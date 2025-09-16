import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IEncryptionService, EncryptionResult } from '../../domain/interfaces/crypto.interface';
import { CryptoKeyProvider } from '../../infrastructure/providers/crypto-key.provider';
import { CryptoAlgorithm, RsaPadding } from '../../domain/types/crypto.types';
import { EncryptionFailedException } from '../../domain/exceptions/crypto.exceptions';

@Injectable()
export class EncryptService implements IEncryptionService {
  private readonly aesAlgorithm: CryptoAlgorithm = 'aes-256-cbc';
  private readonly rsaPadding: RsaPadding = 'RSA_PKCS1_OAEP_PADDING';

  constructor(private readonly cryptoKeyProvider: CryptoKeyProvider) {}

  async encryptData(payload: string): Promise<EncryptionResult> {
    try {
      const aesKey: Buffer = crypto.randomBytes(32);
      const iv: Buffer = crypto.randomBytes(16);

      const aesCipher = crypto.createCipheriv(this.aesAlgorithm, aesKey, iv);
      let encryptedPayload: Buffer = aesCipher.update(payload, 'utf8');
      encryptedPayload = Buffer.concat([encryptedPayload, aesCipher.final()]);
      
      const data2: string = Buffer.concat([iv, encryptedPayload]).toString('base64');

      const data1: string = crypto.publicEncrypt(
        {
          key: this.cryptoKeyProvider.getRsaPublicKey(),
          padding: crypto.constants[this.rsaPadding],
        },
        aesKey
      ).toString('base64');

      return { data1, data2 };
    } catch (error) {
      throw new EncryptionFailedException('Failed to encrypt data', error);
    }
  }
}

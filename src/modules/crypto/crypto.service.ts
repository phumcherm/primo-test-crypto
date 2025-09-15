import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { EncryptData } from '../../common/interfaces/api-response.interface';
import { CryptoConfig, isNonEmptyString, isDefined } from '../../common/types/strict-types';

@Injectable()
export class CryptoService implements CryptoConfig {
  readonly rsaPrivateKey: string;
  readonly rsaPublicKey: string;

  constructor(private readonly configService: ConfigService) {
    const privateKey = this.configService.get<string>('RSA_PRIVATE_KEY');
    const publicKey = this.configService.get<string>('RSA_PUBLIC_KEY');

    if (!isDefined(privateKey) || !isNonEmptyString(privateKey)) {
      throw new InternalServerErrorException('RSA keys not found in environment variables');
    }

    if (!isDefined(publicKey) || !isNonEmptyString(publicKey)) {
      throw new InternalServerErrorException('RSA keys not found in environment variables');
    }

    this.rsaPrivateKey = privateKey;
    this.rsaPublicKey = publicKey;
  }

  async encryptData(payload: string): Promise<EncryptData> {
    if (!isNonEmptyString(payload)) {
      throw new BadRequestException('Invalid payload');
    }

    // Generate random AES key (256-bit)
    const aesKey: Buffer = crypto.randomBytes(32);

    // Encrypt payload with AES
    const iv: Buffer = crypto.randomBytes(16);
    const aesCipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    let encryptedPayload: string = aesCipher.update(payload, 'utf8', 'base64');
    encryptedPayload += aesCipher.final('base64');
    
    // Combine IV and encrypted payload
    const data2: string = Buffer.concat([iv, Buffer.from(encryptedPayload, 'base64')]).toString('base64');

    // Encrypt AES key with RSA private key
    const data1: string = crypto.privateEncrypt(
      {
        key: this.rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      aesKey
    ).toString('base64');

    return { data1, data2 };
  }

  async decryptData(data1: string, data2: string): Promise<string> {
    if (!isNonEmptyString(data1) || !isNonEmptyString(data2)) {
      throw new BadRequestException('Invalid encrypted data');
    }

    // Decrypt AES key with RSA public key
    const aesKey: Buffer = crypto.publicDecrypt(
      {
        key: this.rsaPublicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(data1, 'base64')
    );

    // Extract IV and encrypted payload from data2
    const combinedData: Buffer = Buffer.from(data2, 'base64');
    const iv: Buffer = combinedData.subarray(0, 16);
    const encryptedPayload: Buffer = combinedData.subarray(16);

    // Decrypt payload with AES
    const aesDecipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    let decryptedPayload: string = aesDecipher.update(encryptedPayload).toString('utf8');
    decryptedPayload += aesDecipher.final('utf8');

    return decryptedPayload;
  }
}

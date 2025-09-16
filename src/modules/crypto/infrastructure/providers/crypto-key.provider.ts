import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICryptoKeyProvider } from '../../domain/interfaces/crypto.interface';
import { RsaKeyNotFoundException } from '../../domain/exceptions/crypto.exceptions';
import { isNonEmptyString, isDefined } from '../../../../common/types/strict-types';

@Injectable()
export class CryptoKeyProvider implements ICryptoKeyProvider {
  private readonly _rsaPrivateKey: string;
  private readonly _rsaPublicKey: string;

  constructor(private readonly configService: ConfigService) {
    this._rsaPrivateKey = this.loadRsaPrivateKey();
    this._rsaPublicKey = this.loadRsaPublicKey();
  }

  getRsaPrivateKey(): string {
    return this._rsaPrivateKey;
  }

  getRsaPublicKey(): string {
    return this._rsaPublicKey;
  }

  private loadRsaPrivateKey(): string {
    const privateKey = this.configService.get<string>('RSA_PRIVATE_KEY');
    
    if (!isDefined(privateKey) || !isNonEmptyString(privateKey)) {
      throw new RsaKeyNotFoundException('RSA private key not found in environment variables');
    }

    return privateKey;
  }

  private loadRsaPublicKey(): string {
    const publicKey = this.configService.get<string>('RSA_PUBLIC_KEY');
    
    if (!isDefined(publicKey) || !isNonEmptyString(publicKey)) {
      throw new RsaKeyNotFoundException('RSA public key not found in environment variables');
    }

    return publicKey;
  }
}

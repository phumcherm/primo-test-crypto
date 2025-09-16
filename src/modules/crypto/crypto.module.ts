import { Module } from '@nestjs/common';
import { CryptoController } from './crypto.controller';
import { EncryptService } from './application/services/encrypt.service';
import { DecryptService } from './application/services/decrypt.service';
import { CryptoKeyProvider } from './infrastructure/providers/crypto-key.provider';

@Module({
  controllers: [CryptoController],
  providers: [
    CryptoKeyProvider,
    EncryptService,
    DecryptService,
  ],
  exports: [EncryptService, DecryptService, CryptoKeyProvider],
})
export class CryptoModule {}

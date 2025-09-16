import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CryptoErrorCode } from '../types/crypto.types';

export class CryptoException extends Error {
  constructor(
    public readonly code: CryptoErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CryptoException';
  }
}

export class InvalidPayloadException extends BadRequestException {
  constructor(message: string = 'Invalid payload provided') {
    super({
      error_code: CryptoErrorCode.INVALID_PAYLOAD,
      message,
    });
  }
}

export class InvalidEncryptedDataException extends BadRequestException {
  constructor(message: string = 'Invalid encrypted data provided') {
    super({
      error_code: CryptoErrorCode.INVALID_ENCRYPTED_DATA,
      message,
    });
  }
}

export class RsaKeyNotFoundException extends InternalServerErrorException {
  constructor(message: string = 'RSA keys not found in environment variables') {
    super({
      error_code: CryptoErrorCode.RSA_KEY_NOT_FOUND,
      message,
    });
  }
}

export class EncryptionFailedException extends InternalServerErrorException {
  constructor(message: string = 'Encryption operation failed', details?: unknown) {
    super({
      error_code: CryptoErrorCode.ENCRYPTION_FAILED,
      message,
      details,
    });
  }
}

export class DecryptionFailedException extends InternalServerErrorException {
  constructor(message: string = 'Decryption operation failed', details?: unknown) {
    super({
      error_code: CryptoErrorCode.DECRYPTION_FAILED,
      message,
      details,
    });
  }
}

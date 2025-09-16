import { Test, TestingModule } from '@nestjs/testing';
import { DecryptService } from './decrypt.service';
import { EncryptService } from './encrypt.service';
import { CryptoKeyProvider } from '../../infrastructure/providers/crypto-key.provider';
import { InvalidEncryptedDataException, DecryptionFailedException } from '../../domain/exceptions/crypto.exceptions';
import * as crypto from 'crypto';

describe('DecryptService', () => {
  let service: DecryptService;
  let encryptService: EncryptService;
  let mockCryptoKeyProvider: jest.Mocked<CryptoKeyProvider>;

  // Generate real RSA keys for testing
  const { publicKey: mockPublicKey, privateKey: mockPrivateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  beforeEach(async () => {
    mockCryptoKeyProvider = {
      getRsaPublicKey: jest.fn().mockReturnValue(mockPublicKey),
      getRsaPrivateKey: jest.fn().mockReturnValue(mockPrivateKey),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecryptService,
        EncryptService,
        {
          provide: CryptoKeyProvider,
          useValue: mockCryptoKeyProvider,
        },
      ],
    }).compile();

    service = module.get<DecryptService>(DecryptService);
    encryptService = module.get<EncryptService>(EncryptService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('decryptData', () => {
    const validData1 = 'dGVzdERhdGEx'; // base64 for 'testData1'
    const validData2 = 'dGVzdERhdGEy'; // base64 for 'testData2'

    describe('validation', () => {
      it('should throw InvalidEncryptedDataException for empty data1', async () => {
        await expect(service.decryptData('', validData2))
          .rejects.toThrow(InvalidEncryptedDataException);
      });

      it('should throw InvalidEncryptedDataException for empty data2', async () => {
        await expect(service.decryptData(validData1, ''))
          .rejects.toThrow(InvalidEncryptedDataException);
      });

      it('should throw InvalidEncryptedDataException for null data1', async () => {
        await expect(service.decryptData(null as any, validData2))
          .rejects.toThrow(InvalidEncryptedDataException);
      });

      it('should throw InvalidEncryptedDataException for null data2', async () => {
        await expect(service.decryptData(validData1, null as any))
          .rejects.toThrow(InvalidEncryptedDataException);
      });
    });

    describe('decryption errors', () => {
      it('should throw DecryptionFailedException for invalid base64 data1', async () => {
        await expect(service.decryptData('invalid_base64!', validData2))
          .rejects.toThrow(DecryptionFailedException);
      });

      it('should throw DecryptionFailedException for invalid base64 data2', async () => {
        await expect(service.decryptData(validData1, 'invalid_base64!'))
          .rejects.toThrow(DecryptionFailedException);
      });

      it('should throw DecryptionFailedException when RSA key is invalid', async () => {
        mockCryptoKeyProvider.getRsaPrivateKey.mockReturnValue('invalid-key');

        await expect(service.decryptData(validData1, validData2))
          .rejects.toThrow(DecryptionFailedException);
      });
    });

    describe('integration', () => {
      it('should call getRsaPrivateKey when decrypting', async () => {
        try {
          await service.decryptData(validData1, validData2);
        } catch (error) {
          // Expected to fail with mock data, but should call the method
        }
        
        expect(mockCryptoKeyProvider.getRsaPrivateKey).toHaveBeenCalled();
      });

      it('should handle CryptoKeyProvider errors', async () => {
        mockCryptoKeyProvider.getRsaPrivateKey.mockImplementation(() => {
          throw new Error('Key provider error');
        });

        await expect(service.decryptData(validData1, validData2))
          .rejects.toThrow(DecryptionFailedException);
      });
    });

    describe('encrypt -> decrypt roundtrip', () => {
      it('should encrypt and then decrypt back to original payload', async () => {
        const payload = 'Hello World!';

        const enc = await encryptService.encryptData(payload);
        const dec = await service.decryptData(enc.data1, enc.data2);

        expect(dec).toBe(payload);
      });

      it('should work with longer payloads', async () => {
        const payload = 'This is a much longer test message to verify that our encryption and decryption process works correctly with larger amounts of data. Let\'s make this even longer to see how it handles multiple AES blocks!';

        const enc = await encryptService.encryptData(payload);
        const dec = await service.decryptData(enc.data1, enc.data2);

        expect(dec).toBe(payload);
      });

      it('should work with special characters', async () => {
        const payload = 'สวัสดี! 你好! こんにちは! 🚀🔐💻';

        const enc = await encryptService.encryptData(payload);
        const dec = await service.decryptData(enc.data1, enc.data2);

        expect(dec).toBe(payload);
      });
    });
  });
});

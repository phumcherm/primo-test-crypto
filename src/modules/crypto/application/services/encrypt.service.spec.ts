import { Test, TestingModule } from '@nestjs/testing';
import { EncryptService } from './encrypt.service';
import { CryptoKeyProvider } from '../../infrastructure/providers/crypto-key.provider';
import { InvalidPayloadException } from '../../domain/exceptions/crypto.exceptions';

describe('EncryptService', () => {
  let service: EncryptService;
  let mockCryptoKeyProvider: jest.Mocked<CryptoKeyProvider>;

  beforeEach(async () => {
    mockCryptoKeyProvider = {
      getRsaPublicKey: jest.fn().mockReturnValue('mock-public-key'),
      getRsaPrivateKey: jest.fn().mockReturnValue('mock-private-key'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptService,
        {
          provide: CryptoKeyProvider,
          useValue: mockCryptoKeyProvider,
        },
      ],
    }).compile();

    service = module.get<EncryptService>(EncryptService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('encryptData validation', () => {
    it('should throw InvalidPayloadException for empty string', async () => {
      await expect(service.encryptData(''))
        .rejects.toThrow(InvalidPayloadException);
      await expect(service.encryptData(''))
        .rejects.toThrow('Payload must be a non-empty string');
    });

    it('should throw InvalidPayloadException for null', async () => {
      await expect(service.encryptData(null as any))
        .rejects.toThrow(InvalidPayloadException);
    });

    it('should throw InvalidPayloadException for undefined', async () => {
      await expect(service.encryptData(undefined as any))
        .rejects.toThrow(InvalidPayloadException);
    });

    it('should throw InvalidPayloadException for non-string types', async () => {
      await expect(service.encryptData(123 as any))
        .rejects.toThrow(InvalidPayloadException);
      await expect(service.encryptData({} as any))
        .rejects.toThrow(InvalidPayloadException);
      await expect(service.encryptData([] as any))
        .rejects.toThrow(InvalidPayloadException);
    });
  });

  describe('integration', () => {
    it('should call getRsaPublicKey when encrypting valid payload', async () => {
      // Mock the crypto operations to avoid actual encryption
      const originalCrypto = require('crypto');
      const mockCrypto = {
        ...originalCrypto,
        randomBytes: jest.fn().mockReturnValue(Buffer.from('mock-bytes')),
        createCipheriv: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue('mock-encrypted'),
          final: jest.fn().mockReturnValue('mock-final')
        }),
        publicEncrypt: jest.fn().mockReturnValue(Buffer.from('mock-encrypted-key'))
      };
      
      jest.doMock('crypto', () => mockCrypto);

      try {
        await service.encryptData('valid payload');
      } catch (error) {
        // Expected to fail with mock setup, but should call the method
      }
      
      expect(mockCryptoKeyProvider.getRsaPublicKey).toHaveBeenCalled();
    });
  });
});
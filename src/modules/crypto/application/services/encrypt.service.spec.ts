import { Test, TestingModule } from '@nestjs/testing';
import { EncryptService } from './encrypt.service';
import { CryptoKeyProvider } from '../../infrastructure/providers/crypto-key.provider';
import { EncryptionFailedException } from '../../domain/exceptions/crypto.exceptions';
import { EncryptionResult } from '../../domain/interfaces/crypto.interface';
import * as crypto from 'crypto';

jest.mock('crypto');

interface MockCryptoKeyProvider {
  getRsaPublicKey: jest.MockedFunction<() => string>;
  getRsaPrivateKey: jest.MockedFunction<() => string>;
}

interface MockCipher {
  update: jest.MockedFunction<(data: string, encoding: crypto.Encoding) => Buffer>;
  final: jest.MockedFunction<() => Buffer>;
}

describe('EncryptService', () => {
  let service: EncryptService;
  let mockCryptoKeyProvider: MockCryptoKeyProvider;

  const MOCK_RSA_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMOCK_PUBLIC_KEY\n-----END PUBLIC KEY-----';
  const MOCK_AES_KEY = 'mock-aes-key-32-bytes-length!!!';
  const MOCK_IV = 'mock-iv-16-bytes';
  const VALID_PAYLOAD = 'valid payload';

  beforeEach(async () => {
    mockCryptoKeyProvider = {
      getRsaPublicKey: jest.fn<string, []>().mockReturnValue(MOCK_RSA_PUBLIC_KEY),
      getRsaPrivateKey: jest.fn<string, []>().mockReturnValue('mock-private-key'),
    };

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('encryptData success cases', () => {
    let mockCipher: MockCipher;
    const mockedCrypto = jest.mocked(crypto);

    beforeEach(() => {
      mockCipher = {
        update: jest.fn<Buffer, [string, crypto.Encoding]>(),
        final: jest.fn<Buffer, []>(),
      };

      mockedCrypto.randomBytes.mockImplementation((size: number) => {
        if (size === 32) return Buffer.from(MOCK_AES_KEY);
        if (size === 16) return Buffer.from(MOCK_IV);
        return Buffer.alloc(size);
      });

      mockedCrypto.createCipheriv.mockReturnValue(mockCipher as unknown as crypto.Cipher);
      mockedCrypto.publicEncrypt.mockReturnValue(Buffer.from('encrypted-aes-key'));
      
      (mockedCrypto.constants as unknown as Record<string, number>).RSA_PKCS1_OAEP_PADDING = 4;
    });

    it('should successfully encrypt valid payload', async () => {
      const mockEncryptedPayload = Buffer.from('encrypted-payload');
      const mockFinalBuffer = Buffer.from('final-buffer');
      
      mockCipher.update.mockReturnValue(mockEncryptedPayload);
      mockCipher.final.mockReturnValue(mockFinalBuffer);

      const result: EncryptionResult = await service.encryptData(VALID_PAYLOAD);
      expect(mockedCrypto.randomBytes).toHaveBeenCalledTimes(2);
      expect(mockedCrypto.randomBytes).toHaveBeenNthCalledWith(1, 32);
      expect(mockedCrypto.randomBytes).toHaveBeenNthCalledWith(2, 16);

      expect(mockedCrypto.createCipheriv).toHaveBeenCalledWith(
        'aes-256-cbc',
        Buffer.from(MOCK_AES_KEY),
        Buffer.from(MOCK_IV)
      );

      expect(mockCipher.update).toHaveBeenCalledWith(VALID_PAYLOAD, 'utf8');
      expect(mockCipher.final).toHaveBeenCalled();

      expect(mockedCrypto.publicEncrypt).toHaveBeenCalledWith(
        {
          key: MOCK_RSA_PUBLIC_KEY,
          padding: 4,
        },
        Buffer.from(MOCK_AES_KEY)
      );

      expect(mockCryptoKeyProvider.getRsaPublicKey).toHaveBeenCalledTimes(1);
      const expectedCombinedData = Buffer.concat([
        Buffer.from(MOCK_IV),
        mockEncryptedPayload,
        mockFinalBuffer
      ]);

      expect(result).toEqual({
        data1: Buffer.from('encrypted-aes-key').toString('base64'),
        data2: expectedCombinedData.toString('base64'),
      } satisfies EncryptionResult);
    });

    it('should handle different payload sizes', async () => {
      const testPayloads = [
        'a',
        'short text',
        'A much longer text that contains multiple words and should test encryption with larger payloads',
        '🚀 Unicode characters with émojis and spéciał chars! 中文字符',
      ];

      mockCipher.update.mockReturnValue(Buffer.from('encrypted'));
      mockCipher.final.mockReturnValue(Buffer.from('final'));

      for (const payload of testPayloads) {
        const result: EncryptionResult = await service.encryptData(payload);
        
        expect(result.data1).toBeDefined();
        expect(result.data2).toBeDefined();
        expect(typeof result.data1).toBe('string');
        expect(typeof result.data2).toBe('string');
        
        expect(() => Buffer.from(result.data1, 'base64')).not.toThrow();
        expect(() => Buffer.from(result.data2, 'base64')).not.toThrow();
      }
    });
  });

  describe('encryptData error scenarios', () => {
    const mockedCrypto = jest.mocked(crypto);

    it('should throw EncryptionFailedException when crypto operations fail', async () => {
      mockedCrypto.randomBytes.mockImplementation(() => {
        throw new Error('Random bytes generation failed');
      });

      await expect(service.encryptData(VALID_PAYLOAD))
        .rejects.toThrow(EncryptionFailedException);
    });

    it('should throw EncryptionFailedException when RSA encryption fails', async () => {
      mockedCrypto.randomBytes.mockImplementation((size: number) => Buffer.alloc(size));
      mockedCrypto.createCipheriv.mockReturnValue({
        update: jest.fn().mockReturnValue(Buffer.alloc(10)),
        final: jest.fn().mockReturnValue(Buffer.alloc(10)),
      } as unknown as crypto.Cipher);

      mockedCrypto.publicEncrypt.mockImplementation(() => {
        throw new Error('RSA encryption failed');
      });

      await expect(service.encryptData(VALID_PAYLOAD))
        .rejects.toThrow(EncryptionFailedException);
    });
  });
});
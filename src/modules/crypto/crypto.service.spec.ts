import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import * as crypto from 'crypto';

describe('CryptoService', () => {
  let service: CryptoService;
  let mockConfigService: jest.Mocked<ConfigService>;

  // Generate test RSA keys for testing
  const testKeyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const mockPrivateKey = testKeyPair.privateKey;
  const mockPublicKey = testKeyPair.publicKey;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'RSA_PRIVATE_KEY') return mockPrivateKey;
        if (key === 'RSA_PUBLIC_KEY') return mockPublicKey;
        return null;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have RSA keys initialized', () => {
      expect(service.rsaPrivateKey).toBe(mockPrivateKey);
      expect(service.rsaPublicKey).toBe(mockPublicKey);
    });

    it('should throw error when private key is missing', async () => {
      const invalidConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'RSA_PRIVATE_KEY') return null;
          if (key === 'RSA_PUBLIC_KEY') return mockPublicKey;
          return null;
        }),
      } as any;

      await expect(
        Test.createTestingModule({
          providers: [
            CryptoService,
            { provide: ConfigService, useValue: invalidConfigService },
          ],
        }).compile()
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error when public key is missing', async () => {
      const invalidConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'RSA_PRIVATE_KEY') return mockPrivateKey;
          if (key === 'RSA_PUBLIC_KEY') return null;
          return null;
        }),
      } as any;

      await expect(
        Test.createTestingModule({
          providers: [
            CryptoService,
            { provide: ConfigService, useValue: invalidConfigService },
          ],
        }).compile()
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('encryptData', () => {
    it('should encrypt data successfully', async () => {
      const payload = 'Hello World!';
      const result = await service.encryptData(payload);

      expect(result).toHaveProperty('data1');
      expect(result).toHaveProperty('data2');
      expect(typeof result.data1).toBe('string');
      expect(typeof result.data2).toBe('string');
      expect(result.data1.length).toBeGreaterThan(0);
      expect(result.data2.length).toBeGreaterThan(0);
    });

    it('should encrypt different payloads to different results', async () => {
      const payload1 = 'Hello';
      const payload2 = 'World';
      
      const result1 = await service.encryptData(payload1);
      const result2 = await service.encryptData(payload2);

      expect(result1.data1).not.toBe(result2.data1);
      expect(result1.data2).not.toBe(result2.data2);
    });

    it('should encrypt same payload to different results (due to random IV)', async () => {
      const payload = 'Same payload';
      
      const result1 = await service.encryptData(payload);
      const result2 = await service.encryptData(payload);

      // Should be different due to random IV
      expect(result1.data2).not.toBe(result2.data2);
    });

    it('should throw BadRequestException for empty string', async () => {
      await expect(service.encryptData('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null', async () => {
      await expect(service.encryptData(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for undefined', async () => {
      await expect(service.encryptData(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should handle long payloads', async () => {
      const longPayload = 'A'.repeat(1000);
      const result = await service.encryptData(longPayload);

      expect(result).toHaveProperty('data1');
      expect(result).toHaveProperty('data2');
      expect(result.data1.length).toBeGreaterThan(0);
      expect(result.data2.length).toBeGreaterThan(0);
    });

    it('should handle special characters', async () => {
      const specialPayload = 'Hello 世界! 🌍 @#$%^&*()';
      const result = await service.encryptData(specialPayload);

      expect(result).toHaveProperty('data1');
      expect(result).toHaveProperty('data2');
    });
  });

  describe('decryptData', () => {
    it('should decrypt data successfully', async () => {
      const originalPayload = 'Hello World!';
      
      // First encrypt
      const encrypted = await service.encryptData(originalPayload);
      
      // Then decrypt
      const decrypted = await service.decryptData(encrypted.data1, encrypted.data2);
      
      expect(decrypted).toBe(originalPayload);
    });

    it('should decrypt various payloads correctly', async () => {
      const testPayloads = [
        'Simple text',
        'Text with numbers 123',
        'Special chars !@#$%^&*()',
        'English and Latin: Hello World!',
        'A'.repeat(500), // Long text
      ];

      for (const payload of testPayloads) {
        const encrypted = await service.encryptData(payload);
        const decrypted = await service.decryptData(encrypted.data1, encrypted.data2);
        expect(decrypted).toBe(payload);
      }
    });

    it('should throw BadRequestException for empty data1', async () => {
      await expect(service.decryptData('', 'valid_data2')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty data2', async () => {
      await expect(service.decryptData('valid_data1', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null data1', async () => {
      await expect(service.decryptData(null as any, 'valid_data2')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null data2', async () => {
      await expect(service.decryptData('valid_data1', null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid base64 data1', async () => {
      await expect(service.decryptData('invalid_base64!', 'dGVzdA==')).rejects.toThrow();
    });

    it('should throw error for invalid base64 data2', async () => {
      const validEncrypted = await service.encryptData('test');
      await expect(service.decryptData(validEncrypted.data1, 'invalid_base64!')).rejects.toThrow();
    });

    it('should throw error for mismatched data1 and data2', async () => {
      const encrypted1 = await service.encryptData('payload1');
      const encrypted2 = await service.encryptData('payload2');
      
      // Mix data1 from first with data2 from second
      await expect(service.decryptData(encrypted1.data1, encrypted2.data2)).rejects.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should handle encrypt-decrypt cycle multiple times', async () => {
      const payloads = ['test1', 'test2', 'test3'];
      
      for (const payload of payloads) {
        const encrypted = await service.encryptData(payload);
        const decrypted = await service.decryptData(encrypted.data1, encrypted.data2);
        expect(decrypted).toBe(payload);
      }
    });

    it('should generate different encryption results for same input', async () => {
      const payload = 'same input';
      const results = [];
      
      for (let i = 0; i < 3; i++) {
        const encrypted = await service.encryptData(payload);
        results.push(encrypted);
      }
      
      // All should decrypt to same value
      for (const result of results) {
        const decrypted = await service.decryptData(result.data1, result.data2);
        expect(decrypted).toBe(payload);
      }
      
      // But encrypted values should be different (due to random IV)
      expect(results[0].data2).not.toBe(results[1].data2);
      expect(results[1].data2).not.toBe(results[2].data2);
    });
  });
});

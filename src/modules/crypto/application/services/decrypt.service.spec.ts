import { Test, TestingModule } from '@nestjs/testing';
import { DecryptService } from './decrypt.service';
import { CryptoKeyProvider } from '../../infrastructure/providers/crypto-key.provider';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('DecryptService - Simple Test', () => {
  let service: DecryptService;
  let mockCryptoKeyProvider: Partial<jest.Mocked<CryptoKeyProvider>>;

  beforeEach(async () => {
    const mockedCrypto = jest.mocked(crypto);
    
    // Mock crypto functions
    mockedCrypto.privateDecrypt.mockReturnValue(Buffer.from('decrypted-aes-key'));
    mockedCrypto.createDecipheriv.mockReturnValue({
      update: jest.fn().mockReturnValue(Buffer.from('decrypted')),
      final: jest.fn().mockReturnValue(Buffer.from('payload')),
    } as unknown as crypto.Decipher);
    (mockedCrypto.constants as unknown as Record<string, number>).RSA_PKCS1_OAEP_PADDING = 4;

    mockCryptoKeyProvider = {
      getRsaPublicKey: jest.fn<string, []>().mockReturnValue('-----BEGIN PUBLIC KEY-----\nMOCK_KEY\n-----END PUBLIC KEY-----'),
      getRsaPrivateKey: jest.fn<string, []>().mockReturnValue('-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecryptService,
        {
          provide: CryptoKeyProvider,
          useValue: mockCryptoKeyProvider,
        },
      ],
    }).compile();

    service = module.get<DecryptService>(DecryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should decrypt data and return string result', async () => {
    const data1 = Buffer.from('encrypted-aes-key').toString('base64');
    const data2 = Buffer.from('encrypted-payload').toString('base64');
    
    const result = await service.decryptData(data1, data2);
    
    // ตรวจสอบว่ามี result กลับมา
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle different encrypted data formats', async () => {
    const testCases = [
      { data1: 'dGVzdERhdGEx', data2: 'dGVzdERhdGEy' },
      { data1: 'YW5vdGhlclRlc3Q=', data2: 'bW9yZVRlc3REYXRh' },
      { data1: 'c29tZUVuY3J5cHRlZERhdGE=', data2: 'YW5kTW9yZUVuY3J5cHRlZERhdGE=' }
    ];

    for (const testCase of testCases) {
      const result = await service.decryptData(testCase.data1, testCase.data2);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    }
  });

  it('should call CryptoKeyProvider.getRsaPrivateKey', async () => {
    const data1 = 'dGVzdERhdGEx';
    const data2 = 'dGVzdERhdGEy';
    
    await service.decryptData(data1, data2);
    
    expect(mockCryptoKeyProvider.getRsaPrivateKey).toHaveBeenCalled();
  });
});

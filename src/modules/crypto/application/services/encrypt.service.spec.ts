import { Test, TestingModule } from '@nestjs/testing';
import { EncryptService } from './encrypt.service';
import { CryptoKeyProvider } from '../../infrastructure/providers/crypto-key.provider';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('EncryptService - Simple Test', () => {
  let service: EncryptService;
  let mockCryptoKeyProvider: Partial<jest.Mocked<CryptoKeyProvider>>;

  beforeEach(async () => {
    const mockedCrypto = jest.mocked(crypto);
    
    // Mock crypto functions
    mockedCrypto.randomBytes.mockImplementation((size: number) => Buffer.alloc(size, 'x'));
    mockedCrypto.createCipheriv.mockReturnValue({
      update: jest.fn().mockReturnValue(Buffer.from('encrypted')),
      final: jest.fn().mockReturnValue(Buffer.from('final')),
    } as unknown as crypto.Cipher);
    mockedCrypto.publicEncrypt.mockReturnValue(Buffer.from('encrypted-key'));
    (mockedCrypto.constants as unknown as Record<string, number>).RSA_PKCS1_OAEP_PADDING = 4;

    mockCryptoKeyProvider = {
      getRsaPublicKey: jest.fn<string, []>().mockReturnValue('-----BEGIN PUBLIC KEY-----\nMOCK_KEY\n-----END PUBLIC KEY-----'),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt data and return result with data1 and data2', async () => {
    const payload = 'test data';
    
    const result = await service.encryptData(payload);
    
    // ตรวจสอบว่ามี result กลับมา
    expect(result).toBeDefined();
    expect(result.data1).toBeDefined();
    expect(result.data2).toBeDefined();
    
    // ตรวจสอบว่าเป็น string
    expect(typeof result.data1).toBe('string');
    expect(typeof result.data2).toBe('string');
    
    // ตรวจสอบว่าไม่เป็น empty string
    expect(result.data1.length).toBeGreaterThan(0);
    expect(result.data2.length).toBeGreaterThan(0);
  });

  it('should handle different payload types', async () => {
    const testCases = [
      'simple text',
      'text with numbers 123',
      '🚀 emoji test',
      JSON.stringify({ key: 'value' })
    ];

    for (const payload of testCases) {
      const result = await service.encryptData(payload);
      
      expect(result.data1).toBeDefined();
      expect(result.data2).toBeDefined();
    }
  });
});

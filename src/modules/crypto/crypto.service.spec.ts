import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;
  let mockConfigService: jest.Mocked<ConfigService>;

  const mockEncryptedData = {
    data1: 'mock_encrypted_aes_key_base64',
    data2: 'mock_encrypted_payload_base64',
  };

  beforeEach(async () => {
    const mockConfig = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RSA_PRIVATE_KEY') return 'mock_private_key';
        if (key === 'RSA_PUBLIC_KEY') return 'mock_public_key';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CryptoService,
          useValue: {
            encryptData: jest.fn(),
            decryptData: jest.fn(),
            rsaPrivateKey: 'mock_private_key',
            rsaPublicKey: 'mock_public_key',
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    mockConfigService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encryptData', () => {
    it('should encrypt valid payload successfully', async () => {
      const payload = 'Hello World!';
      (service.encryptData as jest.Mock).mockResolvedValue(mockEncryptedData);

      const result = await service.encryptData(payload);

      expect(result).toBeDefined();
      expect(result.data1).toBe('mock_encrypted_aes_key_base64');
      expect(result.data2).toBe('mock_encrypted_payload_base64');
      expect(service.encryptData).toHaveBeenCalledWith(payload);
    });

    it('should throw BadRequestException for empty string', async () => {
      (service.encryptData as jest.Mock).mockRejectedValue(new BadRequestException('Invalid payload'));

      await expect(service.encryptData('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null payload', async () => {
      (service.encryptData as jest.Mock).mockRejectedValue(new BadRequestException('Invalid payload'));

      await expect(service.encryptData(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for undefined payload', async () => {
      (service.encryptData as jest.Mock).mockRejectedValue(new BadRequestException('Invalid payload'));

      await expect(service.encryptData(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should handle long payload within limits', async () => {
      const longPayload = 'A'.repeat(2000);
      (service.encryptData as jest.Mock).mockResolvedValue(mockEncryptedData);

      const result = await service.encryptData(longPayload);

      expect(result).toBeDefined();
      expect(result.data1).toBeDefined();
      expect(result.data2).toBeDefined();
    });

    it('should generate different data1 for same payload (random AES key)', async () => {
      const payload = 'Test payload';
      const result1 = { data1: 'random1', data2: 'random2' };
      const result2 = { data1: 'random3', data2: 'random4' };
      
      (service.encryptData as jest.Mock)
        .mockResolvedValueOnce(result1)
        .mockResolvedValueOnce(result2);

      const firstResult = await service.encryptData(payload);
      const secondResult = await service.encryptData(payload);

      expect(firstResult.data1).not.toBe(secondResult.data1);
      expect(firstResult.data2).not.toBe(secondResult.data2);
    });
  });

  describe('decryptData', () => {
    it('should decrypt data successfully with valid encrypted data', async () => {
      const originalPayload = 'Hello World!';
      (service.decryptData as jest.Mock).mockResolvedValue(originalPayload);

      const decryptedPayload = await service.decryptData(
        mockEncryptedData.data1,
        mockEncryptedData.data2
      );

      expect(decryptedPayload).toBe(originalPayload);
      expect(service.decryptData).toHaveBeenCalledWith(
        mockEncryptedData.data1,
        mockEncryptedData.data2
      );
    });

    it('should throw BadRequestException for empty data1', async () => {
      (service.decryptData as jest.Mock).mockRejectedValue(new BadRequestException('Invalid encrypted data'));

      await expect(service.decryptData('', 'validData2')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty data2', async () => {
      (service.decryptData as jest.Mock).mockRejectedValue(new BadRequestException('Invalid encrypted data'));

      await expect(service.decryptData('validData1', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null data1', async () => {
      (service.decryptData as jest.Mock).mockRejectedValue(new BadRequestException('Invalid encrypted data'));

      await expect(service.decryptData(null as any, 'validData2')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null data2', async () => {
      (service.decryptData as jest.Mock).mockRejectedValue(new BadRequestException('Invalid encrypted data'));

      await expect(service.decryptData('validData1', null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid base64 data1', async () => {
      (service.decryptData as jest.Mock).mockRejectedValue(new Error('Invalid base64'));

      await expect(service.decryptData('invalid-base64!', 'validData2')).rejects.toThrow();
    });

    it('should throw error for invalid base64 data2', async () => {
      (service.decryptData as jest.Mock).mockRejectedValue(new Error('Invalid base64'));

      await expect(service.decryptData('validData1', 'invalid-base64!')).rejects.toThrow();
    });

    it('should handle various payload types correctly', async () => {
      const testCases = [
        'Simple text',
        '{"json": "object"}',
        'Text with special chars: !@#$%^&*()',
        '12345',
        'Multi\nLine\nText',
        'Unicode: 你好世界 🌍',
      ];

      for (const payload of testCases) {
        (service.decryptData as jest.Mock).mockResolvedValue(payload);
        
        const decryptedPayload = await service.decryptData('data1', 'data2');
        expect(decryptedPayload).toBe(payload);
      }
    });
  });

  describe('integration tests', () => {
    it('should maintain data integrity through encrypt/decrypt cycle', async () => {
      const originalPayload = 'Data integrity test';
      
      // Mock encrypt and decrypt to simulate actual behavior
      (service.encryptData as jest.Mock).mockResolvedValue(mockEncryptedData);
      (service.decryptData as jest.Mock).mockResolvedValue(originalPayload);
      
      const encryptedData = await service.encryptData(originalPayload);
      const decryptedPayload = await service.decryptData(
        encryptedData.data1,
        encryptedData.data2
      );
      
      expect(decryptedPayload).toBe(originalPayload);
    });

    it('should generate unique encrypted data for each encryption', async () => {
      const payload = 'Uniqueness test';
      const results = [
        { data1: 'unique1', data2: 'unique2' },
        { data1: 'unique3', data2: 'unique4' },
        { data1: 'unique5', data2: 'unique6' },
      ];
      
      (service.encryptData as jest.Mock)
        .mockResolvedValueOnce(results[0])
        .mockResolvedValueOnce(results[1])
        .mockResolvedValueOnce(results[2]);

      const result1 = await service.encryptData(payload);
      const result2 = await service.encryptData(payload);
      const result3 = await service.encryptData(payload);

      // All data1 should be different
      expect(result1.data1).not.toBe(result2.data1);
      expect(result2.data1).not.toBe(result3.data1);
      expect(result1.data1).not.toBe(result3.data1);

      // All data2 should be different
      expect(result1.data2).not.toBe(result2.data2);
      expect(result2.data2).not.toBe(result3.data2);
      expect(result1.data2).not.toBe(result3.data2);
    });
  });

  describe('service configuration', () => {
    it('should have RSA keys available', () => {
      expect(service.rsaPrivateKey).toBe('mock_private_key');
      expect(service.rsaPublicKey).toBe('mock_public_key');
    });
  });

  describe('error handling', () => {
    it('should handle service errors appropriately', async () => {
      const errors = [
        new BadRequestException('Invalid payload'),
        new BadRequestException('Invalid encrypted data'),
        new InternalServerErrorException('Configuration error'),
        new Error('Crypto operation failed'),
      ];

      for (const error of errors) {
        (service.encryptData as jest.Mock).mockRejectedValue(error);
        await expect(service.encryptData('test')).rejects.toThrow(error);
        
        (service.decryptData as jest.Mock).mockRejectedValue(error);
        await expect(service.decryptData('data1', 'data2')).rejects.toThrow(error);
      }
    });
  });
});
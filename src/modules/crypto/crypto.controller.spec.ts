import { Test, TestingModule } from '@nestjs/testing';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { EncryptRequestDto } from './dto/encrypt-request.dto';
import { DecryptRequestDto } from './dto/decrypt-request.dto';
import { EncryptData, DecryptData } from '../../common/interfaces/api-response.interface';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('CryptoController', () => {
  let controller: CryptoController;
  let cryptoService: jest.Mocked<CryptoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [
        {
          provide: CryptoService,
          useValue: {
            encryptData: jest.fn(),
            decryptData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CryptoController>(CryptoController);
    cryptoService = module.get(CryptoService) as jest.Mocked<CryptoService>;
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('encryptData', () => {
    it('should encrypt data successfully', async () => {
      // Arrange
      const requestDto: EncryptRequestDto = { payload: 'Hello World!' };
      const mockEncryptedData: EncryptData = {
        data1: 'encrypted_aes_key_mock',
        data2: 'encrypted_payload_mock',
      };
      
      cryptoService.encryptData.mockResolvedValue(mockEncryptedData);

      // Act
      const result = await controller.encryptData(requestDto);

      // Assert
      expect(cryptoService.encryptData).toHaveBeenCalledWith('Hello World!');
      expect(cryptoService.encryptData).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        successful: true,
        error_code: '',
        data: mockEncryptedData,
      });
    });

    it('should handle different payload types', async () => {
      const testCases = [
        'Simple text',
        'Text with numbers 123',
        'Special characters !@#$%^&*()',
        'Unicode text 你好世界 🌍',
        'A'.repeat(100), // Long text
      ];

      for (const payload of testCases) {
        const requestDto: EncryptRequestDto = { payload };
        const mockEncryptedData: EncryptData = {
          data1: `data1_for_${payload.substring(0, 10)}`,
          data2: `data2_for_${payload.substring(0, 10)}`,
        };

        cryptoService.encryptData.mockResolvedValue(mockEncryptedData);

        const result = await controller.encryptData(requestDto);

        expect(cryptoService.encryptData).toHaveBeenCalledWith(payload);
        expect(result.successful).toBe(true);
        expect(result.error_code).toBe('');
        expect(result.data).toBe(mockEncryptedData);
      }
    });

    it('should handle service throwing BadRequestException', async () => {
      // Arrange
      const requestDto: EncryptRequestDto = { payload: 'test' };
      cryptoService.encryptData.mockRejectedValue(new BadRequestException('Invalid payload'));

      // Act & Assert
      await expect(controller.encryptData(requestDto)).rejects.toThrow(BadRequestException);
      expect(cryptoService.encryptData).toHaveBeenCalledWith('test');
    });

    it('should handle service throwing InternalServerErrorException', async () => {
      // Arrange
      const requestDto: EncryptRequestDto = { payload: 'test' };
      cryptoService.encryptData.mockRejectedValue(new InternalServerErrorException('Server error'));

      // Act & Assert
      await expect(controller.encryptData(requestDto)).rejects.toThrow(InternalServerErrorException);
      expect(cryptoService.encryptData).toHaveBeenCalledWith('test');
    });

    it('should handle service throwing generic error', async () => {
      // Arrange
      const requestDto: EncryptRequestDto = { payload: 'test' };
      cryptoService.encryptData.mockRejectedValue(new Error('Unexpected error'));

      // Act & Assert
      await expect(controller.encryptData(requestDto)).rejects.toThrow('Unexpected error');
      expect(cryptoService.encryptData).toHaveBeenCalledWith('test');
    });

    it('should handle maximum length payload', async () => {
      // Arrange
      const maxPayload = 'A'.repeat(2000); // Maximum allowed length
      const requestDto: EncryptRequestDto = { payload: maxPayload };
      const mockEncryptedData: EncryptData = {
        data1: 'encrypted_long_aes_key',
        data2: 'encrypted_long_payload',
      };
      
      cryptoService.encryptData.mockResolvedValue(mockEncryptedData);

      // Act
      const result = await controller.encryptData(requestDto);

      // Assert
      expect(cryptoService.encryptData).toHaveBeenCalledWith(maxPayload);
      expect(result.successful).toBe(true);
      expect(result.data).toBe(mockEncryptedData);
    });
  });

  describe('decryptData', () => {
    it('should decrypt data successfully', async () => {
      // Arrange
      const requestDto: DecryptRequestDto = {
        data1: 'encrypted_aes_key',
        data2: 'encrypted_payload',
      };
      const mockDecryptedPayload = 'Hello World!';
      
      cryptoService.decryptData.mockResolvedValue(mockDecryptedPayload);

      // Act
      const result = await controller.decryptData(requestDto);

      // Assert
      expect(cryptoService.decryptData).toHaveBeenCalledWith(
        'encrypted_aes_key',
        'encrypted_payload'
      );
      expect(cryptoService.decryptData).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        successful: true,
        error_code: '',
        data: { payload: mockDecryptedPayload },
      });
    });

    it('should handle different encrypted data formats', async () => {
      const testCases = [
        {
          data1: 'base64_encoded_key_1',
          data2: 'base64_encoded_payload_1',
          expected: 'Decrypted text 1',
        },
        {
          data1: 'base64_encoded_key_2',
          data2: 'base64_encoded_payload_2',
          expected: 'Decrypted text 2',
        },
        {
          data1: 'very_long_base64_key',
          data2: 'very_long_base64_payload',
          expected: 'Long decrypted content',
        },
      ];

      for (const testCase of testCases) {
        const requestDto: DecryptRequestDto = {
          data1: testCase.data1,
          data2: testCase.data2,
        };

        cryptoService.decryptData.mockResolvedValue(testCase.expected);

        const result = await controller.decryptData(requestDto);

        expect(cryptoService.decryptData).toHaveBeenCalledWith(
          testCase.data1,
          testCase.data2
        );
        expect(result.successful).toBe(true);
        expect(result.error_code).toBe('');
        expect(result.data).toEqual({ payload: testCase.expected });
      }
    });

    it('should handle service throwing BadRequestException', async () => {
      // Arrange
      const requestDto: DecryptRequestDto = {
        data1: 'invalid_data1',
        data2: 'invalid_data2',
      };
      cryptoService.decryptData.mockRejectedValue(new BadRequestException('Invalid encrypted data'));

      // Act & Assert
      await expect(controller.decryptData(requestDto)).rejects.toThrow(BadRequestException);
      expect(cryptoService.decryptData).toHaveBeenCalledWith('invalid_data1', 'invalid_data2');
    });

    it('should handle service throwing InternalServerErrorException', async () => {
      // Arrange
      const requestDto: DecryptRequestDto = {
        data1: 'data1',
        data2: 'data2',
      };
      cryptoService.decryptData.mockRejectedValue(new InternalServerErrorException('Decryption failed'));

      // Act & Assert
      await expect(controller.decryptData(requestDto)).rejects.toThrow(InternalServerErrorException);
      expect(cryptoService.decryptData).toHaveBeenCalledWith('data1', 'data2');
    });

    it('should handle service throwing generic error', async () => {
      // Arrange
      const requestDto: DecryptRequestDto = {
        data1: 'data1',
        data2: 'data2',
      };
      cryptoService.decryptData.mockRejectedValue(new Error('Crypto operation failed'));

      // Act & Assert
      await expect(controller.decryptData(requestDto)).rejects.toThrow('Crypto operation failed');
      expect(cryptoService.decryptData).toHaveBeenCalledWith('data1', 'data2');
    });

    it('should handle Unicode characters in decrypted result', async () => {
      // Arrange
      const requestDto: DecryptRequestDto = {
        data1: 'unicode_key',
        data2: 'unicode_payload',
      };
      const unicodeResult = 'สวัสดี Hello 你好 🌍';
      
      cryptoService.decryptData.mockResolvedValue(unicodeResult);

      // Act
      const result = await controller.decryptData(requestDto);

      // Assert
      expect(result.successful).toBe(true);
      expect(result.data).toEqual({ payload: unicodeResult });
    });

    it('should handle empty string result from service', async () => {
      // Arrange
      const requestDto: DecryptRequestDto = {
        data1: 'key_for_empty',
        data2: 'payload_for_empty',
      };
      
      cryptoService.decryptData.mockResolvedValue('');

      // Act
      const result = await controller.decryptData(requestDto);

      // Assert
      expect(result.successful).toBe(true);
      expect(result.data).toEqual({ payload: '' });
    });
  });

  describe('integration scenarios', () => {
    it('should handle rapid successive calls', async () => {
      const encryptRequests = [
        { payload: 'test1' },
        { payload: 'test2' },
        { payload: 'test3' },
      ];

      const mockResults = [
        { data1: 'key1', data2: 'payload1' },
        { data1: 'key2', data2: 'payload2' },
        { data1: 'key3', data2: 'payload3' },
      ];

      cryptoService.encryptData
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce(mockResults[2]);

      const results = await Promise.all(
        encryptRequests.map(req => controller.encryptData(req))
      );

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.successful).toBe(true);
        expect(result.data).toBe(mockResults[index]);
      });
    });

    it('should maintain service call isolation between requests', async () => {
      // First call
      const encryptDto: EncryptRequestDto = { payload: 'first' };
      cryptoService.encryptData.mockResolvedValueOnce({ data1: 'key1', data2: 'payload1' });
      
      await controller.encryptData(encryptDto);

      // Second call
      const decryptDto: DecryptRequestDto = { data1: 'key2', data2: 'payload2' };
      cryptoService.decryptData.mockResolvedValueOnce('second');
      
      await controller.decryptData(decryptDto);

      // Verify calls were made independently
      expect(cryptoService.encryptData).toHaveBeenCalledWith('first');
      expect(cryptoService.decryptData).toHaveBeenCalledWith('key2', 'payload2');
      expect(cryptoService.encryptData).toHaveBeenCalledTimes(1);
      expect(cryptoService.decryptData).toHaveBeenCalledTimes(1);
    });
  });
});

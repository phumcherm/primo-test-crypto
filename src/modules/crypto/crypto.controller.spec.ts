import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { EncryptRequestDto } from './dto/encrypt-request.dto';
import { DecryptRequestDto } from './dto/decrypt-request.dto';
import { SuccessResponse, EncryptData, DecryptData } from '../../common/interfaces/api-response.interface';

describe('CryptoController', () => {
  let controller: CryptoController;
  let mockCryptoService: jest.Mocked<CryptoService>;

  const mockEncryptedData: EncryptData = {
    data1: 'mock_encrypted_aes_key',
    data2: 'mock_encrypted_payload',
  };

  beforeEach(async () => {
    const mockService = {
      encryptData: jest.fn(),
      decryptData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [
        {
          provide: CryptoService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CryptoController>(CryptoController);
    mockCryptoService = module.get(CryptoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('encryptData', () => {
    const validEncryptRequest: EncryptRequestDto = {
      payload: 'Hello World!',
    };

    it('should encrypt data successfully', async () => {
      mockCryptoService.encryptData.mockResolvedValue(mockEncryptedData);

      const result = await controller.encryptData(validEncryptRequest);

      expect(mockCryptoService.encryptData).toHaveBeenCalledWith('Hello World!');
      expect(mockCryptoService.encryptData).toHaveBeenCalledTimes(1);
      
      expect(result).toEqual({
        successful: true,
        error_code: '',
        data: mockEncryptedData,
      } as SuccessResponse<EncryptData>);
    });

    it('should handle service errors and let global filter handle them', async () => {
      const serviceError = new BadRequestException('Invalid payload');
      mockCryptoService.encryptData.mockRejectedValue(serviceError);

      await expect(controller.encryptData(validEncryptRequest)).rejects.toThrow(BadRequestException);
      expect(mockCryptoService.encryptData).toHaveBeenCalledWith('Hello World!');
    });

    it('should call service with correct payload', async () => {
      mockCryptoService.encryptData.mockResolvedValue(mockEncryptedData);
      
      const testCases = [
        { payload: 'Simple text' },
        { payload: 'Text with numbers 123' },
        { payload: '{"json": "data"}' },
        { payload: 'Special chars: !@#$%' },
      ];

      for (const testCase of testCases) {
        await controller.encryptData(testCase);
        expect(mockCryptoService.encryptData).toHaveBeenCalledWith(testCase.payload);
      }
    });

    it('should return correct response format', async () => {
      const customEncryptedData: EncryptData = {
        data1: 'custom_data1',
        data2: 'custom_data2',
      };
      
      mockCryptoService.encryptData.mockResolvedValue(customEncryptedData);

      const result = await controller.encryptData(validEncryptRequest);

      expect(result).toHaveProperty('successful', true);
      expect(result).toHaveProperty('error_code', '');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(customEncryptedData);
    });
  });

  describe('decryptData', () => {
    const validDecryptRequest: DecryptRequestDto = {
      data1: 'encrypted_aes_key',
      data2: 'encrypted_payload',
    };

    const mockDecryptedPayload = 'Hello World!';

    it('should decrypt data successfully', async () => {
      mockCryptoService.decryptData.mockResolvedValue(mockDecryptedPayload);

      const result = await controller.decryptData(validDecryptRequest);

      expect(mockCryptoService.decryptData).toHaveBeenCalledWith(
        'encrypted_aes_key',
        'encrypted_payload'
      );
      expect(mockCryptoService.decryptData).toHaveBeenCalledTimes(1);
      
      expect(result).toEqual({
        successful: true,
        error_code: '',
        data: { payload: mockDecryptedPayload },
      } as SuccessResponse<DecryptData>);
    });

    it('should handle service errors and let global filter handle them', async () => {
      const serviceError = new BadRequestException('Invalid encrypted data');
      mockCryptoService.decryptData.mockRejectedValue(serviceError);

      await expect(controller.decryptData(validDecryptRequest)).rejects.toThrow(BadRequestException);
      expect(mockCryptoService.decryptData).toHaveBeenCalledWith(
        'encrypted_aes_key',
        'encrypted_payload'
      );
    });

    it('should call service with correct parameters', async () => {
      mockCryptoService.decryptData.mockResolvedValue(mockDecryptedPayload);
      
      const testCases = [
        { data1: 'test_data1_1', data2: 'test_data2_1' },
        { data1: 'test_data1_2', data2: 'test_data2_2' },
        { data1: 'long_base64_string_here', data2: 'another_long_base64_string' },
      ];

      for (const testCase of testCases) {
        await controller.decryptData(testCase);
        expect(mockCryptoService.decryptData).toHaveBeenCalledWith(
          testCase.data1,
          testCase.data2
        );
      }
    });

    it('should return correct response format', async () => {
      const customDecryptedPayload = 'Custom decrypted text';
      mockCryptoService.decryptData.mockResolvedValue(customDecryptedPayload);

      const result = await controller.decryptData(validDecryptRequest);

      expect(result).toHaveProperty('successful', true);
      expect(result).toHaveProperty('error_code', '');
      expect(result).toHaveProperty('data');
      expect(result.data).toEqual({ payload: customDecryptedPayload });
    });

    it('should handle various decrypted payload types', async () => {
      const testPayloads = [
        'Simple text',
        '{"json": "object"}',
        '12345',
        'Multi\nLine\nText',
        'Unicode: 你好世界',
        '',
      ];

      for (const payload of testPayloads) {
        mockCryptoService.decryptData.mockResolvedValue(payload);
        
        const result = await controller.decryptData(validDecryptRequest);
        
        expect(result.data).toEqual({ payload });
      }
    });
  });

  describe('error handling integration', () => {
    it('should propagate encrypt service errors without modification', async () => {
      const errors = [
        new BadRequestException('Invalid payload'),
        new BadRequestException('Payload too long'),
        new Error('Unexpected error'),
      ];

      for (const error of errors) {
        mockCryptoService.encryptData.mockRejectedValue(error);
        
        await expect(controller.encryptData({ payload: 'test' })).rejects.toThrow(error);
      }
    });

    it('should propagate decrypt service errors without modification', async () => {
      const errors = [
        new BadRequestException('Invalid encrypted data'),
        new BadRequestException('Decryption failed'),
        new Error('Crypto error'),
      ];

      for (const error of errors) {
        mockCryptoService.decryptData.mockRejectedValue(error);
        
        await expect(controller.decryptData({ 
          data1: 'test1', 
          data2: 'test2' 
        })).rejects.toThrow(error);
      }
    });
  });

  describe('response consistency', () => {
    it('should always return consistent success response structure for encryption', async () => {
      const testData = [
        { data1: 'data1_1', data2: 'data2_1' },
        { data1: 'data1_2', data2: 'data2_2' },
        { data1: 'data1_3', data2: 'data2_3' },
      ];

      for (const data of testData) {
        mockCryptoService.encryptData.mockResolvedValue(data);
        
        const result = await controller.encryptData({ payload: 'test' });
        
        expect(result).toMatchObject({
          successful: true,
          error_code: '',
          data: data,
        });
      }
    });

    it('should always return consistent success response structure for decryption', async () => {
      const testPayloads = ['payload1', 'payload2', 'payload3'];

      for (const payload of testPayloads) {
        mockCryptoService.decryptData.mockResolvedValue(payload);
        
        const result = await controller.decryptData({ 
          data1: 'test1', 
          data2: 'test2' 
        });
        
        expect(result).toMatchObject({
          successful: true,
          error_code: '',
          data: { payload },
        });
      }
    });
  });
});

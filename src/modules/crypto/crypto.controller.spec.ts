import { Test, TestingModule } from '@nestjs/testing';
import { CryptoController } from './crypto.controller';
import { EncryptService } from './application/services/encrypt.service';
import { DecryptService } from './application/services/decrypt.service';
import { EncryptRequestDto, DecryptRequestDto } from './presentation/dto';
import { InvalidPayloadException, InvalidEncryptedDataException } from './domain/exceptions/crypto.exceptions';

describe('CryptoController', () => {
  let controller: CryptoController;
  let mockEncryptService: jest.Mocked<EncryptService>;
  let mockDecryptService: jest.Mocked<DecryptService>;

  const mockEncryptionResult = {
    data1: 'encrypted_aes_key_base64',
    data2: 'encrypted_payload_with_iv_base64'
  };

  const mockDecryptionResult = 'Hello World!';

  beforeEach(async () => {
    mockEncryptService = {
      encryptData: jest.fn(),
    } as any;

    mockDecryptService = {
      decryptData: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [
        {
          provide: EncryptService,
          useValue: mockEncryptService,
        },
        {
          provide: DecryptService,
          useValue: mockDecryptService,
        },
      ],
    }).compile();

    controller = module.get<CryptoController>(CryptoController);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('encryptData', () => {
    const validEncryptRequest: EncryptRequestDto = {
      payload: 'Hello World!'
    };

    beforeEach(() => {
      mockEncryptService.encryptData.mockResolvedValue(mockEncryptionResult);
    });

    it('should encrypt data successfully', async () => {
      const result = await controller.encryptData(validEncryptRequest);

      expect(result).toEqual({
        successful: true,
        error_code: '',
        data: mockEncryptionResult,
      });
      expect(mockEncryptService.encryptData).toHaveBeenCalledWith(validEncryptRequest.payload);
    });

    it('should propagate InvalidPayloadException', async () => {
      const error = new InvalidPayloadException('Invalid payload');
      mockEncryptService.encryptData.mockRejectedValue(error);

      await expect(controller.encryptData(validEncryptRequest))
        .rejects.toThrow(InvalidPayloadException);
    });

    it('should return correct response structure', async () => {
      const result = await controller.encryptData(validEncryptRequest);

      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('error_code');
      expect(result).toHaveProperty('data');
      expect(result.successful).toBe(true);
      expect(result.error_code).toBe('');
    });
  });

  describe('decryptData', () => {
    const validDecryptRequest: DecryptRequestDto = {
      data1: 'encrypted_aes_key_base64',
      data2: 'encrypted_payload_with_iv_base64'
    };

    beforeEach(() => {
      mockDecryptService.decryptData.mockResolvedValue(mockDecryptionResult);
    });

    it('should decrypt data successfully', async () => {
      const result = await controller.decryptData(validDecryptRequest);

      expect(result).toEqual({
        successful: true,
        error_code: '',
        data: { payload: mockDecryptionResult },
      });
      expect(mockDecryptService.decryptData).toHaveBeenCalledWith(
        validDecryptRequest.data1,
        validDecryptRequest.data2
      );
    });

    it('should propagate InvalidEncryptedDataException', async () => {
      const error = new InvalidEncryptedDataException('Invalid encrypted data');
      mockDecryptService.decryptData.mockRejectedValue(error);

      await expect(controller.decryptData(validDecryptRequest))
        .rejects.toThrow(InvalidEncryptedDataException);
    });

    it('should return correct response structure', async () => {
      const result = await controller.decryptData(validDecryptRequest);

      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('error_code');
      expect(result).toHaveProperty('data');
      expect(result.successful).toBe(true);
      expect(result.error_code).toBe('');
      expect(result.data).toHaveProperty('payload');
    });
  });

  describe('service isolation', () => {
    it('should not call decrypt service during encryption', async () => {
      const encryptRequest: EncryptRequestDto = { payload: 'test' };
      mockEncryptService.encryptData.mockResolvedValue(mockEncryptionResult);

      await controller.encryptData(encryptRequest);

      expect(mockEncryptService.encryptData).toHaveBeenCalled();
      expect(mockDecryptService.decryptData).not.toHaveBeenCalled();
    });

    it('should not call encrypt service during decryption', async () => {
      const decryptRequest: DecryptRequestDto = {
        data1: 'test_data1',
        data2: 'test_data2'
      };
      mockDecryptService.decryptData.mockResolvedValue(mockDecryptionResult);

      await controller.decryptData(decryptRequest);

      expect(mockDecryptService.decryptData).toHaveBeenCalled();
      expect(mockEncryptService.encryptData).not.toHaveBeenCalled();
    });
  });
});
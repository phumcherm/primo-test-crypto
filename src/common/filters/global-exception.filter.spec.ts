import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ERROR_CODES } from '../constants';

// Mock Request and Response
const mockRequest = {
  method: 'POST',
  url: '/get-encrypt-data',
};

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

const mockArgumentsHost = {
  switchToHttp: jest.fn().mockReturnValue({
    getResponse: () => mockResponse,
    getRequest: () => mockRequest,
  }),
} as unknown as ArgumentsHost;

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HttpException handling', () => {
    it('should handle BadRequestException with validation errors', () => {
      const validationErrors = ['payload must be a string', 'payload cannot be empty'];
      const exception = new BadRequestException({
        message: validationErrors,
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.VALIDATION_ERROR,
        data: null,
      });
    });

    it('should handle BadRequestException with single error message', () => {
      const exception = new BadRequestException('Invalid payload');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INVALID_PAYLOAD,
        data: null,
      });
    });

    it('should handle BadRequestException with invalid encrypted data message', () => {
      const exception = new BadRequestException('Invalid encrypted data');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INVALID_ENCRYPTED_DATA,
        data: null,
      });
    });

    it('should handle InternalServerErrorException with RSA keys error', () => {
      const exception = new InternalServerErrorException('RSA keys not found in environment variables');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.CONFIGURATION_ERROR,
        data: null,
      });
    });

    it('should handle generic HttpException', () => {
      const exception = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.FORBIDDEN,
        data: null,
      });
    });

    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.NOT_FOUND,
        data: null,
      });
    });
  });

  describe('Regular Error handling', () => {
    it('should handle Error with invalid payload message', () => {
      const error = new Error('Invalid payload');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INVALID_PAYLOAD,
        data: null,
      });
    });

    it('should handle Error with invalid encrypted data message', () => {
      const error = new Error('Invalid encrypted data');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INVALID_ENCRYPTED_DATA,
        data: null,
      });
    });

    it('should handle Error with RSA configuration message', () => {
      const error = new Error('RSA keys not found in configuration file');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.CONFIGURATION_ERROR,
        data: null,
      });
    });

    it('should handle Error with decryption message', () => {
      const error = new Error('bad decrypt');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.DECRYPTION_FAILED,
        data: null,
      });
    });

    it('should handle Error with encryption message', () => {
      const error = new Error('encrypt failed');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.ENCRYPTION_FAILED,
        data: null,
      });
    });

    it('should handle generic Error', () => {
      const error = new Error('Some unexpected error');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        data: null,
      });
    });
  });

  describe('Unknown exception handling', () => {
    it('should handle unknown exception types', () => {
      const unknownException = 'string exception';

      filter.catch(unknownException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        data: null,
      });
    });

    it('should handle null exception', () => {
      filter.catch(null, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        data: null,
      });
    });

    it('should handle undefined exception', () => {
      filter.catch(undefined, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        data: null,
      });
    });
  });

  describe('getErrorCodeFromStatus', () => {
    it('should map HTTP status codes to correct error codes', () => {
      const testCases = [
        { status: 400, expected: ERROR_CODES.BAD_REQUEST },
        { status: 401, expected: ERROR_CODES.UNAUTHORIZED },
        { status: 403, expected: ERROR_CODES.FORBIDDEN },
        { status: 404, expected: ERROR_CODES.NOT_FOUND },
        { status: 405, expected: ERROR_CODES.METHOD_NOT_ALLOWED },
        { status: 500, expected: ERROR_CODES.INTERNAL_SERVER_ERROR },
        { status: 999, expected: ERROR_CODES.UNKNOWN_ERROR }, // Unknown status
      ];

      for (const testCase of testCases) {
        const exception = new HttpException('Test message', testCase.status);
        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.json).toHaveBeenCalledWith({
          successful: false,
          error_code: testCase.expected,
          data: null,
        });

        jest.clearAllMocks();
      }
    });
  });

  describe('complex validation scenarios', () => {
    it('should handle complex validation error array', () => {
      const complexValidationErrors = [
        'payload must be a string',
        'payload cannot be empty',
        'payload must be at least 1 character long',
        'payload cannot exceed 2000 characters'
      ];
      
      const exception = new BadRequestException({
        message: complexValidationErrors,
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.VALIDATION_ERROR,
        data: null,
      });
    });

    it('should handle nested error objects', () => {
      const exception = new BadRequestException({
        message: {
          payload: ['payload must be a string', 'payload cannot be empty']
        },
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      // Should handle nested objects gracefully
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          successful: false,
          data: null,
        })
      );
    });
  });

  describe('logging behavior', () => {
    it('should log errors appropriately', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const error = new Error('Test error for logging');
      filter.catch(error, mockArgumentsHost);

      // Note: We can't easily test the internal logger without more complex mocking
      // This test verifies the filter doesn't throw during logging
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      
      consoleSpy.mockRestore();
    });
  });

  describe('request context handling', () => {
    it('should handle different request methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        const customMockRequest = { ...mockRequest, method };
        const customMockArgumentsHost = {
          switchToHttp: jest.fn().mockReturnValue({
            getResponse: () => mockResponse,
            getRequest: () => customMockRequest,
          }),
        } as unknown as ArgumentsHost;

        const exception = new BadRequestException('Test error');
        filter.catch(exception, customMockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        jest.clearAllMocks();
      }
    });

    it('should handle different request URLs', () => {
      const urls = ['/get-encrypt-data', '/get-decrypt-data', '/api/test'];
      
      for (const url of urls) {
        const customMockRequest = { ...mockRequest, url };
        const customMockArgumentsHost = {
          switchToHttp: jest.fn().mockReturnValue({
            getResponse: () => mockResponse,
            getRequest: () => customMockRequest,
          }),
        } as unknown as ArgumentsHost;

        const exception = new BadRequestException('Test error');
        filter.catch(exception, customMockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        jest.clearAllMocks();
      }
    });
  });
});

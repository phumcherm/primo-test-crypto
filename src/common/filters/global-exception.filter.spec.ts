import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ERROR_CODES } from '../constants';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockRequest: jest.Mocked<Request>;
  let mockResponse: jest.Mocked<Response>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    // Mock request object
    mockRequest = {
      method: 'POST',
      url: '/get-encrypt-data',
    } as any;

    // Mock arguments host
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;

    // Spy on logger
    loggerSpy = jest.spyOn(filter['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(filter).toBeDefined();
    });
  });

  describe('HttpException handling', () => {
    it('should handle BadRequestException with validation errors (should NOT log)', () => {
      const validationException = new BadRequestException({
        message: ['payload must be a string', 'payload cannot be empty'],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(validationException, mockArgumentsHost);

      expect(loggerSpy).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.VALIDATION_ERROR,
        data: null,
      });
    });

    it('should handle BadRequestException with single error message (should log)', () => {
      const businessException = new BadRequestException('Invalid payload');

      filter.catch(businessException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - Invalid payload',
        expect.any(String)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INVALID_PAYLOAD,
        data: null,
      });
    });

    it('should handle BadRequestException with invalid encrypted data message', () => {
      const cryptoException = new BadRequestException('Invalid encrypted data');

      filter.catch(cryptoException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - Invalid encrypted data',
        expect.any(String)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INVALID_ENCRYPTED_DATA,
        data: null,
      });
    });

    it('should handle InternalServerErrorException with RSA keys error', () => {
      const configError = new InternalServerErrorException('RSA keys not found in environment variables');

      filter.catch(configError, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 500 - RSA keys not found in environment variables',
        expect.any(String)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.CONFIGURATION_ERROR,
        data: null,
      });
    });

    it('should handle generic HttpException', () => {
      const httpException = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);

      filter.catch(httpException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 403 - Forbidden resource',
        expect.any(String)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.FORBIDDEN,
        data: null,
      });
    });

    it('should handle HttpException with string response', () => {
      const httpException = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(httpException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 404 - Not Found',
        expect.any(String)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.NOT_FOUND,
        data: null,
      });
    });

    it('should map various HTTP status codes correctly', () => {
      const statusCodes = [
        { status: HttpStatus.BAD_REQUEST, errorCode: ERROR_CODES.BAD_REQUEST },
        { status: HttpStatus.UNAUTHORIZED, errorCode: ERROR_CODES.UNAUTHORIZED },
        { status: HttpStatus.FORBIDDEN, errorCode: ERROR_CODES.FORBIDDEN },
        { status: HttpStatus.NOT_FOUND, errorCode: ERROR_CODES.NOT_FOUND },
        { status: HttpStatus.METHOD_NOT_ALLOWED, errorCode: ERROR_CODES.METHOD_NOT_ALLOWED },
        { status: HttpStatus.INTERNAL_SERVER_ERROR, errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR },
        { status: 999, errorCode: ERROR_CODES.UNKNOWN_ERROR }, // Unknown status
      ];

      for (const { status, errorCode } of statusCodes) {
        const httpException = new HttpException('Test message', status);
        filter.catch(httpException, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
        expect(mockResponse.json).toHaveBeenCalledWith({
          successful: false,
          error_code: errorCode,
          data: null,
        });
      }
    });
  });

  describe('Regular Error handling', () => {
    it('should handle Error with invalid payload message', () => {
      const error = new Error('Invalid payload');

      filter.catch(error, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - Invalid payload',
        error.stack
      );
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

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - Invalid encrypted data',
        error.stack
      );
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

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 500 - RSA keys not found in configuration file',
        error.stack
      );
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

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - bad decrypt',
        error.stack
      );
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

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - encrypt failed',
        error.stack
      );
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

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 500 - Some unexpected error',
        error.stack
      );
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

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 500 - Internal server error',
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        data: null,
      });
    });

    it('should handle null exception', () => {
      filter.catch(null, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 500 - Internal server error',
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should handle undefined exception', () => {
      filter.catch(undefined, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 500 - Internal server error',
        undefined
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('complex validation scenarios', () => {
    it('should handle complex validation error array', () => {
      const complexValidationException = new BadRequestException({
        message: [
          'payload must be a string',
          'payload should not be empty',
          'payload must be longer than or equal to 1 characters',
        ],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(complexValidationException, mockArgumentsHost);

      expect(loggerSpy).not.toHaveBeenCalled(); // Validation errors should not log
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.VALIDATION_ERROR,
        data: null,
      });
    });

    it('should handle nested error objects', () => {
      const nestedErrorException = new BadRequestException({
        message: { field: 'payload', errors: ['is required', 'must be string'] },
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(nestedErrorException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - [object Object]',
        expect.any(String)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('request context handling', () => {
    it('should handle different request methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        const customMockRequest = { ...mockRequest, method };
        const customMockArgumentsHost = {
          ...mockArgumentsHost,
          switchToHttp: jest.fn().mockReturnValue({
            getResponse: jest.fn().mockReturnValue(mockResponse),
            getRequest: jest.fn().mockReturnValue(customMockRequest),
          }),
        };

        const testException = new BadRequestException('Test error');
        filter.catch(testException, customMockArgumentsHost as any);

        expect(loggerSpy).toHaveBeenCalledWith(
          `${method} /get-encrypt-data - 400 - Test error`,
          expect.any(String)
        );
      }
    });

    it('should handle different request URLs', () => {
      const urls = [
        '/get-encrypt-data',
        '/get-decrypt-data',
        '/api/test',
      ];
      
      for (const url of urls) {
        const customMockRequest = { ...mockRequest, url };
        const customMockArgumentsHost = {
          ...mockArgumentsHost,
          switchToHttp: jest.fn().mockReturnValue({
            getResponse: jest.fn().mockReturnValue(mockResponse),
            getRequest: jest.fn().mockReturnValue(customMockRequest),
          }),
        };

        const testException = new BadRequestException('Test error');
        filter.catch(testException, customMockArgumentsHost as any);

        expect(loggerSpy).toHaveBeenCalledWith(
          `POST ${url} - 400 - Test error`,
          expect.any(String)
        );
      }
    });
  });

  describe('error message handling', () => {
    it('should handle array message properly', () => {
      const arrayMessageException = new BadRequestException({
        message: ['First error', 'Second error'],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(arrayMessageException, mockArgumentsHost);

      expect(loggerSpy).not.toHaveBeenCalled(); // Should not log validation errors
      expect(mockResponse.json).toHaveBeenCalledWith({
        successful: false,
        error_code: ERROR_CODES.VALIDATION_ERROR,
        data: null,
      });
    });

    it('should handle string message in HttpException response', () => {
      const stringMessageException = new BadRequestException('Simple string message');

      filter.catch(stringMessageException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - Simple string message',
        expect.any(String)
      );
    });

    it('should handle empty message', () => {
      const emptyMessageException = new BadRequestException('');

      filter.catch(emptyMessageException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        'POST /get-encrypt-data - 400 - Bad Request',
        expect.any(String)
      );
    });
  });

  describe('logging behavior verification', () => {
    it('should not log for any validation error patterns', () => {
      const validationPatterns = [
        ['field is required'],
        ['must be a string'],
        ['cannot be empty'],
        ['must be longer than'],
        ['must be shorter than'],
        ['multiple', 'validation', 'errors'],
      ];

      for (const pattern of validationPatterns) {
        const validationException = new BadRequestException({
          message: pattern,
          error: 'Bad Request',
          statusCode: 400,
        });

        filter.catch(validationException, mockArgumentsHost);
        expect(loggerSpy).not.toHaveBeenCalled();
        
        loggerSpy.mockClear();
      }
    });

    it('should log for all business logic errors', () => {
      const businessErrorMessages = [
        'Invalid payload',
        'Invalid encrypted data',
        'RSA keys not found',
        'Decryption failed',
        'Encryption failed',
      ];

      for (const message of businessErrorMessages) {
        const businessException = new BadRequestException(message);
        
        filter.catch(businessException, mockArgumentsHost);
        expect(loggerSpy).toHaveBeenCalledWith(
          `POST /get-encrypt-data - 400 - ${message}`,
          expect.any(String)
        );
        
        loggerSpy.mockClear();
      }
    });
  });

  describe('response format consistency', () => {
    it('should always return consistent error response format', () => {
      const testExceptions = [
        new BadRequestException('Test'),
        new InternalServerErrorException('Test'),
        new HttpException('Test', HttpStatus.FORBIDDEN),
        new Error('Test'),
        'Unknown error',
      ];

      for (const exception of testExceptions) {
        filter.catch(exception, mockArgumentsHost);
        
        const lastCall = mockResponse.json.mock.calls[mockResponse.json.mock.calls.length - 1];
        const responseFormat = lastCall[0];
        
        expect(responseFormat).toHaveProperty('successful', false);
        expect(responseFormat).toHaveProperty('error_code');
        expect(responseFormat).toHaveProperty('data', null);
        expect(typeof responseFormat.error_code).toBe('string');
      }
    });
  });
});

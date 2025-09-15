import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES, ErrorCode } from '../constants';
import { ErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let errorCode: ErrorCode;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
          if (typeof errorResponse === 'object' && errorResponse !== null) {
            const errorObj = errorResponse as any;
            message = errorObj.message || exception.message;
            
            // จัดการ validation errors (class-validator)
            if (Array.isArray(errorObj.message)) {
              errorCode = ERROR_CODES.VALIDATION_ERROR;
              message = errorObj.message.join(', ');
            } else {
              // Handle NestJS specific exceptions
              if (typeof message === 'string' && message.includes('Invalid payload')) {
                errorCode = ERROR_CODES.INVALID_PAYLOAD;
              } else if (typeof message === 'string' && message.includes('Invalid encrypted data')) {
                errorCode = ERROR_CODES.INVALID_ENCRYPTED_DATA;
              } else if (typeof message === 'string' && message.includes('RSA keys not found')) {
                errorCode = ERROR_CODES.CONFIGURATION_ERROR;
              } else {
                errorCode = this.getErrorCodeFromStatus(status);
              }
            }
      } else {
        message = errorResponse as string;
        errorCode = this.getErrorCodeFromStatus(status);
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      
      // จัดการ errors แบบง่าย ๆ
      if (message.includes('Invalid payload')) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ERROR_CODES.INVALID_PAYLOAD;
      } else if (message.includes('Invalid encrypted data')) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ERROR_CODES.INVALID_ENCRYPTED_DATA;
      } else if (message.includes('RSA') || message.includes('configuration file')) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        errorCode = ERROR_CODES.CONFIGURATION_ERROR;
      } else if (message.includes('decrypt') || message.includes('bad decrypt')) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ERROR_CODES.DECRYPTION_FAILED;
      } else if (message.includes('encrypt')) {
        status = HttpStatus.BAD_REQUEST;
        errorCode = ERROR_CODES.ENCRYPTION_FAILED;
      } else {
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
    }

    // Log error (skip logging for validation errors)
    const shouldSkipLogging = (
      status === HttpStatus.BAD_REQUEST && 
      errorCode === ERROR_CODES.VALIDATION_ERROR
    );

    if (!shouldSkipLogging) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Return consistent error response format
    const apiResponse: ErrorResponse = {
      successful: false,
      error_code: errorCode,
      data: null,
    };

    response.status(status).json(apiResponse);
  }

  private getErrorCodeFromStatus(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.NOT_FOUND;
      case HttpStatus.METHOD_NOT_ALLOWED:
        return ERROR_CODES.METHOD_NOT_ALLOWED;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
      default:
        return ERROR_CODES.UNKNOWN_ERROR;
    }
  }
}

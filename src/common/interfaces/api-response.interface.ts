import { ErrorCode } from '../constants';

// Base API Response interface - No default generic type
export interface ApiResponse<T> {
  successful: boolean;
  error_code: ErrorCode | '';
  data: T | null;
}

// Success response type
export interface SuccessResponse<T> extends ApiResponse<T> {
  successful: true;
  error_code: '';
  data: T;
}

// Error response type
export interface ErrorResponse extends ApiResponse<null> {
  successful: false;
  error_code: ErrorCode;
  data: null;
}

// Data interfaces
export interface EncryptData {
  data1: string;
  data2: string;
}

export interface DecryptData {
  payload: string;
}

// Specific response types
export type EncryptResponse = SuccessResponse<EncryptData> | ErrorResponse;
export type DecryptResponse = SuccessResponse<DecryptData> | ErrorResponse;

// Strict type definitions - No 'any' allowed

// Ensure all values are strictly typed
export type StrictRecord<K extends string | number | symbol, V> = {
  [P in K]: V;
};

// Configuration types
export interface CryptoConfig {
  readonly rsaPrivateKey: string;
  readonly rsaPublicKey: string;
}

// Request payload types (no optional fields)
export interface EncryptPayload {
  payload: string;
}

export interface DecryptPayload {
  data1: string;
  data2: string;
}

// Crypto operation result types
export interface CryptoResult {
  readonly success: true;
  readonly data: unknown;
}

export interface CryptoError {
  readonly success: false;
  readonly error: string;
  readonly code: string;
}

// Union type for crypto operations
export type CryptoOperationResult = CryptoResult | CryptoError;

// Ensure no undefined/null in data structures
export type NonNullable<T> = T extends null | undefined ? never : T;

// Strict environment variable type
export interface EnvironmentVariables {
  readonly RSA_PRIVATE_KEY: string;
  readonly RSA_PUBLIC_KEY: string;
  readonly PORT: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

// Type guard functions
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Validation result types
export interface ValidationSuccess<T> {
  readonly valid: true;
  readonly data: T;
}

export interface ValidationError {
  readonly valid: false;
  readonly errors: ReadonlyArray<string>;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

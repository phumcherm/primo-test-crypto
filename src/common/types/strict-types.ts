export type StrictRecord<K extends string | number | symbol, V> = {
  [P in K]: V;
};

export interface CryptoConfig {
  readonly rsaPrivateKey: string;
  readonly rsaPublicKey: string;
}

export interface EncryptPayload {
  payload: string;
}

export interface DecryptPayload {
  data1: string;
  data2: string;
}

export interface CryptoResult {
  readonly success: true;
  readonly data: unknown;
}

export interface CryptoError {
  readonly success: false;
  readonly error: string;
  readonly code: string;
}

export type CryptoOperationResult = CryptoResult | CryptoError;

export type NonNullable<T> = T extends null | undefined ? never : T;

export interface EnvironmentVariables {
  readonly RSA_PRIVATE_KEY: string;
  readonly RSA_PUBLIC_KEY: string;
  readonly PORT: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export interface ValidationSuccess<T> {
  readonly valid: true;
  readonly data: T;
}

export interface ValidationError {
  readonly valid: false;
  readonly errors: ReadonlyArray<string>;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

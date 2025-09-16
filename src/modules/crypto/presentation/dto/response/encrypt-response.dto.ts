import { ApiProperty } from '@nestjs/swagger';
import { CryptoErrorCode } from '../../../domain/types/crypto.types';

export class EncryptDataDto {
  @ApiProperty({
    description: 'Encrypted AES key with RSA (Base64 encoded)',
    example: 'encrypted_aes_key_with_rsa_base64',
  })
  data1: string;

  @ApiProperty({
    description: 'Encrypted payload with AES including IV (Base64 encoded)',
    example: 'encrypted_payload_with_aes_and_iv_base64',
  })
  data2: string;
}

export class EncryptSuccessResponseDto {
  @ApiProperty({
    description: 'Indicates successful operation',
    example: true,
  })
  successful: true;

  @ApiProperty({
    description: 'Empty error code for successful operation',
    example: '',
  })
  error_code: '';

  @ApiProperty({
    description: 'Encrypted data result',
    type: EncryptDataDto,
  })
  data: EncryptDataDto;
}

export class EncryptErrorResponseDto {
  @ApiProperty({
    description: 'Indicates failed operation',
    example: false,
  })
  successful: false;

  @ApiProperty({
    description: 'Error code indicating the type of failure',
    enum: CryptoErrorCode,
    example: CryptoErrorCode.INVALID_PAYLOAD,
  })
  error_code: CryptoErrorCode;

  @ApiProperty({
    description: 'Null data for error response',
    example: null,
  })
  data: null;
}

export class EncryptResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    examples: {
      success: { value: true, description: 'Success response' },
      error: { value: false, description: 'Error response' }
    }
  })
  successful: boolean;

  @ApiProperty({
    description: 'Error code if operation failed, empty string if successful',
    examples: {
      success: { value: '', description: 'No error code for success' },
      error: { value: 'INVALID_PAYLOAD', description: 'Error code for failed operation' }
    },
    required: false,
  })
  error_code: string;

  @ApiProperty({
    description: 'Encrypted data or null if error',
    type: EncryptDataDto,
    required: false,
    examples: {
      success: { 
        value: {
          data1: 'encrypted_aes_key_with_rsa_base64',
          data2: 'encrypted_payload_with_aes_and_iv_base64'
        }, 
        description: 'Encrypted data for success response' 
      },
      error: { value: null, description: 'No data for error response' }
    }
  })
  data: EncryptDataDto | null;
}

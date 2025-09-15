import { ApiProperty } from '@nestjs/swagger';

export class EncryptDataDto {
  @ApiProperty({
    description: 'Encrypted AES key with RSA',
    example: 'encrypted_aes_key_with_rsa',
  })
  data1: string;

  @ApiProperty({
    description: 'Encrypted payload with AES',
    example: 'encrypted_payload_with_aes',
  })
  data2: string;
}

export class DecryptDataDto {
  @ApiProperty({
    description: 'Decrypted payload',
    example: 'Hello World!',
  })
  payload: string;
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
    description: 'Error code if operation failed',
    example: '',
    examples: {
      success: { value: '', description: 'No error code for success' },
      error: { value: 'INVALID_PAYLOAD', description: 'Error code for failed operation' }
    },
    required: false,
  })
  error_code: string;

  @ApiProperty({
    description: 'Encrypted data',
    type: EncryptDataDto,
    required: false,
    examples: {
      success: { 
        value: {
          data1: 'encrypted_aes_key_with_rsa',
          data2: 'encrypted_payload_with_aes'
        }, 
        description: 'Encrypted data for success response' 
      },
      error: { value: null, description: 'No data for error response' }
    }
  })
  data: EncryptDataDto | null;
}

export class DecryptResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    examples: {
      success: { value: true, description: 'Success response' },
      error: { value: false, description: 'Error response' }
    }
  })
  successful: boolean;

  @ApiProperty({
    description: 'Error code if operation failed',
    example: '',
    examples: {
      success: { value: '', description: 'No error code for success' },
      error: { value: 'INVALID_ENCRYPTED_DATA', description: 'Error code for failed operation' }
    },
    required: false,
  })
  error_code: string;

  @ApiProperty({
    description: 'Decrypted data',
    type: DecryptDataDto,
    required: false,
    examples: {
      success: { 
        value: { payload: 'Hello World!' }, 
        description: 'Decrypted data for success response' 
      },
      error: { value: null, description: 'No data for error response' }
    }
  })
  data: DecryptDataDto | null;
}

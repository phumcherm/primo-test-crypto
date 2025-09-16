import { ApiProperty } from '@nestjs/swagger';
import { CryptoErrorCode } from '../../../domain/types/crypto.types';

export class DecryptDataDto {
  @ApiProperty({
    description: 'Decrypted payload',
    example: 'Hello World!',
  })
  payload: string;
}

export class DecryptSuccessResponseDto {
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
    description: 'Decrypted data result',
    type: DecryptDataDto,
  })
  data: DecryptDataDto;
}

export class DecryptErrorResponseDto {
  @ApiProperty({
    description: 'Indicates failed operation',
    example: false,
  })
  successful: false;

  @ApiProperty({
    description: 'Error code indicating the type of failure',
    enum: CryptoErrorCode,
    example: CryptoErrorCode.INVALID_ENCRYPTED_DATA,
  })
  error_code: CryptoErrorCode;

  @ApiProperty({
    description: 'Null data for error response',
    example: null,
  })
  data: null;
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
    description: 'Error code if operation failed, empty string if successful',
    examples: {
      success: { value: '', description: 'No error code for success' },
      error: { value: 'INVALID_ENCRYPTED_DATA', description: 'Error code for failed operation' }
    },
    required: false,
  })
  error_code: string;

  @ApiProperty({
    description: 'Decrypted data or null if error',
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

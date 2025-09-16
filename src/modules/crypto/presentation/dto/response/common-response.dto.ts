import { ApiProperty } from '@nestjs/swagger';
import { CryptoErrorCode } from '../../../domain/types/crypto.types';

export class BaseResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  successful: boolean;

  @ApiProperty({
    description: 'Error code if operation failed, empty string if successful',
    example: '',
    required: false,
  })
  error_code: string;
}

export class SuccessResponseDto<T> extends BaseResponseDto {
  declare successful: true;
  declare error_code: '';

  @ApiProperty({
    description: 'Response data',
  })
  data: T;
}

export class ErrorResponseDto extends BaseResponseDto {
  declare successful: false;
  declare error_code: CryptoErrorCode;

  @ApiProperty({
    description: 'Null data for error response',
    example: null,
  })
  data: null;
}

export type ApiResponseDto<T> = SuccessResponseDto<T> | ErrorResponseDto;

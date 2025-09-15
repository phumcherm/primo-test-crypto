import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNotEmpty, IsDefined } from 'class-validator';

export class EncryptRequestDto {
  @ApiProperty({
    description: 'Data to be encrypted',
    example: 'Hello World!',
    minLength: 1,
    maxLength: 2000,
    required: true,
  })
  @IsDefined({ message: 'payload field is required' })
  @IsString({ message: 'payload must be a string' })
  @IsNotEmpty({ message: 'payload cannot be empty' })
  @MinLength(1, { message: 'payload must be at least 1 character long' })
  @MaxLength(2000, { message: 'payload cannot exceed 2000 characters' })
  payload: string;
}

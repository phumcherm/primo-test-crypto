import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDefined } from 'class-validator';

export class DecryptRequestDto {
  @ApiProperty({
    description: 'Encrypted AES key (RSA encrypted)',
    example: 'encrypted_aes_key_with_rsa',
    required: true,
  })
  @IsDefined({ message: 'data1 field is required' })
  @IsString({ message: 'data1 must be a string' })
  @IsNotEmpty({ message: 'data1 cannot be empty' })
  data1: string;

  @ApiProperty({
    description: 'Encrypted payload (AES encrypted)',
    example: 'encrypted_payload_with_aes',
    required: true,
  })
  @IsDefined({ message: 'data2 field is required' })
  @IsString({ message: 'data2 must be a string' })
  @IsNotEmpty({ message: 'data2 cannot be empty' })
  data2: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDefined, IsBase64 } from 'class-validator';

export class DecryptRequestDto {
  @ApiProperty({
    description: 'Encrypted AES key (RSA encrypted, Base64 encoded)',
    example: 'encrypted_aes_key_with_rsa_base64',
    required: true,
  })
  @IsDefined({ message: 'data1 field is required' })
  @IsString({ message: 'data1 must be a string' })
  @IsNotEmpty({ message: 'data1 cannot be empty' })
  @IsBase64({}, { message: 'data1 must be a valid Base64 string' })
  data1: string;

  @ApiProperty({
    description: 'Encrypted payload with IV (AES encrypted, Base64 encoded)',
    example: 'encrypted_payload_with_aes_and_iv_base64',
    required: true,
  })
  @IsDefined({ message: 'data2 field is required' })
  @IsString({ message: 'data2 must be a string' })
  @IsNotEmpty({ message: 'data2 cannot be empty' })
  @IsBase64({}, { message: 'data2 must be a valid Base64 string' })
  data2: string;
}

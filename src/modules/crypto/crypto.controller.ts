import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { EncryptRequestDto } from './dto/encrypt-request.dto';
import { DecryptRequestDto } from './dto/decrypt-request.dto';
import { EncryptResponseDto, DecryptResponseDto } from './dto/api-response.dto';
import { EncryptResponse, DecryptResponse, SuccessResponse, EncryptData, DecryptData } from '../../common/interfaces/api-response.interface';

@ApiTags('Crypto')
@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('get-encrypt-data')
  @ApiOperation({
    summary: 'Encrypt data using AES + RSA encryption',
    description: `Encryption process:
1. Validate request payload (0-2000 characters)
2. Generate random AES key
3. Encrypt payload with AES key (data2)
4. Encrypt AES key with RSA private key (data1)
5. Return data1 and data2`
  })
  @ApiResponse({
    status: 200,
    description: 'Data encrypted successfully',
    type: EncryptResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid payload',
    type: EncryptResponseDto,
    example: {
      successful: false,
      error_code: 'INVALID_PAYLOAD',
      data: null
    }
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async encryptData(@Body() encryptRequest: EncryptRequestDto): Promise<SuccessResponse<EncryptData>> {
    const result = await this.cryptoService.encryptData(encryptRequest.payload);
    return {
      successful: true,
      error_code: '',
      data: result,
    };
  }

  @Post('get-decrypt-data')
  @ApiOperation({
    summary: 'Decrypt data using RSA + AES decryption',
    description: `Decryption process:
1. Validate encrypted data (data1 and data2)
2. Decrypt AES key with RSA public key (from data1)
3. Decrypt payload with AES key (from data2)
4. Return decrypted payload`
  })
  @ApiResponse({
    status: 200,
    description: 'Data decrypted successfully',
    type: DecryptResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid encrypted data',
    type: DecryptResponseDto,
    example: {
      successful: false,
      error_code: 'INVALID_ENCRYPTED_DATA',
      data: null
    }
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async decryptData(@Body() decryptRequest: DecryptRequestDto): Promise<SuccessResponse<DecryptData>> {
    const result = await this.cryptoService.decryptData(decryptRequest.data1, decryptRequest.data2);
    return {
      successful: true,
      error_code: '',
      data: { payload: result },
    };
  }
}

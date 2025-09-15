import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { DecryptRequestDto } from './decrypt-request.dto';

describe('DecryptRequestDto', () => {
  describe('data1 validation', () => {
    it('should pass validation with valid data1', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: 'valid_encrypted_aes_key_base64',
        data2: 'valid_encrypted_payload_base64',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when data1 is missing', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data2: 'valid_encrypted_payload_base64',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('data1');
      expect(errors[0].constraints).toHaveProperty('isDefined');
      expect(errors[0].constraints?.isDefined).toBe('data1 field is required');
    });

    it('should fail validation when data1 is null', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: null,
        data2: 'valid_encrypted_payload_base64',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('data1');
      expect(errors[0].constraints).toHaveProperty('isString');
      expect(errors[0].constraints?.isString).toBe('data1 must be a string');
    });

    it('should fail validation when data1 is empty string', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: '',
        data2: 'valid_encrypted_payload_base64',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('data1');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints?.isNotEmpty).toBe('data1 cannot be empty');
    });

    it('should fail validation when data1 is not a string', async () => {
      const invalidValues = [123, true, {}, []];

      for (const value of invalidValues) {
        const dto = plainToClass(DecryptRequestDto, {
          data1: value,
          data2: 'valid_encrypted_payload_base64',
        });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('data1');
        expect(errors[0].constraints).toHaveProperty('isString');
      }
    });
  });

  describe('data2 validation', () => {
    it('should pass validation with valid data2', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: 'valid_encrypted_aes_key_base64',
        data2: 'valid_encrypted_payload_base64',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when data2 is missing', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: 'valid_encrypted_aes_key_base64',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('data2');
      expect(errors[0].constraints).toHaveProperty('isDefined');
      expect(errors[0].constraints?.isDefined).toBe('data2 field is required');
    });

    it('should fail validation when data2 is null', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: 'valid_encrypted_aes_key_base64',
        data2: null,
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('data2');
      expect(errors[0].constraints).toHaveProperty('isString');
      expect(errors[0].constraints?.isString).toBe('data2 must be a string');
    });

    it('should fail validation when data2 is empty string', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: 'valid_encrypted_aes_key_base64',
        data2: '',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('data2');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints?.isNotEmpty).toBe('data2 cannot be empty');
    });

    it('should fail validation when data2 is not a string', async () => {
      const invalidValues = [123, true, {}, []];

      for (const value of invalidValues) {
        const dto = plainToClass(DecryptRequestDto, {
          data1: 'valid_encrypted_aes_key_base64',
          data2: value,
        });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('data2');
        expect(errors[0].constraints).toHaveProperty('isString');
      }
    });
  });

  describe('both fields validation', () => {
    it('should fail validation when both fields are missing', async () => {
      const dto = plainToClass(DecryptRequestDto, {});
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(2);
      
      const data1Error = errors.find(e => e.property === 'data1');
      const data2Error = errors.find(e => e.property === 'data2');
      
      expect(data1Error).toBeDefined();
      expect(data2Error).toBeDefined();
      expect(data1Error?.constraints).toHaveProperty('isDefined');
      expect(data2Error?.constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when both fields are empty strings', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: '',
        data2: '',
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(2);
      
      const data1Error = errors.find(e => e.property === 'data1');
      const data2Error = errors.find(e => e.property === 'data2');
      
      expect(data1Error?.constraints).toHaveProperty('isNotEmpty');
      expect(data2Error?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when both fields are null', async () => {
      const dto = plainToClass(DecryptRequestDto, {
        data1: null,
        data2: null,
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(2);
      
      const data1Error = errors.find(e => e.property === 'data1');
      const data2Error = errors.find(e => e.property === 'data2');
      
      expect(data1Error?.constraints).toHaveProperty('isString');
      expect(data2Error?.constraints).toHaveProperty('isString');
    });

    it('should pass validation with valid base64-like strings', async () => {
      const validData = [
        { data1: 'dGVzdA==', data2: 'dGVzdA==' },
        { data1: 'bG9uZ2VyX2Jhc2U2NF9zdHJpbmc=', data2: 'YW5vdGhlcl9iYXNlNjRfc3RyaW5n' },
        { data1: 'encrypted_aes_key_mock', data2: 'encrypted_payload_mock' },
      ];

      for (const data of validData) {
        const dto = plainToClass(DecryptRequestDto, data);
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('transformation', () => {
    it('should properly transform plain object to DTO instance', () => {
      const plainObject = {
        data1: 'test_data1',
        data2: 'test_data2',
      };
      const dto = plainToClass(DecryptRequestDto, plainObject);
      
      expect(dto).toBeInstanceOf(DecryptRequestDto);
      expect(dto.data1).toBe('test_data1');
      expect(dto.data2).toBe('test_data2');
    });

    it('should handle transformation with missing properties', () => {
      const plainObject = {};
      const dto = plainToClass(DecryptRequestDto, plainObject);
      
      expect(dto).toBeInstanceOf(DecryptRequestDto);
      expect(dto.data1).toBeUndefined();
      expect(dto.data2).toBeUndefined();
    });

    it('should preserve string types during transformation', () => {
      const testData = {
        data1: 'string_value_1',
        data2: 'string_value_2',
      };
      
      const dto = plainToClass(DecryptRequestDto, testData);
      
      expect(typeof dto.data1).toBe('string');
      expect(typeof dto.data2).toBe('string');
      expect(dto.data1).toBe('string_value_1');
      expect(dto.data2).toBe('string_value_2');
    });
  });

  describe('edge cases', () => {
    it('should handle long strings correctly', async () => {
      const longString = 'A'.repeat(1000);
      const dto = plainToClass(DecryptRequestDto, {
        data1: longString,
        data2: longString,
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in strings', async () => {
      const specialStrings = [
        'data+with+plus/signs==',
        'data_with_underscores-and-dashes',
        'data123with456numbers',
        'data/with/slashes+and=equals',
      ];

      for (const str of specialStrings) {
        const dto = plainToClass(DecryptRequestDto, {
          data1: str,
          data2: str,
        });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('should handle whitespace strings', async () => {
      const whitespaceStrings = [
        ' ',
        '  ',
        '\t',
        '\n',
        ' \t\n ',
      ];

      for (const str of whitespaceStrings) {
        const dto = plainToClass(DecryptRequestDto, {
          data1: str,
          data2: str,
        });
        const errors = await validate(dto);
        
        // These should pass as they are not empty strings
        expect(errors).toHaveLength(0);
      }
    });
  });
});

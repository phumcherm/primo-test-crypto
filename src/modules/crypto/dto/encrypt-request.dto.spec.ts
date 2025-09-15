import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EncryptRequestDto } from './encrypt-request.dto';

describe('EncryptRequestDto', () => {
  describe('valid payloads', () => {
    it('should pass validation with valid payload', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: 'Hello World!' });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with minimum length payload', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: 'A' });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with maximum length payload', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: 'A'.repeat(2000) });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with special characters', async () => {
      const specialPayloads = [
        'Hello @#$%^&*()!',
        'Unicode: 你好世界 🌍',
        'JSON-like: {"key": "value"}',
        'Numbers: 1234567890',
        'Mixed: Hello123!@#',
      ];

      for (const payload of specialPayloads) {
        const dto = plainToClass(EncryptRequestDto, { payload });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('should pass validation with whitespace characters', async () => {
      const whitespacePayloads = [
        ' ', // Single space
        '  ', // Multiple spaces
        '\t', // Tab
        '\n', // Newline
        ' \t\n ', // Mixed whitespace
        'Text with spaces',
        'Text\nwith\nnewlines',
        'Text\twith\ttabs',
      ];

      for (const payload of whitespacePayloads) {
        const dto = plainToClass(EncryptRequestDto, { payload });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('invalid payloads - missing field', () => {
    it('should fail validation when payload is missing', async () => {
      const dto = plainToClass(EncryptRequestDto, {});
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isDefined');
      expect(errors[0].constraints!.isDefined).toBe('payload field is required');
    });

    it('should fail validation when payload is undefined', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: undefined });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });
  });

  describe('invalid payloads - null values', () => {
    it('should fail validation when payload is null', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: null });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isString');
      expect(errors[0].constraints!.isString).toBe('payload must be a string');
    });
  });

  describe('invalid payloads - empty values', () => {
    it('should fail validation when payload is empty string', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: '' });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints).toHaveProperty('minLength');
      expect(errors[0].constraints!.isNotEmpty).toBe('payload cannot be empty');
    });
  });

  describe('invalid payloads - wrong types', () => {
    it('should fail validation when payload is not a string', async () => {
      const invalidValues = [
        123,
        true,
        false,
        {},
        [],
        new Date(),
      ];

      for (const value of invalidValues) {
        const dto = plainToClass(EncryptRequestDto, { payload: value });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('payload');
        expect(errors[0].constraints).toHaveProperty('isString');
        expect(errors[0].constraints!.isString).toBe('payload must be a string');
      }
    });
  });

  describe('invalid payloads - length constraints', () => {
    it('should fail validation when payload exceeds maximum length', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: 'A'.repeat(2001) });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('maxLength');
      expect(errors[0].constraints!.maxLength).toBe('payload cannot exceed 2000 characters');
    });

    it('should fail validation when payload is much longer than limit', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: 'A'.repeat(5000) });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('edge cases', () => {
    it('should handle object with extra properties', async () => {
      const dto = plainToClass(EncryptRequestDto, {
        payload: 'Valid payload',
        extraProperty: 'Should be ignored',
        anotherExtra: 123,
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
      expect(dto.payload).toBe('Valid payload');
    });

    it('should handle nested object as payload (should fail)', async () => {
      const dto = plainToClass(EncryptRequestDto, {
        payload: { nested: 'object' },
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should handle array as payload (should fail)', async () => {
      const dto = plainToClass(EncryptRequestDto, {
        payload: ['array', 'values'],
      });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('transformation', () => {
    it('should properly transform plain object to DTO instance', () => {
      const plainObject = { payload: 'Test payload' };
      const dto = plainToClass(EncryptRequestDto, plainObject);
      
      expect(dto).toBeInstanceOf(EncryptRequestDto);
      expect(dto.payload).toBe('Test payload');
    });

    it('should handle transformation with missing properties', () => {
      const plainObject = {};
      const dto = plainToClass(EncryptRequestDto, plainObject);
      
      expect(dto).toBeInstanceOf(EncryptRequestDto);
      expect(dto.payload).toBeUndefined();
    });

    it('should preserve string types during transformation', () => {
      const testData = { payload: 'String value' };
      const dto = plainToClass(EncryptRequestDto, testData);
      
      expect(typeof dto.payload).toBe('string');
      expect(dto.payload).toBe('String value');
    });

    it('should handle string conversion for number-like strings', () => {
      const testData = { payload: '12345' };
      const dto = plainToClass(EncryptRequestDto, testData);
      
      expect(typeof dto.payload).toBe('string');
      expect(dto.payload).toBe('12345');
    });
  });

  describe('multiple errors', () => {
    it('should return single error for empty string (multiple constraints violated)', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: '' });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      // Should have both isNotEmpty and minLength constraints
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should handle payload that violates multiple constraints', async () => {
      // null violates isDefined, isString, isNotEmpty, and minLength
      const dto = plainToClass(EncryptRequestDto, { payload: null });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});

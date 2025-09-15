import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EncryptRequestDto } from './encrypt-request.dto';

describe('EncryptRequestDto', () => {
  describe('payload validation', () => {
    it('should pass validation with valid payload', async () => {
      const validPayloads = [
        'Hello World!',
        'A',
        'A'.repeat(2000), // Max length
        'Text with numbers 123',
        'Special chars: !@#$%^&*()',
        '{"json": "object"}',
        'Unicode: 你好世界 🌍',
        'Multi\nLine\nText',
      ];

      for (const payload of validPayloads) {
        const dto = plainToClass(EncryptRequestDto, { payload });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation when payload is missing', async () => {
      const dto = plainToClass(EncryptRequestDto, {});
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isDefined');
      expect(errors[0].constraints?.isDefined).toBe('payload field is required');
    });

    it('should fail validation when payload is null', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: null });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isString');
      expect(errors[0].constraints?.isString).toBe('payload must be a string');
    });

    it('should fail validation when payload is undefined', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: undefined });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isDefined');
    });

    it('should fail validation when payload is empty string', async () => {
      const dto = plainToClass(EncryptRequestDto, { payload: '' });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      expect(errors[0].constraints).toHaveProperty('minLength');
      expect(errors[0].constraints?.isNotEmpty).toBe('payload cannot be empty');
    });

    it('should fail validation when payload is not a string', async () => {
      const invalidPayloads = [
        123,
        true,
        false,
        {},
        [],
        { text: 'object' },
      ];

      for (const payload of invalidPayloads) {
        const dto = plainToClass(EncryptRequestDto, { payload });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('payload');
        expect(errors[0].constraints).toHaveProperty('isString');
        expect(errors[0].constraints?.isString).toBe('payload must be a string');
      }
    });

    it('should fail validation when payload exceeds maximum length', async () => {
      const tooLongPayload = 'A'.repeat(2001); // Exceeds max length of 2000
      const dto = plainToClass(EncryptRequestDto, { payload: tooLongPayload });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      expect(errors[0].constraints).toHaveProperty('maxLength');
      expect(errors[0].constraints?.maxLength).toBe('payload cannot exceed 2000 characters');
    });

    it('should pass validation with payload at minimum length', async () => {
      const minLengthPayload = 'A'; // Minimum length of 1
      const dto = plainToClass(EncryptRequestDto, { payload: minLengthPayload });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with payload at maximum length', async () => {
      const maxLengthPayload = 'A'.repeat(2000); // Maximum length of 2000
      const dto = plainToClass(EncryptRequestDto, { payload: maxLengthPayload });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should provide correct error messages for multiple violations', async () => {
      // Test empty string which violates both isNotEmpty and minLength
      const dto = plainToClass(EncryptRequestDto, { payload: '' });
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('payload');
      
      const constraints = errors[0].constraints || {};
      const constraintValues = Object.values(constraints);
      
      expect(constraintValues).toContain('payload cannot be empty');
      expect(constraintValues).toContain('payload must be at least 1 character long');
    });

    it('should validate extra properties are not allowed (whitelist)', async () => {
      const dtoWithExtra = plainToClass(EncryptRequestDto, {
        payload: 'Valid payload',
        extraField: 'This should not be allowed',
      });
      
      // Note: This test assumes forbidNonWhitelisted is enabled in ValidationPipe
      // The actual enforcement happens at the pipe level, not at the DTO validation level
      const errors = await validate(dtoWithExtra);
      expect(errors).toHaveLength(0); // DTO validation itself doesn't check whitelist
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

    it('should preserve string payload types during transformation', () => {
      const testCases = [
        { input: 'simple string', expected: 'simple string' },
        { input: '123', expected: '123' },
        { input: 'true', expected: 'true' },
        { input: '{"json": "string"}', expected: '{"json": "string"}' },
      ];

      for (const testCase of testCases) {
        const dto = plainToClass(EncryptRequestDto, { payload: testCase.input });
        expect(dto.payload).toBe(testCase.expected);
        expect(typeof dto.payload).toBe('string');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only strings correctly', async () => {
      const whitespacePayloads = [
        ' ',           // Single space - should pass
        '  ',          // Multiple spaces - should pass
        '\t',          // Tab - should pass
        '\n',          // Newline - should pass
        ' \t\n ',      // Mixed whitespace - should pass
      ];

      for (const payload of whitespacePayloads) {
        const dto = plainToClass(EncryptRequestDto, { payload });
        const errors = await validate(dto);
        
        // These should pass validation as they are not empty strings
        expect(errors).toHaveLength(0);
      }
    });

    it('should handle Unicode characters correctly', async () => {
      const unicodePayloads = [
        '你好世界',           // Chinese
        'Здравствуй мир',     // Russian  
        'مرحبا بالعالم',      // Arabic
        '🌍🌎🌏',            // Emojis
        'café',              // Accented characters
      ];

      for (const payload of unicodePayloads) {
        const dto = plainToClass(EncryptRequestDto, { payload });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('should handle special string edge cases', async () => {
      const edgeCases = [
        'null',          // String "null"
        'undefined',     // String "undefined"
        'false',         // String "false"
        '0',             // String "0"
        '[]',            // String "[]"
        '{}',            // String "{}"
      ];

      for (const payload of edgeCases) {
        const dto = plainToClass(EncryptRequestDto, { payload });
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });
  });
});

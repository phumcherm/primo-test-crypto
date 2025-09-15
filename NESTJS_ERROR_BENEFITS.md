# NestJS Exceptions Benefits

## 🎯 **ข้อดีของการใช้ NestJS Built-in Exceptions**

### **✅ 1. Automatic HTTP Status Codes**
```typescript
// ❌ ก่อนหน้า - ต้อง map เอง
throw new Error('Invalid payload');
// Global Filter ต้องแยกแยะว่าเป็น 400 หรือ 500

// ✅ ตอนนี้ - HTTP status อัตโนมัติ
throw new BadRequestException('Invalid payload');          // → 400
throw new InternalServerErrorException('Config error');    // → 500
```

### **✅ 2. Consistent Error Structure**
```typescript
// NestJS exceptions มี structure มาตรฐาน
{
  "statusCode": 400,
  "message": "Invalid payload",
  "error": "Bad Request"
}
```

### **✅ 3. Type Safety**
```typescript
// TypeScript รู้ว่าเป็น HTTP exception
if (exception instanceof HttpException) {
  const status = exception.getStatus();        // Type-safe
  const response = exception.getResponse();    // Type-safe
}
```

## 🔧 **Service Layer - ใช้ NestJS Exceptions**

```typescript
@Injectable()
export class CryptoService {
  async encryptData(payload: string): Promise<EncryptData> {
    // ✅ Clear intent with proper HTTP status
    if (!isNonEmptyString(payload)) {
      throw new BadRequestException('Invalid payload');
    }

    // Pure crypto logic - crypto errors will bubble up
    const result = crypto.privateEncrypt(/* ... */);
    return result;
  }

  async decryptData(data1: string, data2: string): Promise<string> {
    // ✅ Clear intent with proper HTTP status
    if (!isNonEmptyString(data1) || !isNonEmptyString(data2)) {
      throw new BadRequestException('Invalid encrypted data');
    }

    // Pure crypto logic
    const result = crypto.publicDecrypt(/* ... */);
    return result;
  }

  constructor(configService: ConfigService) {
    // ✅ Configuration errors are 500, not 400
    if (!privateKey) {
      throw new InternalServerErrorException('RSA keys not found in environment variables');
    }
  }
}
```

## 🛡️ **Global Filter - Enhanced Handling**

```typescript
@Catch()
export class GlobalExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      // ✅ NestJS exceptions มี status code แล้ว
      status = exception.getStatus();
      
      // ✅ Smart error code mapping
      if (message.includes('Invalid payload')) {
        errorCode = ERROR_CODES.INVALID_PAYLOAD;
      } else if (message.includes('Invalid encrypted data')) {
        errorCode = ERROR_CODES.INVALID_ENCRYPTED_DATA;
      }
    } else if (exception instanceof Error) {
      // ✅ Handle unexpected crypto errors
      if (message.includes('decrypt')) {
        errorCode = ERROR_CODES.DECRYPTION_FAILED;
      }
    }
  }
}
```

## 📊 **Error Flow Comparison**

### **Before (Generic Error):**
```
Service: throw new Error('Invalid payload')
         ↓
Filter:  - Check error message
         - Guess HTTP status (400/500?)
         - Map to error code
         ↓
Response: 500 Internal Server Error (wrong!)
```

### **After (NestJS Exceptions):**
```
Service: throw new BadRequestException('Invalid payload')
         ↓
Filter:  - Get status from exception (400)
         - Map message to error code
         ↓
Response: 400 Bad Request (correct!)
```

## 🚀 **Available NestJS Exceptions**

### **Client Errors (4xx):**
```typescript
// 400 Bad Request
throw new BadRequestException('Invalid input');

// 401 Unauthorized  
throw new UnauthorizedException('Auth required');

// 403 Forbidden
throw new ForbiddenException('Access denied');

// 404 Not Found
throw new NotFoundException('Resource not found');

// 409 Conflict
throw new ConflictException('Data conflict');

// 422 Unprocessable Entity
throw new UnprocessableEntityException('Invalid data');
```

### **Server Errors (5xx):**
```typescript
// 500 Internal Server Error
throw new InternalServerErrorException('Config error');

// 501 Not Implemented
throw new NotImplementedException('Feature not ready');

// 503 Service Unavailable
throw new ServiceUnavailableException('Service down');
```

## 💡 **Best Practices**

### **✅ Use Appropriate Exception Types:**
```typescript
// Input validation errors
if (!payload) throw new BadRequestException('Invalid payload');

// Configuration/setup errors  
if (!rsaKey) throw new InternalServerErrorException('Missing RSA key');

// Business logic errors
if (userExists) throw new ConflictException('User already exists');
```

### **✅ Meaningful Error Messages:**
```typescript
// ❌ Generic
throw new BadRequestException('Error');

// ✅ Specific
throw new BadRequestException('Payload must be between 1-2000 characters');
```

### **✅ Let Crypto Errors Bubble Up:**
```typescript
// ✅ Don't catch crypto errors - let Global Filter handle them
const encrypted = crypto.privateEncrypt(key, data); // May throw
```

## 🎉 **Result:**

### **📋 Cleaner Code:**
- **Explicit HTTP status codes** in Service layer
- **No guessing** about error types
- **Type-safe** exception handling

### **🎯 Better Error Responses:**
- **Correct HTTP status codes** automatically
- **Consistent error structure**
- **Meaningful error messages**

### **🛠️ Developer Experience:**
- **IntelliSense** for exception types
- **Clear intent** in code
- **Easy debugging**

**Bottom Line: NestJS exceptions ทำให้ error handling professional และ maintainable! 🎉**

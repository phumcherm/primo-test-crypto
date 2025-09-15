# Error Handling Strategy

## 🎯 **Layered Error Handling Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Request                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Controller Layer                               │
│  • Input validation (DTO + ValidationPipe)                 │
│  • HTTP-specific concerns                                   │
│  • Success response formatting                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               Service Layer                                 │
│  • Business logic validation                               │
│  • Crypto-specific error handling                          │
│  • Transform technical errors to meaningful messages       │
│  • Add context to errors                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ (Any Error)
┌─────────────────────▼───────────────────────────────────────┐
│           Global Exception Filter                          │
│  • Catch all unhandled errors                             │
│  • Map error types to HTTP status codes                   │
│  • Format consistent error responses                       │
│  • Log errors for debugging                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Client Response                              │
│  { successful: false, error_code: "...", data: null }      │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Why We Need Both Service Try-Catch AND Global Filter?**

### **Service Layer Try-Catch:**
```typescript
async encryptData(payload: string): Promise<EncryptData> {
  try {
    // Crypto operations
    const result = crypto.privateEncrypt(/* ... */);
    return result;
  } catch (error: unknown) {
    // 🎯 Transform crypto-specific errors
    if (error instanceof Error) {
      if (error.message.includes('bad decrypt')) {
        throw new Error('Invalid payload: encryption failed');
      }
      if (error.message.includes('illegal or unsupported padding mode')) {
        throw new Error('RSA encryption failed: invalid key format');
      }
    }
    
    // Re-throw with context
    throw new Error(`Encryption failed: ${error.message}`);
  }
}
```

**Purpose:**
- ✅ **Transform technical errors** → meaningful messages
- ✅ **Add business context** to crypto errors  
- ✅ **Handle domain-specific exceptions**
- ✅ **Prevent cryptic error messages** from reaching users

### **Global Exception Filter:**
```typescript
@Catch()
export class GlobalExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    // 🎯 Final error processing
    if (exception instanceof Error) {
      if (exception.message.includes('Encryption failed')) {
        errorCode = ERROR_CODES.ENCRYPTION_FAILED;
      } else if (exception.message.includes('Decryption failed')) {
        errorCode = ERROR_CODES.DECRYPTION_FAILED;
      }
    }
    
    // Return consistent format
    response.json({
      successful: false,
      error_code: errorCode,
      data: null
    });
  }
}
```

**Purpose:**
- ✅ **Consistent response format** ทุก error
- ✅ **HTTP status code mapping**
- ✅ **Centralized logging**
- ✅ **Catch unexpected errors** ที่ไม่ได้ handle

## 📋 **Error Flow Examples**

### **Example 1: Validation Error**
```
Request: { payload: "" }
↓
DTO Validation fails
↓
ValidationPipe throws BadRequestException
↓
Global Filter catches → 400 Bad Request
↓
Response: { successful: false, error_code: "VALIDATION_ERROR", data: null }
```

### **Example 2: Crypto Error**
```
Request: { payload: "valid data" }
↓
Controller validates input ✅
↓
Service: crypto.privateEncrypt() fails (bad key)
↓
Service try-catch: "RSA encryption failed: invalid key format"
↓
Global Filter catches → 400 Bad Request  
↓
Response: { successful: false, error_code: "ENCRYPTION_FAILED", data: null }
```

### **Example 3: Unexpected Error**
```
Request: { payload: "valid data" }
↓
Service: Database connection fails (unexpected)
↓
Service doesn't catch (not crypto-related)
↓
Global Filter catches → 500 Internal Server Error
↓
Response: { successful: false, error_code: "INTERNAL_SERVER_ERROR", data: null }
```

## 🎨 **Best Practices Applied**

### **1. Fail Fast Principle**
```typescript
// Validate early, fail fast
if (!isNonEmptyString(payload)) {
  throw new Error('Invalid payload: must be a non-empty string');
}
```

### **2. Error Context Enhancement**
```typescript
// Before: Cryptic crypto error
// "error:0E06D06C:configuration file routines"

// After: Meaningful error
// "RSA keys not found in environment variables"
```

### **3. Separation of Concerns**
- **Service Layer**: Handle domain-specific errors
- **Global Filter**: Handle HTTP concerns & formatting

### **4. Type Safety**
```typescript
} catch (error: unknown) {
  // Always check error type before accessing properties
  if (error instanceof Error) {
    // Safe to access error.message
  }
}
```

## 🚀 **Benefits**

### **✅ For Developers:**
- **Clear error messages** for debugging
- **Consistent error handling** patterns
- **Type-safe error processing**

### **✅ For Users:**
- **Meaningful error responses**
- **Consistent API format**
- **No cryptic technical errors**

### **✅ For Operations:**
- **Centralized error logging**
- **Error categorization**
- **Monitoring integration ready**

**Result: Professional, robust error handling that's both developer-friendly and user-friendly! 🎉**

# Type Safety Examples

## 🎯 **Enhanced Type Safety**

### **1. Base Interface Hierarchy**

```typescript
// Base API Response
interface ApiResponse<T = any> {
  successful: boolean;
  error_code: ErrorCode | '';
  data: T | null;
}

// Success Response (จำเป็นต้องมี data)
interface SuccessResponse<T> extends ApiResponse<T> {
  successful: true;
  error_code: '';
  data: T;
}

// Error Response (data เป็น null เสมอ)
interface ErrorResponse extends ApiResponse<null> {
  successful: false;
  error_code: ErrorCode;
  data: null;
}
```

### **2. Specific Data Types**

```typescript
// Encryption data structure
interface EncryptData {
  data1: string;  // RSA encrypted AES key
  data2: string;  // AES encrypted payload
}

// Decryption data structure
interface DecryptData {
  payload: string;  // Original decrypted text
}
```

### **3. Union Types for Responses**

```typescript
// Encrypt endpoint response (Success OR Error)
type EncryptResponse = SuccessResponse<EncryptData> | ErrorResponse;

// Decrypt endpoint response (Success OR Error)
type DecryptResponse = SuccessResponse<DecryptData> | ErrorResponse;
```

## 💡 **Type Safety Benefits**

### **✅ Compile-time Checking**

```typescript
// ❌ This will cause TypeScript error
const invalidSuccess: SuccessResponse<EncryptData> = {
  successful: true,
  error_code: 'SOME_ERROR',  // Error: should be ''
  data: null                 // Error: should be EncryptData
};

// ✅ This is correct
const validSuccess: SuccessResponse<EncryptData> = {
  successful: true,
  error_code: '',
  data: {
    data1: 'encrypted_aes_key',
    data2: 'encrypted_payload'
  }
};
```

### **✅ IntelliSense Support**

```typescript
// Controller method with precise return type
async encryptData(request: EncryptRequestDto): Promise<SuccessResponse<EncryptData>> {
  const result = await this.cryptoService.encryptData(request.payload);
  
  // TypeScript knows exactly what should be returned
  return {
    successful: true,
    error_code: '',
    data: result  // TypeScript validates this is EncryptData
  };
}
```

### **✅ Error Prevention**

```typescript
// Service method with specific return type
async encryptData(payload: string): Promise<EncryptData> {
  // ... encryption logic
  
  // ❌ TypeScript error - missing required property
  return { data1: 'encrypted_key' };  // Missing 'data2'
  
  // ✅ Correct
  return { 
    data1: 'encrypted_key', 
    data2: 'encrypted_payload' 
  };
}
```

## 🔧 **Usage Examples**

### **Client-side Type Guards**

```typescript
// Type guard for success response
function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.successful === true;
}

// Usage
const response: EncryptResponse = await fetch('/get-encrypt-data');

if (isSuccessResponse(response)) {
  // TypeScript knows response.data is EncryptData
  console.log(response.data.data1);  // ✅ Type-safe access
  console.log(response.data.data2);  // ✅ Type-safe access
} else {
  // TypeScript knows this is ErrorResponse
  console.error(response.error_code);  // ✅ Type-safe error handling
}
```

### **Generic Response Handler**

```typescript
class ApiClient {
  async handleResponse<T>(
    promise: Promise<Response>
  ): Promise<SuccessResponse<T> | ErrorResponse> {
    const response = await promise;
    const data = await response.json();
    
    // TypeScript ensures correct structure
    if (data.successful) {
      return {
        successful: true,
        error_code: '',
        data: data.data
      } as SuccessResponse<T>;
    } else {
      return {
        successful: false,
        error_code: data.error_code,
        data: null
      } as ErrorResponse;
    }
  }
}
```

## 🎨 **Advanced Type Patterns**

### **Conditional Types**

```typescript
// Conditional response type based on input
type ApiResponseFor<T> = T extends 'encrypt' 
  ? EncryptResponse 
  : T extends 'decrypt' 
    ? DecryptResponse 
    : never;

// Usage
function callApi<T extends 'encrypt' | 'decrypt'>(
  endpoint: T, 
  data: any
): Promise<ApiResponseFor<T>> {
  // Implementation
}
```

### **Discriminated Unions**

```typescript
// The 'successful' field acts as discriminator
function handleApiResponse(response: EncryptResponse) {
  if (response.successful) {
    // TypeScript narrows to SuccessResponse<EncryptData>
    const { data1, data2 } = response.data;
    console.log(`Encrypted: ${data1}, ${data2}`);
  } else {
    // TypeScript narrows to ErrorResponse
    console.error(`Error: ${response.error_code}`);
  }
}
```

## 🚀 **Result**

### **Type Safety ที่ได้:**

1. **Compile-time validation** - ตรวจสอบ structure ก่อน runtime
2. **IntelliSense support** - Auto-completion แม่นยำ
3. **Refactoring safety** - เปลี่ยนชื่อ/โครงสร้างได้อย่างปลอดภัย
4. **Documentation** - Types เป็น documentation ที่อัพเดทเสมอ
5. **Error prevention** - ป้องกัน typos และ structure errors

**ผลลัพธ์: Code ที่ปลอดภัย มั่นคง และ maintainable! 🎉**

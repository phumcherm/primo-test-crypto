# Simple Error Handling Strategy

## 🎯 **ง่าย แต่มีประสิทธิภาพ**

### **📋 หลักการ:**
1. **Service Layer**: แค่ throw Error ธรรมดา
2. **Global Filter**: จัดการ mapping และ formatting ทั้งหมด
3. **ไม่ซับซ้อน**: ไม่มี nested try-catch หรือ error transformation

## 🔧 **Service Layer - เรียบง่าย**

```typescript
async encryptData(payload: string): Promise<EncryptData> {
  // ✅ Simple validation
  if (!isNonEmptyString(payload)) {
    throw new Error('Invalid payload');
  }

  // ✅ Pure business logic - NO try-catch!
  const aesKey: Buffer = crypto.randomBytes(32);
  const iv: Buffer = crypto.randomBytes(16);
  
  // ... crypto operations ...
  
  return { data1, data2 };
}

async decryptData(data1: string, data2: string): Promise<string> {
  // ✅ Simple validation
  if (!isNonEmptyString(data1) || !isNonEmptyString(data2)) {
    throw new Error('Invalid encrypted data');
  }

  // ✅ Pure business logic - NO try-catch!
  const aesKey = crypto.publicDecrypt(/* ... */);
  
  // ... crypto operations ...
  
  return decryptedPayload;
}
```

## 🛡️ **Global Exception Filter - จัดการทั้งหมด**

```typescript
@Catch()
export class GlobalExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    // ✅ Simple error mapping
    if (message.includes('Invalid payload')) {
      errorCode = ERROR_CODES.INVALID_PAYLOAD;
    } else if (message.includes('Invalid encrypted data')) {
      errorCode = ERROR_CODES.INVALID_ENCRYPTED_DATA;
    } else if (message.includes('decrypt')) {
      errorCode = ERROR_CODES.DECRYPTION_FAILED;
    } else if (message.includes('encrypt')) {
      errorCode = ERROR_CODES.ENCRYPTION_FAILED;
    }

    // ✅ Consistent response format
    response.json({
      successful: false,
      error_code: errorCode,
      data: null
    });
  }
}
```

## 🌊 **Error Flow - เรียบง่าย**

```
Request
  ↓
Controller (Input validation)
  ↓
Service (Business logic)
  ↓ (Any Error)
Global Filter (Error mapping + formatting)
  ↓
Consistent JSON Response
```

## ✅ **ข้อดี:**

### **1. Simplicity**
- **ไม่มี nested try-catch**
- **ไม่มี error transformation ซับซ้อน**
- **Code อ่านง่าย เข้าใจง่าย**

### **2. Maintainability**
- **Error handling logic อยู่ที่เดียว** (Global Filter)
- **Service เน้น business logic อย่างเดียว**
- **Easy to modify** error responses

### **3. Consistency**
- **Response format เหมือนกันทุก error**
- **Error codes มาตรฐาน**
- **HTTP status codes ถูกต้อง**

### **4. Let It Crash Philosophy**
- **Crypto errors จะ bubble up** ไป Global Filter
- **Unexpected errors จะถูก catch** โดย Global Filter
- **ไม่ต้องกังวลเรื่อง unhandled errors**

## 📋 **Error Mapping Examples:**

### **Input Validation Errors:**
```
Service: throw new Error('Invalid payload')
Filter: → INVALID_PAYLOAD (400)
```

### **Crypto Errors:**
```
Crypto library: "bad decrypt" 
Filter: → DECRYPTION_FAILED (400)

Crypto library: "error:0E06D06C:configuration file"
Filter: → CONFIGURATION_ERROR (500)
```

### **Unexpected Errors:**
```
Unknown error: anything else
Filter: → INTERNAL_SERVER_ERROR (500)
```

## 🚀 **Result:**

### **✅ Service Layer:**
```typescript
// Clean, focused on business logic
async encryptData(payload: string): Promise<EncryptData> {
  if (!payload) throw new Error('Invalid payload');
  
  // Pure crypto logic
  return { data1, data2 };
}
```

### **✅ Error Responses:**
```json
{
  "successful": false,
  "error_code": "INVALID_PAYLOAD",
  "data": null
}
```

**Bottom Line: เรียบง่าย มีประสิทธิภาพ และ maintainable! 🎉**

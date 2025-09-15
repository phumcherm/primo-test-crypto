# Swagger Examples ที่แก้ไขแล้ว

## 🎯 **ปัญหาที่พบ:**

Response ที่แสดงผิด:
```json
{
  "successful": true,           // ← Success
  "error_code": "INVALID_PAYLOAD",  // ← แต่มี error code! 
  "data": { /* ... */ }
}
```

## ✅ **การแก้ไข:**

### **1. ใช้ `examples` แทน `example`**

```typescript
// ❌ ก่อนหน้า - example เดียว (confused)
@ApiProperty({
  description: 'Indicates if the operation was successful',
  example: true,  // Always true - confusing!
})

// ✅ ตอนนี้ - examples แยกชัด
@ApiProperty({
  description: 'Indicates if the operation was successful',
  examples: {
    success: { value: true, description: 'Success response' },
    error: { value: false, description: 'Error response' }
  }
})
```

### **2. แยก Success/Error Examples ชัดเจน**

#### **Success Response Example:**
```json
{
  "successful": true,
  "error_code": "",
  "data": {
    "data1": "encrypted_aes_key_with_rsa",
    "data2": "encrypted_payload_with_aes"
  }
}
```

#### **Error Response Example:**
```json
{
  "successful": false,
  "error_code": "INVALID_PAYLOAD",
  "data": null
}
```

## 🔧 **สาเหตุของปัญหา:**

### **Swagger Documentation Confusion:**
- **Single `example`** ไม่สามารถแสดง success/error scenarios ได้
- **Mixed values** ใน examples ทำให้เกิด confusion
- **Users เห็น example ที่ผิด** ใน Swagger UI

### **ปัจจัยที่มีส่วน:**
1. **Swagger UI** แสดง example จาก `@ApiProperty`
2. **Mixed success/error examples** ในที่เดียว
3. **ไม่มี clear separation** ระหว่าง scenarios

## 📋 **การแก้ไขที่ทำ:**

### **1. EncryptResponseDto Examples:**
```typescript
@ApiProperty({
  description: 'Indicates if the operation was successful',
  examples: {
    success: { value: true, description: 'Success response' },
    error: { value: false, description: 'Error response' }
  }
})
successful: boolean;

@ApiProperty({
  description: 'Error code if operation failed',
  examples: {
    success: { value: '', description: 'No error code for success' },
    error: { value: 'INVALID_PAYLOAD', description: 'Error code for failed operation' }
  },
  required: false,
})
error_code: string;

@ApiProperty({
  description: 'Encrypted data',
  examples: {
    success: { 
      value: {
        data1: 'encrypted_aes_key_with_rsa',
        data2: 'encrypted_payload_with_aes'
      }, 
      description: 'Encrypted data for success response' 
    },
    error: { value: null, description: 'No data for error response' }
  }
})
data: EncryptDataDto | null;
```

### **2. DecryptResponseDto Examples:**
```typescript
// Similar structure with proper success/error separation
```

## 🚀 **ผลลัพธ์:**

### **✅ Swagger UI จะแสดง:**
- **Clear success examples** ด้วย `successful: true, error_code: "", data: {...}`
- **Clear error examples** ด้วย `successful: false, error_code: "...", data: null`
- **No more confusion** ระหว่าง success และ error responses

### **✅ Developers จะเห็น:**
- **Proper response structures** สำหรับแต่ละ scenario
- **Meaningful examples** ที่สามารถใช้งานได้จริง
- **Clear documentation** ที่ไม่ทำให้เกิด confusion

### **✅ API Users จะเข้าใจ:**
- **Success responses** มีหน้าตาอย่างไร
- **Error responses** มีหน้าตาอย่างไร
- **ไม่มีการ mix** ระหว่าง success/error ใน example เดียว

**Bottom Line: Swagger examples ที่ชัดเจนและถูกต้อง ไม่ทำให้เกิด confusion! 🎉**

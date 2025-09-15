# Global Exception Filter Test Cases

## 🔸 Test Cases สำหรับ Global Exception Filter

### 1. **Validation Errors (DTO Level)**

#### Test: Invalid payload length
```bash
curl -X POST http://localhost:3000/get-encrypt-data \
  -H "Content-Type: application/json" \
  -d '{"payload": "'$(printf 'x%.0s' {1..2001})'"}'
```

**Expected Response:**
```json
{
  "successful": false,
  "error_code": "VALIDATION_ERROR",
  "data": null
}
```

#### Test: Missing required fields
```bash
curl -X POST http://localhost:3000/get-decrypt-data \
  -H "Content-Type: application/json" \
  -d '{"data1": "test"}'
```

**Expected Response:**
```json
{
  "successful": false,
  "error_code": "VALIDATION_ERROR", 
  "data": null
}
```

### 2. **Crypto-specific Errors**

#### Test: Invalid encrypted data format
```bash
curl -X POST http://localhost:3000/get-decrypt-data \
  -H "Content-Type: application/json" \
  -d '{"data1": "invalid_base64", "data2": "invalid_base64"}'
```

**Expected Response:**
```json
{
  "successful": false,
  "error_code": "DECRYPTION_FAILED",
  "data": null
}
```

### 3. **HTTP Errors**

#### Test: Not Found (wrong endpoint)
```bash
curl -X POST http://localhost:3000/wrong-endpoint
```

**Expected Response:**
```json
{
  "successful": false,
  "error_code": "NOT_FOUND",
  "data": null
}
```

#### Test: Method Not Allowed
```bash
curl -X GET http://localhost:3000/get-encrypt-data
```

**Expected Response:**
```json
{
  "successful": false,
  "error_code": "METHOD_NOT_ALLOWED",
  "data": null
}
```

### 4. **Valid Success Cases**

#### Test: Successful encryption
```bash
curl -X POST http://localhost:3000/get-encrypt-data \
  -H "Content-Type: application/json" \
  -d '{"payload": "Hello World!"}'
```

**Expected Response:**
```json
{
  "successful": true,
  "error_code": "",
  "data": {
    "data1": "base64_encrypted_aes_key",
    "data2": "base64_encrypted_payload"
  }
}
```

## 🔸 Global Exception Filter Benefits

### ✅ **Consistent Error Format**
- ทุก error จะมี format เหมือนกัน
- `{ successful: false, error_code: "...", data: null }`

### ✅ **Centralized Error Handling**
- จัดการ error ที่เดียว
- ไม่ต้องเขียน try-catch ใน Controller

### ✅ **Automatic Error Mapping**
- Validation errors → `VALIDATION_ERROR`
- Crypto errors → `ENCRYPTION_FAILED` / `DECRYPTION_FAILED`
- HTTP errors → `NOT_FOUND` / `METHOD_NOT_ALLOWED`

### ✅ **Logging**
- Log ทุก error พร้อม stack trace
- ช่วยใน debugging

## 🔸 Error Code Mapping

| Error Type | Error Code | HTTP Status |
|------------|------------|-------------|
| Validation failed | `VALIDATION_ERROR` | 400 |
| Encryption failed | `ENCRYPTION_FAILED` | 400 |
| Decryption failed | `DECRYPTION_FAILED` | 400 |
| Invalid payload | `INVALID_PAYLOAD` | 400 |
| Invalid encrypted data | `INVALID_ENCRYPTED_DATA` | 400 |
| Configuration error | `CONFIGURATION_ERROR` | 500 |
| Not found | `NOT_FOUND` | 404 |
| Method not allowed | `METHOD_NOT_ALLOWED` | 405 |
| Internal server error | `INTERNAL_SERVER_ERROR` | 500 |

# Simple Crypto API

NestJS API for RSA + AES encryption and decryption.

## Installation

```bash
npm install
```

## Environment Setup

1. Copy environment file:
```bash
cp env.example .env
```

2. Edit `.env` file with your RSA keys:
```env
PORT=3000

RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_ACTUAL_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"

RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_ACTUAL_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"
```

Generate RSA keys at: https://cryptotools.net/rsagen

## การใช้งาน

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API

Server runs on: http://localhost:3000  
API Documentation: http://localhost:3000/api-docs

### Endpoints

#### POST /crypto/get-encrypt-data
```json
{
  "payload": "Hello World!"
}
```

Response:
```json
{
  "successful": true,
  "error_code": "",
  "data": {
    "data1": "encrypted_aes_key_base64",
    "data2": "encrypted_payload_base64"
  }
}
```

#### POST /crypto/get-decrypt-data
```json
{
  "data1": "encrypted_aes_key_base64",
  "data2": "encrypted_payload_base64"
}
```

Response:
```json
{
  "successful": true,
  "error_code": "",
  "data": {
    "payload": "Hello World!"
  }
}
```

## Testing

```bash
npm test
```

## API Test Example

```bash
# Encrypt
curl -X POST http://localhost:3000/crypto/get-encrypt-data \
  -H "Content-Type: application/json" \
  -d '{"payload": "Hello World!"}'

# Decrypt (use data1 and data2 from encrypt response)
curl -X POST http://localhost:3000/crypto/get-decrypt-data \
  -H "Content-Type: application/json" \
  -d '{"data1": "YOUR_DATA1", "data2": "YOUR_DATA2"}'
```

## คุณสมบัติ

- ✅ เข้ารหัส/ถอดรหัสด้วย RSA + AES
- ✅ Validation ด้วย class-validator
- ✅ Global Exception Filter
- ✅ Swagger API Documentation
- ✅ Type Safety เต็มรูปแบบ
- ✅ Unit Tests ครอบคลุม
- ✅ Clean Architecture

## เทคโนโลยีที่ใช้

- **NestJS** - Framework หลัก
- **TypeScript** - ภาษาที่ใช้
- **class-validator** - สำหรับ validation
- **Swagger** - สำหรับ API documentation
- **Jest** - สำหรับ testing

**สร้างด้วย NestJS**
# Simple Crypto API

A simple NestJS API for RSA + AES encryption and decryption.

## Features

- **RSA + AES Hybrid Encryption**: Uses AES for payload encryption and RSA for key encryption
- **Swagger Documentation**: Available at `/api-docs`
- **Environment Configuration**: RSA keys stored in `.env` file
- **Input Validation**: Request payload validation using class-validator
- **Error Handling**: Consistent error response format

## API Endpoints

### POST /get-encrypt-data
Encrypts data using AES + RSA encryption.

**Request:**
```json
{
  "payload": "Hello World!"
}
```

**Response:**
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

### POST /get-decrypt-data
Decrypts data using RSA + AES decryption.

**Request:**
```json
{
  "data1": "encrypted_aes_key_with_rsa",
  "data2": "encrypted_payload_with_aes"
}
```

**Response:**
```json
{
  "successful": true,
  "error_code": "",
  "data": {
    "payload": "Hello World!"
  }
}
```

## How to Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   - Copy RSA keys to `.env` file
   - Keys are already configured for development

3. **Start development server:**
```bash
   npm run start:dev
   ```

4. **Access the API:**
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api-docs

## Project Structure

```
src/
├── dto/                    # Data Transfer Objects
│   ├── encrypt-request.dto.ts
│   ├── decrypt-request.dto.ts
│   └── api-response.dto.ts
├── crypto.service.ts       # Crypto business logic
├── crypto.controller.ts    # API endpoints
├── app.module.ts          # Main application module
└── main.ts                # Application entry point
```

## Encryption Process

1. Generate random AES key (256-bit)
2. Encrypt payload with AES key using AES-256-CBC
3. Encrypt AES key with RSA private key
4. Return encrypted AES key (data1) and encrypted payload (data2)

## Decryption Process

1. Decrypt AES key with RSA public key (from data1)
2. Extract IV and encrypted payload (from data2)
3. Decrypt payload with AES key using AES-256-CBC
4. Return decrypted payload

## Security Notes

- RSA keys are stored in environment variables
- AES keys are generated randomly for each encryption
- Uses PKCS1 padding for RSA operations
- Payload size limit: 2000 characters
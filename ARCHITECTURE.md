# Simple Crypto API - Clean Architecture

## 🏗️ **Project Structure**

```
src/
├── common/                     # Shared components
│   ├── constants/              # Application constants
│   │   └── index.ts           # Error codes & types
│   ├── filters/               # Global filters
│   │   └── global-exception.filter.ts
│   └── interfaces/            # Shared interfaces
│       └── api-response.interface.ts
├── modules/                   # Feature modules
│   └── crypto/               # Crypto module
│       ├── dto/              # Data Transfer Objects
│       │   ├── encrypt-request.dto.ts
│       │   ├── decrypt-request.dto.ts
│       │   └── api-response.dto.ts
│       ├── crypto.controller.ts
│       ├── crypto.service.ts
│       └── crypto.module.ts
├── app.module.ts             # Root module
└── main.ts                   # Application entry point
```

## 🎯 **Architecture Principles**

### **1. Modular Design**
- **Feature-based modules** - แต่ละ feature มี module แยก
- **Separation of concerns** - แยกหน้าที่ชัดเจน
- **Reusable components** - components ที่ใช้ร่วมกันใน `common/`

### **2. Layered Architecture**
```
┌─────────────────────────────┐
│        Controllers          │ ← HTTP Layer
├─────────────────────────────┤
│         Services            │ ← Business Logic
├─────────────────────────────┤
│        DTOs/Interfaces      │ ← Data Layer
└─────────────────────────────┘
```

### **3. Dependency Injection**
- **Constructor injection** - NestJS DI container
- **Interface-based** - Loose coupling
- **Module exports** - Control visibility

## 📁 **Directory Breakdown**

### **`src/common/`** - Shared Components
- **Purpose**: Components ที่ใช้ร่วมกันทั่วทั้งแอป
- **Contains**:
  - `constants/` - Error codes, enums, types
  - `filters/` - Global exception filters
  - `interfaces/` - Shared interfaces & types
  - `pipes/` - Global validation pipes (future)
  - `interceptors/` - Global interceptors (future)

### **`src/modules/crypto/`** - Crypto Feature
- **Purpose**: Encryption/Decryption functionality
- **Contains**:
  - `dto/` - Request/Response DTOs
  - `crypto.controller.ts` - HTTP endpoints
  - `crypto.service.ts` - Business logic
  - `crypto.module.ts` - Feature module

### **`src/app.module.ts`** - Root Module
- **Purpose**: Application root configuration
- **Imports**: 
  - `ConfigModule` - Environment configuration
  - `CryptoModule` - Crypto functionality

### **`src/main.ts`** - Bootstrap
- **Purpose**: Application entry point
- **Configuration**:
  - Global pipes (validation)
  - Global filters (exception handling)
  - Swagger documentation
  - CORS configuration

## 🔄 **Data Flow**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Request   │───▶│  Controller  │───▶│   Service   │
│    (HTTP)   │    │ (Validation) │    │ (Business)  │
└─────────────┘    └──────────────┘    └─────────────┘
        ▲                   ▲                   │
        │                   │                   ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Response  │◀───│    Filter    │◀───│   Result    │
│   (JSON)    │    │ (Exception)  │    │    (Data)   │
└─────────────┘    └──────────────┘    └─────────────┘
```

## ✅ **Benefits of This Structure**

### **1. Scalability**
- ง่ายต่อการเพิ่ม modules ใหม่
- แยก concerns ชัดเจน
- Reusable components

### **2. Maintainability**
- โครงสร้างที่เข้าใจง่าย
- เปลี่ยนแปลงได้โดยไม่กระทบส่วนอื่น
- Consistent patterns

### **3. Testability**
- Mock dependencies ได้ง่าย
- Unit test แยกชัด
- Integration test ครอบคลุม

### **4. Type Safety**
- TypeScript interfaces
- Consistent error types
- Compile-time checking

## 🚀 **Future Enhancements**

### **Possible Additions:**
- `src/common/decorators/` - Custom decorators
- `src/common/middleware/` - Custom middleware
- `src/common/guards/` - Authentication guards
- `src/modules/auth/` - Authentication module
- `src/modules/users/` - User management
- `src/config/` - Configuration schemas

### **Database Integration:**
- `src/database/` - Database configuration
- `src/entities/` - Database entities
- `src/repositories/` - Data access layer

## 📋 **Best Practices Applied**

1. **Single Responsibility** - แต่ละ class มีหน้าที่เดียว
2. **Open/Closed** - เปิดให้ extend, ปิดการแก้ไข
3. **Dependency Inversion** - Depend on abstractions
4. **Don't Repeat Yourself** - ไม่เขียนโค้ดซ้ำ
5. **KISS (Keep It Simple)** - เรียบง่าย เข้าใจง่าย

นี่คือโครงสร้างที่ **Clean, Scalable และ Maintainable** ตามหลักการ NestJS และ Clean Architecture ครับ! 🎉

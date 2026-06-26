# Security: Hardcoded Credentials Removal - Implementation Summary

## Overview
This document tracks the removal of hardcoded credentials from the lifelong2-front backend codebase, replacing them with environment variables following proper security practices.

## Security Policy
- **Passwords/Secrets**: Must use environment variables with NO fallback values. Exit if missing.
- **Hosts/Ports/Non-sensitive**: Can use environment variables with fallback + warning.

## Current Status: ✅ MOSTLY SECURE

### ✅ Already Secured Components

#### 1. Environment Validator Utilities
- **Location**: `scripts/utils/env-validator.js`, `scripts/utils/env_validator.py`
- **Status**: ✅ Implemented
- **Features**:
  - `sensitive: true` flag forces exit if variable is missing
  - `fallback` option for non-sensitive values with warnings
  - Proper error messaging

#### 2. Seed Scripts Using Validators
- **seed-test-users.js**: ✅ Uses `getEnv('SEED_USER_PASSWORD', { sensitive: true })`
- **add_student_data.py**: ✅ Uses `get_env('PYTHON_BACKEND_DB_PASSWORD', sensitive=True)`
- **seed-moodle-rosters.js**: ✅ Uses env-validator for passwords

#### 3. Environment Configuration
- **File**: `.env.example`
- **Status**: ✅ Comprehensive
- **Contains**: All required environment variables for seeding and production

### ⚠️ Issues Found & Need Fixing

#### Issue 1: Hardcoded 'password123' in seed-moodle-rosters.js
**Location**: `scripts/seed-moodle-rosters.js` lines 272, 313
```javascript
// ❌ BAD: Hardcoded password
[profile.studentId, profile.email, 'password123'],

// ✅ SHOULD BE: Use environment variable
const hashedPassword = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
```
**Impact**: Test users created with predictable passwords
**Fix**: Use `SEED_USER_PASSWORD` env var with bcrypt hashing

#### Issue 2: Empty Password Fallbacks in Some Scripts
**Locations**: 
- `scripts/seed-privilege.js` line 48
- `scripts/seed-course-images.js` line 142
- `scripts/seed-studentgrad.js` line 40
- `scripts/seed-openclass-fee.js` line 24

```javascript
// ❌ BAD: Empty string fallback for password
password: process.env.DB_PASSWORD ?? '',

// ✅ SHOULD BE: Use env-validator
password: getEnv('DB_PASSWORD', { sensitive: true }),
```
**Impact**: Scripts might run with empty passwords, failing silently
**Fix**: Replace with `getEnv()` calls with `sensitive: true`

#### Issue 3: Configuration Files with Insecure Fallbacks
**Locations**:
- `src/config/configuration.ts` line 32
- `src/database/data-source.ts` line 12
- `src/modules/moodle/moodle-user-token.service.ts` line 59
- `src/modules/instructor/instructor.service.ts` line 1705

```typescript
// ❌ BAD: Empty password fallback in production code
password: process.env.DB_PASSWORD ?? '',

// ✅ SHOULD BE: Throw error if missing
password: process.env.DB_PASSWORD || (() => {
  throw new Error('DB_PASSWORD environment variable is required');
})(),
```
**Impact**: Application might start with wrong/empty database credentials
**Fix**: Remove fallbacks for sensitive values, rely on env.validation.ts

### ✅ Already Correct

#### Main Application Configuration
- **File**: `src/config/env.validation.ts`
- **Status**: ✅ SECURE
- **Features**:
  - `DB_PASSWORD`: Required in production, Joi validation enforces non-empty
  - `JWT_SECRET`: Minimum 32 characters required
  - `MOODLE_DB_PASSWORD`: Optional but validated when present

#### Moodle Theme JavaScript
- **Files**: `moodle-theme/javascript/*.js`
- **Status**: ✅ NO HARDCODED CREDENTIALS
- **Notes**: Only contains URL configuration with smart environment detection (not security-sensitive)

## Implementation Plan

### Task 1: Fix seed-moodle-rosters.js Hardcoded Passwords ⏳
**Files**: `backend/scripts/seed-moodle-rosters.js`
**Changes**:
1. Import bcrypt
2. Use `SEED_USER_PASSWORD` env var
3. Hash passwords before insertion
4. Remove hardcoded 'password123'

### Task 2: Secure Remaining Seed Scripts ⏳
**Files**: 
- `backend/scripts/seed-privilege.js`
- `backend/scripts/seed-course-images.js`
- `backend/scripts/seed-studentgrad.js`
- `backend/scripts/seed-openclass-fee.js`

**Changes**:
1. Import env-validator
2. Replace `process.env.DB_PASSWORD ?? ''` with `getEnv('DB_PASSWORD', { sensitive: true })`
3. Add loadEnv() if missing

### Task 3: Remove Fallbacks from Application Code ⏳
**Files**:
- `backend/src/config/configuration.ts`
- `backend/src/database/data-source.ts`
- `backend/src/modules/moodle/moodle-user-token.service.ts`
- `backend/src/modules/instructor/instructor.service.ts`

**Changes**:
1. Remove `?? ''` fallbacks for passwords
2. Rely on Joi validation in env.validation.ts
3. Let application fail fast on startup if credentials missing

### Task 4: Update Documentation ⏳
**Files**: 
- `backend/README.md` (if exists)
- `.env.example` (verify completeness)

**Changes**:
1. Document security policy
2. Add setup instructions emphasizing required env vars
3. Add troubleshooting for missing credentials

### Task 5: Create Pre-flight Validation Script ⏳
**Files**: `backend/scripts/validate-env.js` (new)
**Purpose**: Validate environment before running any script
**Features**:
- Check all required env vars exist
- Warn about missing optional vars
- Can be run manually or via npm script

## Testing Checklist

### After Implementation
- [ ] All seed scripts run successfully with proper .env
- [ ] All seed scripts fail appropriately with missing .env
- [ ] Application starts with valid credentials
- [ ] Application fails fast with missing credentials
- [ ] No plaintext passwords in codebase
- [ ] No empty password fallbacks for sensitive values
- [ ] All database connections use env vars

### Security Verification
- [ ] Search codebase for `password.*['"].*['"]` returns no hardcoded passwords
- [ ] Search codebase for `password.*\?\?.*['"]` returns no insecure fallbacks
- [ ] All scripts using database connections import env-validator
- [ ] .env.example is comprehensive and up-to-date

## Environment Variables Reference

### Required (Sensitive - No Fallback)
```env
# Application Database
DB_PASSWORD=

# JWT & Security
JWT_SECRET=YOUR_JWT_SECRET_MIN_32_CHARS_PLACEHOLDER

# Moodle Direct DB Access
MOODLE_DB_PASSWORD=

# BUU MSG API
BUU_REQUEST_CLIENT_SECRET=
BUU_SEND_EMAIL_PROVISION_KEY=

# Platform Gateway
PLATFORM_GATEWAY_CLIENT_SECRET=

# Seeding Scripts
SEED_MOODLE_DB_PASSWORD=
SEED_APP_DB_PASSWORD=
SEED_USER_PASSWORD=

# Python Scripts
PYTHON_BACKEND_DB_PASSWORD=
PYTHON_MOODLE_DB_PASSWORD=
```

### Optional (With Fallbacks)
```env
# Application
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_NAME=lifelong2

# Moodle
MOODLE_BASE_URL=http://localhost:8080
MOODLE_DB_HOST=localhost
MOODLE_DB_PORT=3306
MOODLE_DB_USER=moodle_user
MOODLE_DB_NAME=moodle
```

## Notes
- This is a **development/test environment** project with demo data
- Production deployment would require additional security measures:
  - Secrets management system (AWS Secrets Manager, HashiCorp Vault, etc.)
  - Encrypted environment variable storage
  - Credential rotation policies
  - Audit logging of credential access

## Completion Criteria
✅ All tasks completed
✅ All tests passing
✅ Security verification checklist complete
✅ Documentation updated
✅ No hardcoded credentials in codebase

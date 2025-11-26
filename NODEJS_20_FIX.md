# إصلاح خطأ Node.js 18

## المشكلة:
```
Error: Runtime Node.js 18 was decommissioned on 2025-10-30
```

## الحل السريع:

### الطريقة 1: تعديل ملف واحد (30 ثانية)

1. **افتح الملف:**
   ```
   Bare-PWA-Standalone/functions/package.json
   ```

2. **ابحث عن السطر:**
   ```json
   "engines": {
     "node": "18"
   },
   ```

3. **غيّره إلى:**
   ```json
   "engines": {
     "node": "20"
   },
   ```

4. **احفظ الملف**

5. **أعد المحاولة:**
   ```bash
   firebase deploy --only functions
   ```

---

### الطريقة 2: نسخ الملف المحدّث

1. **احذف الملف القديم:**
   ```bash
   rm functions/package.json
   ```

2. **انسخ المحتوى التالي وضعه في `functions/package.json`:**

```json
{
  "name": "functions",
  "version": "1.0.0",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "20"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "firebase-admin": "^13.6.0",
    "firebase-functions": "^7.0.0"
  }
}
```

3. **أعد المحاولة:**
   ```bash
   firebase deploy --only functions
   ```

---

## ✅ النتيجة المتوقعة:

```
=== Deploying to 'bare-android-app'...

i  deploying functions
i  functions: preparing codebase default for deployment
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 20 function cleanupAdImages(europe-west1)...
✔  functions[cleanupAdImages(europe-west1)] Successful create operation.

✔  Deploy complete!
```

**لاحظ:** `Node.js 20` و `europe-west1` ✅

---

## 📌 ملاحظة:

- **Node.js 18** تم إيقافه في 30 أكتوبر 2025
- **Node.js 20** هو الإصدار الموصى به حالياً
- **Node.js 22** متاح أيضاً لكن 20 أكثر استقراراً

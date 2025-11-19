# Bare - Syrian Classified Ads Platform (Standalone PWA)

منصة الإعلانات المبوبة السورية - نسخة ويب مستقلة تماماً

## ✨ Features

- ✅ **مستقل 100%** - لا يعتمد على أي Backend خارجي
- ✅ **Firebase Integration** - Auth (Email/Password), Firestore, Storage
- ✅ **PWA Support** - يعمل بدون إنترنت، قابل للتثبيت
- ✅ **Responsive Design** - متجاوب مع جميع الشاشات
- ✅ **Arabic RTL** - واجهة عربية كاملة

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

التطبيق سيعمل على: http://localhost:3000

### 3. Build for Production

```bash
npm run build
# or
pnpm build
# or
yarn build
```

الملفات الجاهزة ستكون في مجلد `dist/`

## 📦 Deploy to Firebase Hosting

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Hosting

```bash
firebase init hosting
```

اختر:
- **Public directory**: `dist`
- **Single-page app**: `Yes`
- **Automatic builds**: `No`

### 4. Deploy

```bash
npm run build
firebase deploy
```

## 📦 Deploy to Netlify

### Option 1: Drag & Drop

1. Build the project: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder

### Option 2: Netlify CLI

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## 📦 Deploy to Vercel

```bash
npm install -g vercel
npm run build
vercel --prod
```

## 🔧 Configuration

### Firebase Config

الإعدادات موجودة في: `src/config/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Firestore Rules

أضف هذه القواعد في Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ads/{adId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules

أضف هذه القواعد في Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /ads/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📁 Project Structure

```
bare-standalone/
├── public/
│   ├── manifest.json
│   ├── firebase-messaging-sw.js
│   ├── logo-192.png
│   └── logo-512.png
├── src/
│   ├── components/
│   │   └── Navbar.tsx
│   ├── config/
│   │   └── firebase.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── CreateAd.tsx
│   │   ├── AdDetails.tsx
│   │   └── Profile.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ Technologies

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Firebase** - Backend (Auth, Firestore, Storage)
- **Wouter** - Routing
- **PWA** - Progressive Web App

## 📱 Features

### Authentication
- تسجيل دخول بالإيميل وكلمة المرور
- إنشاء حساب جديد
- تسجيل خروج

### Ads Management
- عرض جميع الإعلانات
- البحث والفلترة حسب الفئة
- إضافة إعلان جديد (مع رفع الصور)
- عرض تفاصيل الإعلان
- إعلاناتي (My Ads)

### PWA Features
- يعمل بدون إنترنت (Offline)
- قابل للتثبيت على الهاتف
- إشعارات Push (Firebase Cloud Messaging)

## 🔒 Security

- جميع البيانات محمية بقواعد Firestore
- الصور محمية بقواعد Storage
- المصادقة عبر Firebase Auth

## 📄 License

MIT License - Free to use and modify

## 🤝 Support

للدعم والمساعدة، تواصل معنا على:
- Email: support@bare-app.com
- GitHub Issues: https://github.com/your-repo/issues

---

**Made with ❤️ in Syria**


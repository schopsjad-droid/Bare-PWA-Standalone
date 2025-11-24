# دليل اسم المستخدم الإلزامي وتعديل الإعلانات

## 📋 نظرة عامة

تم إضافة ميزتين رئيسيتين:
1. ✅ **اسم مستخدم إلزامي** لجميع المستخدمين (بما في ذلك Google OAuth)
2. ✅ **تعديل الإعلانات** مع حماية الملكية

---

## 🔐 اسم المستخدم الإلزامي

### المشكلة السابقة
- مستخدمو Google لم يكن لديهم username مخصص
- كان يتم عرض البريد الإلكتروني للعامة (مشكلة خصوصية)

### الحل الجديد

#### 1. سيناريو التسجيل التقليدي
```typescript
// عند التسجيل، يتم طلب username مباشرة
await signup(email, password, username);

// يتم حفظ username في Firestore
{
  uid: "...",
  username: "Tiger2025",  // ✅ محفوظ من البداية
  email: "user@example.com",
  isVerified: false
}
```

#### 2. سيناريو Google OAuth
```typescript
// عند تسجيل الدخول لأول مرة عبر Google
await loginWithGoogle();

// يتم إنشاء حساب بدون username
{
  uid: "...",
  username: "مستخدم",  // ⚠️ قيمة افتراضية
  email: "user@gmail.com",
  googleId: "...",
  isVerified: true
}

// النظام يكتشف أن username فارغ
// يتم توجيه المستخدم تلقائياً إلى /complete-profile
```

---

## 📱 صفحة إكمال الملف الشخصي

### `/complete-profile`

**الوصف:** صفحة إلزامية لمستخدمي Google الجدد

**الميزات:**
- ✅ حقل واحد لإدخال username
- ✅ التحقق من توفر الاسم (Uniqueness Check)
- ✅ قواعد التحقق:
  - من 3 إلى 20 حرف
  - حروف وأرقام فقط (+ _ و -)
  - لا يمكن أن يكون فارغاً أو "مستخدم"

**الكود:**
```typescript
// التحقق من توفر الاسم
const checkUsernameAvailability = async (username: string) => {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snapshot = await getDocs(q);
  return snapshot.empty; // true if available
};

// حفظ الاسم
await updateDoc(doc(db, 'users', user.uid), {
  username: username.trim()
});
```

---

## 🛡️ ProtectedRoute Component

### الغرض
منع الوصول إلى الصفحات قبل إكمال الملف الشخصي

### الاستخدام
```typescript
<ProtectedRoute requireAuth={true} requireUsername={true}>
  <YourComponent />
</ProtectedRoute>
```

### السلوك
1. **إذا لم يكن مسجل دخول:** توجيه إلى `/login`
2. **إذا لم يكن لديه username:** توجيه إلى `/complete-profile`
3. **إذا كان كل شيء صحيح:** عرض المحتوى

### الصفحات المحمية
- `/create-ad` - نشر إعلان جديد
- `/edit-ad/:id` - تعديل إعلان

---

## 🔒 إخفاء البريد الإلكتروني

### قبل التحديث
```typescript
// في AdDetails.tsx
<p>{ad.userEmail}</p>  // ❌ يعرض: user@example.com
```

### بعد التحديث
```typescript
// في AdDetails.tsx
<p>👤 {ad.username}</p>  // ✅ يعرض: Tiger2025
```

### التغييرات في قاعدة البيانات

#### مجموعة `ads`
```typescript
// قبل
{
  title: "...",
  userId: "...",
  userEmail: "user@example.com"  // ❌ حذف
}

// بعد
{
  title: "...",
  userId: "...",
  username: "Tiger2025"  // ✅ إضافة
}
```

---

## ✏️ ميزة تعديل الإعلان

### 1. زر التعديل في صفحة التفاصيل

**الموقع:** `/ad/:id`

**الشرط:** يظهر فقط إذا كان `current_user.uid === ad.userId`

**الكود:**
```typescript
// في AdDetails.tsx
{user && ad.userId === user.uid && (
  <Link href={`/edit-ad/${params?.id}`}>
    <a className="btn btn-primary">
      ✏️ تعديل الإعلان
    </a>
  </Link>
)}
```

---

### 2. صفحة التعديل

**المسار:** `/edit-ad/:id`

**الميزات:**
- ✅ تحميل البيانات الحالية تلقائياً
- ✅ التحقق من الملكية عند التحميل
- ✅ التحقق من الملكية عند الحفظ (مرتين!)
- ✅ إدارة الصور (حذف القديمة + إضافة جديدة)
- ✅ رسالة "غير مصرح" للمستخدمين غير المالكين

---

### 3. حماية الملكية (Ownership Verification)

#### المستوى الأول: عند تحميل الصفحة
```typescript
const loadAd = async (id: string) => {
  const docSnap = await getDoc(docRef);
  const adData = docSnap.data();
  
  // ✅ التحقق الأول
  if (adData.userId !== user?.uid) {
    setUnauthorized(true);
    return;
  }
  
  // تحميل البيانات...
};
```

#### المستوى الثاني: عند الحفظ
```typescript
const handleSubmit = async () => {
  // ✅ التحقق الثاني قبل الحفظ
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
    setError('غير مصرح لك بتعديل هذا الإعلان');
    return;
  }
  
  // حفظ التعديلات...
  await updateDoc(docRef, { ... });
};
```

---

### 4. إدارة الصور

#### حذف الصور القديمة
```typescript
const removeExistingImage = (index: number) => {
  setExistingImages(prev => prev.filter((_, i) => i !== index));
};
```

#### إضافة صور جديدة
```typescript
// رفع الصور الجديدة
const newImageUrls: string[] = [];
for (const image of newImages) {
  const imageRef = ref(storage, `ads/${Date.now()}-${image.name}`);
  await uploadBytes(imageRef, image);
  const url = await getDownloadURL(imageRef);
  newImageUrls.push(url);
}

// دمج القديمة والجديدة
const allImages = [...existingImages, ...newImageUrls];
```

---

## 🔄 تدفق العمل الكامل

### سيناريو 1: مستخدم Google جديد

```
1. المستخدم يضغط "تسجيل الدخول عبر Google"
   ↓
2. يختار حساب Google
   ↓
3. النظام ينشئ حساب بـ username = "مستخدم"
   ↓
4. ProtectedRoute يكتشف أن username غير صالح
   ↓
5. توجيه تلقائي إلى /complete-profile
   ↓
6. المستخدم يدخل username (مثلاً: Tiger2025)
   ↓
7. النظام يتحقق من التوفر
   ↓
8. حفظ الاسم في Firestore
   ↓
9. توجيه إلى الصفحة الرئيسية
   ↓
10. الآن يمكنه نشر وتعديل الإعلانات
```

### سيناريو 2: تعديل إعلان

```
1. المستخدم يفتح إعلانه: /ad/123
   ↓
2. يرى زر "✏️ تعديل الإعلان" (مرئي له فقط)
   ↓
3. يضغط على الزر
   ↓
4. توجيه إلى /edit-ad/123
   ↓
5. ProtectedRoute يتحقق من:
   - تسجيل الدخول ✅
   - وجود username ✅
   ↓
6. EditAd يتحقق من الملكية (التحقق الأول)
   ↓
7. تحميل البيانات الحالية في النموذج
   ↓
8. المستخدم يعدل البيانات
   ↓
9. يضغط "حفظ التعديلات"
   ↓
10. النظام يتحقق من الملكية مرة أخرى (التحقق الثاني)
   ↓
11. حفظ التعديلات في Firestore
   ↓
12. توجيه إلى /ad/123
```

---

## 🚨 معالجة الأخطاء

### 1. اسم مستخدم مكرر
```typescript
if (!isAvailable) {
  setError('اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر');
  return;
}
```

### 2. محاولة تعديل إعلان غير مملوك
```typescript
if (adData.userId !== user?.uid) {
  setUnauthorized(true);
  // عرض صفحة "غير مصرح"
}
```

### 3. اسم مستخدم غير صالح
```typescript
const usernameRegex = /^[a-zA-Z0-9_\u0600-\u06FF-]+$/;
if (!usernameRegex.test(username)) {
  setError('اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط');
}
```

---

## 📊 قواعد Firestore المحدثة

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
                    && request.auth.uid == userId;
      allow update: if request.auth != null 
                    && request.auth.uid == userId;
    }
    
    // Ads collection
    match /ads/{adId} {
      // Public read
      allow read: if true;
      
      // Create: must be authenticated with username
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.username != null
                    && request.resource.data.username != 'مستخدم';
      
      // Update: only owner can edit
      allow update: if request.auth != null 
                    && request.auth.uid == resource.data.userId;
      
      // Delete: only owner can delete
      allow delete: if request.auth != null 
                    && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🎯 أفضل الممارسات

### 1. التحقق من username قبل الإجراءات الحساسة
```typescript
const { userProfile } = useAuth();

if (!userProfile?.username || userProfile.username === 'مستخدم') {
  return <Redirect to="/complete-profile" />;
}
```

### 2. استخدام ProtectedRoute
```typescript
// ✅ صحيح
<ProtectedRoute requireAuth={true} requireUsername={true}>
  <CreateAd />
</ProtectedRoute>

// ❌ خطأ
<CreateAd />  // بدون حماية
```

### 3. التحقق من الملكية مرتين
```typescript
// ✅ صحيح
// 1. عند تحميل الصفحة
if (adData.userId !== user?.uid) { ... }

// 2. عند الحفظ
const docSnap = await getDoc(docRef);
if (docSnap.data().userId !== user.uid) { ... }

// ❌ خطأ
// التحقق مرة واحدة فقط (غير آمن)
```

---

## 🔮 ميزات مستقبلية محتملة

- [ ] تغيير username (مع قيود زمنية)
- [ ] سجل التعديلات (Audit Log)
- [ ] حذف الإعلانات
- [ ] الإبلاغ عن إعلانات مخالفة
- [ ] تثبيت الإعلانات (Pin Ads)
- [ ] إحصائيات المشاهدات

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من Firebase Console → Firestore → users collection
2. تأكد من أن username ليس "مستخدم" أو NULL
3. تحقق من userId في مجموعة ads
4. راجع Console في المتصفح للأخطاء

---

**تم التطوير بواسطة:** Bare Team  
**آخر تحديث:** نوفمبر 2025  
**الإصدار:** 2.1.0


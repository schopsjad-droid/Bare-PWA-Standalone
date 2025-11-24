# دليل حذف الإعلانات وتنظيف التخزين

## 📋 نظرة عامة

تم إضافة نظام شامل لحذف الإعلانات مع تنظيف تلقائي للصور من Firebase Storage.

---

## 🎯 الميزات المضافة

### 1. ✅ زر حذف الإعلان
- يظهر فقط لمالك الإعلان
- بلون أحمر مميز (🗑️)
- بجانب زر التعديل

### 2. ✅ رسالة تأكيد
- نافذة منبثقة قبل الحذف
- تحذير: "لا يمكن التراجع عن هذه العملية"
- خياران: "نعم، احذف" أو "إلغاء"

### 3. ✅ حذف الصور من Storage
- حذف تلقائي لجميع صور الإعلان
- يحدث قبل حذف الإعلان من Firestore
- توفير مساحة التخزين

### 4. ✅ Cloud Function للتنظيف التلقائي
- تعمل تلقائياً عند حذف أي إعلان
- تحذف الصور المرتبطة من Storage
- نظام احتياطي للتأكد من النظافة

---

## 🔄 سير العمل الكامل

### عند حذف إعلان من الواجهة:

```
1. المستخدم يفتح إعلانه
   ↓
2. يرى زر "🗑️ حذف" (مرئي له فقط)
   ↓
3. يضغط على الزر
   ↓
4. تظهر نافذة تأكيد: "⚠️ هل أنت متأكد؟"
   ↓
5. يضغط "نعم، احذف"
   ↓
6. النظام يحذف الصور من Storage (خطوة 1)
   ↓
7. النظام يحذف الإعلان من Firestore (خطوة 2)
   ↓
8. Cloud Function تتحقق وتحذف أي صور متبقية (احتياطي)
   ↓
9. توجيه المستخدم إلى الصفحة الرئيسية
   ↓
10. تم الحذف بنجاح ✅
```

---

## 💻 الكود التقني

### 1. استخراج مسار الملف من URL

```javascript
const getFilePathFromUrl = (url) => {
  try {
    const decodedUrl = decodeURIComponent(url);
    const match = decodedUrl.match(/\/o\/(.+?)\?/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting file path:', error);
    return null;
  }
};
```

**الشرح:**
- يفك تشفير URL
- يستخرج المسار بين `/o/` و `?`
- مثال: `https://...storage.googleapis.com/v0/b/bucket/o/ads%2F123.jpg?...`
- النتيجة: `ads/123.jpg`

---

### 2. دالة الحذف في الواجهة الأمامية

```javascript
const handleDelete = async () => {
  if (!params?.id || !user || !ad) return;

  setDeleting(true);

  try {
    // Step 1: Delete images from Storage
    if (ad.images && ad.images.length > 0) {
      for (const imageUrl of ad.images) {
        try {
          const filePath = getFilePathFromUrl(imageUrl);
          if (filePath) {
            const imageRef = ref(storage, filePath);
            await deleteObject(imageRef);
            console.log('Image deleted:', filePath);
          }
        } catch (imgError) {
          console.error('Error deleting image:', imgError);
          // Continue even if image deletion fails
        }
      }
    }

    // Step 2: Delete ad document from Firestore
    await deleteDoc(doc(db, 'ads', params.id));

    // Step 3: Redirect to home
    setLocation('/');
  } catch (error) {
    console.error('Error deleting ad:', error);
    alert('حدث خطأ أثناء حذف الإعلان');
  } finally {
    setDeleting(false);
    setShowDeleteConfirm(false);
  }
};
```

**الخطوات:**
1. ✅ حذف كل صورة من Storage
2. ✅ حذف مستند الإعلان من Firestore
3. ✅ توجيه المستخدم للرئيسية

---

### 3. Cloud Function (Backend)

```javascript
exports.cleanupAdImages = functions.firestore
  .document('ads/{adId}')
  .onDelete(async (snap, context) => {
    const deletedAd = snap.data();
    const adId = context.params.adId;

    console.log(`Ad deleted: ${adId}`);

    // Check if the ad has images
    if (!deletedAd.images || deletedAd.images.length === 0) {
      console.log('No images to delete');
      return null;
    }

    const bucket = admin.storage().bucket();
    const deletePromises = [];

    // Extract file path from URL
    const getFilePathFromUrl = (url) => {
      try {
        const decodedUrl = decodeURIComponent(url);
        const match = decodedUrl.match(/\/o\/(.+?)\?/);
        return match ? match[1] : null;
      } catch (error) {
        console.error('Error extracting file path:', error);
        return null;
      }
    };

    // Delete each image
    for (const imageUrl of deletedAd.images) {
      const filePath = getFilePathFromUrl(imageUrl);
      
      if (filePath) {
        console.log(`Deleting image: ${filePath}`);
        
        const file = bucket.file(filePath);
        deletePromises.push(
          file.delete()
            .then(() => {
              console.log(`Successfully deleted: ${filePath}`);
            })
            .catch((error) => {
              console.error(`Error deleting ${filePath}:`, error);
            })
        );
      }
    }

    // Wait for all deletions
    await Promise.all(deletePromises);

    console.log(`Cleanup completed for ad: ${adId}`);
    return null;
  });
```

**كيف تعمل:**
- **Trigger:** `onDelete` على مجموعة `ads`
- **البيانات:** `snap.data()` تحتوي على بيانات الإعلان المحذوف
- **العملية:** حذف جميع الصور من Storage
- **الفائدة:** نظام احتياطي يضمن عدم تراكم الصور

---

## 🔐 قواعد الأمان

### Firestore Security Rules

```javascript
// Ads collection
match /ads/{adId} {
  // Anyone can read ads (public)
  allow read: if true;
  
  // Authenticated users can create ads
  allow create: if isAuthenticated()
                && hasValidUsername()
                && request.resource.data.userId == request.auth.uid;
  
  // Only owner can update
  allow update: if isAuthenticated() 
                && request.auth.uid == resource.data.userId;
  
  // Only owner can delete ✅
  allow delete: if isAuthenticated() 
                && request.auth.uid == resource.data.userId;
}
```

**الحماية:**
- ✅ فقط المالك (`userId == auth.uid`) يمكنه الحذف
- ✅ لا يمكن لأي مستخدم آخر حذف الإعلان
- ✅ يجب أن يكون مسجل دخول

---

### Storage Security Rules

```javascript
// Ads images
match /ads/{imageId} {
  // Anyone can read (public)
  allow read: if true;
  
  // Authenticated users can upload
  allow create: if isAuthenticated() && isValidImage();
  
  // Authenticated users can delete ✅
  allow delete: if isAuthenticated();
  
  // No updates
  allow update: if false;
}
```

**الحماية:**
- ✅ فقط المستخدمين المسجلين يمكنهم حذف الصور
- ✅ حجم الصورة: أقل من 5MB
- ✅ نوع الملف: صور فقط (`image/*`)

---

## 📱 واجهة المستخدم

### زر الحذف

```jsx
<button
  onClick={() => setShowDeleteConfirm(true)}
  className="btn"
  style={{
    flex: 1,
    background: '#ef4444',  // أحمر
    color: 'white',
    border: 'none'
  }}
>
  🗑️ حذف
</button>
```

**التصميم:**
- لون أحمر مميز (`#ef4444`)
- أيقونة سلة مهملات (🗑️)
- يظهر بجانب زر التعديل
- مرئي فقط للمالك

---

### نافذة التأكيد

```jsx
{showDeleteConfirm && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <div className="card">
      <div style={{ fontSize: '64px' }}>⚠️</div>
      <h2>تأكيد الحذف</h2>
      <p>
        هل أنت متأكد أنك تريد حذف هذا الإعلان نهائياً؟<br/>
        <strong>لا يمكن التراجع عن هذه العملية.</strong>
      </p>
      
      <button onClick={handleDelete}>
        {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
      </button>
      <button onClick={() => setShowDeleteConfirm(false)}>
        إلغاء
      </button>
    </div>
  </div>
)}
```

**الميزات:**
- خلفية شفافة داكنة
- أيقونة تحذير كبيرة (⚠️)
- رسالة واضحة
- زران: تأكيد أو إلغاء
- حالة تحميل أثناء الحذف

---

## 🚀 النشر

### 1. نشر الواجهة الأمامية

```bash
npm run build
firebase deploy --only hosting
```

### 2. نشر Cloud Functions

```bash
firebase deploy --only functions
```

### 3. نشر قواعد الأمان

```bash
# Firestore Rules
firebase deploy --only firestore:rules

# Storage Rules
firebase deploy --only storage:rules
```

### 4. نشر كل شيء مرة واحدة

```bash
npm run build
firebase deploy
```

---

## 🧪 الاختبار

### اختبار الحذف من الواجهة:

1. ✅ سجل دخول كمستخدم
2. ✅ انشر إعلان مع صور
3. ✅ افتح الإعلان
4. ✅ تأكد من ظهور زر "حذف"
5. ✅ اضغط على الزر
6. ✅ تأكد من ظهور نافذة التأكيد
7. ✅ اضغط "نعم، احذف"
8. ✅ تحقق من حذف الإعلان
9. ✅ تحقق من حذف الصور من Storage

### اختبار Cloud Function:

1. ✅ افتح Firebase Console → Functions
2. ✅ تحقق من نشر `cleanupAdImages`
3. ✅ احذف إعلان من Firestore مباشرة
4. ✅ تحقق من Logs: `firebase functions:log`
5. ✅ تأكد من حذف الصور تلقائياً

---

## 📊 مراقبة الأداء

### Firebase Console

**Functions → Logs:**
```
Ad deleted: abc123
Deleting image: ads/1234567890-image1.jpg
Successfully deleted: ads/1234567890-image1.jpg
Deleting image: ads/1234567890-image2.jpg
Successfully deleted: ads/1234567890-image2.jpg
Cleanup completed for ad: abc123
```

**Storage → Files:**
- تحقق من عدم وجود صور يتيمة (orphaned images)
- راقب حجم التخزين المستخدم

---

## ⚠️ معالجة الأخطاء

### 1. فشل حذف الصورة

```javascript
try {
  await deleteObject(imageRef);
} catch (imgError) {
  console.error('Error deleting image:', imgError);
  // Continue with other deletions
}
```

**السلوك:**
- لا يتوقف الحذف
- يستمر مع الصور الأخرى
- Cloud Function ستحذف الصور المتبقية

---

### 2. فشل حذف الإعلان

```javascript
try {
  await deleteDoc(doc(db, 'ads', params.id));
} catch (error) {
  alert('حدث خطأ أثناء حذف الإعلان');
}
```

**السلوك:**
- عرض رسالة خطأ للمستخدم
- عدم التوجيه للرئيسية
- السماح بإعادة المحاولة

---

### 3. انقطاع الاتصال

```javascript
finally {
  setDeleting(false);
  setShowDeleteConfirm(false);
}
```

**السلوك:**
- إعادة تعيين حالة التحميل
- إغلاق نافذة التأكيد
- السماح بالتفاعل مع الواجهة

---

## 🎯 أفضل الممارسات

### 1. ✅ احذف الصور أولاً

```javascript
// ✅ صحيح
// 1. حذف الصور
await deleteImages();
// 2. حذف الإعلان
await deleteDoc();

// ❌ خطأ
// 1. حذف الإعلان أولاً
// 2. فقدان مراجع الصور!
```

---

### 2. ✅ استخدم Cloud Function كاحتياطي

```javascript
// الواجهة الأمامية: المحاولة الأولى
await deleteImages();

// Cloud Function: المحاولة الثانية (احتياطي)
exports.cleanupAdImages = functions.firestore...
```

---

### 3. ✅ تأكيد الحذف دائماً

```javascript
// ✅ صحيح
<button onClick={() => setShowDeleteConfirm(true)}>
  حذف
</button>

// ❌ خطأ - حذف فوري بدون تأكيد
<button onClick={handleDelete}>
  حذف
</button>
```

---

## 📈 الإحصائيات

### قبل التحديث:
- ❌ الصور تتراكم في Storage
- ❌ هدر مساحة التخزين
- ❌ تكلفة إضافية

### بعد التحديث:
- ✅ حذف تلقائي للصور
- ✅ توفير مساحة التخزين
- ✅ تقليل التكلفة
- ✅ نظام احتياطي مزدوج

---

## 🔮 ميزات مستقبلية محتملة

- [ ] سلة محذوفات (Trash/Recycle Bin)
- [ ] استرجاع الإعلانات المحذوفة (لمدة 30 يوم)
- [ ] إحصائيات الحذف
- [ ] تنبيهات عند الحذف
- [ ] أرشفة الإعلانات بدلاً من الحذف

---

## 📞 استكشاف الأخطاء

### المشكلة: زر الحذف لا يظهر

**الحل:**
```javascript
// تحقق من:
1. هل المستخدم مسجل دخول؟ (user != null)
2. هل هو المالك؟ (ad.userId === user.uid)
3. هل تم تحميل البيانات؟ (!loading && ad)
```

---

### المشكلة: الصور لا تُحذف

**الحل:**
```javascript
// تحقق من:
1. Firebase Storage Rules (allow delete)
2. صلاحيات Cloud Function
3. صحة استخراج file path
4. Logs في Firebase Console
```

---

### المشكلة: Cloud Function لا تعمل

**الحل:**
```bash
# 1. تحقق من النشر
firebase deploy --only functions

# 2. تحقق من Logs
firebase functions:log

# 3. تحقق من الأخطاء
firebase functions:log --only cleanupAdImages
```

---

## 📚 الملفات المعدلة

1. **`src/pages/AdDetails.tsx`**
   - إضافة زر الحذف
   - إضافة نافذة التأكيد
   - إضافة دالة `handleDelete`

2. **`functions/index.js`**
   - Cloud Function للتنظيف التلقائي

3. **`firestore.rules`**
   - قواعد الحذف للإعلانات

4. **`storage.rules`**
   - قواعد الحذف للصور

5. **`firebase.json`**
   - تكوين Functions و Rules

---

**تم التطوير بواسطة:** Bare Team  
**آخر تحديث:** نوفمبر 2025  
**الإصدار:** 2.2.0


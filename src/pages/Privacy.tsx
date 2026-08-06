import { Link } from 'wouter';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="page-wrap">
      <header className="page-header">
        <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">سياسة الخصوصية</h1>
        <div className="page-header-spacer" />
      </header>

      <div className="page-content">
        <div className="content-page">
          <div className="content-page-header">
            <h1 className="content-page-title">سياسة الخصوصية</h1>
            <div className="content-page-accent" />
            <p className="content-page-date">آخر تحديث: يناير 2025</p>
          </div>

          <section className="content-section">
            <h2 className="content-section-title">1. المقدمة</h2>
            <p className="content-text">نحن في <strong>Bare</strong> نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا.</p>
            <p className="content-text">باستخدامك لمنصة Bare، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.</p>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">2. المعلومات التي نجمعها</h2>
            <ul className="content-list">
              <li><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، واسم المستخدم.</li>
              <li><strong>معلومات الإعلانات:</strong> العنوان، الوصف، السعر، الصور، والموقع الجغرافي.</li>
              <li><strong>معلومات الاستخدام:</strong> سجل التصفح، الإعلانات المفضلة، والمحادثات.</li>
              <li><strong>معلومات تقنية:</strong> عنوان IP، نوع المتصفح، ونظام التشغيل.</li>
            </ul>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">3. كيفية استخدام المعلومات</h2>
            <ul className="content-list">
              <li>توفير وتحسين خدماتنا</li>
              <li>إدارة حسابك والتواصل معك</li>
              <li>عرض الإعلانات وتسهيل التواصل بين المستخدمين</li>
              <li>منع الاحتيال وضمان أمان المنصة</li>
              <li>إرسال إشعارات حول نشاط حسابك</li>
              <li>تحليل استخدام المنصة لتحسين الأداء</li>
            </ul>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">4. مشاركة المعلومات</h2>
            <p className="content-text">لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:</p>
            <ul className="content-list">
              <li><strong>مع مستخدمين آخرين:</strong> عند نشر إعلان، يتم عرض اسم المستخدم والمعلومات الأساسية.</li>
              <li><strong>مع مزودي الخدمات:</strong> نستخدم خدمات Firebase لاستضافة البيانات والمصادقة.</li>
              <li><strong>للامتثال القانوني:</strong> عند الطلب من السلطات المختصة.</li>
            </ul>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">5. أمان البيانات</h2>
            <p className="content-text">نتخذ إجراءات أمنية معقولة لحماية معلوماتك. نستخدم:</p>
            <ul className="content-list">
              <li>تشفير البيانات أثناء النقل (HTTPS)</li>
              <li>قواعد أمان Firestore لحماية قاعدة البيانات</li>
              <li>مصادقة آمنة عبر Firebase Authentication</li>
              <li>مراقبة منتظمة للأنشطة المشبوهة</li>
            </ul>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">6. حقوقك</h2>
            <ul className="content-list">
              <li>الوصول إلى معلوماتك الشخصية وتحديثها</li>
              <li>حذف حسابك وبياناتك</li>
              <li>الاعتراض على معالجة بياناتك</li>
              <li>طلب نسخة من بياناتك</li>
            </ul>
          </section>

          <section className="content-section">
            <h2 className="content-section-title">7. اتصل بنا</h2>
            <p className="content-text">إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر:</p>
            <div className="content-contact-box">
              <p>البريد الإلكتروني: privacy@bare.app</p>
              <p>الموقع: www.bare.app</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

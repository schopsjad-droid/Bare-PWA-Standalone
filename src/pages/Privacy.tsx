import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container py-8" style={{ flex: 1 }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}>
              سياسة الخصوصية
            </h1>
            <div style={{
              width: '60px',
              height: '4px',
              backgroundColor: '#22c55e',
              margin: '0 auto',
              borderRadius: '2px'
            }} />
            <p style={{
              marginTop: '16px',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              آخر تحديث: يناير 2025
            </p>
          </div>

          {/* Content */}
          <div style={{
            fontSize: '15px',
            lineHeight: '1.8',
            color: 'var(--text-secondary)'
          }}>
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                1. المقدمة
              </h2>
              <p style={{ marginBottom: '12px' }}>
                نحن في <strong>Bare</strong> نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا.
              </p>
              <p>
                باستخدامك لمنصة Bare، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                2. المعلومات التي نجمعها
              </h2>
              <p style={{ marginBottom: '12px' }}>
                نقوم بجمع الأنواع التالية من المعلومات:
              </p>
              <ul style={{
                listStyle: 'disc',
                paddingRight: '24px',
                marginBottom: '12px'
              }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، واسم المستخدم.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>معلومات الإعلانات:</strong> العنوان، الوصف، السعر، الصور، والموقع الجغرافي.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>معلومات الاستخدام:</strong> سجل التصفح، الإعلانات المفضلة، والمحادثات.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>معلومات تقنية:</strong> عنوان IP، نوع المتصفح، ونظام التشغيل.
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                3. كيفية استخدام المعلومات
              </h2>
              <p style={{ marginBottom: '12px' }}>
                نستخدم المعلومات التي نجمعها للأغراض التالية:
              </p>
              <ul style={{
                listStyle: 'disc',
                paddingRight: '24px',
                marginBottom: '12px'
              }}>
                <li style={{ marginBottom: '8px' }}>توفير وتحسين خدماتنا</li>
                <li style={{ marginBottom: '8px' }}>إدارة حسابك والتواصل معك</li>
                <li style={{ marginBottom: '8px' }}>عرض الإعلانات وتسهيل التواصل بين المستخدمين</li>
                <li style={{ marginBottom: '8px' }}>منع الاحتيال وضمان أمان المنصة</li>
                <li style={{ marginBottom: '8px' }}>إرسال إشعارات حول نشاط حسابك</li>
                <li style={{ marginBottom: '8px' }}>تحليل استخدام المنصة لتحسين الأداء</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                4. مشاركة المعلومات
              </h2>
              <p style={{ marginBottom: '12px' }}>
                لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:
              </p>
              <ul style={{
                listStyle: 'disc',
                paddingRight: '24px',
                marginBottom: '12px'
              }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>مع مستخدمين آخرين:</strong> عند نشر إعلان، يتم عرض اسم المستخدم والمعلومات الأساسية.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>مع مزودي الخدمات:</strong> نستخدم خدمات Firebase لاستضافة البيانات والمصادقة.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>للامتثال القانوني:</strong> عند الطلب من السلطات المختصة.
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                5. الكوكيز (Cookies)
              </h2>
              <p style={{ marginBottom: '12px' }}>
                نستخدم الكوكيز وتقنيات مشابهة لتحسين تجربتك على المنصة. الكوكيز هي ملفات صغيرة يتم تخزينها على جهازك لتذكر تفضيلاتك وتسجيل دخولك.
              </p>
              <p>
                يمكنك تعطيل الكوكيز من إعدادات المتصفح، لكن هذا قد يؤثر على بعض وظائف المنصة.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                6. أمان البيانات
              </h2>
              <p style={{ marginBottom: '12px' }}>
                نتخذ إجراءات أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. نستخدم:
              </p>
              <ul style={{
                listStyle: 'disc',
                paddingRight: '24px',
                marginBottom: '12px'
              }}>
                <li style={{ marginBottom: '8px' }}>تشفير البيانات أثناء النقل (HTTPS)</li>
                <li style={{ marginBottom: '8px' }}>قواعد أمان Firestore لحماية قاعدة البيانات</li>
                <li style={{ marginBottom: '8px' }}>مصادقة آمنة عبر Firebase Authentication</li>
                <li style={{ marginBottom: '8px' }}>مراقبة منتظمة للأنشطة المشبوهة</li>
              </ul>
              <p>
                مع ذلك، لا يمكن ضمان أمان البيانات بنسبة 100% عبر الإنترنت.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                7. حقوقك
              </h2>
              <p style={{ marginBottom: '12px' }}>
                لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:
              </p>
              <ul style={{
                listStyle: 'disc',
                paddingRight: '24px',
                marginBottom: '12px'
              }}>
                <li style={{ marginBottom: '8px' }}>الوصول إلى معلوماتك الشخصية وتحديثها</li>
                <li style={{ marginBottom: '8px' }}>حذف حسابك وبياناتك</li>
                <li style={{ marginBottom: '8px' }}>الاعتراض على معالجة بياناتك</li>
                <li style={{ marginBottom: '8px' }}>طلب نسخة من بياناتك</li>
              </ul>
              <p>
                للممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر إعدادات الحساب.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                8. خصوصية الأطفال
              </h2>
              <p>
                منصتنا غير موجهة للأطفال دون سن 13 عاماً. لا نجمع معلومات شخصية من الأطفال عن قصد. إذا اكتشفنا أننا جمعنا معلومات من طفل دون موافقة الوالدين، سنحذف هذه المعلومات فوراً.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                9. التغييرات على سياسة الخصوصية
              </h2>
              <p>
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ "آخر تحديث" أعلاه.
              </p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '16px'
              }}>
                10. اتصل بنا
              </h2>
              <p style={{ marginBottom: '12px' }}>
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
              </p>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <p style={{ marginBottom: '8px' }}>
                  البريد الإلكتروني: privacy@bare.app
                </p>
                <p>
                  📱 الموقع: www.bare.app
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

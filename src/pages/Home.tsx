import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';

interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
  subcategories?: Category[];
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Fetch category counts from Firestore
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const adsRef = collection(db, 'ads');
        
        // Get all approved ads
        const approvedQuery = query(adsRef, where('status', '==', 'approved'));
        const snapshot = await getDocs(approvedQuery);
        
        // Count by mainCategory
        const counts: Record<string, number> = { all: 0 };
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          counts.all++;
          
          if (data.mainCategory) {
            counts[data.mainCategory] = (counts[data.mainCategory] || 0) + 1;
          }
        });
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      }
    };

    fetchCategoryCounts();
  }, []);

  // Main categories based on Kleinanzeigen specification
  const mainCategories: Category[] = [
    {
      id: 'all',
      name: 'جميع الفئات',
      icon: '📦',
      count: 0
    },
    {
      id: 'vehicles',
      name: 'سيارات، دراجات وقوارب',
      icon: '🚗',
      count: 0,
      subcategories: [
        { id: 'vehicles-all', name: 'الكل في هذا القسم', icon: '📦' },
        { id: 'cars', name: 'سيارات', icon: '🚗' },
        { id: 'bicycles', name: 'دراجات هوائية وملحقاتها', icon: '🚴' },
        { id: 'car-parts', name: 'قطع غيار السيارات وإطارات', icon: '⚙️' },
        { id: 'boats', name: 'قوارب وملحقاتها', icon: '⛵' },
        { id: 'motorcycles', name: 'دراجات نارية وسكوتر', icon: '🏍️' },
        { id: 'motorcycle-parts', name: 'قطع غيار الدراجات النارية وملحقاتها', icon: '🔧' },
        { id: 'commercial-vehicles', name: 'مركبات تجارية ومقطورات', icon: '🚛' },
        { id: 'repairs', name: 'إصلاحات وخدمات', icon: '🔨' },
        { id: 'caravans', name: 'كرفانات وبيوت متنقلة', icon: '🚐' },
        { id: 'vehicles-other', name: 'أخرى في هذا القسم', icon: '📦' }
      ]
    },
    {
      id: 'real-estate',
      name: 'عقارات',
      icon: '🏠',
      count: 0,
      subcategories: [
        { id: 'real-estate-all', name: 'الكل في العقارات', icon: '📦' },
        { id: 'commercial-real-estate', name: 'عقارات تجارية', icon: '🏢' },
        { id: 'houses-for-sale', name: 'منازل للبيع', icon: '🏡' },
        { id: 'apartments-for-rent', name: 'شقق للإيجار', icon: '🏘️' },
        { id: 'temporary-housing', name: 'سكن مؤقت وسكن مشترك', icon: '🛏️' },
        { id: 'containers', name: 'حاويات (كونتينر)', icon: '📦' },
        { id: 'apartments-for-sale', name: 'شقق تمليك', icon: '🏢' },
        { id: 'vacation-properties', name: 'عقارات للعطلات وخارجية', icon: '🏖️' },
        { id: 'garages', name: 'كراجات ومواقف', icon: '🚪' },
        { id: 'land', name: 'أراضي وحدائق', icon: '🌳' },
        { id: 'houses-for-rent', name: 'منازل للإيجار', icon: '🏠' },
        { id: 'moving', name: 'نقل وعفش', icon: '📦' },
        { id: 'real-estate-other', name: 'عقارات أخرى', icon: '🏗️' }
      ]
    },
    {
      id: 'home-garden',
      name: 'منزل وحديقة',
      icon: '🏡',
      count: 0,
      subcategories: [
        { id: 'home-garden-all', name: 'الكل في المنزل والحديقة', icon: '📦' },
        { id: 'kitchen', name: 'مطبخ وغرفة طعام', icon: '🍽️' },
        { id: 'living-room', name: 'غرفة معيشة', icon: '🛋️' },
        { id: 'bathroom', name: 'حمام', icon: '🚿' },
        { id: 'office', name: 'مكتب', icon: '💼' },
        { id: 'decoration', name: 'ديكور', icon: '🎨' },
        { id: 'home-services', name: 'خدمات المنزل والحديقة', icon: '🔧' },
        { id: 'garden-supplies', name: 'مستلزمات الحدائق والنباتات', icon: '🌱' },
        { id: 'textiles', name: 'منسوجات منزلية', icon: '🧵' },
        { id: 'diy', name: 'أعمال يدوية / تحسين المنزل', icon: '🔨' },
        { id: 'lighting', name: 'مصابيح وإضاءة', icon: '💡' },
        { id: 'bedroom', name: 'غرفة نوم', icon: '🛏️' },
        { id: 'home-other', name: 'أخرى في المنزل والحديقة', icon: '📦' }
      ]
    },
    {
      id: 'fashion',
      name: 'أزياء وتجميل',
      icon: '👔',
      count: 0,
      subcategories: [
        { id: 'fashion-all', name: 'الكل في الأزياء والتجميل', icon: '📦' },
        { id: 'womens-clothing', name: 'ملابس نسائية', icon: '👗' },
        { id: 'mens-clothing', name: 'ملابس رجالية', icon: '👔' },
        { id: 'beauty-health', name: 'جمال وصحة', icon: '💄' },
        { id: 'womens-shoes', name: 'أحذية نسائية', icon: '👠' },
        { id: 'mens-shoes', name: 'أحذية رجالية', icon: '👞' },
        { id: 'bags-accessories', name: 'حقائب وإكسسوارات', icon: '👜' },
        { id: 'watches-jewelry', name: 'ساعات ومجوهرات', icon: '⌚' },
        { id: 'fashion-other', name: 'أخرى في الأزياء والتجميل', icon: '📦' }
      ]
    },
    {
      id: 'electronics',
      name: 'إلكترونيات',
      icon: '📱',
      count: 0,
      subcategories: [
        { id: 'electronics-all', name: 'الكل في الإلكترونيات', icon: '📦' },
        { id: 'phones', name: 'جوالات وهواتف', icon: '📱' },
        { id: 'home-appliances', name: 'أجهزة منزلية', icon: '🏠' },
        { id: 'audio', name: 'صوتيات (Audio & HiFi)', icon: '🔊' },
        { id: 'electronics-services', name: 'خدمات إلكترونية', icon: '🔧' },
        { id: 'photography', name: 'تصوير وكاميرات', icon: '📷' },
        { id: 'gaming-consoles', name: 'أجهزة ألعاب (كونسول)', icon: '🎮' },
        { id: 'laptops', name: 'لابتوبات', icon: '💻' },
        { id: 'desktop-pc', name: 'كمبيوترات مكتبية (PC)', icon: '🖥️' },
        { id: 'computer-accessories', name: 'ملحقات الكمبيوتر وبرامج', icon: '⌨️' },
        { id: 'tablets', name: 'أجهزة لوحية وقارئات كتب', icon: '📱' },
        { id: 'tv-video', name: 'تلفزيون وفيديو', icon: '📺' },
        { id: 'video-games', name: 'ألعاب فيديو', icon: '🎮' },
        { id: 'electronics-other', name: 'إلكترونيات أخرى', icon: '📦' }
      ]
    },
    {
      id: 'pets',
      name: 'حيوانات أليفة',
      icon: '🐾',
      count: 0,
      subcategories: [
        { id: 'pets-all', name: 'الكل في الحيوانات', icon: '📦' },
        { id: 'dogs', name: 'كلاب', icon: '🐕' },
        { id: 'cats', name: 'قطط', icon: '🐈' },
        { id: 'fish', name: 'أسماك', icon: '🐠' },
        { id: 'small-animals', name: 'حيوانات صغيرة', icon: '🐹' },
        { id: 'farm-animals', name: 'حيوانات مزارع', icon: '🐄' },
        { id: 'horses', name: 'خيول', icon: '🐴' },
        { id: 'pet-care', name: 'رعاية وتدريب الحيوانات', icon: '🦴' },
        { id: 'lost-pets', name: 'حيوانات مفقودة', icon: '🔍' },
        { id: 'birds', name: 'طيور', icon: '🦜' },
        { id: 'pet-supplies', name: 'مستلزمات حيوانات', icon: '🦴' }
      ]
    },
    {
      id: 'family-kids',
      name: 'عائلة، طفل ورضيع',
      icon: '👶',
      count: 0,
      subcategories: [
        { id: 'family-all', name: 'الكل في العائلة والطفل', icon: '📦' },
        { id: 'kids-clothing', name: 'ملابس رضع وأطفال', icon: '👕' },
        { id: 'strollers', name: 'عربات أطفال', icon: '🚼' },
        { id: 'elderly-care', name: 'رعاية كبار السن', icon: '👴' },
        { id: 'kids-shoes', name: 'أحذية رضع وأطفال', icon: '👟' },
        { id: 'baby-equipment', name: 'تجهيزات المواليد', icon: '🍼' },
        { id: 'car-seats', name: 'مقاعد سيارة للأطفال', icon: '🚗' },
        { id: 'babysitting', name: 'جليس أطفال ورعاية', icon: '👶' },
        { id: 'kids-furniture', name: 'أثاث غرف أطفال', icon: '🛏️' },
        { id: 'toys', name: 'ألعاب', icon: '🧸' },
        { id: 'family-other', name: 'أخرى في العائلة والطفل', icon: '📦' }
      ]
    },
    {
      id: 'jobs',
      name: 'وظائف',
      icon: '💼',
      count: 0,
      subcategories: [
        { id: 'jobs-all', name: 'الكل في الوظائف', icon: '📦' },
        { id: 'hospitality', name: 'ضيافة وسياحة', icon: '🏨' },
        { id: 'construction', name: 'بناء، حرف وإنتاج', icon: '🏗️' },
        { id: 'mini-jobs', name: 'وظائف صغيرة وجانبية', icon: '💼' },
        { id: 'apprenticeship', name: 'تدريب مهني', icon: '🎓' },
        { id: 'office-work', name: 'عمل مكتبي وإدارة', icon: '📊' },
        { id: 'customer-service', name: 'خدمة عملاء ومراكز اتصال', icon: '☎️' },
        { id: 'internship', name: 'تدريب عملي', icon: '📝' },
        { id: 'social-nursing', name: 'قطاع اجتماعي وتمريض', icon: '🏥' },
        { id: 'logistics', name: 'نقل، لوجستيات ومرور', icon: '🚚' },
        { id: 'sales', name: 'مبيعات ومشتريات', icon: '💰' },
        { id: 'jobs-other', name: 'وظائف أخرى', icon: '📦' }
      ]
    },
    {
      id: 'leisure',
      name: 'وقت فراغ، هوايات وجيرة',
      icon: '🎨',
      count: 0,
      subcategories: [
        { id: 'leisure-all', name: 'الكل في الهوايات', icon: '📦' },
        { id: 'art-antiques', name: 'فن وأنتيكات', icon: '🎨' },
        { id: 'collectibles', name: 'مقتنيات', icon: '🏺' },
        { id: 'spirituality', name: 'روحانيات', icon: '🕉️' },
        { id: 'food-drink', name: 'أكل وشرب', icon: '🍽️' },
        { id: 'entertainment', name: 'أنشطة ترفيهية', icon: '🎪' },
        { id: 'crafts', name: 'أعمال يدوية وفنية', icon: '✂️' },
        { id: 'artists-musicians', name: 'فنانون وموسيقيون', icon: '🎵' },
        { id: 'models', name: 'نماذج مصغرة', icon: '🚂' },
        { id: 'travel-events', name: 'سفر وخدمات مناسبات', icon: '✈️' },
        { id: 'sports-camping', name: 'رياضة وتخييم', icon: '⛺' },
        { id: 'flea-market', name: 'سوق المستعمل (أغراض متنوعة)', icon: '🛍️' },
        { id: 'lost-found', name: 'مفقودات وموجودات', icon: '🔍' }
      ]
    },
    {
      id: 'media',
      name: 'موسيقى، أفلام وكتب',
      icon: '📚',
      count: 0,
      subcategories: [
        { id: 'media-all', name: 'الكل في الموسيقى والكتب', icon: '📦' },
        { id: 'books', name: 'كتب ومجلات', icon: '📚' },
        { id: 'movies', name: 'أفلام (DVD)', icon: '📀' },
        { id: 'stationery', name: 'قرطاسية ومكتب', icon: '✏️' },
        { id: 'comics', name: 'قصص مصورة (كوميكس)', icon: '📖' },
        { id: 'textbooks', name: 'كتب دراسية وعلمية', icon: '📕' },
        { id: 'music-cds', name: 'موسيقى وأقراص CD', icon: '💿' },
        { id: 'instruments', name: 'آلات موسيقية', icon: '🎸' }
      ]
    },
    {
      id: 'tickets',
      name: 'تذاكر وفعاليات',
      icon: '🎫',
      count: 0
    },
    {
      id: 'services',
      name: 'خدمات',
      icon: '🔧',
      count: 0
    },
    {
      id: 'give-away',
      name: 'للمنح والمبادلة',
      icon: '🎁',
      count: 0,
      subcategories: [
        { id: 'free', name: 'للمنح (مجاناً)', icon: '🎁' },
        { id: 'lending', name: 'للإعارة', icon: '🔄' },
        { id: 'exchange', name: 'للمبادلة', icon: '🔁' }
      ]
    },
    {
      id: 'courses',
      name: 'دروس ودورات',
      icon: '📖',
      count: 0,
      subcategories: [
        { id: 'tutoring', name: 'دروس خصوصية', icon: '📝' },
        { id: 'beauty-courses', name: 'دورات تجميل وصحة', icon: '💅' },
        { id: 'computer-courses', name: 'دورات كمبيوتر', icon: '💻' },
        { id: 'spirituality-courses', name: 'روحانيات', icon: '🕉️' },
        { id: 'cooking', name: 'طبخ وخبز', icon: '🍳' },
        { id: 'art-design', name: 'فن وتصميم', icon: '🎨' },
        { id: 'music-singing', name: 'موسيقى وغناء', icon: '🎤' },
        { id: 'sports-courses', name: 'دورات رياضية', icon: '🏃' },
        { id: 'language-courses', name: 'دورات لغات', icon: '🗣️' },
        { id: 'dance-courses', name: 'دورات رقص', icon: '💃' },
        { id: 'continuing-education', name: 'تعليم مستمر', icon: '🎓' }
      ]
    },
    {
      id: 'neighbors',
      name: 'مساعدة الجيران',
      icon: '🤝',
      count: 0
    }
  ];

  const filteredCategories = mainCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setSelectedCategory(category);
    } else {
      // Navigate to category page
      setLocation(`/category/${category.id}`);
    }
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  const currentCategories = selectedCategory?.subcategories || filteredCategories;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <Helmet>
        <title>Bare - بيع وشراء في سوريا</title>
        <meta name="description" content="منصة للإعلانات المبوبة. اشترِ وبِع سيارات، عقارات، إلكترونيات وأكثر بسهولة وأمان." />
      </Helmet>
      {/* Top Green Accent Line */}
      <div className="top-accent"></div>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          {selectedCategory && (
            <button
              onClick={handleBackClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0 8px'
              }}
            >
              ←
            </button>
          )}
          <Link href="/">
            <a className="logo" style={{ textDecoration: 'none' }}>Bare</a>
          </Link>
          <input
            type="text"
            className="search-bar"
            placeholder="ابحث في الفئات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, maxWidth: '500px' }}
          />
        </div>
      </div>

      {/* Page Title */}
      {selectedCategory && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--divider-color)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {selectedCategory.name}
          </h2>
        </div>
      )}

      {/* Categories List */}
      <div>
        {currentCategories.map((category) => (
          <div
            key={category.id}
            className="category-item"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="category-icon">
              <span style={{ fontSize: '24px' }}>{category.icon}</span>
            </div>
            <div className="category-content">
              <div className="category-title">{category.name}</div>
              {(categoryCounts[category.id] !== undefined || category.count !== undefined) && (
                <div className="category-count">{categoryCounts[category.id] ?? category.count ?? 0} إعلان</div>
              )}
            </div>
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="category-arrow">‹</div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        zIndex: 999
      }}>
        <Link href="/">
          <a style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--accent-green)',
            textDecoration: 'none',
            fontSize: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>🏠</span>
            <span>الرئيسية</span>
          </a>
        </Link>
        <Link href="/favorites">
          <a style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>❤️</span>
            <span>المفضلة</span>
          </a>
        </Link>
        <Link href="/create-ad">
          <a style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>➕</span>
            <span>إضافة</span>
          </a>
        </Link>
        <Link href="/messages">
          <a style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <span>الرسائل</span>
          </a>
        </Link>
        <Link href="/profile">
          <a style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>👤</span>
            <span>حسابي</span>
          </a>
        </Link>
      </div>

      <Footer />
    </div>
  );
}


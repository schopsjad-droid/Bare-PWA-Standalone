export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
  subcategories?: Category[];
}

// Complete categories structure based on Kleinanzeigen specification
export const MAIN_CATEGORIES: Category[] = [
  {
    id: 'vehicles',
    name: 'سيارات، دراجات وقوارب',
    icon: '🚗',
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
    icon: '🎫'
  },
  {
    id: 'services',
    name: 'خدمات',
    icon: '🔧'
  },
  {
    id: 'give-away',
    name: 'للمنح والمبادلة',
    icon: '🎁',
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
    subcategories: [
      { id: 'tutoring', name: 'دروس خصوصية', icon: '📝' },
      { id: 'beauty-courses', name: 'دورات تجميل وصحة', icon: '💅' },
      { id: 'computer-courses', name: 'دورات كمبيوتر', icon: '💻' },
      { id: 'cooking-courses', name: 'دورات طبخ', icon: '👨‍🍳' },
      { id: 'language-courses', name: 'دورات لغات', icon: '🗣️' },
      { id: 'music-courses', name: 'دورات موسيقى', icon: '🎵' },
      { id: 'courses-other', name: 'دورات أخرى', icon: '📦' }
    ]
  }
];

// Helper function to get all subcategories for a main category
export function getSubcategories(mainCategoryId: string): Category[] {
  const mainCategory = MAIN_CATEGORIES.find(cat => cat.id === mainCategoryId);
  return mainCategory?.subcategories || [];
}

// Helper function to find a category by ID (searches both main and sub)
export function findCategoryById(categoryId: string): Category | undefined {
  // Check main categories first
  const mainCat = MAIN_CATEGORIES.find(cat => cat.id === categoryId);
  if (mainCat) return mainCat;
  
  // Check subcategories
  for (const mainCat of MAIN_CATEGORIES) {
    if (mainCat.subcategories) {
      const subCat = mainCat.subcategories.find(sub => sub.id === categoryId);
      if (subCat) return subCat;
    }
  }
  
  return undefined;
}

// Helper function to get main category for a subcategory
export function getMainCategoryForSub(subcategoryId: string): Category | undefined {
  for (const mainCat of MAIN_CATEGORIES) {
    if (mainCat.subcategories?.some(sub => sub.id === subcategoryId)) {
      return mainCat;
    }
  }
  return undefined;
}

// Price types
export type PriceType = 'fixed' | 'negotiable' | 'free';

export interface PriceInfo {
  amount: number;
  type: PriceType;
}

// Helper function to format price display
export function formatPrice(priceInfo: PriceInfo): string {
  if (priceInfo.type === 'free') {
    return 'مجاناً';
  }
  
  const formattedAmount = priceInfo.amount.toLocaleString('ar-SY');
  
  if (priceInfo.type === 'negotiable') {
    return `${formattedAmount} ل.س قابل للتفاوض`;
  }
  
  return `${formattedAmount} ل.س`;
}

// Syrian cities
export const SYRIAN_CITIES = [
  'دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'دير الزور', 'الرقة', 'إدلب', 'الحسكة', 'القامشلي',
  'درعا', 'السويداء', 'القنيطرة'
];

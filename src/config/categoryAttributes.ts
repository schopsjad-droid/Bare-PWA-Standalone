/**
 * Dynamic Category Attributes System
 * 
 * This configuration defines custom fields for each category.
 * Easy to extend: just add a new category key with its fields.
 * 
 * Field Types:
 * - text: Simple text input
 * - number: Numeric input
 * - select: Dropdown with options
 * - boolean: Yes/No toggle
 */

export interface AttributeField {
  id: string;
  label: string;
  labelAr: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  icon: string;
  unit?: string;
  unitAr?: string;
  options?: { value: string; label: string; labelAr: string }[];
  required?: boolean;
  placeholder?: string;
  placeholderAr?: string;
  min?: number;
  max?: number;
}

export interface CategoryAttributeConfig {
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
  fields: AttributeField[];
}

// ============================================
// CATEGORY ATTRIBUTES CONFIGURATION
// ============================================

export const categoryAttributes: Record<string, CategoryAttributeConfig> = {
  // ----------------------------------------
  // VEHICLES (السيارات)
  // ----------------------------------------
  'vehicles': {
    categoryId: 'vehicles',
    categoryName: 'Vehicles',
    categoryNameAr: 'السيارات',
    fields: [
      {
        id: 'year',
        label: 'Year',
        labelAr: 'سنة الصنع',
        type: 'number',
        icon: '📅',
        placeholder: '2020',
        placeholderAr: '2020',
        min: 1950,
        max: new Date().getFullYear() + 1,
        required: true
      },
      {
        id: 'mileage',
        label: 'Mileage',
        labelAr: 'المسافة المقطوعة',
        type: 'number',
        icon: '🛣️',
        unit: 'km',
        unitAr: 'كم',
        placeholder: '50000',
        placeholderAr: '50000',
        min: 0
      },
      {
        id: 'transmission',
        label: 'Transmission',
        labelAr: 'ناقل الحركة',
        type: 'select',
        icon: '⚙️',
        options: [
          { value: 'automatic', label: 'Automatic', labelAr: 'أوتوماتيك' },
          { value: 'manual', label: 'Manual', labelAr: 'يدوي' },
          { value: 'cvt', label: 'CVT', labelAr: 'CVT' }
        ],
        required: true
      },
      {
        id: 'fuelType',
        label: 'Fuel Type',
        labelAr: 'نوع الوقود',
        type: 'select',
        icon: '⛽',
        options: [
          { value: 'petrol', label: 'Petrol', labelAr: 'بنزين' },
          { value: 'diesel', label: 'Diesel', labelAr: 'ديزل' },
          { value: 'electric', label: 'Electric', labelAr: 'كهربائي' },
          { value: 'hybrid', label: 'Hybrid', labelAr: 'هجين' },
          { value: 'lpg', label: 'LPG', labelAr: 'غاز' }
        ],
        required: true
      },
      {
        id: 'color',
        label: 'Color',
        labelAr: 'اللون',
        type: 'text',
        icon: '🎨',
        placeholder: 'Black',
        placeholderAr: 'أسود'
      }
    ]
  },

  // ----------------------------------------
  // REAL ESTATE (العقارات)
  // ----------------------------------------
  'real-estate': {
    categoryId: 'real-estate',
    categoryName: 'Real Estate',
    categoryNameAr: 'العقارات',
    fields: [
      {
        id: 'area',
        label: 'Area',
        labelAr: 'المساحة',
        type: 'number',
        icon: '📐',
        unit: 'm²',
        unitAr: 'م²',
        placeholder: '120',
        placeholderAr: '120',
        min: 1,
        required: true
      },
      {
        id: 'rooms',
        label: 'Rooms',
        labelAr: 'عدد الغرف',
        type: 'number',
        icon: '🚪',
        placeholder: '3',
        placeholderAr: '3',
        min: 0,
        max: 20,
        required: true
      },
      {
        id: 'bathrooms',
        label: 'Bathrooms',
        labelAr: 'عدد الحمامات',
        type: 'number',
        icon: '🚿',
        placeholder: '2',
        placeholderAr: '2',
        min: 0,
        max: 10
      },
      {
        id: 'floor',
        label: 'Floor',
        labelAr: 'الطابق',
        type: 'number',
        icon: '🏢',
        placeholder: '3',
        placeholderAr: '3',
        min: -2,
        max: 100
      },
      {
        id: 'furnished',
        label: 'Furnished',
        labelAr: 'مفروش',
        type: 'boolean',
        icon: '🛋️'
      },
      {
        id: 'propertyType',
        label: 'Property Type',
        labelAr: 'نوع العقار',
        type: 'select',
        icon: '🏠',
        options: [
          { value: 'apartment', label: 'Apartment', labelAr: 'شقة' },
          { value: 'house', label: 'House', labelAr: 'منزل' },
          { value: 'villa', label: 'Villa', labelAr: 'فيلا' },
          { value: 'office', label: 'Office', labelAr: 'مكتب' },
          { value: 'shop', label: 'Shop', labelAr: 'محل تجاري' },
          { value: 'land', label: 'Land', labelAr: 'أرض' },
          { value: 'warehouse', label: 'Warehouse', labelAr: 'مستودع' }
        ],
        required: true
      }
    ]
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get attributes config for a category
 * Returns null if category has no custom attributes
 */
export function getCategoryAttributes(mainCategory: string): CategoryAttributeConfig | null {
  return categoryAttributes[mainCategory] || null;
}

/**
 * Check if a category has custom attributes
 */
export function hasCustomAttributes(mainCategory: string): boolean {
  return mainCategory in categoryAttributes;
}

/**
 * Get all categories that have custom attributes
 */
export function getCategoriesWithAttributes(): string[] {
  return Object.keys(categoryAttributes);
}

/**
 * Format attribute value for display
 */
export function formatAttributeValue(
  field: AttributeField,
  value: any,
  useArabic: boolean = true
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  switch (field.type) {
    case 'boolean':
      return value ? (useArabic ? 'نعم' : 'Yes') : (useArabic ? 'لا' : 'No');
    
    case 'select':
      const option = field.options?.find(o => o.value === value);
      return option ? (useArabic ? option.labelAr : option.label) : value;
    
    case 'number':
      const unit = useArabic ? field.unitAr : field.unit;
      return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
    
    default:
      return String(value);
  }
}

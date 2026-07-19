export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductApplication {
  title: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  categoryId: number;
  category?: ProductCategory;
  shortDescription: string | null;
  description: string;
  mainImage: string;
  galleryImages: ProductImage[];
  specs: ProductSpec[];
  features: (string | { title: string; description?: string })[];
  applications: ProductApplication[];
  packagingInfo: string | null;
  moq: string | null;
  oemOdmSupport: boolean;
  specSheetUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
}

export interface Certificate {
  id: number;
  name: string;
  certType: string | null;
  certNumber: string | null;
  issuingAuthority: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  imageUrl: string;
  pdfUrl: string | null;
  description: string | null;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
}

export interface Testimonial {
  id: number;
  authorName: string;
  authorTitle: string | null;
  companyName: string | null;
  country: string | null;
  avatarUrl: string | null;
  quote: string;
  rating: number | null;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  bodyHtml: string | null;
  sections: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
}

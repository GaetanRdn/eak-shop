export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName?: string; // For display purposes
  quoteNumber: string;
  date: Date;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  lines: QuoteLine[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalBeforeTax: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteCreate = Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt' | 'subtotal' | 'discountAmount' | 'totalBeforeTax' | 'taxAmount' | 'totalAmount'>;
export type QuoteUpdate = Partial<QuoteCreate>;
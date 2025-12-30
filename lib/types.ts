export interface ItemAnalysis {
  brand: string;
  type: string;
  color: string;
  condition_score: number;
  estimated_era: string;
}

export interface SalesCopy {
  seo_title: string;
  description: string;
  hashtags: string[];
}

export interface Pricing {
  fast_sell_price: number;
  market_price: number;
  pro_negotiation_price: number;
}

export interface AnalysisResult {
  item_analysis: ItemAnalysis;
  sales_copy: SalesCopy;
  pricing: Pricing;
}

export interface UploadState {
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  result: AnalysisResult | null;
}


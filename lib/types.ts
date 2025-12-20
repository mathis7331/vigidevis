export type LineItemStatus = "ok" | "warning" | "danger";

export interface LineItem {
  item_name: string;
  quoted_price: string;
  market_price: string;
  status: LineItemStatus;
  comment: string;
}

export interface AnalysisResult {
  category: string;
  trust_score: number;
  verdict: string;
  red_flags: string[];
  fair_price_estimate: string;
  negotiation_tip: string;
  line_items: LineItem[];
}

export interface UploadState {
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  result: AnalysisResult | null;
}


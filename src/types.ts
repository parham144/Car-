export interface PriceRange {
  min: number;
  max: number;
}

export interface PartItem {
  partName: string;
  priceRange: PriceRange;
  lifetime: string;
  replacementSigns: string;
  suggestedBrands: string[];
  installDifficulty: "آسان" | "متوسط" | "سخت" | string;
  proTip: string;
}

export interface PartCategory {
  categoryName: string;
  parts: PartItem[];
}

export interface CommonTrouble {
  symptom: string;
  possibleCause: string;
  urgentLevel: "زرد" | "نارنجی" | "قرمز" | string;
}

export interface CarConsumablesResponse {
  carModelName: string;
  summary: string;
  overallExpenseLevel: string;
  partsCount: number;
  categories: PartCategory[];
  commonTroubles: CommonTrouble[];
  isOfflineData?: boolean;
}

export interface SearchHistoryItem {
  carModel: string;
  timestamp: string;
}

export interface ChatMessage {
  sender: "user" | "mechanic" | "system";
  text: string;
  timestamp: string;
}

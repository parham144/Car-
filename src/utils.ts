import { SearchHistoryItem } from "./types";

// Helper to format currency values to beautiful Persian local currencies
export function formatPriceToman(num: number): string {
  try {
    const formatted = new Intl.NumberFormat("fa-IR", {
      useGrouping: true,
    }).format(num);
    return `${formatted} تومان`;
  } catch (e) {
    return `${num.toLocaleString("fa-IR")} تومان`;
  }
}

// Convert numbers in string to Persian digits for beautiful RTL display consistency
export function toPersianNumberString(val: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return val
    .toString()
    .replace(/[0-9]/g, (char) => persianDigits[parseInt(char, 10)]);
}

// Load Search history safely from localStorage
export function loadSearchHistory(): SearchHistoryItem[] {
  try {
    const data = localStorage.getItem("car_search_history");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load search history", error);
    return [];
  }
}

// Save search history entry safely to localStorage
export function saveToSearchHistory(carModel: string): SearchHistoryItem[] {
  try {
    const history = loadSearchHistory();
    // Remove if already exists to move to top
    const filtered = history.filter(
      (item) => item.carModel.trim().toLowerCase() !== carModel.trim().toLowerCase()
    );
    const newEntry: SearchHistoryItem = {
      carModel,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...filtered].slice(0, 10); // Keep last 10
    localStorage.setItem("car_search_history", JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save search history", error);
    return [];
  }
}

// Clear Search history from localStorage
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem("car_search_history");
  } catch (error) {
    console.error("Error clearing search history", error);
  }
}

import { AnnouncementType, OrderStatus } from "../backend.d";

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStockStatus(stock: bigint): {
  label: string;
  color: string;
  className: string;
} {
  const s = Number(stock);
  if (s === 0) {
    return {
      label: "Out of Stock",
      color: "red",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  }
  if (s <= 20) {
    return {
      label: "Low Stock",
      color: "orange",
      className:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };
  }
  return {
    label: "In Stock",
    color: "green",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
}

export function getOrderStatusConfig(status: OrderStatus): {
  label: string;
  className: string;
} {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    [OrderStatus.Pending]: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    [OrderStatus.Confirmed]: {
      label: "Confirmed",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    [OrderStatus.Shipped]: {
      label: "Shipped",
      className:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    },
    [OrderStatus.Delivered]: {
      label: "Delivered",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    [OrderStatus.Cancelled]: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  return map[status] ?? { label: String(status), className: "" };
}

export function getAnnouncementTypeConfig(type: AnnouncementType): {
  label: string;
  className: string;
} {
  const map: Record<AnnouncementType, { label: string; className: string }> = {
    [AnnouncementType.Promotion]: {
      label: "Promotion",
      className:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    },
    [AnnouncementType.NewProduct]: {
      label: "New Product",
      className:
        "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    },
    [AnnouncementType.TradeOffer]: {
      label: "Trade Offer",
      className:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
    [AnnouncementType.General]: {
      label: "General",
      className:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    },
  };
  return map[type] ?? { label: String(type), className: "" };
}

export const PHARMA_CATEGORIES = [
  "Antibiotics",
  "Analgesics",
  "Antivirals",
  "Cardiovascular",
  "Dermatology",
  "Diabetes Care",
  "Gastrointestinal",
  "Immunology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Pulmonology",
  "Vitamins & Supplements",
  "Vaccines",
  "Medical Devices",
  "Diagnostics",
  "Other",
];

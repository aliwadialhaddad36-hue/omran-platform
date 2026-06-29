import Stripe from "stripe";
import type { PackagePrice } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const PACKAGES: Record<
  PackagePrice,
  { label: string; features: string[]; stripeAmount: number }
> = {
  125: {
    label: "الباقة الأساسية",
    stripeAmount: 12500,
    features: [
      "نشر المشروع على المنصة",
      "رابط تسويقي مخصص",
      "دعم فني لمدة شهر",
    ],
  },
  250: {
    label: "الباقة المتوسطة",
    stripeAmount: 25000,
    features: [
      "نشر المشروع على المنصة",
      "رابط تسويقي مخصص",
      "دعم فني لمدة 3 أشهر",
      "تقرير أداء شهري",
    ],
  },
  350: {
    label: "الباقة المميزة",
    stripeAmount: 35000,
    features: [
      "نشر المشروع على المنصة",
      "رابط تسويقي مخصص",
      "دعم فني لمدة 6 أشهر",
      "تقرير أداء أسبوعي",
      "أولوية في العرض",
    ],
  },
};

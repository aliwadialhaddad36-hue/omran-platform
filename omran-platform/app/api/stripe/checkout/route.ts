import { NextRequest, NextResponse } from "next/server";
import { stripe, PACKAGES } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type { PackagePrice } from "@/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { clientId, packagePrice } = await req.json();
    if (!clientId || !packagePrice) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    const pkg = PACKAGES[packagePrice as PackagePrice];
    if (!pkg) {
      return NextResponse.json({ error: "باقة غير صحيحة" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: client } = await supabase.from("clients").select("*").eq("id", clientId).single();
    if (!client) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "sar",
            product_data: {
              name: `منصة العمران - ${pkg.label}`,
              description: pkg.features.join(" | "),
            },
            unit_amount: pkg.stripeAmount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: client.email,
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&client_id=${clientId}`,
      cancel_url: `${appUrl}/clients`,
      metadata: { clientId, packagePrice: String(packagePrice) },
    });

    await supabase.from("clients").update({ stripe_session_id: session.id }).eq("id", clientId);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "فشل إنشاء جلسة الدفع" }, { status: 500 });
  }
}

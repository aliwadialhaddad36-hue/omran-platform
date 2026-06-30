import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = await createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clientId = session.metadata?.clientId;
    if (!clientId) return NextResponse.json({ received: true });

    const { data: client } = await supabase.from("clients").select("*").eq("id", clientId).single();
    if (client) {
      await supabase.from("clients").update({ payment_status: "paid", status: "pending" }).eq("id", clientId);

      const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
      if (admins?.length) {
        await supabase.from("notifications").insert(
          admins.map((a) => ({
            user_id: a.id,
            title: "دفع جديد من عميل مميز",
            message: `أتم ${client.name} الدفع بمبلغ ${client.package_price} ريال. يرجى مراجعة طلب الاشتراك.`,
            type: "success" as const,
            related_type: "client" as const,
            related_id: clientId,
          }))
        );
      }
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as any;
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("stripe_session_id", invoice.subscription)
      .single();
    if (client?.user_id) {
      await supabase.from("notifications").insert({
        user_id: client.user_id,
        title: "فشل الدفع",
        message: "لم يتمكن النظام من تحصيل مبلغ الاشتراك. يرجى تحديث بيانات بطاقتك.",
        type: "error",
        related_type: "client",
        related_id: client.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}

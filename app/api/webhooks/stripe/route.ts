import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markAnalysisAsPaid, incrementStats, getAnalysis } from "@/lib/kv";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  // Si Stripe n'est pas configuré, on retourne une erreur 503
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const analysisId = session.metadata?.analysisId;

      if (analysisId) {
        console.log(`Payment successful for analysis: ${analysisId}`);

        // Mark analysis as paid
        await markAnalysisAsPaid(analysisId);

        // Get analysis to calculate savings and check guarantee
        const analysis = await getAnalysis(analysisId);
        
        // GARANTIE REMBOURSÉ : Si score ≥ 90/100
        if (analysis && analysis.result.trust_score >= 90) {
          console.log(`🎉 Score ${analysis.result.trust_score}/100 ≥ 90 → Remboursement automatique`);
          
          try {
            await stripe.refunds.create({
              payment_intent: session.payment_intent as string,
              reason: "requested_by_customer",
              metadata: {
                analysisId,
                reason: "Garantie remboursé - Devis déjà au prix juste",
                trust_score: analysis.result.trust_score.toString()
              }
            });
            
            console.log(`✅ Remboursement effectué pour l'analyse ${analysisId}`);
          } catch (refundError) {
            console.error("Erreur lors du remboursement:", refundError);
          }
        }
        if (analysis) {
          // Calculate total savings
          const totalSavings = analysis.result.line_items.reduce((total, item) => {
            const quotedNum = parseFloat(
              item.quoted_price.replace(/[^\d.,]/g, "").replace(",", ".")
            );
            const marketNum = parseFloat(
              item.market_price.replace(/[^\d.,]/g, "").replace(",", ".")
            );

            if (isNaN(quotedNum) || isNaN(marketNum)) return total;

            const savings = quotedNum - marketNum;
            return total + (savings > 0 ? savings : 0);
          }, 0);

          // Increment total savings counter
          await incrementStats("savings", Math.round(totalSavings));
        }

        console.log(`Analysis ${analysisId} marked as paid`);
      }
      break;

    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}


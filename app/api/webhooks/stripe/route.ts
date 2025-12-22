import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markAnalysisAsPaid, incrementStats, getAnalysis, saveAnalysis } from "@/lib/kv";
import { analyzeQuote } from "@/actions/analyze";
import Stripe from "stripe";

// Export runtime config to ensure this route is not cached
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
        console.log(`💳 Payment successful for analysis: ${analysisId}`);
        
        // Fonction asynchrone pour traiter l'analyse en arrière-plan
        const processAnalysisAsync = async () => {
          try {
            console.log(`🤖 Starting OpenAI analysis (async, after payment confirmation)...`);
            
            // Get pending analysis (with imageBase64, no result yet)
            const pendingAnalysis = await getAnalysis(analysisId);

            if (!pendingAnalysis || !pendingAnalysis.imageBase64) {
              console.error(`❌ Analysis ${analysisId} not found or missing image`);
              return;
            }

            // NOW do the OpenAI analysis (only after payment!)
            let analysisResult;
            try {
              analysisResult = await analyzeQuote(
                pendingAnalysis.imageBase64,
                pendingAnalysis.category || null
              );
            } catch (error) {
              console.error(`❌ OpenAI analysis error for ${analysisId}:`, error);
              // Mark as paid even if analysis fails (user already paid)
              await markAnalysisAsPaid(analysisId);
              return;
            }

            if (!analysisResult.success || !analysisResult.data) {
              console.error(`❌ OpenAI analysis failed for ${analysisId}:`, analysisResult.error);
              // Mark as paid even if analysis fails (user already paid)
              await markAnalysisAsPaid(analysisId);
              return;
            }

            // Save the analysis result and mark as paid
            try {
              await saveAnalysis(
                analysisId,
                analysisResult.data,
                true, // isPaid = true
                pendingAnalysis.category
              );
              console.log(`✅ Analysis ${analysisId} completed and saved`);
            } catch (saveError) {
              console.error(`❌ Error saving analysis ${analysisId}:`, saveError);
              // Still mark as paid
              await markAnalysisAsPaid(analysisId);
              return;
            }

            // Get the final analysis to calculate savings and check guarantee
            const analysis = await getAnalysis(analysisId);
            
            if (analysis && analysis.result) {
              // GARANTIE REMBOURSÉ : Si score ≥ 90/100
              if (analysis.result.trust_score >= 90) {
                console.log(`🎉 Score ${analysis.result.trust_score}/100 ≥ 90 → Remboursement automatique`);
                
                // Vérifier que stripe est configuré avant de faire le remboursement
                if (stripe && session.payment_intent) {
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
                } else {
                  console.warn(`⚠️ Cannot process refund for ${analysisId}: Stripe not configured or no payment_intent`);
                }
              }

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

            // Increment analysis counter
            await incrementStats("analyses");

            console.log(`✅ Analysis ${analysisId} completed, saved, and marked as paid`);
          } catch (error) {
            console.error(`❌ Critical error processing analysis for ${analysisId}:`, error);
            // Try to mark as paid anyway (user already paid)
            try {
              await markAnalysisAsPaid(analysisId);
            } catch (markError) {
              console.error(`❌ Failed to mark ${analysisId} as paid:`, markError);
            }
          }
        };

        // ÉTAPE 1 : Marquer comme payé IMMÉDIATEMENT (sans attendre l'analyse)
        try {
          await markAnalysisAsPaid(analysisId);
          console.log(`✅ Marked ${analysisId} as paid immediately`);
        } catch (markError) {
          console.error(`❌ Failed to mark ${analysisId} as paid:`, markError);
          // Continue anyway, we'll try again in async process
        }

        // ÉTAPE 2 : Lancer l'analyse OpenAI en arrière-plan (sans await)
        // Ne pas bloquer la réponse à Stripe
        processAnalysisAsync().catch((error) => {
          console.error(`❌ Async analysis processing failed for ${analysisId}:`, error);
        });

        // ÉTAPE 3 : Répondre IMMÉDIATEMENT à Stripe (200 OK)
        // Stripe reçoit sa confirmation instantanément, l'analyse continue en arrière-plan
        return NextResponse.json({ 
          received: true,
          message: "Payment confirmed, analysis processing in background"
        }, { status: 200 });
      }
      break;

    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Always return 200 to Stripe to confirm receipt
  return NextResponse.json({ received: true }, { status: 200 });
}


import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markAnalysisAsPaid, incrementStats, getAnalysis, saveAnalysis, saveAnalysisError } from "@/lib/kv";
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
            console.log(`[WEBHOOK] 🤖 Starting OpenAI analysis (async, after payment confirmation) for ${analysisId}`);
            
            // VÉRIFICATION KV : Récupérer l'analyse avec l'image
            const pendingAnalysis = await getAnalysis(analysisId);

            if (!pendingAnalysis) {
              console.error(`[WEBHOOK] ❌ CRITICAL: Analysis ${analysisId} not found in KV`);
              await saveAnalysisError(
                analysisId,
                "ANALYSIS_NOT_FOUND",
                `Analysis ${analysisId} not found in KV store at webhook time`,
                true
              );
              return;
            }

            if (!pendingAnalysis.imageBase64 || pendingAnalysis.imageBase64.trim().length === 0) {
              console.error(`[WEBHOOK] ❌ CRITICAL: Analysis ${analysisId} missing imageBase64`);
              await saveAnalysisError(
                analysisId,
                "IMAGE_MISSING",
                `Analysis ${analysisId} is missing imageBase64 in KV store`,
                true
              );
              return;
            }

            console.log(`[WEBHOOK] ✅ Analysis ${analysisId} found, imageBase64: ${Math.round(pendingAnalysis.imageBase64.length / 1024)}KB`);

            // NOW do the OpenAI analysis (only after payment!)
            let analysisResult;
            try {
              console.log(`[WEBHOOK] 📡 Calling analyzeQuote for ${analysisId}...`);
              analysisResult = await analyzeQuote(
                pendingAnalysis.imageBase64,
                pendingAnalysis.category || null
              );
              console.log(`[WEBHOOK] 📥 analyzeQuote response: success=${analysisResult.success}`);
            } catch (error) {
              console.error(`[WEBHOOK] ❌ OpenAI analysis exception for ${analysisId}:`, error);
              const errorMessage = error instanceof Error ? error.message : String(error);
              await saveAnalysisError(
                analysisId,
                "IA_FAILED",
                `OpenAI analysis exception: ${errorMessage}`,
                true
              );
              return;
            }

            if (!analysisResult.success || !analysisResult.data) {
              console.error(`[WEBHOOK] ❌ OpenAI analysis failed for ${analysisId}: ${analysisResult.error}`);
              await saveAnalysisError(
                analysisId,
                "IA_FAILED",
                analysisResult.error || "OpenAI analysis failed without specific error",
                true
              );
              return;
            }

            // Save the analysis result and mark as paid
            try {
              console.log(`[WEBHOOK] 💾 Saving analysis result for ${analysisId}...`);
              await saveAnalysis(
                analysisId,
                analysisResult.data,
                true, // isPaid = true
                pendingAnalysis.category
              );
              console.log(`[WEBHOOK] ✅ Analysis ${analysisId} completed and saved successfully`);
            } catch (saveError) {
              console.error(`[WEBHOOK] ❌ Error saving analysis ${analysisId}:`, saveError);
              const errorMessage = saveError instanceof Error ? saveError.message : String(saveError);
              await saveAnalysisError(
                analysisId,
                "SAVE_FAILED",
                `Failed to save analysis result: ${errorMessage}`,
                true
              );
              return;
            }

            // Get the final analysis to calculate savings and check guarantee
            const analysis = await getAnalysis(analysisId);
            
            if (analysis && analysis.result) {
              // Pour les vêtements, pas de logique de remboursement automatique
              // Le paiement est définitif une fois l'analyse générée

              console.log(`✅ Analyse de vêtement terminée pour ${analysisId}`);
              console.log(`👕 Vêtement analysé: ${analysis.result.item_analysis.brand} ${analysis.result.item_analysis.type}`);
              console.log(`💰 Prix recommandé: ${analysis.result.pricing.market_price}€`);
            }

            // Increment analysis counter
            await incrementStats("analyses");

            console.log(`[WEBHOOK] ✅ Analysis ${analysisId} completed, saved, and marked as paid`);
          } catch (error) {
            console.error(`[WEBHOOK] ❌ Critical error processing analysis for ${analysisId}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Sauvegarder l'erreur critique
            try {
              await saveAnalysisError(
                analysisId,
                "CRITICAL_ERROR",
                `Critical error in processAnalysisAsync: ${errorMessage}`,
                true
              );
            } catch (saveErrorError) {
              console.error(`[WEBHOOK] ❌ Failed to save error for ${analysisId}:`, saveErrorError);
            }
          }
        };

        // ÉTAPE 1 : Marquer comme payé IMMÉDIATEMENT (sans attendre l'analyse)
        try {
          await markAnalysisAsPaid(analysisId);
          console.log(`[WEBHOOK] ✅ Marked ${analysisId} as paid immediately`);
        } catch (markError) {
          console.error(`[WEBHOOK] ❌ Failed to mark ${analysisId} as paid:`, markError);
          // Continue anyway, we'll try again in async process
        }

        // ÉTAPE 2 : Lancer l'analyse OpenAI en arrière-plan (vraiment asynchrone)
        // Utiliser setImmediate pour s'assurer que la réponse 200 est envoyée AVANT le traitement
        setImmediate(() => {
          processAnalysisAsync().catch((error) => {
            console.error(`[WEBHOOK] ❌ Async analysis processing failed for ${analysisId}:`, error);
          });
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


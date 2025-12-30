"use server";

import OpenAI from "openai";
import { AnalysisResult } from "@/lib/types";
import { parseJSONWithRepair } from "@/lib/json-repair";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un expert vintage fashion reseller et Vinted algorithm specialist. Tu parles le langage des Gen Z (cool, direct, emoji-friendly). Ta mission est d'analyser une photo de vêtement et de générer une annonce Vinted high-performing.

OUTPUT FORMAT (JSON ONLY):

JSON

{
  "item_analysis": {
    "brand": "String (ex: Nike, Zara, Vintage)",
    "type": "String (ex: Sweatshirt, Cargo Pants)",
    "color": "String",
    "condition_score": "Number (1-10)",
    "estimated_era": "String (ex: Y2K, 90s, Modern)"
  },
  "sales_copy": {
    "seo_title": "String (Max 50 chars, keyword stuffed. Ex: 'Sweat Nike Vintage Gris - Oversize - Y2K')",
    "description": "String (Une description complète avec bullet points pour Condition, Size, Brand. Inclut un 'Style Tip' à la fin. Utilise des emojis).",
    "hashtags": "String (Array de 15 hashtags tendance pour cet article spécifique)"
  },
  "pricing": {
    "fast_sell_price": "Number (Prix bas pour vendre en 24h)",
    "market_price": "Number (Le prix moyen équitable)",
    "pro_negotiation_price": "Number (Prix plus élevé pour permettre la négociation)"
  }
}
TONE OF VOICE: Dynamic, persuasif, professionnel mais accessible. Pas de 'corporate' talk.`;

/**
 * Nettoie et formate le Base64 pour OpenAI
 * @param imageBase64 - Chaîne Base64 (peut contenir le préfixe data:image/... ou non)
 * @returns URL formatée pour OpenAI (data:image/jpeg;base64,... ou data:image/png;base64,...)
 */
function formatBase64ForOpenAI(imageBase64: string): string {
  // Nettoyer la chaîne : enlever retours à la ligne, espaces, etc.
  let cleaned = imageBase64.trim().replace(/\s+/g, '');
  
  // Si le préfixe data:image/ est déjà présent, le retourner tel quel
  if (cleaned.startsWith('data:image/')) {
    return cleaned;
  }
  
  // Détecter le type MIME en analysant les premiers bytes du Base64
  // PNG commence par iVBORw0KGgo (base64 de la signature PNG)
  // JPEG commence par /9j/ (base64 de la signature JPEG)
  const base64Data = cleaned.includes(',') ? cleaned.split(',')[1] : cleaned;
  const firstChars = base64Data.substring(0, 20);
  
  let mimeType = 'image/jpeg'; // Par défaut JPEG (OpenAI est flexible)
  
  if (firstChars.startsWith('iVBORw0KGgo')) {
    mimeType = 'image/png';
  } else if (firstChars.startsWith('/9j/')) {
    mimeType = 'image/jpeg';
  } else if (firstChars.startsWith('UklGR')) {
    mimeType = 'image/webp';
  }
  
  // Formater avec le préfixe data URI
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Valide que l'image Base64 est valide
 */
function validateBase64Image(imageBase64: string): { valid: boolean; error?: string } {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Base64 image is missing or not a string' };
  }
  
  const cleaned = imageBase64.trim();
  
  if (cleaned.length < 100) {
    return { valid: false, error: 'Base64 image is too short (corrupted or empty)' };
  }
  
  // Extraire les données Base64 (après la virgule si préfixe présent)
  const base64Data = cleaned.includes(',') ? cleaned.split(',')[1] : cleaned;
  
  // Vérifier que c'est du Base64 valide (caractères alphanumériques + / + =)
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(base64Data)) {
    return { valid: false, error: 'Base64 image contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Fonction helper pour appeler OpenAI avec retry logic
 */
async function callOpenAIWithRetry(
  imageBase64: string,
  category: string | null | undefined,
  attempt: number = 1,
  maxAttempts: number = 2
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    console.log(`[ANALYSE STEP ${attempt}/${maxAttempts}] Envoi requête OpenAI...`);
    
    // Valider et formater le Base64
    const validation = validateBase64Image(imageBase64);
    if (!validation.valid) {
      console.error(`[ANALYSE STEP ${attempt}/${maxAttempts}] ❌ ${validation.error}`);
      return {
        success: false,
        error: validation.error || 'Image Base64 invalide',
      };
    }
    
    const formattedImageUrl = formatBase64ForOpenAI(imageBase64);
    console.log(`[ANALYSE STEP ${attempt}/${maxAttempts}] ✅ Image formatée pour OpenAI (${formattedImageUrl.substring(0, 30)}...)`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse ce vêtement et génère une annonce Vinted optimisée. Retourne UNIQUEMENT le JSON demandé, sans markdown, sans texte explicatif.`,
            },
            {
              type: "image_url",
              image_url: {
                url: formattedImageUrl, // Format data:image/jpeg;base64,...
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      console.error(`[ANALYSE STEP ${attempt}/${maxAttempts}] ❌ Aucune réponse de l'IA`);
      
      if (attempt < maxAttempts) {
        console.log(`[ANALYSE STEP] Nouvelle tentative dans 2 secondes...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return callOpenAIWithRetry(imageBase64, category, attempt + 1, maxAttempts);
      }
      
      return {
        success: false,
        error: "L'IA n'a pas pu générer de réponse après plusieurs tentatives.",
      };
    }

    console.log(`[ANALYSE STEP ${attempt}/${maxAttempts}] ✅ Réponse reçue (${content.length} caractères)`);
    return { success: true, content };
    
  } catch (error) {
    console.error(`[ANALYSE STEP ${attempt}/${maxAttempts}] ❌ Erreur OpenAI:`, error);
    
    // Si c'est une erreur réseau/timeout et qu'on peut réessayer
    const isRetryable = error instanceof Error && (
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('rate limit') ||
      error.message.includes('429')
    );
    
    if (isRetryable && attempt < maxAttempts) {
      const delay = attempt * 2000; // Délai progressif : 2s, 4s
      console.log(`[ANALYSE STEP] Erreur récupérable, nouvelle tentative dans ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callOpenAIWithRetry(imageBase64, category, attempt + 1, maxAttempts);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue lors de l'appel OpenAI",
    };
  }
}

/**
 * Valide la structure de la réponse IA
 */
function validateAnalysisResult(data: any): { valid: boolean; error?: string } {
  // Vérification des champs obligatoires de premier niveau
  const requiredFields = ['item_analysis', 'sales_copy', 'pricing'];

  for (const field of requiredFields) {
    if (!(field in data)) {
      return { valid: false, error: `Champ manquant: ${field}` };
    }
  }

  // Vérification de item_analysis
  const itemAnalysis = data.item_analysis;
  if (typeof itemAnalysis !== 'object') {
    return { valid: false, error: 'item_analysis doit être un objet' };
  }

  const requiredItemAnalysisFields = ['brand', 'type', 'color', 'condition_score', 'estimated_era'];
  for (const field of requiredItemAnalysisFields) {
    if (!(field in itemAnalysis)) {
      return { valid: false, error: `item_analysis manque le champ: ${field}` };
    }
  }

  if (typeof itemAnalysis.condition_score !== 'number') {
    return { valid: false, error: 'item_analysis.condition_score doit être un number' };
  }

  // Vérification de sales_copy
  const salesCopy = data.sales_copy;
  if (typeof salesCopy !== 'object') {
    return { valid: false, error: 'sales_copy doit être un objet' };
  }

  const requiredSalesCopyFields = ['seo_title', 'description', 'hashtags'];
  for (const field of requiredSalesCopyFields) {
    if (!(field in salesCopy)) {
      return { valid: false, error: `sales_copy manque le champ: ${field}` };
    }
  }

  // Vérification de pricing
  const pricing = data.pricing;
  if (typeof pricing !== 'object') {
    return { valid: false, error: 'pricing doit être un objet' };
  }

  const requiredPricingFields = ['fast_sell_price', 'market_price', 'pro_negotiation_price'];
  for (const field of requiredPricingFields) {
    if (!(field in pricing)) {
      return { valid: false, error: `pricing manque le champ: ${field}` };
    }
  }

  // Vérifier que les prix sont des nombres
  if (typeof pricing.fast_sell_price !== 'number') {
    return { valid: false, error: 'pricing.fast_sell_price doit être un number' };
  }
  if (typeof pricing.market_price !== 'number') {
    return { valid: false, error: 'pricing.market_price doit être un number' };
  }
  if (typeof pricing.pro_negotiation_price !== 'number') {
    return { valid: false, error: 'pricing.pro_negotiation_price doit être un number' };
  }

  return { valid: true };
}

export async function analyzeQuote(
  imageBase64: string,
  category?: string | null
): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
  try {
    // VALIDATION D'ENTRÉE
    console.log('[ANALYSE STEP] 🚀 Début de l\'analyse IA...');
    
    // Validation stricte de l'image Base64
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length === 0) {
      console.error('[ANALYSE STEP] ❌ [ERROR] Base64 image is missing or corrupted');
      return {
        success: false,
        error: "Image manquante. Veuillez réessayer avec un document valide.",
      };
    }
    
    // Validation détaillée du format Base64
    const validation = validateBase64Image(imageBase64);
    if (!validation.valid) {
      console.error(`[ANALYSE STEP] ❌ [ERROR] ${validation.error}`);
      return {
        success: false,
        error: validation.error || "Format d'image invalide. Veuillez réessayer avec un document valide.",
      };
    }
    
    // Vérification de la clé API
    if (!process.env.OPENAI_API_KEY) {
      console.error('[ANALYSE STEP] ❌ Clé API OpenAI manquante');
      return {
        success: false,
        error: "Configuration manquante. Veuillez contacter le support.",
      };
    }

    if (category) {
      console.log(`[ANALYSE STEP] 📁 Catégorie sélectionnée: ${category}`);
    }
    
    // Log de la taille de l'image (sans afficher tout le Base64)
    const imageSizeKB = Math.round(imageBase64.length / 1024);
    const imagePreview = imageBase64.substring(0, 50);
    const hasDataPrefix = imageBase64.startsWith('data:image/');
    console.log(`[ANALYSE STEP] 📸 Image base64: ${imagePreview}... (${imageSizeKB}KB, préfixe: ${hasDataPrefix ? 'oui' : 'non'})`);

    // APPEL OPENAI AVEC RETRY LOGIC
    const openAIResult = await callOpenAIWithRetry(imageBase64, category, 1, 2);
    
    if (!openAIResult.success || !openAIResult.content) {
      console.error('[ANALYSE STEP] ❌ Échec après toutes les tentatives');
      return {
        success: false,
        error: openAIResult.error || "L'IA n'a pas pu générer de réponse. Veuillez réessayer.",
      };
    }

    const content = openAIResult.content;
    console.log('[ANALYSE STEP] 📥 Réponse brute reçue:', content.length, 'caractères');

    // PARSING JSON AVEC RÉPARATION AUTOMATIQUE
    console.log('[ANALYSE STEP] 🔧 Parsing JSON avec réparation...');
    const parseResult = parseJSONWithRepair(content);
    
    if (!parseResult.success || !parseResult.data) {
      console.error('[ANALYSE STEP] ❌ Échec parsing JSON après toutes les tentatives de réparation');
      console.error('[ANALYSE STEP] Réponse brute (premiers 500 caractères):', content.substring(0, 500));
      
      return {
        success: false,
        error: "Désolé, l'IA n'a pas pu générer un format de réponse valide. Veuillez réessayer avec un devis plus clair.",
      };
    }

    const result = parseResult.data as AnalysisResult;
    console.log('[ANALYSE STEP] ✅ JSON parsé avec succès');

    // VALIDATION DE LA STRUCTURE
    console.log('[ANALYSE STEP] 🔍 Validation de la structure...');
    const structureValidation = validateAnalysisResult(result);
    if (!structureValidation.valid) {
      console.error('[ANALYSE STEP] ❌ Validation échouée:', structureValidation.error);
      console.error('[ANALYSE STEP] Données reçues:', JSON.stringify(result, null, 2));
      
      return {
        success: false,
        error: `Format de réponse invalide: ${structureValidation.error}. Veuillez réessayer avec un devis plus clair.`,
      };
    }

    console.log('[ANALYSE STEP] ✅ Analyse terminée avec succès');
    console.log(`[ANALYSE STEP] 👕 Vêtement analysé: ${result.item_analysis.brand} ${result.item_analysis.type}`);
    console.log(`[ANALYSE STEP] 📊 État estimé: ${result.item_analysis.condition_score}/10`);
    console.log(`[ANALYSE STEP] 💰 Prix recommandé: ${result.pricing.market_price}€`);

    return {
      success: true,
      data: result,
    };
    
  } catch (error) {
    console.error('[ANALYSE STEP] 💥 Erreur critique lors de l\'analyse:');
    console.error('[ANALYSE STEP] Erreur:', error);
    console.error('[ANALYSE STEP] Stack:', error instanceof Error ? error.stack : 'N/A');

    // Erreur spécifique OpenAI
    if (error instanceof Error && error.message.includes('API key')) {
      return {
        success: false,
        error: "Configuration API invalide. Veuillez contacter le support.",
      };
    }

    // Erreur réseau
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return {
        success: false,
        error: "Problème de connexion. Vérifiez votre connexion internet et réessayez.",
      };
    }

    // Erreur générique
    return {
      success: false,
      error: error instanceof Error 
        ? `Erreur technique: ${error.message}` 
        : "Une erreur inattendue est survenue. Veuillez réessayer.",
    };
  }
}

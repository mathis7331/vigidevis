"use server";

import OpenAI from "openai";
import { AnalysisResult } from "@/lib/types";
import { parseJSONWithRepair } from "@/lib/json-repair";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un Expert en Tarification et Lutte Anti-Fraude avec accès aux prix du marché français.

MISSION : Analyse ce devis LIGNE PAR LIGNE et compare chaque prix avec le marché actuel.

CRITIQUE : Tu ne dois répondre QUE par un objet JSON pur. Pas de texte avant, pas de texte après. Aucune balise markdown, aucun commentaire, aucune explication. UNIQUEMENT le JSON.

1. Identifie le type de devis (Garage, Plomberie, Dentiste, Électricité, etc.).
2. Pour CHAQUE ligne du devis (pièce, prestation, main d'œuvre), crée une entrée dans "line_items" avec :
   - item_name : Nom exact de la pièce/prestation
   - quoted_price : Prix affiché sur le devis (format: "XXX€" ou "XXX.XX€")
   - market_price : Prix moyen du marché français (Oscaro, Amazon, Tarif conventionné, etc.)
   - status : "ok" (prix correct, écart <15%), "warning" (écart 15-30%), "danger" (écart >30%)
   - comment : Explication courte (ex: "3x le prix Amazon", "Tarif conventionnel OK", "Main d'œuvre excessive")

3. Analyse globale :
   - trust_score : Note de 0 à 100 (100 = parfait, 0 = arnaque totale)
   - verdict : Résumé en 2 phrases maximum
   - red_flags : Liste des problèmes majeurs détectés
   - fair_price_estimate : Estimation du prix juste total
   - negotiation_tip : Message de négociation COMPLET structuré ainsi :
     • Formule de politesse d'ouverture (Bonjour)
     • Contexte : J'ai bien reçu votre devis...
     • Problème identifié : En comparant avec les prix du marché...
     • Demande de négociation : Je souhaiterais discuter...
     • Formule de politesse de clôture (Cordialement)

STRUCTURE JSON EXACTE À RETOURNER (copie ce format exactement) :
{
  "category": "ex: Mécanique Auto",
  "trust_score": 85,
  "verdict": "Court résumé du problème ou validation (max 2 phrases)",
  "red_flags": ["Problème 1", "Problème 2"],
  "fair_price_estimate": "350€ - 420€",
  "negotiation_tip": "Bonjour,\n\nJ'ai bien reçu votre devis pour [service]. Après avoir comparé avec les prix du marché actuel, j'ai remarqué que certains postes semblent au-dessus des tarifs pratiqués (notamment [exemple précis]). Seriez-vous disposé à revoir certains montants pour nous rapprocher des prix moyens du secteur ?\n\nJe reste à votre disposition pour en discuter.\n\nCordialement",
  "line_items": [
    {
      "item_name": "Plaquettes de frein avant",
      "quoted_price": "180€",
      "market_price": "60€",
      "status": "danger",
      "comment": "3x le prix Amazon/Oscaro"
    }
  ]
}

RÈGLES STRICTES :
- NE commence PAS par "Voici l'analyse..." ou tout autre texte
- NE mets PAS de balises \`\`\`json ou \`\`\`
- Retourne UNIQUEMENT le JSON, rien d'autre
- Tous les champs sont OBLIGATOIRES
- line_items doit contenir AU MOINS une ligne
- Sois PRÉCIS dans les prix du marché (utilise tes connaissances des prix réels en France)
- Pour "negotiation_tip" : écris un MESSAGE COMPLET avec bonjour, contexte, problème, négociation et formule de politesse (prêt à être copié/collé ou envoyé par SMS)`;

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
              text: `Analyse ce devis${category ? ` dans la catégorie ${category}` : ''} et retourne UNIQUEMENT le JSON demandé, sans markdown, sans texte explicatif.${category ? ` L'utilisateur a sélectionné "${category}", donc priorise l'analyse pour ce type de devis.` : ''}`,
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
  // Vérification des champs obligatoires
  const requiredFields = [
    'category',
    'trust_score',
    'verdict',
    'red_flags',
    'fair_price_estimate',
    'negotiation_tip',
    'line_items'
  ];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      return { valid: false, error: `Champ manquant: ${field}` };
    }
  }
  
  // Vérification des types
  if (typeof data.category !== 'string') {
    return { valid: false, error: 'category doit être une string' };
  }
  
  if (typeof data.trust_score !== 'number') {
    return { valid: false, error: 'trust_score doit être un number' };
  }
  
  if (typeof data.verdict !== 'string') {
    return { valid: false, error: 'verdict doit être une string' };
  }
  
  if (!Array.isArray(data.red_flags)) {
    return { valid: false, error: 'red_flags doit être un array' };
  }
  
  if (typeof data.fair_price_estimate !== 'string') {
    return { valid: false, error: 'fair_price_estimate doit être une string' };
  }
  
  if (typeof data.negotiation_tip !== 'string') {
    return { valid: false, error: 'negotiation_tip doit être une string' };
  }
  
  if (!Array.isArray(data.line_items)) {
    return { valid: false, error: 'line_items doit être un array' };
  }
  
  if (data.line_items.length === 0) {
    return { valid: false, error: 'line_items ne peut pas être vide' };
  }
  
  // Vérification de chaque line_item
  for (let i = 0; i < data.line_items.length; i++) {
    const item = data.line_items[i];
    const requiredItemFields = ['item_name', 'quoted_price', 'market_price', 'status', 'comment'];
    
    for (const field of requiredItemFields) {
      if (!(field in item)) {
        return { valid: false, error: `line_items[${i}] manque le champ: ${field}` };
      }
    }
    
    if (!['ok', 'warning', 'danger'].includes(item.status)) {
      return { valid: false, error: `line_items[${i}].status doit être "ok", "warning" ou "danger"` };
    }
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

    // Normalisation du trust_score
    result.trust_score = Math.max(0, Math.min(100, result.trust_score));

    console.log('[ANALYSE STEP] ✅ Analyse terminée avec succès');
    console.log(`[ANALYSE STEP] 📊 Score de confiance: ${result.trust_score}/100`);
    console.log(`[ANALYSE STEP] 📝 ${result.line_items.length} ligne(s) analysée(s)`);
    console.log(`[ANALYSE STEP] 🏷️ Catégorie: ${result.category}`);

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

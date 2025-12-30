/**
 * Utilitaire de réparation et nettoyage de JSON pour les réponses IA
 * Gère les cas où l'IA ajoute du texte avant/après le JSON ou utilise markdown
 */

/**
 * Nettoie la réponse de l'IA pour extraire le JSON pur
 * @param content - Réponse brute de l'IA
 * @returns JSON nettoyé prêt à être parsé
 */
export function cleanAIResponse(content: string): string {
  let cleaned = content.trim();
  
  // Étape 1 : Supprimer les balises markdown
  cleaned = cleaned.replace(/```json\n?/gi, '');
  cleaned = cleaned.replace(/```\n?/g, '');
  cleaned = cleaned.replace(/```json/gi, '');
  
  // Étape 2 : Supprimer les textes avant le premier {
  const jsonStart = cleaned.indexOf('{');
  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }
  
  // Étape 3 : Supprimer les textes après le dernier }
  // On cherche le dernier } qui correspond au JSON principal
  let braceCount = 0;
  let lastValidBrace = -1;
  
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++;
    if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        lastValidBrace = i;
      }
    }
  }
  
  if (lastValidBrace > 0 && lastValidBrace < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastValidBrace + 1);
  } else {
    // Fallback : utiliser lastIndexOf
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonEnd > 0 && jsonEnd < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }
  }
  
  return cleaned.trim();
}

/**
 * Extrait le JSON d'une chaîne en utilisant une regex si le parsing échoue
 * @param content - Contenu à analyser
 * @returns JSON extrait ou null si impossible
 */
export function extractJSONWithRegex(content: string): string | null {
  // Regex pour trouver un objet JSON complet
  const jsonRegex = /\{[\s\S]*\}/;
  const match = content.match(jsonRegex);
  
  if (match && match[0]) {
    return match[0];
  }
  
  return null;
}

/**
 * Parse JSON avec réparation automatique en cas d'échec
 * @param content - Contenu à parser
 * @returns Objet parsé ou null si impossible
 */
export function parseJSONWithRepair(content: string): { success: boolean; data?: any; error?: string } {
  // Tentative 1 : Parsing direct
  try {
    const parsed = JSON.parse(content);
    return { success: true, data: parsed };
  } catch (error) {
    console.log('[JSON Repair] Tentative 1 échouée, nettoyage en cours...');
  }
  
  // Tentative 2 : Nettoyage puis parsing
  try {
    const cleaned = cleanAIResponse(content);
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed };
  } catch (error) {
    console.log('[JSON Repair] Tentative 2 échouée, extraction regex en cours...');
  }
  
  // Tentative 3 : Extraction regex puis parsing
  try {
    const extracted = extractJSONWithRegex(content);
    if (extracted) {
      const cleaned = cleanAIResponse(extracted);
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed };
    }
  } catch (error) {
    console.log('[JSON Repair] Tentative 3 échouée');
  }
  
  // Tentative 4 : Nettoyage agressif (supprime tout sauf les caractères JSON valides)
  try {
    // Garder seulement les caractères valides pour JSON
    let aggressive = content.replace(/[^\x20-\x7E\n\r\t]/g, '');
    // Trouver le premier { et dernier }
    const firstBrace = aggressive.indexOf('{');
    const lastBrace = aggressive.lastIndexOf('}');
    
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      aggressive = aggressive.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(aggressive);
      return { success: true, data: parsed };
    }
  } catch (error) {
    console.log('[JSON Repair] Tentative 4 échouée');
  }
  
  return {
    success: false,
    error: 'Impossible de parser le JSON après toutes les tentatives de réparation',
  };
}











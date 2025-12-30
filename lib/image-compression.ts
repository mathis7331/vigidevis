/**
 * Utilitaire de compression d'images côté client
 * Compresse les images si elles dépassent 4MB pour éviter de saturer Vercel KV
 */

const MAX_SIZE_BEFORE_COMPRESSION = 4 * 1024 * 1024; // 4MB
const TARGET_SIZE = 2 * 1024 * 1024; // 2MB cible après compression
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.85; // Qualité JPEG (0.85 = 85%)

/**
 * Compresse une image si nécessaire
 * @param file - Fichier image à compresser
 * @returns Promise<string> - Base64 de l'image compressée ou originale
 */
export async function compressImageIfNeeded(file: File): Promise<string> {
  // Si le fichier est déjà petit, pas besoin de compression
  if (file.size <= MAX_SIZE_BEFORE_COMPRESSION) {
    console.log(`[Image Compression] Fichier ${(file.size / 1024 / 1024).toFixed(2)}MB < 4MB, pas de compression nécessaire`);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  console.log(`[Image Compression] Fichier ${(file.size / 1024 / 1024).toFixed(2)}MB > 4MB, compression en cours...`);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculer les nouvelles dimensions (maintenir le ratio)
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Créer un canvas pour redimensionner et compresser
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'));
        return;
      }

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en base64 avec compression
      let quality = QUALITY;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let size = getBase64Size(dataUrl);

      // Ajuster la qualité si nécessaire pour atteindre la taille cible
      while (size > TARGET_SIZE && quality > 0.5) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        size = getBase64Size(dataUrl);
      }

      const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const compressedSizeMB = (size / 1024 / 1024).toFixed(2);
      console.log(`[Image Compression] ✅ Compressé de ${originalSizeMB}MB à ${compressedSizeMB}MB (qualité: ${(quality * 100).toFixed(0)}%)`);

      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    // Charger l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calcule la taille approximative d'une chaîne base64 en bytes
 */
function getBase64Size(base64: string): number {
  // Base64 ajoute ~33% de taille par rapport au binaire
  // On soustrait le préfixe "data:image/jpeg;base64," (environ 23 caractères)
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  return (base64Data.length * 3) / 4;
}











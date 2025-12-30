"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shirt, Sparkles, Camera } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { createPendingAnalysis } from "@/actions/create-pending-analysis";
import { compressImageIfNeeded } from "@/lib/image-compression";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Format invalide', { description: 'Utilisez JPG ou PNG.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux', { description: 'Maximum 10MB.' });
      return;
    }

    try {
      setIsAnalyzing(true);
      setShowProgress(false);
      toast.loading('Preparation de ton vetement...', { id: 'upload' });

      const reader = new FileReader();
      reader.onload = async () => {
        let base64 = reader.result as string;

        try {
          base64 = await compressImageIfNeeded(file);
        } catch (compressionError) {
          console.error('Compression error:', compressionError);
        }

        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

        try {
          const checkResponse = await fetch('/api/check-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data }),
          });

          const checkData = await checkResponse.json();

          if (!checkData.success || !checkData.valid) {
            toast.error('Photo non reconnue', {
              id: 'upload',
              description: "Assure-toi que la photo montre bien un vetement."
            });
            setIsAnalyzing(false);
            return;
          }

          toast.loading('Sauvegarde en cours...', { id: 'upload' });
          const saveResult = await createPendingAnalysis(base64Data);

          if (saveResult.success && saveResult.id) {
            toast.success('Vetement pret !', { id: 'upload' });
            setShowProgress(false);
            setIsAnalyzing(false);
            router.push(`/rapport/${saveResult.id}`);
          } else {
            toast.error('Erreur', { id: 'upload', description: saveResult.error });
            setIsAnalyzing(false);
          }
        } catch (error) {
          toast.error('Erreur reseau', { id: 'upload' });
          setIsAnalyzing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erreur', { description: error instanceof Error ? error.message : 'Erreur inattendue' });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">VINTED-TURBO</h1>
        <p className="text-lg mb-8">Application en cours de chargement...</p>

        <div id="upload" className="max-w-md mx-auto">
          <UploadZone onFileSelect={handleFileSelect} disabled={isAnalyzing} />
        </div>
      </div>

      {showProgress && <AnalysisProgress />}
    </div>
  );
}
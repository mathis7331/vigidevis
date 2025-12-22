"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisProgress } from "@/components/AnalysisProgress";

export default function DemoPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Rediriger vers le rapport de démo une fois l'animation terminée
    router.push("/rapport/DEMO12345");
  };

  return <AnalysisProgress onComplete={handleComplete} />;
}






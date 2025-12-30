"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisProgress } from "@/components/AnalysisProgress";

export default function DemoPage() {
  const router = useRouter();
  const [showProgress, setShowProgress] = useState(true);

  useEffect(() => {
    // Afficher AnalysisProgress pendant 3,1 secondes puis rediriger
    const timer = setTimeout(() => {
      setShowProgress(false);
      router.push("/rapport/DEMO12345");
    }, 3100); // 3,1 secondes exactement

    return () => clearTimeout(timer);
  }, [router]);

  if (!showProgress) {
    return null; // Pendant la redirection
  }

  return <AnalysisProgress />;
}






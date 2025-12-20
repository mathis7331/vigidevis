"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisProgress } from "@/components/AnalysisProgress";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Simuler l'analyse pendant 3 secondes
    const timer = setTimeout(() => {
      // Redirect vers le rapport de démo
      router.push("/rapport/DEMO12345");
    }, 3100);

    return () => clearTimeout(timer);
  }, [router]);

  return <AnalysisProgress onComplete={() => {}} />;
}




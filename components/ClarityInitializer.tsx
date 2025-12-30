"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

/**
 * Composant d'initialisation de Microsoft Clarity Analytics
 * 
 * Ce composant initialise Clarity côté client uniquement pour éviter
 * tout problème avec le rendu serveur (SSR).
 * 
 * Project ID: urot4t9p0j
 */
export default function ClarityInitializer() {
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === "undefined") {
      return;
    }

    // Initialiser Clarity avec le Project ID
    const projectId = "urot4t9p0j";
    
    try {
      Clarity.init(projectId);
      console.log("[Clarity] Initialized successfully");
    } catch (error) {
      console.error("[Clarity] Failed to initialize:", error);
    }
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}









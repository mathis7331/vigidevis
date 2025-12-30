"use client";

import { useEffect } from "react";

export function FaviconHead() {
  useEffect(() => {
    // Vérifier si la balise existe déjà
    const existingLink = document.querySelector('link[rel="shortcut icon"]');
    
    if (!existingLink) {
      // Créer et ajouter la balise shortcut icon pour Googlebot
      const link = document.createElement("link");
      link.rel = "shortcut icon";
      link.href = "/favicon.png";
      link.type = "image/png";
      document.head.appendChild(link);
    }
  }, []);

  return null;
}



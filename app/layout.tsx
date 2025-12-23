import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VigiDevis - Vérificateur de Devis Intelligent",
  description: "L'IA analyse vos devis ligne par ligne en 3 secondes. 185 000€ d'économies détectées ce mois-ci.",
  openGraph: {
    title: "VigiDevis - Ne payez plus jamais trop cher",
    description: "L'IA analyse vos devis ligne par ligne. 185 000€ d'économies détectées.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <Toaster 
          position="top-center" 
          richColors 
          expand={true}
          duration={4000}
        />
      </body>
    </html>
  );
}





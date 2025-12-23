import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VigiDevis - Vérificateur de Devis Intelligent",
  description: "L'IA analyse vos devis ligne par ligne en 3 secondes. 185 000€ d'économies détectées ce mois-ci.",
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: "VigiDevis - Ne payez plus jamais trop cher",
    description: "L'IA analyse vos devis ligne par ligne. 185 000€ d'économies détectées.",
    type: 'website',
    images: ['/logo.png'],
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
        {children}
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





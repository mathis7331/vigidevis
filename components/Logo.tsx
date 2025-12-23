"use client";

import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const sizes = {
  sm: { container: "w-8 h-8", image: 32 },
  md: { container: "w-11 h-11", image: 44 },
  lg: { container: "w-16 h-16", image: 64 },
  xl: { container: "w-24 h-24", image: 96 },
};

export function Logo({ size = "md", className = "", showText = true }: LogoProps) {
  const sizeConfig = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeConfig.container} relative flex-shrink-0`}>
        <Image
          src="/logo.png"
          alt="VigiDevis Logo"
          width={sizeConfig.image}
          height={sizeConfig.image}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            VigiDevis
          </h1>
          {size === "md" && (
            <p className="text-xs text-gray-500 hidden sm:block">Analyse IA de devis</p>
          )}
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = "md", className = "" }: Omit<LogoProps, "showText">) {
  const sizeConfig = sizes[size];

  return (
    <div className={`${sizeConfig.container} relative flex-shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="VigiDevis"
        width={sizeConfig.image}
        height={sizeConfig.image}
        className="object-contain"
        priority
      />
    </div>
  );
}


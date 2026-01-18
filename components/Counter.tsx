"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function Counter({ 
  from = 0, 
  to, 
  duration = 1.5, 
  prefix = "",
  suffix = "",
  decimals = 0,
  className = ""
}: CounterProps) {
  const spring = useSpring(from, {
    stiffness: 50,
    damping: 30,
  });
  const display = useTransform(spring, (current) => {
    const value = Math.floor(current * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return `${prefix}${value.toLocaleString('fr-FR', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    })}${suffix}`;
  });

  useEffect(() => {
    spring.set(to);
  }, [spring, to]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}


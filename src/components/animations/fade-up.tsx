"use client";

import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function FadeUp({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

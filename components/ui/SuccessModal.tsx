// components/ui/SuccessModal.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  description: string;
  onClose?: () => void;
}

export default function SuccessModal({
  isOpen,
  title = "Succès !",
  description,
  onClose,
}: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-(--bg-secondary) p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15"
            >
              <Check className="h-8 w-8 text-emerald-500" />
            </motion.div>

            <h2 className="text-xl font-semibold text-(--text-primary)">
              {title}
            </h2>
            <p className="mt-2 text-sm text-(--text-secondary)">
              {description}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

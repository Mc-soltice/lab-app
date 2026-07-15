"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch relative overflow-hidden">
      {/* Section gauche - Message de bienvenue (mobile: en haut, desktop: à gauche) */}
      <div className="md:w-1/2 bg-linear-to-br from-rose-50 via-purple-50 to-pink-50 flex flex-col justify-center p-6 lg:p-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <Link href="/" className="inline-block mb-4 md:mb-8">
            <motion.h1
              className="font-bold text-2xl md:text-3xl lg:text-4xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-[#03045E] font-semibold">
                Virtual&amp;Lab
              </span>
              <span className="text-[#90e0ef] font-semibold">Pro</span>
            </motion.h1>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-rose-500 to-purple-600 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full mb-3 md:mb-4 lg:mb-6">
              <span className="text-xs lg:text-sm font-medium">Initiative Féminine</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 bg-linear-to-r from-rose-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Bienvenue dans l&apos;espace dédié aux femmes leaders
            </h2>

            <p className="text-sm md:text-base lg:text-xl text-gray-700 mb-4 md:mb-6 lg:mb-8 leading-relaxed">
              Rejoignez une communauté qui célèbre, soutient et propulse les initiatives féminines.
              Ici, chaque femme trouve sa place pour grandir, innover et réussir.
            </p>

            <div className="space-y-2 md:space-y-3 lg:space-y-4 mb-4 md:mb-6 lg:mb-8">
              {[
                { text: "Développez votre réseau professionnel", delay: 0.4 },
                { text: "Accédez à des ressources exclusives", delay: 0.5 },
                { text: "Participez à nos événements inspirants", delay: 0.6 }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-gray-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.delay }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-rose-500 to-purple-600"></div>
                  <span className="text-xs md:text-sm lg:text-base">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="border-t border-gray-200 pt-3 md:pt-4 lg:pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-xs text-gray-500">
                Rejoignez plus de 10 000 femmes qui transforment leur avenir avec Virtual&amp;Lab Pro
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Section droite - Formulaire (mobile: en bas, desktop: à droite) */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(-225deg, #7742B2 0%, #F180FF 52%, #FD8BD9 100%)'
        }}
      >
        <div className="relative z-10 w-full max-w-md px-2 sm:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}
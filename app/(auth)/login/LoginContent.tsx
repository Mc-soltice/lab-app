"use client";

import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

import facebook from "@/assets/facebook.svg";
import google from "@/assets/Google.svg";
import logo from "@/assets/logo.svg";

export default function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);

  // Variantes d'animation pour les champs - PLUS LENTES
  const fieldVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 80,
        duration: 0.6,
      },
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: "easeInOut" as const,
      },
    },
  };

  // Variantes pour les boutons sociaux - PLUS LENTES
  const socialVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.15,
        type: "spring" as const,
        damping: 15,
        stiffness: 80,
        duration: 0.5,
      },
    }),
    exit: {
      opacity: 0,
      y: -30,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  // Variantes pour le titre
  const titleVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-100 p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="flex flex-col w-full max-w-185 rounded-[30px] bg-white p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.10)] md:flex-row"
      >
        {/* HERO avec vagues */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex-1 overflow-hidden rounded-3xl min-h-55 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at center,#eaf5fd 0%,#cfe7fa 45%,#55acee 100%)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="absolute bottom-0 w-full h-[200%]"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C300,120 600,0 900,60 C1050,90 1150,60 1200,60 L1200,120 L0,120 Z"
                fill="rgba(255,255,255,0.3)"
                className="wave wave1"
              />
              <path
                d="M0,80 C200,40 500,100 800,60 C1000,30 1100,70 1200,60 L1200,120 L0,120 Z"
                fill="rgba(255,255,255,0.2)"
                className="wave wave2"
              />
              <path
                d="M0,70 C250,30 550,90 850,50 C1050,30 1150,50 1200,50 L1200,120 L0,120 Z"
                fill="rgba(255,255,255,0.15)"
                className="wave wave3"
              />
            </svg>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.9, type: "spring" }}
              className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/20 animate-float"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.9, type: "spring" }}
              className="absolute bottom-20 right-10 w-12 h-12 rounded-full bg-white/20 animate-float-delayed"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.9, type: "spring" }}
              className="absolute top-1/3 right-20 w-8 h-8 rounded-full bg-white/20 animate-float"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="relative z-10 text-center text-white px-6"
          >
            <motion.h2
              key={isLogin ? "login-title" : "register-title"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15, duration: 0.6 }}
              className="text-3xl font-bold mb-3"
            >
              {isLogin ? "Welcome Back!" : "Join Us!"}
            </motion.h2>
            <motion.p
              key={isLogin ? "login-sub" : "register-sub"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white/90 text-sm"
            >
              {isLogin
                ? "Sign in to continue your journey"
                : "Create your account and start exploring"}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* FORM */}
        <motion.form
          className="flex-1 flex flex-col px-4.5 py-7.5 md:p-7.5 overflow-hidden"
          onSubmit={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center"
          >
            <Image
              src={logo}
              alt="Logo"
              width={110}
              height={26}
              className="mx-auto mb-3 h-6.5 w-auto"
            />
          </motion.div>

          <motion.h3
            key={isLogin ? "login-heading" : "register-heading"}
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-center text-sm font-medium mb-3"
          >
            {isLogin ? "Login to your account" : "Create your account"}
          </motion.h3>

          {/* CONTENEUR AVEC HAUTEUR MINIMUM FIXE */}
          <div className="flex flex-col gap-3 min-h-[300px]">
            {/* Boutons sociaux - uniquement en login */}
            <AnimatePresence mode="wait">
              {isLogin && (
                <motion.div
                  key="social-buttons"
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeInOut",
                      staggerChildren: 0.15,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -20,
                    transition: {
                      duration: 0.4,
                      ease: "easeInOut",
                    },
                  }}
                  className="flex flex-row gap-2 md:flex-col overflow-hidden"
                >
                  <motion.button
                    custom={0}
                    variants={socialVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/home" })}
                    className="p-4 flex-1 rounded-xl bg-[#f0f0f0] flex items-center justify-center gap-2.5 transition hover:bg-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Image src={google} alt="Google" width={24} height={24} />
                    <p className="text-[#5c5c5c]">
                      <span className="hidden md:inline">Login with </span>
                      Google
                    </p>
                  </motion.button>

                  <motion.button
                    custom={1}
                    variants={socialVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    type="button"
                    className="p-4 flex-1 rounded-xl bg-[#f0f0f0] flex items-center justify-center gap-2.5 transition hover:bg-gray-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Image
                      src={facebook}
                      alt="Facebook"
                      width={24}
                      height={24}
                    />
                    <p className="text-[#5c5c5c]">
                      <span className="hidden md:inline">Login with </span>
                      Facebook
                    </p>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Séparateur "Or" */}
            <AnimatePresence mode="wait">
              {isLogin && (
                <motion.div
                  key="separator"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeInOut",
                      delay: 0.1,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -10,
                    transition: {
                      duration: 0.3,
                      ease: "easeInOut",
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-black/20"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-500">
                        Or
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CHAMPS */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {/* Champs de registration (nom, username) */}
                {!isLogin && (
                  <motion.div
                    key="register-fields"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.5,
                        ease: "easeOut",
                        staggerChildren: 0.15,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      transition: {
                        duration: 0.4,
                        ease: "easeIn",
                      },
                    }}
                    className="space-y-3"
                  >
                    <motion.input
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      type="text"
                      placeholder="Full Name"
                      className="w-full rounded-xl bg-[#efefef] p-4 outline-none placeholder:text-[#9e9e9e] focus:ring-2 focus:ring-sky-400"
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 2px #38bdf8",
                      }}
                      transition={{ type: "spring", damping: 20 }}
                    />
                    <motion.input
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      type="text"
                      placeholder="Username"
                      className="w-full rounded-xl bg-[#efefef] p-4 outline-none placeholder:text-[#9e9e9e] focus:ring-2 focus:ring-sky-400"
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 2px #38bdf8",
                      }}
                      transition={{ type: "spring", damping: 20 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Champs communs (email, password) */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    duration: 0.4,
                    delay: 0.1,
                  },
                }}
              >
                <motion.input
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-xl bg-[#efefef] p-4 outline-none placeholder:text-[#9e9e9e] focus:ring-2 focus:ring-sky-400"
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #38bdf8" }}
                  transition={{ type: "spring", damping: 20 }}
                />

                <motion.input
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-xl bg-[#efefef] p-4 outline-none placeholder:text-[#9e9e9e] focus:ring-2 focus:ring-sky-400"
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #38bdf8" }}
                  transition={{ type: "spring", damping: 20 }}
                />

                {/* Confirm Password - uniquement en register */}
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.input
                      key="confirm-password"
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full rounded-xl bg-[#efefef] p-4 outline-none placeholder:text-[#9e9e9e] focus:ring-2 focus:ring-sky-400"
                      whileFocus={{
                        scale: 1.02,
                        boxShadow: "0 0 0 2px #38bdf8",
                      }}
                      transition={{ type: "spring", damping: 20 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-3 p-4 rounded-xl bg-[#332e2e] text-white font-medium transition hover:bg-black relative overflow-hidden"
          >
            <motion.span
              key={isLogin ? "login-btn" : "register-btn"}
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.4 },
              }}
              exit={{
                opacity: 0,
                y: -15,
                transition: { duration: 0.3 },
              }}
              className="relative z-10"
            >
              {isLogin ? "Login" : "Register"}
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-sky-400 to-blue-500"
              initial={{ x: "-100%" }}
              whileHover={{ x: "0%" }}
              transition={{ duration: 0.4 }}
            />
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.4, duration: 0.5 },
            }}
            className="text-center text-sm mt-2"
          >
            <span className="text-gray-500">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <motion.button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sky-500 font-medium hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLogin ? "Register" : "Login"}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>

      <style jsx>{`
        .wave {
          animation: wave 7s ease-in-out infinite;
        }
        .wave1 {
          animation: wave 7s ease-in-out infinite;
        }
        .wave2 {
          animation: wave 10s ease-in-out infinite reverse;
        }
        .wave3 {
          animation: wave 13s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes wave {
          0%,
          100% {
            transform: translateX(0px) translateY(0px);
          }
          25% {
            transform: translateX(-50px) translateY(10px);
          }
          50% {
            transform: translateX(0px) translateY(-10px);
          }
          75% {
            transform: translateX(50px) translateY(10px);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
}

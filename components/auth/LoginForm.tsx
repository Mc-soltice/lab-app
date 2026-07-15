// components/auth/LoginForm.tsx
"use client";

import GoogleButton from "@/components/auth/AuthButtons";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

// Importer les hooks générés par Orval
import {
  useAuthControllerLogin,
  useAuthControllerRegister,
} from "@/app/api/generated/endpoints/auth/auth";
import type { LoginDto, RegisterDto } from "@/app/api/generated/models";

// Correction des types pour Framer Motion
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

const formVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, staggerChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(
    searchParams.get("mode") !== "register",
  );
  const [showPassword, setShowPassword] = useState(false);

  // 📌 Utiliser les hooks Orval
  const loginMutation = useAuthControllerLogin();
  const registerMutation = useAuthControllerRegister();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    password_confirmation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // 📌 1. Appel au backend via Orval
        await loginMutation.mutateAsync({
          data: {
            email: formData.email,
            password: formData.password,
          } as LoginDto,
        });

        // 📌 2. Connexion avec NextAuth en utilisant les identifiants
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Erreur de connexion: " + result.error);
          return;
        }

        toast.success("Connexion réussie !");
        router.replace("/home");
        router.refresh();
      } else {
        // Inscription
        if (formData.password !== formData.password_confirmation) {
          toast.error("Les mots de passe ne correspondent pas");
          return;
        }

        // 📌 1. Appel au backend via Orval pour l'inscription
        await registerMutation.mutateAsync({
          data: {
            username: formData.email.split("@")[0],
            email: formData.email,
            password: formData.password,
          } as RegisterDto,
        });

        // 📌 2. Connexion automatique après inscription
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Erreur lors de la connexion automatique");
          return;
        }

        toast.success("Compte créé avec succès !");
        router.replace("/home");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Erreur lors de l'authentification:", error);

      // Gestion des erreurs formatées par le backend
      if (error?.message) {
        toast.error(error.message);
      } else if (error?.error) {
        toast.error(error.error);
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      password_confirmation: "",
    });
  };

  // 📌 Utiliser l'état de chargement des mutations
  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="bg-white/10 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 lg:p-8">
          <motion.div
            className="text-center mb-6 lg:mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.p
              className="text-xl lg:text-2xl font-semibold text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isLogin
                ? "Connectez-vous à votre compte"
                : "Rejoignez notre communauté"}
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "register"}
              onSubmit={handleSubmit}
              className="space-y-4 lg:space-y-5"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-white/80 mb-1 lg:mb-2">
                        Prénom
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-300" />
                        </div>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Prénom"
                          className="w-full px-3 py-2 lg:px-4 lg:py-3 pl-8 lg:pl-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 text-sm lg:text-base"
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-white/80 mb-1 lg:mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Nom"
                        className="w-full px-3 py-2 lg:px-4 lg:py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 text-sm lg:text-base"
                        required={!isLogin}
                      />
                    </motion.div>
                  </div>
                </>
              )}

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-white/80 mb-1 lg:mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-300" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemple.com"
                    className="w-full px-3 py-2 lg:px-4 lg:py-3 pl-8 lg:pl-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 text-sm lg:text-base"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-white/80 mb-1 lg:mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 lg:px-4 lg:py-3 pl-8 lg:pl-10 pr-10 lg:pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 text-sm lg:text-base"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-300 hover:text-emerald-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {!isLogin && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-white/80 mb-1 lg:mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 lg:px-4 lg:py-3 pl-8 lg:pl-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200 text-sm lg:text-base"
                      required={!isLogin}
                      minLength={8}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl"></div>
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative px-4 py-2.5 lg:px-6 lg:py-3 text-white font-semibold flex items-center justify-center gap-2 text-sm lg:text-base">
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span>
                          {isLogin ? "Connexion..." : "Inscription..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{isLogin ? "Connexion" : "Créer un compte"}</span>
                        <motion.div
                          initial={{ x: 0 }}
                          animate={{ x: [0, 5, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        >
                          <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            </motion.form>
          </AnimatePresence>

          {isLogin && (
            <motion.div
              className="mt-5 lg:mt-6 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GoogleButton />
            </motion.div>
          )}

          {!isLogin && (
            <motion.div
              className="mt-5 lg:mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-white/40">ou</span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            className="text-center mt-5 lg:mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-white/90 text-xs lg:text-sm">
              {isLogin ? "Pas encore de compte?" : "Déjà un compte?"}
              <motion.button
                onClick={toggleAuthMode}
                className="ml-2 text-emerald-300 font-semibold hover:text-emerald-200 transition-colors text-xs lg:text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </motion.button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

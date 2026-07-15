// src/components/blog/users/UserProfileCard.tsx
"use client";

import ProductImage from "@/components/ProductImage";
import type {
  update_user_request,
  user_response,
} from "@/types/blog/user.types";
import { motion } from "framer-motion";
import { Edit2, Mail, Save, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface UserProfileCardProps {
  user: user_response;
  isCurrentUser?: boolean;
  onUpdate?: (data: update_user_request) => Promise<void>;
  onDelete?: () => Promise<void>;
  postsCount?: number;
  podcastsCount?: number;
  booksCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export function UserProfileCard({
  user,
  isCurrentUser = false,
  onUpdate,
  onDelete,
  postsCount = 0,
  podcastsCount = 0,
  booksCount = 0,
  followersCount = 0,
  followingCount = 0,
}: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedUser, setEditedUser] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    bio: user.bio || "",
    image: user.image || "",
  });

  // Formatage de la date d'adhésion
  const memberSince = new Date(user.created_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Nom complet de l'utilisateur
  const fullName =
    `${editedUser.first_name} ${editedUser.last_name}`.trim() ||
    "Utilisateur·ice";

  // Avatar par défaut si pas d'image
  const avatarUrl = isEditing ? editedUser.image : user.image;
  const displayAvatar =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=8B5CF6&color=fff&size=128`;

  // Gestion des changements dans le formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Sauvegarde du profil
  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate(editedUser);
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès ! ✊");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  // Annulation de l'édition
  const handleCancel = () => {
    setEditedUser({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      bio: user.bio || "",
      image: user.image || "",
    });
    setIsEditing(false);
  };

  // Suppression du compte
  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = confirm(
      "Es-tu sûr·e de vouloir supprimer ton compte ? Cette action est irréversible.",
    );
    if (!confirmed) return;

    try {
      await onDelete();
      toast.success("Compte supprimé. Prends soin de toi 💜");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression du compte");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="frosted-glass-premium rounded-2xl p-6 sm:p-8 mb-8"
    >
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg shrink-0"
        >
          <ProductImage
            src={displayAvatar}
            alt={fullName}
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Profile Details */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="first_name"
                  value={editedUser.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all"
                  placeholder="Prénom"
                />
                <input
                  type="text"
                  name="last_name"
                  value={editedUser.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all"
                  placeholder="Nom"
                />
              </div>
              <textarea
                name="bio"
                value={editedUser.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all"
                placeholder="Parle-nous de toi..."
                rows={3}
              />
              <input
                type="url"
                name="image"
                value={editedUser.image}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all text-xs"
                placeholder="URL de l'avatar (optionnel)"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-display text-white">
                {fullName}
              </h1>
              {user.role && (
                <p className="text-cyan-300 font-semibold mb-3">
                  {user.role === "ADMIN" ? "Administrateur·ice" : "Membre"}
                </p>
              )}
              {user.bio && (
                <p className="text-white/80 mb-4 leading-relaxed">{user.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                {user.email && (
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    {user.email}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  Membre depuis {memberSince}
                </span>
              </div>
            </>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">
                {followersCount}
              </p>
              <p className="text-sm text-white/60">Abonné·es</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">
                {followingCount}
              </p>
              <p className="text-sm text-white/60">Abonnements</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">
                {postsCount + podcastsCount + booksCount}
              </p>
              <p className="text-sm text-white/60">Contenus</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:ml-auto">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-all"
              >
                <Save size={18} />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all border border-white/20"
              >
                <X size={18} />
                Annuler
              </motion.button>
              {isCurrentUser && onDelete && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-all border border-red-500/30"
                >
                  Supprimer le compte
                </motion.button>
              )}
            </>
          ) : (
            isCurrentUser && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all border border-white/20"
              >
                <Edit2 size={18} />
                Éditer le profil
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

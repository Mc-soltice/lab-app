import React, { useState, useEffect } from "react";

interface CircularProgressProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  strokeWidth?: number;
  color?: string;
  label?: string;
  showLabel?: boolean;
}

interface ProgressBarProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  label?: string;
  showPercentageText?: boolean;
  percentageSuffix?: string;
}

// Composant de cercle de progression
export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage = 0,
  size = "md",
  strokeWidth = 8,
  color = "orange",
  label = "Loading",
  showLabel = true,
}) => {
  const sizeConfig = {
    sm: { size: 120, fontSize: "24px" },
    md: { size: 180, fontSize: "48px" },
    lg: { size: 240, fontSize: "64px" },
  };

  const colorConfig: { [key: string]: string } = {
    orange: "#FF9500",
    blue: "#3B82F6",
    green: "#10B981",
    purple: "#A855F7",
    red: "#EF4444",
  };

  const config = sizeConfig[size];
  const radius = (config.size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {showLabel && (
        <h2 className="text-xl font-light text-gray-700 dark:text-gray-300">{label}</h2>
      )}

      <div className="relative" style={{ width: config.size, height: config.size }}>
        {/* SVG pour le cercle */}
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}
        >
          {/* Cercle de fond */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            className="dark:stroke-gray-700"
          />

          {/* Cercle de progression */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={colorConfig[color] || colorConfig.orange}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 8px ${colorConfig[color] || colorConfig.orange}22)`,
            }}
          />
        </svg>

        {/* Texte du pourcentage au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="font-bold text-gray-900 dark:text-white"
              style={{ fontSize: config.fontSize }}
            >
              {percentage}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de barre de progression
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage = 0,
  size = "md",
  color = "orange",
  label = "",
  showPercentageText = true,
  percentageSuffix = "Downloaded",
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    if (animatedPercentage > percentage) {
      setAnimatedPercentage(percentage);
      return;
    }

    const timer = setTimeout(() => {
      if (animatedPercentage < percentage) {
        setAnimatedPercentage((prev) => Math.min(prev + 1, percentage));
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [animatedPercentage, percentage]);

  const sizeConfig = {
    sm: { barHeight: "h-2", textSize: "text-xs" },
    md: { barHeight: "h-3", textSize: "text-sm" },
    lg: { barHeight: "h-4", textSize: "text-base" },
  };

  const colorConfig: { [key: string]: string } = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
  };

  const config = sizeConfig[size];

  return (
    <div className="w-full space-y-3">
      {/* Barre de progression */}
      <div
        className={`w-full ${config.barHeight} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-sm`}
      >
        <div
          className={`h-full ${colorConfig[color] || colorConfig.orange} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${animatedPercentage}%` }}
        ></div>
      </div>

      {/* Texte du label et pourcentage */}
      <div className="flex justify-between items-center">
        {label && (
          <span
            className={`${config.textSize} font-medium text-gray-700 dark:text-gray-300`}
          >
            {label}
          </span>
        )}
        {showPercentageText && (
          <span
            className={`${config.textSize} font-semibold text-gray-900 dark:text-white`}
          >
            {animatedPercentage}% {percentageSuffix}
          </span>
        )}
      </div>
    </div>
  );
};

// Page de démonstration
export default function Demo() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* En-tête */}
        <div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Composants de Chargement Avancés
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Cercles de progression et barres avec design moderne
          </p>
        </div>

        {/* Section Cercles */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Cercles de Progression
          </h2>

          {/* Tailles différentes */}
          <div className="mb-16">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-8">
              Variations de taille
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex justify-center">
                <CircularProgress
                  percentage={progress}
                  size="sm"
                  color="blue"
                  label="Petit"
                />
              </div>
              <div className="flex justify-center">
                <CircularProgress
                  percentage={progress}
                  size="md"
                  color="orange"
                  label="Moyen"
                />
              </div>
              <div className="flex justify-center">
                <CircularProgress
                  percentage={progress}
                  size="lg"
                  color="green"
                  label="Grand"
                />
              </div>
            </div>
          </div>

          {/* Couleurs */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-8">
              Variations de couleur
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {[
                { color: "orange", label: "Orange" },
                { color: "blue", label: "Bleu" },
                { color: "green", label: "Vert" },
                { color: "purple", label: "Violet" },
                { color: "red", label: "Rouge" },
              ].map((item) => (
                <div key={item.color} className="flex flex-col items-center gap-4">
                  <CircularProgress
                    percentage={progress}
                    size="md"
                    color={item.color}
                    showLabel={false}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Barres */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Barres de Progression
          </h2>

          <div className="space-y-12">
            {/* Petit */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Petit (sm)
              </h3>
              <ProgressBar
                percentage={progress}
                size="sm"
                color="blue"
                label="Téléchargement"
                showPercentageText
              />
            </div>

            {/* Moyen */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Moyen (md)
              </h3>
              <ProgressBar
                percentage={progress}
                size="md"
                color="orange"
                label="Traitement"
                showPercentageText
              />
            </div>

            {/* Grand */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Grand (lg)
              </h3>
              <ProgressBar
                percentage={progress}
                size="lg"
                color="green"
                label="Envoi"
                showPercentageText
              />
            </div>

            {/* Sans label */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Sans texte
              </h3>
              <ProgressBar
                percentage={progress}
                size="md"
                color="purple"
                showPercentageText={false}
              />
            </div>
          </div>

          {/* Toutes les couleurs */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-12">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-8">
              Variations de couleur
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { color: "orange", label: "Orange" },
                { color: "blue", label: "Bleu" },
                { color: "green", label: "Vert" },
                { color: "purple", label: "Violet" },
              ].map((item) => (
                <div key={item.color}>
                  <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide block mb-3">
                    {item.label}
                  </span>
                  <ProgressBar
                    percentage={progress}
                    size="md"
                    color={item.color}
                    showPercentageText={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Combined - Comme dans l'image */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Combinaison (Cercle + Barre)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Cercle */}
            <div className="flex justify-center">
              <CircularProgress
                percentage={progress}
                size="md"
                color="orange"
                label="Loading"
              />
            </div>

            {/* Barre */}
            <div className="flex flex-col justify-center">
              <ProgressBar
                percentage={progress}
                size="lg"
                color="orange"
                label=""
                showPercentageText
              />
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                {progress}% Downloaded
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

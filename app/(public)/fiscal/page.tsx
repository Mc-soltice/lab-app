import FiscalPageTemplate, {
  type FiscalService,
} from "@/components/fiscal/FiscalPageTemplate";
import {
  BadgeDollarSign,
  BookCheck,
  Building2,
  FileBarChart,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

const services: FiscalService[] = [
  {
    title: "TVA — Taxe sur la Valeur Ajoutée",
    description:
      "Suivi de la TVA, calcul, déclaration et conformité sur les opérations imposables.",
    href: "/fiscal/tva",
    badge: "TVA",
    icon: ReceiptText,
  },
  {
    title: "IS — Impôt sur les Sociétés",
    description:
      "Régularisation de l’impôt sur les sociétés, bilan fiscal et optimisation du cadre légal.",
    href: "/fiscal/is",
    badge: "IS",
    icon: Building2,
  },
  {
    title: "IRPP — Revenu des Personnes Physiques",
    description:
      "Déclaration des revenus, charges déductibles et stratégie de réduction conforme.",
    href: "/fiscal/irpp",
    badge: "IRPP",
    icon: BadgeDollarSign,
  },
  {
    title: "DSF — Déclaration Annuelle",
    description:
      "Préparation et contrôle des déclarations annuelles pour un suivi sans surprise.",
    href: "/fiscal/dsf",
    badge: "DSF",
    icon: FileBarChart,
  },
  {
    title: "Patente professionnelle",
    description:
      "Vérification du montant, attestation et conformité pour les activités commerciales.",
    href: "/fiscal/patente",
    badge: "Patente",
    icon: BookCheck,
  },
  {
    title: "Vérifier un NIU",
    description:
      "Contrôle rapide du numéro d’identification unique et des éléments de conformité.",
    href: "/fiscal/niu",
    badge: "NIU",
    icon: ShieldCheck,
  },
];

export default function FiscalPage() {
  return (
    <FiscalPageTemplate
      eyebrow="Fiscalité & conformité"
      title="Fiscalité pour entrepreneurs, TPE et PME"
      subtitle="Des outils clairs pour maîtriser les impôts, les déclarations et les obligations administratives."
      intro="LAB vous accompagne dans la gestion fiscale de votre activité : TVA, IS, IRPP, déclarations annuelles, NIU et conformité administrative. L’objectif est simple : sécuriser votre situation, respecter les délais et libérer votre énergie pour développer votre entreprise."
      highlights={[
        {
          label: "Délais",
          value: "100%",
          description: "Suivi des échéances et relances proactives.",
        },
        {
          label: "Conformité",
          value: "24/7",
          description: "Vérification des pièces et contrôle administratif.",
        },
        {
          label: "Accompagnement",
          value: "1:1",
          description: "Conseils personnalisés selon votre statut et votre activité.",
        },
      ]}
      services={services}
      checklist={[
        "Vérification des obligations fiscales et administratives selon votre activité.",
        "Contrôle des déclarations TVA, IS, IRPP et DSF.",
        "Analyse des pièces justificatives et suivi des échéances.",
        "Préparation des attestations et documents réglementaires.",
        "Conseils sur la structure de votre entreprise et la conformité DGI.",
        "Protection de votre dossier avec un support proactif et clair.",
      ]}
      faq={[
        {
          question: "Quand faut-il déclarer ses impôts ?",
          answer:
            "Les échéances varient selon votre statut et votre activité. Nous vous aidons à identifier les dates de dépôt, les pièces nécessaires et les mouvements à contrôler avant chaque période fiscale.",
        },
        {
          question: "Peut-on vérifier un NIU ou une attestation sans dossier complet ?",
          answer:
            "Oui. Une vérification préalable est possible pour contrôler le numéro, les pièces ou l’état d’un document administratif avant toute déclaration ou imposition majeure.",
        },
        {
          question: "Est-ce utile de faire un audit fiscal ?",
          answer:
            "Oui, surtout si votre activité évolue, si vous avez plusieurs clients ou si vous souhaitez sécuriser les déclarations de votre entreprise avant un contrôle ou une croissance rapide.",
        },
        {
          question: "Que faire si un document fiscal est manquant ?",
          answer:
            "Nous vous aidons à reconstruire le dossier, à sécuriser les pièces manquantes et à préparer une réponse conforme aux exigences de la DGI ou de l’administration concernée.",
        },
      ]}
      ctaLabel="Demander un accompagnement"
      ctaHref="/contact"
    />
  );
}

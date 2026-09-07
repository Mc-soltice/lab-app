import FiscalPageTemplate, { type FiscalService } from "@/components/fiscal/FiscalPageTemplate";
import {
    BadgeCheck,
    BadgeDollarSign,
    BookCheck,
    Building2,
    Calculator,
    FileBarChart,
    Landmark,
    ListChecks,
    ReceiptText,
    ShieldCheck,
    WalletCards,
} from "lucide-react";
import { notFound } from "next/navigation";

const fiscalData: Record<
  string,
  {
    title: string;
    subtitle: string;
    intro: string;
    highlights: Array<{ label: string; value: string; description: string }>;
    services: FiscalService[];
    checklist: string[];
    faq: Array<{ question: string; answer: string }>;
  }
> = {
  tva: {
    title: "TVA — Taxe sur la Valeur Ajoutée",
    subtitle: "Déclaration, calcul, suivi et optimisation de la TVA dans un cadre fiscal clair.",
    intro: "La TVA est l’un des éléments clés de la conformité fiscale d’une entreprise. Nous accompagnons les entrepreneurs dans la bonne déclaration, le contrôle des montants et la bonne gestion des opérations imposables.",
    highlights: [
      { label: "Base", value: "Taux", description: "Gestion des taux applicables à chaque activité." },
      { label: "Déclaration", value: "Mensuel", description: "Suivi des échéances et contrôle des montants." },
      { label: "Vérification", value: "100%", description: "Contrôle des pièces et conformité des montants." },
    ],
    services: [
      {
        title: "Déclaration de TVA",
        description: "Préparation et contrôle des montants à déclarer selon vos opérations et vos justificatifs.",
        href: "/fiscal/tva",
        badge: "TVA",
        icon: ReceiptText,
      },
      {
        title: "Suivi des taux",
        description: "Identification des cas soumis à taux normal, réduit ou exonéré selon votre activité.",
        href: "/fiscal/tva",
        badge: "Régles",
        icon: BookCheck,
      },
      {
        title: "Vérification de conformité",
        description: "Contrôle des montants, factures et pièces pour sécuriser les déclarations fiscales.",
        href: "/fiscal/tva",
        badge: "Contrôle",
        icon: ShieldCheck,
      },
    ],
    checklist: [
      "Identification des opérations imposables et des exonérations possibles.",
      "Contrôle des factures, taux et montants collectés.",
      "Préparation de la déclaration de TVA dans les délais requis.",
      "Analyse des écarts et rapprochement avec les écritures comptables.",
      "Conseil sur les bons régimes et la bonne organisation documentaire.",
    ],
    faq: [
      {
        question: "La TVA est-elle obligatoire pour toutes les entreprises ?",
        answer: "Pas toujours. Tout dépend du statut juridique, du régime d’imposition et du type d’activité. Nous vous aidons à vérifier si vous êtes assujetti et à quel taux.",
      },
      {
        question: "Faut-il déclarer la TVA chaque mois ?",
        answer: "Selon le régime dont relève votre entreprise, la périodicité varie. Nous vous assistons pour identifier les obligations exactes et respecter les délais.",
      },
    ],
  },
  is: {
    title: "IS — Impôt sur les Sociétés",
    subtitle: "Pilotage de l’impôt sur les sociétés et optimisation de la structure fiscale de l’entreprise.",
    intro: "L’impôt sur les sociétés demande une bonne compréhension du résultat fiscal, des amortissements et des éléments imposables. Nous aidons les PME à préparer et contrôler leurs déclarations avec rigueur.",
    highlights: [
      { label: "Résultat", value: "Fiscal", description: "Analyse du bénéfice imposable et des ajustements utiles." },
      { label: "Déclaration", value: "Annuelle", description: "Préparation et contrôle des éléments comptables et fiscaux." },
      { label: "Suivi", value: "Régulier", description: "Veille sur les délais, la documentation et la conformité." },
    ],
    services: [
      {
        title: "Calcul de l’IS",
        description: "Diagnostic du bénéfice fiscal et calcul des montants à déclarer selon le cadre juridique actuel.",
        href: "/fiscal/is",
        badge: "IS",
        icon: Building2,
      },
      {
        title: "Rapprochement comptable",
        description: "Contrôle des écarts entre comptabilité et fiscalité pour sécuriser la base imposable.",
        href: "/fiscal/is",
        badge: "Compta",
        icon: Calculator,
      },
      {
        title: "Optimisation fiscale",
        description: "Identification des leviers conformes pour mieux maîtriser l’imposition de la société.",
        href: "/fiscal/is",
        badge: "Stratégie",
        icon: Landmark,
      },
    ],
    checklist: [
      "Diagnostic du résultat fiscal et des éléments ajustables.",
      "Vérification des charges, provisions et amortissements.",
      "Contrôle des documents comptables et des pièces justificatives.",
      "Préparation de la déclaration selon les exigences en vigueur.",
      "Conformité avec la structure juridique de la société.",
    ],
    faq: [
      {
        question: "Un entrepreneur individuel peut-il être soumis à l’IS ?",
        answer: "Non en tant qu’individu. L’IS concerne plutôt les sociétés. Nous vous aidons à confirmer le bon régime selon votre statut.",
      },
      {
        question: "Que faut-il préparer pour la déclaration d’IS ?",
        answer: "Le bilan, les comptes annuels, les amortissements, les provisions et les éléments de résultat sont les éléments clés à organiser.",
      },
    ],
  },
  irpp: {
    title: "IRPP — Impôt sur le Revenu des Personnes Physiques",
    subtitle: "Déclaration de revenus, charges déductibles et stratégie de réduction conforme.",
    intro: "L’IRPP demande une bonne organisation des revenus, charges et justificatifs. Nous vous aidons à déclarer correctement et à identifier les éléments qui peuvent réduire votre base imposable dans le respect de la loi.",
    highlights: [
      { label: "Revenus", value: "Tous", description: "Analyse des revenus et éléments imposables." },
      { label: "Charges", value: "Déductibles", description: "Vérification des dépenses éligibles pour le calcul." },
      { label: "Déclaration", value: "Année", description: "Préparation de la déclaration dans les meilleurs délais." },
    ],
    services: [
      {
        title: "Déclaration IRPP",
        description: "Préparation de la déclaration et contrôle des éléments imposables selon votre situation.",
        href: "/fiscal/irpp",
        badge: "IRPP",
        icon: BadgeDollarSign,
      },
      {
        title: "Charges déductibles",
        description: "Analyse des dépenses admissibles pour mieux sécuriser le calcul de l’impôt.",
        href: "/fiscal/irpp",
        badge: "Charges",
        icon: WalletCards,
      },
      {
        title: "Suivi annuel",
        description: "Organisation des revenus et suivi des évolutions fiscales pour éviter les surprises.",
        href: "/fiscal/irpp",
        badge: "Suivi",
        icon: BadgeCheck,
      },
    ],
    checklist: [
      "Vérification des revenus et des sources de financement.",
      "Contrôle des charges professionnelles et personnelles déductibles.",
      "Préparation des déclarations selon la situation du contribuable.",
      "Analyse des révisions et ajustements possibles.",
      "Organisation de la documentation pour un traitement clair et rapide.",
    ],
    faq: [
      {
        question: "Quelle est la différence entre IRPP et IS ?",
        answer: "L’IRPP concerne les personnes physiques, tandis que l’IS s’applique aux sociétés. Les règles et les déclarations ne sont pas les mêmes.",
      },
      {
        question: "Peut-on corriger une déclaration déjà déposée ?",
        answer: "Oui, il est possible de corriger certains écarts ou d’apporter des précisions. Le plus important est d’agir rapidement et avec les justificatifs adéquats.",
      },
    ],
  },
  dsf: {
    title: "DSF — Déclaration Annuelle",
    subtitle: "Traçabilité, conformité et préparation de la déclaration annuelle de votre activité.",
    intro: "La déclaration annuelle reste un point central pour conserver une conformité claire et éviter des écarts de suivi. Nous aidons à organiser les éléments nécessaires pour une déclaration solide et sérieuse.",
    highlights: [
      { label: "Documents", value: "Complets", description: "Vérification des pièces et éléments à fournir." },
      { label: "Délai", value: "Anticipé", description: "Préparation avant la date d’échéance pour éviter les erreurs." },
      { label: "Sécurité", value: "Rigueur", description: "Contrôle de la cohérence entre déclaration et comptabilité." },
    ],
    services: [
      {
        title: "Préparation DSF",
        description: "Organisation des éléments à rendre pour une déclaration annuelle claire et conforme.",
        href: "/fiscal/dsf",
        badge: "DSF",
        icon: FileBarChart,
      },
      {
        title: "Contrôle de cohérence",
        description: "Vérification des montants, pièces et données fiscales pour sécuriser l’ensemble du dossier.",
        href: "/fiscal/dsf",
        badge: "Cohérence",
        icon: Calculator,
      },
      {
        title: "Accompagnement administratif",
        description: "Aide à la préparation des justifications et à la mise en conformité du dossier.",
        href: "/fiscal/dsf",
        badge: "Admin",
        icon: Landmark,
      },
    ],
    checklist: [
      "Recensement des revenus, charges et mouvements importants de la période.",
      "Contrôle des données comptables et de la déclaration annuelle.",
      "Vérification de l’exhaustivité des pièces justificatives.",
      "Préparation des pièces en vue des formalités administratives.",
      "Suivi des échéances pour éviter les oublis ou retards.",
    ],
    faq: [
      {
        question: "Pourquoi la déclaration annuelle est-elle importante ?",
        answer: "Parce qu’elle permet de synthétiser votre activité, d’assurer la conformité de votre dossier et d’éviter les écarts ou retards de traitement administratif.",
      },
      {
        question: "Peut-on préparer la déclaration bien avant la date limite ?",
        answer: "Oui, c’est même recommandé. Anticiper permet de vérifier les pièces et corriger les oublis avant le dépôt final.",
      },
    ],
  },
  patente: {
    title: "Patente professionnelle",
    subtitle: "Évaluation, conformité et gestion des obligations liées à la patente professionnelle.",
    intro: "La patente est une taxation propre aux activités commerciales et artisanales. Son calcul repose sur plusieurs éléments, notamment l’activité, la nature de l’entreprise et le niveau d’exploitation.",
    highlights: [
      { label: "Éligibilité", value: "Vérifiée", description: "Contrôle de votre cadre d’activité et des obligations applicables." },
      { label: "Montant", value: "Examiné", description: "Évaluation du calcul et des composants de la patente." },
      { label: "Délais", value: "Suivis", description: "Planification des paiements et des délais de déclaration." },
    ],
    services: [
      {
        title: "Vérification patente",
        description: "Contrôle du cadre réglementaire et des éléments clés pour votre activité commerciale.",
        href: "/fiscal/patente",
        badge: "Patente",
        icon: BookCheck,
      },
      {
        title: "Calcul et suivi",
        description: "Évaluation des montants et préparation des pièces à fournir pour le traitement administratif.",
        href: "/fiscal/patente",
        badge: "Montant",
        icon: Calculator,
      },
      {
        title: "Accompagnement de conformité",
        description: "Aide à la compréhension des obligations et à la bonne organisation de votre dossier.",
        href: "/fiscal/patente",
        badge: "Conformité",
        icon: ShieldCheck,
      },
    ],
    checklist: [
      "Vérification de l’activité concernée et de son statut fiscal.",
      "Contrôle des données à renseigner pour le calcul de la patente.",
      "Suivi des échéances et des paiements à réaliser.",
      "Mise en ordre des pièces justificatives administratives.",
      "Conseils sur les obligations liées à l’exercice selon votre activité.",
    ],
    faq: [
      {
        question: "Qui est concerné par la patente ?",
        answer: "Principalement les entreprises exerçant des activités commerciales, industrielles ou artisanales selon le cadre fiscal applicable à leur activité.",
      },
      {
        question: "Peut-on avoir des erreurs sur le montant payé ?",
        answer: "Oui, certaines erreurs de calcul ou d’évaluation peuvent être corrigées. Il est important d’identifier rapidement le point problématique pour sécuriser les démarches.",
      },
    ],
  },
  niu: {
    title: "Vérifier un NIU",
    subtitle: "Contrôle du numéro d’identification unique et vérification de la conformité administrative.",
    intro: "Le NIU est un élément central dans plusieurs démarches fiscales et administratives. Nous vous assistons pour le vérifier, le documenter et en garantir la cohérence avec les pièces de votre dossier.",
    highlights: [
      { label: "Dossier", value: "Vérifié", description: "Contrôle de la qualité et de la cohérence des informations." },
      { label: "Traitement", value: "Rapide", description: "Évaluation rapide de vos informations avant démarches fiscales." },
      { label: "Sécurité", value: "Proactive", description: "Prévention des erreurs admin pour éviter les blocages." },
    ],
    services: [
      {
        title: "Vérification NIU",
        description: "Contrôle de la validité et de la cohérence du numéro d’identification unique.",
        href: "/fiscal/niu",
        badge: "NIU",
        icon: ShieldCheck,
      },
      {
        title: "Contrôle administratif",
        description: "Analyse des pièces et informations associées pour sécuriser le dossier.",
        href: "/fiscal/niu",
        badge: "Admin",
        icon: FileBarChart,
      },
      {
        title: "Aide au suivi",
        description: "Accompagnement pour corriger les anomalies avant toute déclaration ou demande d’attestation.",
        href: "/fiscal/niu",
        badge: "Suivi",
        icon: ListChecks,
      },
    ],
    checklist: [
      "Contrôle du numéro d’identification unique et des informations associées.",
      "Vérification de l’alignement entre pièce d’identité et informations administratives.",
      "Préparation des documents pour une demande de conformité ou d’attestation.",
      "Analyse des écarts ou anomalies avant traitement fiscal.",
      "Aide à la correction des informations de manière claire et structurée.",
    ],
    faq: [
      {
        question: "Pourquoi vérifier un NIU avant une demande ?",
        answer: "Parce qu’une erreur d’identification peut ralentir une procédure, bloquer une déclaration ou entraîner un rejet administratif.",
      },
      {
        question: "Que faire en cas d’erreur sur le NIU ?",
        answer: "La correction doit se faire avec les documents justificatifs appropriés. Nous vous aidons à identifier la bonne démarche et à préparer les pièces pour sécuriser la correction.",
      },
    ],
  },
};

export default async function FiscalSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = fiscalData[slug];

  if (!data) {
    notFound();
  }

  return (
    <FiscalPageTemplate
      eyebrow="Fiscalité & conformité"
      title={data.title}
      subtitle={data.subtitle}
      intro={data.intro}
      highlights={data.highlights}
      services={data.services}
      checklist={data.checklist}
      faq={data.faq}
      ctaLabel="Prendre rendez-vous"
      ctaHref="/contact"
    />
  );
}

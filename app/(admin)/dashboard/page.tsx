import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const metrics = [
  {
    label: "Articles publiés",
    value: "128",
    icon: Briefcase,
    change: "+14 %",
    detail: "Ce mois-ci",
  },
  {
    label: "Utilisateurs actifs",
    value: "2 430",
    icon: Users,
    change: "+8 %",
    detail: "7 derniers jours",
  },
  {
    label: "Commentaires",
    value: "1 084",
    icon: MessageCircle,
    change: "+22 %",
    detail: "Nouveaux",
  },
];

const recentPosts = [
  {
    title: "Réussir la promotion d'un podcast en 2026",
    type: "Article",
    status: "Publié",
    actions: 219,
    comments: 34,
    date: "15 juil.",
  },
  {
    title: "Nouvelle stratégie d'abonnement premium",
    type: "Analyse",
    status: "Brouillon",
    actions: 12,
    comments: 4,
    date: "14 juil.",
  },
  {
    title: "Mise à jour du catalogue livres",
    type: "Annonce",
    status: "Programmé",
    actions: 58,
    comments: 10,
    date: "13 juil.",
  },
];

const activities = [
  {
    title: "Utilisateur confirmé",
    description: "Claire a activé son compte après l'inscription.",
    meta: "il y a 35 min",
  },
  {
    title: "Article publié",
    description: "Le post 'Réussir la promo...' est en ligne.",
    meta: "il y a 1 h",
  },
  {
    title: "Commentaire modéré",
    description: "3 messages signalés ont été validés.",
    meta: "il y a 3 h",
  },
];

export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,247,237,0.9),rgba(255,241,242,0.9))] p-6 shadow-[0_18px_32px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--accent)">
              Tableau de bord
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-(--text-primary) sm:text-4xl">
              Vue d'ensemble de l'administration
            </h1>
            <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
              Suivez les indicateurs clés, les publications récentes et les
              actions prioritaires pour piloter votre espace admin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article
                  key={metric.label}
                  className="rounded-[28px] border border-amber-100/80 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--text-tertiary)">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-(--text-primary)">
                        {metric.value}
                      </p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-3xl bg-(--accent)/10 text-(--accent)">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-(--text-secondary)">
                    <span>{metric.detail}</span>
                    <span className="font-semibold text-(--accent)">
                      {metric.change}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-4xl border border-amber-100/80 bg-white/80 p-6 shadow-[0_18px_32px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--accent)">
                  Contenus récents
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-(--text-primary)">
                  Publications à surveiller
                </h2>
              </div>
              <Link
                href="/admin/posts"
                className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--bg-primary) px-4 py-2 text-sm font-medium text-(--text-primary) transition hover:bg-(--bg-tertiary)"
              >
                Voir tout
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.title}
                  className="rounded-3xl border border-(--border) bg-(--bg-primary) p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <p className="text-sm font-semibold text-(--text-primary) truncate">
                        {post.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-secondary)">
                        <span className="rounded-full bg-(--bg-secondary) px-2 py-1">
                          {post.type}
                        </span>
                        <span className="rounded-full bg-(--bg-secondary) px-2 py-1">
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-(--text-secondary)">
                      <span>{post.actions} interactions</span>
                      <span>{post.comments} commentaires</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-4xl border border-(--border) bg-(--bg-secondary) p-6 shadow-sm shadow-black/5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--accent)">
                  Activité récente
                </p>
                <h2 className="mt-2 text-xl font-semibold text-(--text-primary)">
                  Dernières actions
                </h2>
              </div>
              <div className="inline-flex items-center rounded-3xl bg-(--bg-primary) px-3 py-2 text-xs font-semibold text-(--text-secondary)">
                <CalendarDays className="mr-2 h-4 w-4" />
                24 dernières heures
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {activities.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-(--border) bg-(--bg-primary) p-4"
                >
                  <p className="font-semibold text-(--text-primary)">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-(--text-secondary)">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-(--text-tertiary)">
                    {item.meta}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-4xl border border-(--border) bg-(--bg-secondary) p-6 shadow-sm shadow-black/5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--accent)">
                  Actions rapides
                </p>
                <h2 className="mt-2 text-xl font-semibold text-(--text-primary)">
                  Priorités du jour
                </h2>
              </div>
              <Zap className="h-6 w-6 text-(--accent)" />
            </div>

            <div className="mt-6 grid gap-2">
              <button className="rounded-3xl border border-(--border) bg-(--bg-primary) px-4 py-2 text-left text-sm font-medium text-(--text-primary) transition hover:bg-(--bg-tertiary)">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-(--accent)" />
                  <span>Vérifier les nouveaux commentaires</span>
                </div>
              </button>
              <button className="rounded-3xl border border-(--border) bg-(--bg-primary) px-4 py-2 text-left text-sm font-medium text-(--text-primary) transition hover:bg-(--bg-tertiary)">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-(--accent)" />
                  <span>Publier une nouveauté promotionnelle</span>
                </div>
              </button>
              <button className="rounded-3xl border border-(--border) bg-(--bg-primary) px-2 py-2 text-left text-sm font-medium text-(--text-primary) transition hover:bg-(--bg-tertiary)">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-(--accent)" />
                  <span>Ajouter une offre réservée aux membres</span>
                </div>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

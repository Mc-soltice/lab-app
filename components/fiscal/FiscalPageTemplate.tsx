import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Calculator, FileText, Landmark, ShieldCheck } from "lucide-react";

export type FiscalHighlight = {
  label: string;
  value: string;
  description: string;
};

export type FiscalService = {
  title: string;
  description: string;
  href: string;
  badge: string;
  icon: LucideIcon;
};

export type FiscalFaqItem = {
  question: string;
  answer: string;
};

type FiscalPageTemplateProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  highlights: FiscalHighlight[];
  services: FiscalService[];
  checklist: string[];
  faq: FiscalFaqItem[];
  ctaLabel: string;
  ctaHref: string;
};

export default function FiscalPageTemplate({
  eyebrow,
  title,
  subtitle,
  intro,
  highlights,
  services,
  checklist,
  faq,
  ctaLabel,
  ctaHref,
}: FiscalPageTemplateProps) {
  return (
    <main className="bg-slate-50 pb-20 pt-28 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          {eyebrow}
        </div>

        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-sky-950 via-indigo-900 to-amber-700 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-12">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-sky-100">
                LAB • Expertise comptable
              </p>
              <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base text-sky-50/90 sm:text-lg">
                {subtitle}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-100/90">
                {intro}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-sky-900 transition hover:translate-y-[-1px] hover:bg-sky-50"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/apropos"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Découvrir LAB
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-end sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-100/80">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-sky-100/80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-indigo-100 to-amber-100 text-sky-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {service.badge}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">{service.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Checklist de conformité
                </p>
                <h3 className="text-2xl font-bold text-slate-900">Ce que nous sécurisons</h3>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                    ✓
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] bg-gradient-to-br from-sky-50 via-white to-amber-50 p-7 shadow-sm ring-1 ring-sky-100">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Accompagnement stratégique</h3>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
                <Calculator className="mt-1 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-slate-900">Analyse fiscale</p>
                  <p className="text-sm text-slate-600">Diagnostic des obligations, délais et opportunités.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
                <FileText className="mt-1 h-5 w-5 text-sky-600" />
                <div>
                  <p className="font-semibold text-slate-900">Déclarations & suivi</p>
                  <p className="text-sm text-slate-600">Mise en conformité, suivi des échéances et relance des pièces.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
                <BriefcaseBusiness className="mt-1 h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-semibold text-slate-900">Conseil d’entreprise</p>
                  <p className="text-sm text-slate-600">Conseils adaptés à votre statut, activité et croissance.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {faq.length > 0 && (
          <section className="mt-16 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Questions fréquentes</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">Tout ce qu’il faut savoir</h3>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {faq.map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

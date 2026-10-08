/**
 * Contenu du site — UNIQUE fichier à modifier pour personnaliser le cabinet.
 *
 * ⚠️  Tout ce qui suit est un TEXTE PROVISOIRE (nom, barreau, adresse,
 * téléphone, SIRET, assurance…). Remplacez-le par les informations réelles
 * de l'avocat avant la mise en ligne. Les mentions légales exigent des
 * données exactes (voir app/mentions-legales).
 */

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  name: "Cabinet Marchand",
  lawyer: "Maître Élise Marchand",
  lawyerShort: "É. Marchand",
  monogram: "ÉM",
  title: "Avocate à Paris",
  barreau: "Barreau de Paris",
  year: 2026,
  address: {
    street: "12 rue de la Paix",
    postalCode: "75002",
    city: "Paris",
  },
  phone: "01 00 00 00 00",
  phoneHref: "+33100000000",
  email: "contact@cabinet-marchand.example",
  hours: [
    { days: "Lundi – Jeudi", time: "9 h – 19 h" },
    { days: "Vendredi", time: "9 h – 17 h" },
  ],
  responseTime: "un jour ouvré",
} as const;

export const nav = [
  { href: "#cabinet", label: "Le cabinet" },
  { href: "#domaines", label: "Domaines" },
  { href: "#deroule", label: "Déroulé" },
  { href: "#honoraires", label: "Honoraires" },
] as const;

export const hero = {
  eyebrow: `Avocate · ${site.barreau}`,
  title: "Défendre vos droits, avec rigueur et humanité.",
  lead: "Un accompagnement juridique clair, de la première consultation jusqu’à la décision. Écoute attentive, stratégie sur mesure, honnêteté sur les chances de succès.",
} as const;

export const about = {
  eyebrow: "Le cabinet",
  title: "Une pratique exigeante, une relation de confiance.",
  paragraphs: [
    "Inscrite au Barreau de Paris, Maître Marchand accompagne particuliers et dirigeants dans les moments où le droit devient personnel : une séparation, un licenciement, une mise en cause, un litige qui s’enlise.",
    "Sa méthode tient en trois engagements : comprendre votre situation avant de conseiller, vous dire sans détour ce qui est possible, et vous tenir informé à chaque étape. Le secret professionnel garantit la confidentialité de chaque échange.",
  ],
  quote:
    "Un bon conseil n’est pas celui qui rassure, c’est celui qui éclaire.",
  facts: [
    { label: "Barreau", value: "Paris" },
    { label: "Prestation de serment", value: "2012" },
    { label: "Langues", value: "Français, anglais" },
    { label: "Modes de rendez-vous", value: "Cabinet, visioconférence, téléphone" },
  ],
} as const;

export type PracticeIcon = "family" | "work" | "criminal" | "property";

export const practices: {
  id: string;
  icon: PracticeIcon;
  title: string;
  text: string;
  items: string[];
}[] = [
  {
    id: "famille",
    icon: "family",
    title: "Droit de la famille",
    text: "Traverser une séparation ou un conflit familial avec un cadre clair, dans l’intérêt de chacun et, surtout, des enfants.",
    items: ["Divorce et séparation", "Garde et pension alimentaire", "Succession et partage"],
  },
  {
    id: "travail",
    icon: "work",
    title: "Droit du travail",
    text: "Faire respecter vos droits de salarié, ou sécuriser vos décisions d’employeur, avant que le conflit ne s’installe.",
    items: ["Licenciement et rupture conventionnelle", "Harcèlement, discrimination", "Prud’hommes"],
  },
  {
    id: "penal",
    icon: "criminal",
    title: "Droit pénal",
    text: "Être assisté dès la garde à vue, comprendre la procédure et préparer une défense solide à chaque étape.",
    items: ["Garde à vue, audition", "Défense devant les juridictions", "Victimes : constitution de partie civile"],
  },
  {
    id: "immobilier",
    icon: "property",
    title: "Droit immobilier",
    text: "Sécuriser un achat, résoudre un litige de voisinage, de copropriété ou de bail, sans perdre des mois en procédure.",
    items: ["Baux d’habitation et commerciaux", "Copropriété", "Litiges de construction"],
  },
];

export const steps = [
  {
    n: "01",
    title: "Vous faites une demande",
    text: "Quelques lignes sur votre situation et vos disponibilités suffisent. Aucune pièce n’est demandée à ce stade.",
  },
  {
    n: "02",
    title: "Nous fixons le premier échange",
    text: `Vous recevez une confirmation sous ${site.responseTime}, avec la date retenue, le lieu ou le lien de visioconférence, et les documents utiles à apporter.`,
  },
  {
    n: "03",
    title: "Nous construisons la stratégie",
    text: "Analyse de votre dossier, options réalistes, calendrier et coût prévisible. Vous décidez ensuite, librement, de poursuivre ou non.",
  },
] as const;

export const fees = {
  eyebrow: "Honoraires",
  title: "Un coût annoncé avant, jamais découvert après.",
  lead: "Les honoraires sont libres mais encadrés : ils sont déterminés avec vous, par écrit, en fonction de la complexité du dossier, du temps à y consacrer et de votre situation.",
  items: [
    {
      title: "Premier rendez-vous",
      text: "Le tarif de la consultation initiale vous est communiqué à la confirmation du rendez-vous, avant que vous vous déplaciez.",
    },
    {
      title: "Convention d’honoraires",
      text: "Si vous confiez le dossier au cabinet, une convention écrite précise le mode de calcul, forfait ou temps passé, ainsi que les frais éventuels.",
    },
    {
      title: "Aide juridictionnelle",
      text: "Selon vos ressources, l’État peut prendre en charge tout ou partie des frais. Nous vous aidons à évaluer votre éligibilité.",
    },
  ],
} as const;

export const booking = {
  eyebrow: "Rendez-vous",
  title: "Demandez un rendez-vous.",
  lead: `Indiquez vos disponibilités : le cabinet vous répond sous ${site.responseTime} pour confirmer le créneau.`,
  motifs: [
    "Droit de la famille",
    "Droit du travail",
    "Droit pénal",
    "Droit immobilier",
    "Autre sujet",
  ],
  modes: [
    { value: "cabinet", label: "Au cabinet" },
    { value: "visio", label: "Visioconférence" },
    { value: "telephone", label: "Téléphone" },
  ],
  windows: [
    { value: "matin", label: "Matin", detail: "9 h – 12 h" },
    { value: "apres-midi", label: "Après-midi", detail: "14 h – 17 h" },
    { value: "fin-journee", label: "Fin de journée", detail: "17 h – 19 h" },
  ],
} as const;

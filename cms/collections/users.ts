import type { CollectionConfig } from "payload";

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Utilisateur", plural: "Utilisateurs" },
  admin: { useAsTitle: "email", defaultColumns: ["name", "email"], group: "Administration" },
  auth: {
    tokenExpiration: 60 * 60 * 12,
    // Freine les attaques par essais successifs sur la page de connexion.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: "Lax", secure: process.env.NODE_ENV === "production" },
  },
  access: {
    read: loggedIn,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [{ name: "name", type: "text", label: "Nom" }],
};

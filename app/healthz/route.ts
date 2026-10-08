// Santé du conteneur (DEPLOY-3) : 200 sans toucher au reste de l’app.
export function GET() {
  return new Response("ok", { headers: { "Cache-Control": "no-store" } });
}

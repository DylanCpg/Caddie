// Relais de recherche pour Caddie (facultatif), à déployer gratuitement sur Cloudflare Workers.
//
// À quoi ça sert : certains navigateurs ou réseaux bloquent les recherches par nom d'Open Food Facts.
// Ce petit programme les fait à votre place et renvoie le résultat à Caddie.
//
// Comment faire (depuis un navigateur, en version ordinateur) :
// 1. Créez un compte gratuit sur https://dash.cloudflare.com (aucune carte bancaire).
// 2. Menu « Workers et Pages » > « Créer » > « Créer un Worker » > donnez un nom > « Déployer ».
// 3. Touchez « Modifier le code », effacez tout, collez CE fichier en entier, puis « Déployer ».
// 4. Copiez l'adresse du Worker (elle ressemble à https://nom.votre-compte.workers.dev).
// 5. Dans Caddie : Réglages > Open Food Facts > « Relais de recherche », collez l'adresse, Enregistrer,
//    puis « Tester la connexion ».

export default {
  async fetch(request) {
    const headers = {
      'access-control-allow-origin': '*',
      'content-type': 'application/json; charset=utf-8'
    };
    const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 80);
    if (!q) return new Response('{"products":[]}', { headers });
    const target = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
      '&search_simple=1&action=process&json=1&page_size=24&sort_by=unique_scans_n' +
      '&tagtype_0=countries&tag_contains_0=contains&tag_0=france' +
      '&fields=code,product_name,nutriscore_grade,nova_group';
    try {
      const r = await fetch(target, {
        headers: { 'User-Agent': 'Caddie/1.0 (liste de courses familiale)' },
        cf: { cacheTtl: 86400, cacheEverything: true }
      });
      return new Response(await r.text(), { status: r.status, headers });
    } catch (e) {
      return new Response('{"products":[]}', { status: 502, headers });
    }
  }
};

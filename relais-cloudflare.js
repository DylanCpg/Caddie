// Relais de recherche pour Caddie (facultatif), à déployer gratuitement sur Cloudflare Workers.
//
// À quoi ça sert : le serveur de recherche d'Open Food Facts est souvent surchargé et répond par intermittence,
// surtout quand la demande vient directement d'un navigateur. Ce petit programme fait la demande à votre place,
// réessaie plusieurs fois, garde les réponses en mémoire pendant 24 h et les renvoie à Caddie.
//
// Comment faire (depuis un navigateur, en version ordinateur) :
// 1. Créez un compte gratuit sur https://dash.cloudflare.com (aucune carte bancaire).
// 2. Menu « Workers et Pages » > « Créer » > « Créer un Worker » > donnez un nom > « Déployer ».
// 3. Touchez « Modifier le code », effacez tout, collez CE fichier en entier, puis « Déployer ».
// 4. Copiez l'adresse du Worker (elle ressemble à https://nom.votre-compte.workers.dev).
// 5. Dans Caddie : Réglages > Open Food Facts > « Relais de recherche », collez l'adresse, Enregistrer,
//    puis « Tester la connexion ».

const FIELDS = 'code,product_name,nutriscore_grade,nutrition_grades,nutriscore_data,nova_group,nova_groups';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export default {
  async fetch(request) {
    const headers = {
      'access-control-allow-origin': '*',
      'content-type': 'application/json; charset=utf-8'
    };
    const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 80);
    if (!q) return new Response('{"products":[]}', { headers });

    // Requête légère d'abord (la plus susceptible d'aboutir), puis restreinte à la France.
    const base = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
      '&search_simple=1&action=process&json=1&fields=' + FIELDS;
    const targets = [
      base + '&page_size=12',
      base + '&page_size=24&sort_by=unique_scans_n&tagtype_0=countries&tag_contains_0=contains&tag_0=france'
    ];

    let last = null;
    for (let i = 0; i < 4; i++) {
      const url = targets[i % targets.length];
      try {
        const r = await fetch(url, {
          headers: { 'User-Agent': 'Caddie/1.0 (liste de courses familiale)' },
          cf: { cacheTtl: 86400, cacheEverything: true }
        });
        const text = await r.text();
        if (r.ok && text.trim().startsWith('{')) {
          return new Response(text, { status: 200, headers });
        }
        last = r.status;
      } catch (e) {
        last = 502;
      }
      await sleep(600 * (i + 1));
    }
    return new Response('{"products":[]}', { status: last || 502, headers });
  }
};

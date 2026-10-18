/* ─────────────────────────────────────────────────────────────────────────
   KLINKS · Configuração do Supabase
   ─────────────────────────────────────────────────────────────────────────

   Preencha as DUAS variáveis abaixo com os dados do SEU projeto Supabase.
   Você encontra em:  Supabase → Project Settings → API
     • Project URL          → KLINKS_SUPABASE_URL
     • Project API keys → anon public  → KLINKS_SUPABASE_ANON_KEY

   ⚠️ A chave "anon public" é FEITA para ficar no navegador — pode ficar aqui
      sem problema. Quem protege os dados é a RLS (Row Level Security) que você
      ativa na tabela `restaurants` (veja o README). NUNCA cole aqui a chave
      "service_role" — essa é secreta e jamais vai para o front-end.

   Enquanto estiver com os valores de exemplo abaixo (YOUR-PROJECT / YOUR-ANON),
   o KLINKS funciona em modo LOCAL (igual antes: edições salvas no aparelho).
   Assim que você colocar os valores reais, ele passa a usar o Supabase
   automaticamente — sem mexer em mais nada.
   ───────────────────────────────────────────────────────────────────────── */

window.KLINKS_SUPABASE_URL      = 'https://tfkpltamxypzayocfpeh.supabase.co';
window.KLINKS_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma3BsdGFteHlwemF5b2NmcGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDU5NDAsImV4cCI6MjA5ODEyMTk0MH0.yXw5BcYMYwpr67ZTPDI1QKXeyH-kx4aq65yYEL9BwuY';

/* Nome do bucket público de imagens (logo, promo, tour). Crie no Supabase
   em Storage → New bucket → "restaurants" (marque como público). */
window.KLINKS_SUPABASE_BUCKET   = 'restaurants';

/* Domínio público das páginas. Com ele preenchido, o link de cada cliente
   vira  https://SEU-DOMINIO/nome-do-restaurante  (precisa do vercel.json).
   Fora do domínio (preview), o link aberto continua sendo pagina.html?r=nome. */
window.KLINKS_PUBLIC_BASE       = 'https://useklinks.com';
/* Link do checkout do Pro (Cakto). */
window.KLINKS_UPGRADE_URL       = '';
/* WhatsApp comercial da Kurtz (só números, com 55). Usado se não houver checkout. */
window.KLINKS_SALES_WHATSAPP    = '';

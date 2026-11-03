# link.me

Plataforma de página de links: cada pessoa cria a sua página com foto redonda,
links, tema (fofos, masculinos ou neutros), modo claro/escuro e wallpaper.
Tem painel com editor de links, aparência com prévia ao vivo, estatísticas e conta.

Feito com Next.js 16 (App Router, Server Actions), TypeScript, libSQL/Turso e sharp.

## Rodar local

```bash
npm install
cp .env.example .env.local   # DATABASE_URL=file:local.db já funciona
npm run dev                  # http://localhost:3000
```

O banco é criado sozinho na primeira requisição (`src/infra/db.ts`). Não há passo de migração.

## Deploy na Vercel

1. Crie um banco no [Turso](https://turso.tech) (ou pela integração Turso no Vercel Marketplace).
2. Na Vercel, importe o repositório e defina as variáveis:
   - `DATABASE_URL` = `libsql://<seu-banco>.turso.io` (ou `TURSO_DATABASE_URL`, que a integração cria)
   - `DATABASE_AUTH_TOKEN` (ou `TURSO_AUTH_TOKEN`)
   - `NEXT_PUBLIC_SITE_URL` = a URL do site
   - opcional: `GOOGLE_SAFE_BROWSING_KEY` para bloquear links de phishing/malware
3. Deploy. SQLite em arquivo não funciona na Vercel (disco efêmero), por isso o Turso.

## Arquitetura

Camadas com dependência só para dentro. Estilo procedural: funções puras e
funções de caso de uso, sem classes.

```
src/
  core/          domínio puro, sem IO: temas, wallpapers, validação (zod), regras de URL e de endereço
  infra/         detalhes: conexão libSQL, scrypt/tokens, repositórios com SQL parametrizado
  services/      casos de uso: auth, sessão, links, perfil, mídia, estatísticas, rate limit
  app/           rotas Next.js; app/actions/* são controllers finos (FormData -> service -> Result)
  ui/            componentes React; ProfileView desenha a página pública, a prévia e a vitrine
  proxy.ts       CSP com nonce por requisição + barreira rápida do /dashboard
```

Serviços nunca lançam erro para falhas esperadas: retornam `Result` (`ok` / `fail`),
e a camada de apresentação decide como mostrar.

## Segurança

- Senhas: scrypt (N=2^15) com sal aleatório, comparação em tempo constante.
- Senhas vazadas recusadas via Have I Been Pwned (k-anonymity: só 5 caracteres do hash saem do servidor).
- Login: mensagem genérica, scrypt mesmo quando o e-mail não existe (sem enumeração por tempo),
  5 tentativas por conta e 30 por IP a cada 15 min.
- Sessões opacas: token de 256 bits em cookie `__Host-` HttpOnly, Secure, SameSite=Lax;
  o banco guarda só o SHA-256. Trocar a senha invalida todas as sessões antigas.
- CSRF: Server Actions checam o Origin; formulários só aceitam `form-action 'self'`.
- Headers: CSP com nonce e `strict-dynamic`, HSTS, `frame-ancestors 'none'`, nosniff, Permissions-Policy.
- Links: só http(s), mailto e tel; bloqueia `javascript:`, `data:`, credenciais na URL e redes privadas.
  Cliques passam por `/go/<id>` (sem open redirect) e links sensíveis mostram aviso antes.
- Imagens: decodificadas e regravadas em WebP pelo sharp; EXIF/GPS removidos; SVG recusado.

## Créditos

Os wallpapers em `public/wallpapers/` (feminino-1..6 e masculino-1..3) foram escolhidos pelo dono do projeto
no Pinterest e mostram personagens de terceiros (como Hello Kitty, da Sanrio). Confirme os direitos de uso antes de lançar em produção.

As fotos de perfil dos exemplos da página inicial são obras em domínio público via Wikimedia Commons
(lista completa no rodapé do site e em `src/ui/landing/samples.ts`).

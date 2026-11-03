# Segurança

## Como reportar uma falha

Não abra uma issue pública para falhas de segurança.
Use a aba **Security → Report a vulnerability** deste repositório no GitHub (aviso privado).

Inclua, se puder: o que encontrou, como reproduzir e qual o impacto.

## O que nunca vai para o repositório

- Arquivos `.env*` (só o `.env.example`, sem valores, é versionado)
- O banco local `local.db`
- Tokens do Turso, chaves de API e qualquer segredo: configure tudo nas variáveis de ambiente da Vercel

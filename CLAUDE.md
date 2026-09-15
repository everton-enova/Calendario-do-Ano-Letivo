# Calendário do Ano Letivo 2026

Front estático (`index.html`, Vercel) + back no Google Apps Script (`codigo.gs`),
gravando na planilha "140926 - Calendário Letivo 2026".

## Deploy

**Sempre fazer o promote to production.** Uma alteração não está entregue
enquanto não estiver em produção:

1. Merge no `main` e push.
2. **Vercel → Deployments → promote to production** no deploy do commit.
3. Se o `codigo.gs` mudou: Apps Script → **Implantar → Gerenciar implantações
   → lápis → Nova versão → Implantar**. Usar "Gerenciar implantações", nunca
   "Nova implantação" — esta cria uma URL nova e quebra o `APPS_SCRIPT_URL`
   do front.

Não há Vercel CLI nem token neste ambiente, então o passo 2 é manual — avisar
o usuário explicitamente quando ficar pendente.

## Pontos de atenção

- `APPS_SCRIPT_URL` (`index.html`) e a URL da implantação ativa precisam bater.
- `DEADLINE` (`index.html`) e `DEADLINE_ISO` (`codigo.gs`) precisam bater.
- A contagem de dias letivos é o teto do período declarado: não desconta
  recesso escolar nem feriados municipais, e não soma sábados letivos.

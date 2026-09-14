# Formulário — Calendário do Ano Letivo 2026

Coleta as datas de início e fim do ano letivo 2026 das redes municipais de ensino da Bahia.

- **Front**: `index.html` estático (Vercel).
- **Back**: `codigo.gs` no Google Apps Script, grava em Google Sheets.
- **Prazo**: 22/09/2026, 23:59 (-03:00) — bloqueio automático no front e no back.
- **Regra**: 1 resposta por município (bloqueio pelo código IBGE).

## Estrutura

```
.
├── index.html   # formulário público
├── codigo.gs    # Apps Script (Web App)
└── README.md
```

## Deploy — passo a passo

### 1. Google Sheets + Apps Script

1. Crie uma planilha Google em branco. Nomeie, por exemplo, `Calendário Letivo 2026 — Municipal`.
2. Menu **Extensões → Apps Script**.
3. Apague o `Código.gs` padrão e cole o conteúdo de `codigo.gs`.
4. Salve (`Ctrl+S`).
5. **Implantar → Nova implantação**:
   - Tipo: **App da Web**.
   - Executar como: **eu**.
   - Quem tem acesso: **Qualquer pessoa** (necessário para o formulário público chamar).
   - Clique em **Implantar**.
6. Copie a **URL do app da Web** (algo como `https://script.google.com/macros/s/AKfy.../exec`).

### 2. Front (GitHub + Vercel)

1. No `index.html`, substitua a linha:
   ```js
   var APPS_SCRIPT_URL = 'COLOQUE_A_URL_DO_WEB_APP_AQUI';
   ```
   pela URL copiada no passo 1.6.

2. Suba os arquivos num repositório novo do GitHub (comandos abaixo).

3. Na [Vercel](https://vercel.com), **Add New → Project → Import** o repositório. Não precisa configurar nada (é HTML estático). Clique em **Deploy**.

4. A Vercel gera uma URL do tipo `https://calendario-letivo-2026.vercel.app`. Essa é a URL pública do formulário.

### Comandos Git

```bash
cd caminho/da/pasta
git init
git add index.html codigo.gs README.md
git commit -m "formulario calendario letivo 2026"
git branch -M main
git remote add origin git@github.com:everton-web/formulario_calendario_letivo.git
git push -u origin main
```

(Crie o repositório vazio no GitHub antes — sem README, sem .gitignore — e use a URL dele em `git remote add`.)

## O que a planilha vai conter

**Aba `Respostas`** — registro cru:
Data/Hora · Nome · E-mail · Telefone · Cargo · CodMunicipio · Municipio · NTE · Sede NTE · Território · Início · Fim.

**Aba `Acompanhamento`** — 417 municípios da Bahia com status Pendente/Respondido, pendentes no topo (vermelho) e respondidos abaixo (verde). Atualiza automaticamente a cada resposta; também tem o botão manual **⚙️ Calendário Letivo → Atualizar Acompanhamento** no menu da planilha.

## Alterando o formulário depois

- **Mudar o prazo**: alterar `DEADLINE` (linha ~250 do `index.html`) e `DEADLINE_ISO` (linha 13 do `codigo.gs`) — os dois valores precisam bater.
- **Mudar os cargos**: editar o `<select id="cargo">` no `index.html`.
- **Republicar back após editar o `.gs`**: no Apps Script, **Implantar → Gerenciar implantações → editar (ícone lápis) → Nova versão → Implantar**. A URL do web app não muda.

## Regras já implementadas (front + back)

- 1 resposta por município (bloqueio pelo código IBGE).
- Município já respondido aparece riscado no dropdown.
- NTE preenchido automaticamente a partir do município (mostra `NTE XX — Sede: Y — Território: Z`).
- Datas obrigatoriamente em 2026; fim posterior ao início.
- Após 22/09/2026 23:59 o front esconde o formulário e o back rejeita POST.

# Formulário — Calendário do Ano Letivo 2026

Coleta as datas de início e fim do ano letivo 2026 das redes municipais de ensino da Bahia.

- **Front**: `index.html` estático (Vercel).
- **Back**: `codigo.gs` no Google Apps Script, grava na planilha [140926 - Calendário Letivo 2026](https://docs.google.com/spreadsheets/d/1A87OsuoxTzUEfHceo1MyVACCR0g-noEZGslMbwtftN0/edit).
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

1. Abra a planilha [140926 - Calendário Letivo 2026](https://docs.google.com/spreadsheets/d/1A87OsuoxTzUEfHceo1MyVACCR0g-noEZGslMbwtftN0/edit). As abas `Respostas` e `Acompanhamento` são criadas pelo script; não precisa montá-las à mão.
2. Menu **Extensões → Apps Script**.
3. Apague o `Código.gs` padrão e cole o conteúdo de `codigo.gs`.
4. Salve (`Ctrl+S`). O ID da planilha já vem fixado em `SPREADSHEET_ID` (linha 14 do `codigo.gs`) — só precisa trocar se um dia a planilha de destino mudar.
5. Rode a função `onOpen` uma vez pelo editor para disparar a tela de autorização e conceder as permissões.
6. **Implantar → Nova implantação**:
   - Tipo: **App da Web**.
   - Executar como: **eu**.
   - Quem tem acesso: **Qualquer pessoa** (necessário para o formulário público chamar).
   - Clique em **Implantar**.
7. Copie a **URL do app da Web** (algo como `https://script.google.com/macros/s/AKfy.../exec`).

### 2. Front (GitHub + Vercel)

1. A URL do Web App já está gravada em `APPS_SCRIPT_URL` (linha 179 do `index.html`). Só precisa trocar se o Apps Script for reimplantado como **nova** implantação — editar uma implantação existente mantém a mesma URL.

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
Data/Hora · Nome · E-mail · Telefone · Cargo · CodMunicipio · Municipio · NTE · Sede NTE · Território · Início · Fim · **Dias Letivos**.

**Aba `Acompanhamento`** — 417 municípios da Bahia com status Pendente/Respondido, pendentes no topo (vermelho) e respondidos abaixo (verde), com a coluna **Dias Letivos** entre `Fim` e `Respondente`. A linha de total traz quantos respondentes ficaram abaixo da meta. Atualiza automaticamente a cada resposta; também tem o botão manual **⚙️ Calendário Letivo → Atualizar Acompanhamento** no menu da planilha.

## Coluna Dias Letivos

Calculada pelo script a partir das datas declaradas, com faixas de cor:

| Dias letivos | Cor |
|---|---|
| **200 ou mais** | verde |
| **180 a 199** | laranja |
| **abaixo de 180** | vermelho |

**Como é contada**: dias de segunda a sexta entre início e fim (inclusive), descontando feriados nacionais e o feriado estadual da Bahia (2 de julho). Carnaval, Sexta-feira Santa e Corpus Christi são calculados a partir da Páscoa, então valem para qualquer ano.

**O que a contagem não sabe**: o formulário coleta apenas início e fim, então o cálculo **não desconta** recesso escolar (julho), feriados municipais e pontos facultativos locais, e **não soma** sábados letivos. O valor é o **teto** de dias letivos do período declarado.

Na prática: um ano letivo de fevereiro a dezembro dá ~220 nessa contagem e aparece verde, mesmo que o calendário real do município, já com o recesso, fique perto de 200. A coluna serve para **flagrar período declarado curto demais** — um município que informa fevereiro a outubro, por exemplo, cai em laranja (187) — não para homologar o calendário. Para um número fechado seria preciso o formulário coletar também os dias de recesso/feriado local, ou pedir os dias letivos previstos direto ao município.

**Linhas antigas**: a coluna é criada e preenchida retroativamente na primeira execução após a atualização do script — abra a planilha e clique em **⚙️ Calendário Letivo → Atualizar Acompanhamento**. Corrigir uma data à mão na aba `Respostas` também recalcula o valor.

## Alterando o formulário depois

- **Mudar a planilha de destino**: alterar `SPREADSHEET_ID` (linha 14 do `codigo.gs`).
- **Mudar o prazo**: alterar `DEADLINE` (linha ~250 do `index.html`) e `DEADLINE_ISO` (linha 13 do `codigo.gs`) — os dois valores precisam bater.
- **Mudar os cargos**: editar o `<select id="cargo">` no `index.html`.
- **Mudar as faixas de dias letivos**: alterar `DIAS_LETIVOS_META` (verde, padrão 200) e `DIAS_LETIVOS_ALERTA` (laranja, padrão 180) no topo do `codigo.gs`.
- **Ajustar os feriados considerados**: editar `feriadosDoAno()` no `codigo.gs` — o array `fixos` tem os de data fixa; os móveis saem da Páscoa.
- **Republicar back após editar o `.gs`**: no Apps Script, **Implantar → Gerenciar implantações → editar (ícone lápis) → Nova versão → Implantar**. A URL do web app não muda.

## Regras já implementadas (front + back)

- 1 resposta por município (bloqueio pelo código IBGE).
- Município já respondido aparece riscado no dropdown.
- NTE preenchido automaticamente a partir do município (mostra `NTE XX — Sede: Y — Território: Z`).
- Datas obrigatoriamente em 2026; fim posterior ao início.
- Após 22/09/2026 23:59 o front esconde o formulário e o back rejeita POST.
- Dias letivos calculados a cada resposta, com faixa de cor na planilha (ver acima).

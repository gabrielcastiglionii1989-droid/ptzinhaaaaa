# Painel de XP e Metas – Tibia (independente da planilha)

Site estático + coleta automática diária. Não usa Google Sheets.

## Como funciona
- `scripts/update.mjs` consulta a API pública TibiaData (highscores de experiência do mundo) e grava a XP/level de cada personagem em `data/history.json`.
- `.github/workflows/update.yml` roda isso todo dia às 10:30 UTC e salva no repositório.
- `index.html` lê `config.json` e `data/history.json` e calcula XP ontem, 7d, 30d, média/dia e dias para a meta.
- `data/history.json` já vem preenchido com os 30 dias da sua planilha (06/09 a 05/10).

## Colocar no ar (grátis, ~5 min)
1. Crie um repositório no GitHub e envie todos estes arquivos (inclusive a pasta `.github`).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / root.
3. Aba Actions → "Atualizar XP" → *Run workflow* para rodar a primeira coleta.
4. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## Personalizar
Edite `config.json`: mundo, personagens, vocação e level-alvo de cada um.

## Observações
- Personagem fora do top 1000 de XP do mundo: só o level é coletado (XP aparece como "–").
- Para testar localmente: `node scripts/update.mjs` e `python3 -m http.server`.

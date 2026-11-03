#!/usr/bin/env bash
# Publica o jogo na VPS (ssh vps) sem precisar de push no GitHub:
# envia os arquivos versionados no commit atual, reconstrói a imagem com as bases
# (Node e Nginx) atualizadas, para receber correções de segurança, e recria o container.
# Uso: bash deploy/publicar.sh
set -euo pipefail

cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain)" ]; then
  echo "Há alterações sem commit. Faça o commit antes de publicar." >&2
  exit 1
fi

pacote="$(mktemp --suffix=.tar.gz)"
trap 'rm -f "$pacote"' EXIT
git archive --format=tar.gz -o "$pacote" HEAD

ssh vps 'mkdir -p ~/apps/3palavras'
scp -q "$pacote" vps:/tmp/3palavras.tar.gz
ssh vps 'cd ~/apps/3palavras && tar xzf /tmp/3palavras.tar.gz && rm /tmp/3palavras.tar.gz && docker compose build --pull && docker compose up -d'

for i in 1 2 3 4 5 6; do
  # Confere também o tipo: um 200 em HTML no lugar do sw.js significaria arquivo faltando.
  codigo="$(curl -s -o /dev/null -w '%{http_code} %{content_type}' https://3palavras.devsaulo.com.br/sw.js || true)"
  case "$codigo" in "200 application/javascript"*) certo=1 ;; *) certo=0 ;; esac
  [ "$certo" = "1" ] && { echo "No ar: https://3palavras.devsaulo.com.br/ ($(git rev-parse --short HEAD))"; exit 0; }
  sleep 5
done
echo "Container subiu, mas o endereço público respondeu $codigo." >&2
exit 1

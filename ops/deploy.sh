#!/usr/bin/env bash
set -euo pipefail
sha=${1:?Informe o SHA da versão}
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || { echo 'SHA inválido'; exit 1; }
cd /opt/sunhost
[[ -s .env.production ]] || { echo 'Configure /opt/sunhost/.env.production'; exit 1; }
exec 9>/opt/sunhost/deploy.lock
flock -w 300 9
release="/opt/sunhost/releases/$sha"
previous=$(cat current-image 2>/dev/null || true)
gzip -dc "$release/image.tar.gz" | docker load
export APP_IMAGE="sunhost:$sha"
cp "$release/compose.yaml" compose.yaml
if docker compose up -d --no-build --wait --wait-timeout 120; then
  printf '%s\n' "$APP_IMAGE" > current-image
  rm -f "$release/image.tar.gz"
else
  echo 'A versão não ficou saudável. Tentando restaurar a imagem anterior.'
  if [[ -n "$previous" ]]; then APP_IMAGE="$previous" docker compose up -d --no-build --wait --wait-timeout 120; fi
  exit 1
fi

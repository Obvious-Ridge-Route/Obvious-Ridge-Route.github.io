#!/bin/sh
# Build or preview the site with the same Ruby and github-pages gem that GitHub
# Pages uses, without installing Ruby locally. Requires Docker.
#
#   sh scripts/jekyll-docker.sh build   # writes _site/
#   sh scripts/jekyll-docker.sh serve   # http://localhost:4000
#
# Installed gems are cached in the `orr-bundle` Docker volume.
set -eu

cd "$(dirname "$0")/.."

case "${1:-build}" in
  build)
    jekyll="bundle exec jekyll build"
    ports=""
    ;;
  serve)
    jekyll="bundle exec jekyll serve --host 0.0.0.0 --livereload --force_polling"
    ports="-p 4000:4000 -p 35729:35729"
    ;;
  *)
    echo "usage: sh scripts/jekyll-docker.sh build|serve" >&2
    exit 2
    ;;
esac

# shellcheck disable=SC2086
docker run --rm $ports \
  -v "$PWD":/srv/site \
  -v orr-bundle:/usr/local/bundle \
  -w /srv/site \
  -e JEKYLL_ENV=production \
  -e PAGES_REPO_NWO=Obvious-Ridge-Route/Obvious-Ridge-Route.github.io \
  ruby:3.3 \
  sh -c "bundle install --quiet && $jekyll"

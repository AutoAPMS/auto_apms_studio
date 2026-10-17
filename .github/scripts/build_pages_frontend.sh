#!/usr/bin/env bash
# Build the frontend of a git ref for deployment on GitHub Pages.
#
# Usage: build_pages_frontend.sh <ref> <base> <out_dir>
#   ref      git ref to build (e.g. v0.2.0, origin/master)
#   base     public base path the app is served from (e.g. /auto_apms_studio/master/)
#   out_dir  directory to copy the build output to

set -euo pipefail

ref="$1"
base="$2"
out_dir="$(realpath -m "$3")"
worktree="${RUNNER_TEMP:-$(mktemp -d)}/worktree-${ref//\//-}"

git worktree add --force --detach "$worktree" "$ref"

# Pass the commit explicitly, since the workflow itself may run on a different ref
sha="$(git -C "$worktree" rev-parse HEAD)"
tag="$(git -C "$worktree" describe --tags --exact-match HEAD 2>/dev/null || true)"
echo "Building ${ref} (${sha}${tag:+, ${tag}}) with base ${base}"

cd "$worktree/web"
npm ci
AUTO_APMS_STUDIO_GIT_SHA="$sha" AUTO_APMS_STUDIO_GIT_TAG="$tag" \
  npm run build -- --base "$base"

mkdir -p "$out_dir"
cp -a dist/. "$out_dir/"

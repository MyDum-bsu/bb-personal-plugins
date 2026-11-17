#!/usr/bin/env bash
# Put the personal BB setup back on a running bb.
#
# bb builds a plugin's frontend bundle on install. A long-running server can
# end up with a dead esbuild helper, which fails every such build with
# "The service is no longer running"; restart bb, then run this script.
#
#   tools/restore-personal-plugins.sh
#
# It installs the composer-card plugin and overlays the Chat Sidebar fork's UI
# bundle onto the upstream install. The overlay is deliberate: switching that
# plugin's source to a local path deletes its stored settings and folders.
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== composer cards =="
bb plugin install "path:$repo/plugins/bb-plugin-composer-scroll" --yes

echo "== chat sidebar: upstream install =="
if ! bb plugin list --json | jq -e '.plugins[]? | select(.id == "chat-sidebar")' >/dev/null; then
  bb plugin install 'git:https://github.com/seoperin/bb-plugin-chat-sidebar.git@v0.2.8' --yes
fi
root="$(bb plugin list --json | jq -r '.plugins[]? | select(.id == "chat-sidebar") | .rootDir' | head -1)"
if [ -z "$root" ] || [ ! -d "$root" ]; then
  echo "chat-sidebar is not installed; cannot overlay the fork bundle" >&2
  exit 1
fi

echo "== chat sidebar: build fork at $repo/plugins/chat-sidebar =="
(cd "$repo/plugins/chat-sidebar" && bb plugin build .)

echo "== chat sidebar: overlay UI bundle into $root/dist =="
mkdir -p "$root/dist"
cp "$repo/plugins/chat-sidebar/dist/app.js" \
   "$repo/plugins/chat-sidebar/dist/app.css" \
   "$repo/plugins/chat-sidebar/dist/app.meta.json" \
   "$root/dist/"
bb plugin reload chat-sidebar

echo "done: reload the bb window (Ctrl+R) to pick up both"

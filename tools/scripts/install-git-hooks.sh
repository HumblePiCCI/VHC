#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [[ ! -f ".githooks/pre-push" ]]; then
  echo "Missing .githooks/pre-push"
  exit 1
fi

chmod +x .githooks/pre-push
git config core.hooksPath .githooks

echo "Installed git hooks path: $(git config --get core.hooksPath)"
echo "pre-push hook is now active."

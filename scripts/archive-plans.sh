#!/usr/bin/env bash
set -euo pipefail

SOURCE_GLOBAL="${HOME}/.cursor/plans"
SOURCE_WORKSPACE=".cursor/plans"
TARGET_DIR=".cursor/plans/history"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
SNAPSHOT_DIR="${TARGET_DIR}/${TIMESTAMP}"

mkdir -p "${SNAPSHOT_DIR}"

if [ -d "${SOURCE_GLOBAL}" ]; then
  cp "${SOURCE_GLOBAL}"/*.plan.md "${SNAPSHOT_DIR}/" 2>/dev/null || true
fi

if [ -d "${SOURCE_WORKSPACE}" ]; then
  cp "${SOURCE_WORKSPACE}"/*.plan.md "${SNAPSHOT_DIR}/" 2>/dev/null || true
fi

echo "Archived plan markdown files to ${SNAPSHOT_DIR}"

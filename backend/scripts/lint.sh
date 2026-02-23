#!/usr/bin/env bash

set -e
set -x

uv run ty check
uv run ruff check app
uv run ruff format app --check

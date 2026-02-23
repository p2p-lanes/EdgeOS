#!/bin/sh -e
set -x

uv run ruff check app scripts --fix
uv run ruff format app scripts

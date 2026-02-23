#! /usr/bin/env bash

set -e
set -x

cd backend
uv run python -c "import app.main; import json; print(json.dumps(app.main.application.openapi()))" > ../openapi.json
cd ..
mv openapi.json backoffice/
cd backoffice
bun run generate-client
bun run lint

#!/bin/bash
# Run this once after `docker-compose up -d` to pull the model into the
# Ollama container. Only needs to be run once per machine — the model
# persists in the ollama-data volume across restarts.

set -e

MODEL="${OLLAMA_MODEL:-qwen2.5-coder:1.5b}"

echo "Waiting for Ollama container to be ready..."
until docker exec diff-visualizer-ollama ollama list > /dev/null 2>&1; do
  sleep 2
done

echo "Pulling model: $MODEL"
docker exec diff-visualizer-ollama ollama pull "$MODEL"

echo "Done. Model is ready for use."

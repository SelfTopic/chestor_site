# syntax=docker/dockerfile:1
FROM python:3.12-slim AS build
# git — для зависимости ghoul-quiz-lib из GitHub.
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
ENV POETRY_VIRTUALENVS_IN_PROJECT=true POETRY_NO_INTERACTION=1 PIP_DISABLE_PIP_VERSION_CHECK=1
RUN pip install --no-cache-dir poetry==2.3.3
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-root
COPY chestor_chat ./chestor_chat
COPY tests/fixtures ./tests/fixtures
RUN poetry install --only main

FROM python:3.12-slim AS run
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1 GHOUL_QUIZ_TOKEN_PATH=/data/ghoul_quiz/tokens.json
RUN useradd --system --create-home chat && mkdir -p /data/ghoul_quiz && chown -R chat /data
COPY --from=build --chown=chat /app /app
USER chat
EXPOSE 8080 8081
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/chat/health', timeout=3)"
CMD ["python", "-m", "chestor_chat"]

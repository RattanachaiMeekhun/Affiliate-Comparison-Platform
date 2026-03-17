# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy from the cache instead of linking since it's a separate volume
ENV UV_LINK_MODE=copy

# Install the project into /app
WORKDIR /app

# Copy only the files needed for dependency installation
COPY uv.lock pyproject.toml /app/

# Install the project's dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Then, add the rest of the project source code and install it
COPY . /app
RUN uv sync --frozen --no-dev


# Final image
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the environment, but not the source, from the builder
COPY --from=builder /app /app

# Place executables in the path
ENV PATH="/app/.venv/bin:$PATH"

# Run the web service on container startup.
# Cloud Run sets the PORT environment variable.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]

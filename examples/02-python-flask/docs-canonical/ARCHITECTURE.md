# Architecture

## System Overview

Product Catalog API — a simple Flask application.

## Tech Stack

- **Runtime**: Python 3.10+
- **Framework**: Flask
- **Database**: SQLite (local development)
- **Deployment**: Docker

## Components

| Component | Purpose |
|-----------|---------|
| app.py | Main Flask application |
| models.py | Database models |

## Data Flow

1. Client sends HTTP request
2. Flask routes to handler
3. Handler queries SQLite database
4. Response returned as JSON

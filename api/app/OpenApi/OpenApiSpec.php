<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'SceneShelf API',
    description: <<<'MD'
SceneShelf backend API for browsing movies/TV via a TMDB proxy, IMDb ratings via OMDb, and managing a personal shelf.

## Authentication (Sanctum SPA)

This API uses **Laravel Sanctum cookie/session auth** (not Bearer tokens by default).

1. `GET /sanctum/csrf-cookie` — sets the `XSRF-TOKEN` cookie
2. `POST /login`, `POST /register`, or `POST /auth/tmdb` — starts a session
3. Send cookies on subsequent requests, plus the `X-XSRF-TOKEN` header (decoded from the `XSRF-TOKEN` cookie) for state-changing methods

Protected routes use the `sanctum` security scheme (send `X-XSRF-TOKEN`).
MD
)]
#[OA\Server(url: 'http://localhost:8000', description: 'Local development')]
#[OA\Tag(name: 'Auth', description: 'Registration, login, logout, password reset, email verification')]
#[OA\Tag(name: 'User', description: 'Current user profile and photo')]
#[OA\Tag(name: 'Shelf', description: 'Personal watched / want / favorites lists')]
#[OA\Tag(name: 'TMDB', description: 'Allowlisted TMDB API proxy (server holds the API key)')]
#[OA\Tag(name: 'OMDb', description: 'IMDb rating lookup via OMDb')]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'apiKey',
    description: 'Sanctum SPA: after CSRF cookie + login, send the decoded XSRF-TOKEN cookie value as this header (and include session cookies).',
    name: 'X-XSRF-TOKEN',
    in: 'header',
)]
class OpenApiSpec {}

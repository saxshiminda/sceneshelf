<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class TmdbDocumentation
{
    #[OA\Get(
        path: '/api/tmdb/{path}',
        operationId: 'tmdbProxyGet',
        tags: ['TMDB'],
        summary: 'TMDB proxy (GET)',
        description: <<<'MD'
Proxies GET requests to TMDB for allowlisted paths. Query string is forwarded.

**Allowed path patterns:**
- `trending/{all|movie|tv}/{day|week}`
- `search/{multi|movie|tv}`
- `discover/{movie|tv}`
- `genre/{movie|tv}/list`
- `movie/{id}`, `movie/{id}/similar`
- `tv/{id}`, `tv/{id}/similar`
- `collection/{id}`
- `authentication/token/new`
- `authentication/token/validate_with_login`
- `authentication/session/new`
- `authentication/session`
- `account`

Response body matches [TMDB API](https://developer.themoviedb.org/docs) for the requested resource.
MD,
        parameters: [
            new OA\PathParameter(
                name: 'path',
                description: 'TMDB path (see allowlist). Example: `trending/movie/week`',
                required: true,
                schema: new OA\Schema(type: 'string'),
                example: 'trending/movie/week',
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'TMDB JSON passthrough',
                content: new OA\JsonContent(type: 'object'),
            ),
            new OA\Response(response: 404, description: 'Path not allowlisted'),
        ],
    )]
    public function get(): void {}

    #[OA\Post(
        path: '/api/tmdb/{path}',
        operationId: 'tmdbProxyPost',
        tags: ['TMDB'],
        summary: 'TMDB proxy (POST)',
        description: 'Proxies POST requests to TMDB for allowlisted paths. Body and query string are forwarded.',
        parameters: [
            new OA\PathParameter(
                name: 'path',
                description: 'TMDB path (see allowlist). Example: `authentication/session/new`',
                required: true,
                schema: new OA\Schema(type: 'string'),
                example: 'authentication/session/new',
            ),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(type: 'object'),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'TMDB JSON passthrough',
                content: new OA\JsonContent(type: 'object'),
            ),
            new OA\Response(response: 404, description: 'Path not allowlisted'),
        ],
    )]
    public function post(): void {}

    #[OA\Delete(
        path: '/api/tmdb/{path}',
        operationId: 'tmdbProxyDelete',
        tags: ['TMDB'],
        summary: 'TMDB proxy (DELETE)',
        description: 'Proxies DELETE requests to TMDB for allowlisted paths. Body and query string are forwarded.',
        parameters: [
            new OA\PathParameter(
                name: 'path',
                description: 'TMDB path (see allowlist). Example: `authentication/session`',
                required: true,
                schema: new OA\Schema(type: 'string'),
                example: 'authentication/session',
            ),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(type: 'object'),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'TMDB JSON passthrough',
                content: new OA\JsonContent(type: 'object'),
            ),
            new OA\Response(response: 404, description: 'Path not allowlisted'),
        ],
    )]
    public function delete(): void {}
}

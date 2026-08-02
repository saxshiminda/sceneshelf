<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class ShelfDocumentation
{
    #[OA\Get(
        path: '/api/shelf',
        operationId: 'listShelfItems',
        tags: ['Shelf'],
        summary: 'List shelf items',
        security: [['sanctum' => []]],
        parameters: [
            new OA\QueryParameter(
                name: 'list',
                required: false,
                description: 'Filter by list',
                schema: new OA\Schema(type: 'string', enum: ['watched', 'want', 'favorites']),
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Shelf items',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/ShelfItem'),
                ),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ],
    )]
    public function index(): void {}

    #[OA\Get(
        path: '/api/shelf/{mediaType}/{tmdbId}',
        operationId: 'getShelfItem',
        tags: ['Shelf'],
        summary: 'Get shelf item for a title',
        security: [['sanctum' => []]],
        parameters: [
            new OA\PathParameter(
                name: 'mediaType',
                required: true,
                schema: new OA\Schema(type: 'string', enum: ['movie', 'tv']),
            ),
            new OA\PathParameter(
                name: 'tmdbId',
                required: true,
                schema: new OA\Schema(type: 'integer', minimum: 1),
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Shelf item, or null if not on the shelf',
                content: new OA\JsonContent(ref: '#/components/schemas/ShelfItem', nullable: true),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Invalid media type'),
        ],
    )]
    public function show(): void {}

    #[OA\Post(
        path: '/api/shelf/toggle',
        operationId: 'toggleShelfFlag',
        tags: ['Shelf'],
        summary: 'Toggle a shelf flag',
        description: 'Toggles watched, want_to_watch, or favorite. Turning watched on clears want_to_watch. If all flags become false, the row is deleted and `item` is null.',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['tmdb_id', 'media_type', 'flag', 'title'],
                properties: [
                    new OA\Property(property: 'tmdb_id', type: 'integer', minimum: 1, example: 550),
                    new OA\Property(property: 'media_type', type: 'string', enum: ['movie', 'tv']),
                    new OA\Property(property: 'flag', type: 'string', enum: ['watched', 'want_to_watch', 'favorite']),
                    new OA\Property(property: 'title', type: 'string', maxLength: 255, example: 'Fight Club'),
                    new OA\Property(property: 'poster_path', type: 'string', nullable: true, maxLength: 255),
                    new OA\Property(property: 'year', type: 'integer', nullable: true, minimum: 1800, maximum: 2100),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Updated shelf state',
                content: new OA\JsonContent(ref: '#/components/schemas/ShelfToggleResponse'),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function toggle(): void {}

    #[OA\Post(
        path: '/api/shelf/statuses',
        operationId: 'batchShelfStatuses',
        tags: ['Shelf'],
        summary: 'Batch lookup shelf flags',
        description: 'Returns a map keyed by `{media_type}:{tmdb_id}` (e.g. `movie:550`).',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['items'],
                properties: [
                    new OA\Property(
                        property: 'items',
                        type: 'array',
                        maxItems: 100,
                        items: new OA\Items(
                            type: 'object',
                            required: ['media_type', 'tmdb_id'],
                            properties: [
                                new OA\Property(property: 'media_type', type: 'string', enum: ['movie', 'tv']),
                                new OA\Property(property: 'tmdb_id', type: 'integer', minimum: 1),
                            ],
                        ),
                    ),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Map of shelf flags by media key',
                content: new OA\JsonContent(
                    type: 'object',
                    additionalProperties: new OA\AdditionalProperties(ref: '#/components/schemas/ShelfFlags'),
                    example: [
                        'movie:550' => [
                            'watched' => true,
                            'want_to_watch' => false,
                            'favorite' => true,
                        ],
                    ],
                ),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function statuses(): void {}
}

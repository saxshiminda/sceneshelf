<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class OmdbDocumentation
{
    #[OA\Get(
        path: '/api/omdb/rating',
        operationId: 'getOmdbRating',
        tags: ['OMDb'],
        summary: 'Get IMDb rating by IMDb ID',
        description: 'Returns null when OMDb is not configured or the title is not found.',
        parameters: [
            new OA\QueryParameter(
                name: 'imdb_id',
                required: true,
                description: 'IMDb ID (e.g. tt0137523)',
                schema: new OA\Schema(type: 'string', pattern: '^tt\\d+$'),
                example: 'tt0137523',
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Rating payload, or null',
                content: new OA\JsonContent(
                    oneOf: [
                        new OA\Schema(ref: '#/components/schemas/OmdbRating'),
                        new OA\Schema(type: 'null'),
                    ],
                ),
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error or upstream failure',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function rating(): void {}
}

<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class UserDocumentation
{
    #[OA\Get(
        path: '/api/user',
        operationId: 'getCurrentUser',
        tags: ['User'],
        summary: 'Get the authenticated user',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Current user',
                content: new OA\JsonContent(ref: '#/components/schemas/User'),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ],
    )]
    public function show(): void {}

    #[OA\Patch(
        path: '/api/user',
        operationId: 'updateCurrentUser',
        tags: ['User'],
        summary: 'Update name and optional password',
        description: 'When changing password, `current_password` is required unless the account uses a TMDB placeholder email (`*@tmdb.sceneshelf.local`).',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255),
                    new OA\Property(property: 'password', type: 'string', format: 'password', nullable: true),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', nullable: true),
                    new OA\Property(property: 'current_password', type: 'string', format: 'password', nullable: true),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Updated user',
                content: new OA\JsonContent(ref: '#/components/schemas/User'),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function update(): void {}

    #[OA\Post(
        path: '/api/user/profile-photo',
        operationId: 'updateProfilePhoto',
        tags: ['User'],
        summary: 'Upload or replace profile photo',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: 'multipart/form-data',
                    schema: new OA\Schema(
                        required: ['photo'],
                        properties: [
                            new OA\Property(
                                property: 'photo',
                                type: 'string',
                                format: 'binary',
                                description: 'Image file, max 2048 KB',
                            ),
                        ],
                    ),
                ),
            ],
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Updated user',
                content: new OA\JsonContent(ref: '#/components/schemas/User'),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function updateProfilePhoto(): void {}

    #[OA\Delete(
        path: '/api/user/profile-photo',
        operationId: 'deleteProfilePhoto',
        tags: ['User'],
        summary: 'Remove profile photo',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Updated user',
                content: new OA\JsonContent(ref: '#/components/schemas/User'),
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ],
    )]
    public function deleteProfilePhoto(): void {}
}

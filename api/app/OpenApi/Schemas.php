<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'User',
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'tmdb_id', type: 'integer', nullable: true, example: 12345),
        new OA\Property(property: 'name', type: 'string', example: 'Jane Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jane@example.com'),
        new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'tmdb_username', type: 'string', nullable: true, example: 'janedoe'),
        new OA\Property(property: 'avatar_path', type: 'string', nullable: true, description: 'TMDB avatar path'),
        new OA\Property(property: 'profile_photo_path', type: 'string', nullable: true, example: 'avatars/abc.jpg'),
        new OA\Property(property: 'profile_photo_url', type: 'string', nullable: true, example: '/storage/avatars/abc.jpg'),
        new OA\Property(property: 'include_adult', type: 'boolean', example: false),
        new OA\Property(property: 'iso_639_1', type: 'string', nullable: true, example: 'en'),
        new OA\Property(property: 'iso_3166_1', type: 'string', nullable: true, example: 'US'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
#[OA\Schema(
    schema: 'ShelfItem',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'user_id', type: 'integer', example: 1),
        new OA\Property(property: 'tmdb_id', type: 'integer', example: 550),
        new OA\Property(property: 'media_type', type: 'string', enum: ['movie', 'tv'], example: 'movie'),
        new OA\Property(property: 'title', type: 'string', example: 'Fight Club'),
        new OA\Property(property: 'poster_path', type: 'string', nullable: true, example: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'),
        new OA\Property(property: 'year', type: 'integer', nullable: true, example: 1999),
        new OA\Property(property: 'watched', type: 'boolean', example: false),
        new OA\Property(property: 'want_to_watch', type: 'boolean', example: true),
        new OA\Property(property: 'favorite', type: 'boolean', example: false),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
#[OA\Schema(
    schema: 'ShelfToggleResponse',
    type: 'object',
    required: ['item', 'tmdb_id', 'media_type', 'watched', 'want_to_watch', 'favorite'],
    properties: [
        new OA\Property(property: 'item', ref: '#/components/schemas/ShelfItem', nullable: true, description: 'Null when the row is removed (all flags off)'),
        new OA\Property(property: 'tmdb_id', type: 'integer', example: 550),
        new OA\Property(property: 'media_type', type: 'string', enum: ['movie', 'tv']),
        new OA\Property(property: 'watched', type: 'boolean'),
        new OA\Property(property: 'want_to_watch', type: 'boolean'),
        new OA\Property(property: 'favorite', type: 'boolean'),
    ],
)]
#[OA\Schema(
    schema: 'ShelfFlags',
    type: 'object',
    required: ['watched', 'want_to_watch', 'favorite'],
    properties: [
        new OA\Property(property: 'watched', type: 'boolean'),
        new OA\Property(property: 'want_to_watch', type: 'boolean'),
        new OA\Property(property: 'favorite', type: 'boolean'),
    ],
)]
#[OA\Schema(
    schema: 'OmdbRating',
    type: 'object',
    properties: [
        new OA\Property(property: 'imdbId', type: 'string', example: 'tt0137523'),
        new OA\Property(property: 'rating', type: 'number', format: 'float', nullable: true, example: 8.8),
        new OA\Property(property: 'votes', type: 'string', nullable: true, example: '2,300,000'),
    ],
)]
#[OA\Schema(
    schema: 'StatusMessage',
    type: 'object',
    required: ['status'],
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'We have emailed your password reset link.'),
    ],
)]
#[OA\Schema(
    schema: 'ValidationError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'The given data was invalid.'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            additionalProperties: new OA\AdditionalProperties(
                type: 'array',
                items: new OA\Items(type: 'string'),
            ),
            example: ['email' => ['The email field is required.']],
        ),
    ],
)]
class Schemas {}

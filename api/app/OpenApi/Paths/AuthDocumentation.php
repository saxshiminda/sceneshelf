<?php

namespace App\OpenApi\Paths;

use OpenApi\Attributes as OA;

final class AuthDocumentation
{
    #[OA\Get(
        path: '/sanctum/csrf-cookie',
        operationId: 'sanctumCsrfCookie',
        tags: ['Auth'],
        summary: 'Initialize CSRF cookie',
        description: 'Sets the `XSRF-TOKEN` cookie required before login/register and other mutating web/auth requests.',
        responses: [
            new OA\Response(response: 204, description: 'CSRF cookie set'),
        ],
    )]
    public function csrfCookie(): void {}

    #[OA\Get(
        path: '/up',
        operationId: 'healthCheck',
        tags: ['Auth'],
        summary: 'Health check',
        responses: [
            new OA\Response(response: 200, description: 'Application is up'),
        ],
    )]
    public function healthCheck(): void {}

    #[OA\Post(
        path: '/register',
        operationId: 'register',
        tags: ['Auth'],
        summary: 'Register a new account',
        description: 'Creates the user, logs them in, and returns 204. Call `GET /sanctum/csrf-cookie` first.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 204, description: 'Registered and logged in'),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function register(): void {}

    #[OA\Post(
        path: '/login',
        operationId: 'login',
        tags: ['Auth'],
        summary: 'Log in',
        description: 'Creates a session cookie. Call `GET /sanctum/csrf-cookie` first.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                    new OA\Property(property: 'remember', type: 'boolean', nullable: true),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 204, description: 'Logged in'),
            new OA\Response(
                response: 422,
                description: 'Validation or authentication error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function login(): void {}

    #[OA\Post(
        path: '/auth/tmdb',
        operationId: 'loginWithTmdb',
        tags: ['Auth'],
        summary: 'Log in with a TMDB session',
        description: 'Validates the TMDB `session_id`, upserts the local user, and starts a Sanctum session. Call `GET /sanctum/csrf-cookie` first.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['session_id'],
                properties: [
                    new OA\Property(property: 'session_id', type: 'string', description: 'TMDB session ID'),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Authenticated user',
                content: new OA\JsonContent(ref: '#/components/schemas/User'),
            ),
            new OA\Response(
                response: 422,
                description: 'Invalid session or validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function loginWithTmdb(): void {}

    #[OA\Post(
        path: '/logout',
        operationId: 'logout',
        tags: ['Auth'],
        summary: 'Log out',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 204, description: 'Logged out'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ],
    )]
    public function logout(): void {}

    #[OA\Post(
        path: '/forgot-password',
        operationId: 'forgotPassword',
        tags: ['Auth'],
        summary: 'Request a password reset link',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Reset link status',
                content: new OA\JsonContent(ref: '#/components/schemas/StatusMessage'),
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function forgotPassword(): void {}

    #[OA\Post(
        path: '/reset-password',
        operationId: 'resetPassword',
        tags: ['Auth'],
        summary: 'Reset password with token',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['token', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'token', type: 'string'),
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'password', type: 'string', format: 'password'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password'),
                ],
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Password reset status',
                content: new OA\JsonContent(ref: '#/components/schemas/StatusMessage'),
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(ref: '#/components/schemas/ValidationError'),
            ),
        ],
    )]
    public function resetPassword(): void {}

    #[OA\Get(
        path: '/verify-email/{id}/{hash}',
        operationId: 'verifyEmail',
        tags: ['Auth'],
        summary: 'Verify email via signed link',
        description: 'Requires an authenticated session and a valid signed URL. Redirects to the frontend dashboard.',
        security: [['sanctum' => []]],
        parameters: [
            new OA\PathParameter(
                name: 'id',
                required: true,
                schema: new OA\Schema(type: 'integer'),
            ),
            new OA\PathParameter(
                name: 'hash',
                required: true,
                schema: new OA\Schema(type: 'string'),
            ),
            new OA\QueryParameter(
                name: 'expires',
                required: true,
                schema: new OA\Schema(type: 'integer'),
            ),
            new OA\QueryParameter(
                name: 'signature',
                required: true,
                schema: new OA\Schema(type: 'string'),
            ),
        ],
        responses: [
            new OA\Response(response: 302, description: 'Redirect to frontend dashboard with verified=1'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Invalid signature'),
        ],
    )]
    public function verifyEmail(): void {}

    #[OA\Post(
        path: '/email/verification-notification',
        operationId: 'sendEmailVerificationNotification',
        tags: ['Auth'],
        summary: 'Resend email verification notification',
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Verification link sent',
                content: new OA\JsonContent(
                    required: ['status'],
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'verification-link-sent'),
                    ],
                ),
            ),
            new OA\Response(response: 302, description: 'Already verified — redirect to dashboard'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ],
    )]
    public function sendEmailVerificationNotification(): void {}
}

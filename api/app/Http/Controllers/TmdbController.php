<?php

namespace App\Http\Controllers;

use App\Services\TmdbClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TmdbController extends Controller
{
    /** @var list<string> */
    private const ALLOWED = [
        '#^trending/(all|movie|tv)/(day|week)$#',
        '#^search/(multi|movie|tv)$#',
        '#^discover/(movie|tv)$#',
        '#^genre/(movie|tv)/list$#',
        '#^movie/[0-9]+$#',
        '#^movie/[0-9]+/similar$#',
        '#^tv/[0-9]+$#',
        '#^tv/[0-9]+/similar$#',
        '#^collection/[0-9]+$#',
        '#^authentication/token/new$#',
        '#^authentication/token/validate_with_login$#',
        '#^authentication/session/new$#',
        '#^authentication/session$#',
        '#^account$#',
    ];

    public function __construct(private TmdbClient $tmdb) {}

    public function get(Request $request, string $path): JsonResponse
    {
        $this->assertAllowed($path);

        return response()->json(
            $this->tmdb->get($path, $request->query())
        );
    }

    public function post(Request $request, string $path): JsonResponse
    {
        $this->assertAllowed($path);

        /** @var array<string, mixed> $body */
        $body = $request->all();

        return response()->json(
            $this->tmdb->post($path, $body, $request->query())
        );
    }

    public function delete(Request $request, string $path): JsonResponse
    {
        $this->assertAllowed($path);

        /** @var array<string, mixed> $body */
        $body = $request->all();

        return response()->json(
            $this->tmdb->delete($path, $body, $request->query())
        );
    }

    private function assertAllowed(string $path): void
    {
        $path = trim($path, '/');

        foreach (self::ALLOWED as $pattern) {
            if (preg_match($pattern, $path) === 1) {
                return;
            }
        }

        abort(404);
    }
}

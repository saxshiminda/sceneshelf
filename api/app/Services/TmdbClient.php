<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class TmdbClient
{
    public function get(string $path, array $query = []): array
    {
        return $this->send('get', $path, $query);
    }

    public function post(string $path, array $body = [], array $query = []): array
    {
        return $this->send('post', $path, $query, $body);
    }

    public function delete(string $path, array $body = [], array $query = []): array
    {
        return $this->send('delete', $path, $query, $body);
    }

    /**
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, array $query = [], array $body = []): array
    {
        $key = config('services.tmdb.key');

        if (! filled($key)) {
            throw new RuntimeException('TMDB API key is not configured.');
        }

        $url = rtrim((string) config('services.tmdb.base_url'), '/').'/'.ltrim($path, '/');

        /** @var PendingRequest $request */
        $request = Http::timeout(20)->acceptJson();

        /** @var Response $response */
        $response = match ($method) {
            'get' => $request->get($url, array_merge(['api_key' => $key], $query)),
            'post' => $request->asJson()->post($url.'?'.http_build_query(array_merge(['api_key' => $key], $query)), $body),
            'delete' => $request->asJson()->delete($url.'?'.http_build_query(array_merge(['api_key' => $key], $query)), $body),
            default => throw new RuntimeException("Unsupported method [{$method}]."),
        };

        if (! $response->successful()) {
            abort($response->status() >= 400 && $response->status() < 600 ? $response->status() : 502, $response->json('status_message') ?? 'TMDB request failed.');
        }

        /** @var array<string, mixed> $json */
        $json = $response->json() ?? [];

        return $json;
    }
}

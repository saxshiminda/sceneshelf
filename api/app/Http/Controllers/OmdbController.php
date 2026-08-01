<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class OmdbController extends Controller
{
    public function rating(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'imdb_id' => ['required', 'string', 'regex:/^tt\d+$/'],
        ]);

        $key = config('services.omdb.key');

        if (! filled($key)) {
            return response()->json(null);
        }

        $response = Http::timeout(15)->get('https://www.omdbapi.com/', [
            'apikey' => $key,
            'i' => $validated['imdb_id'],
        ]);

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'imdb_id' => 'Could not load IMDb rating.',
            ]);
        }

        /** @var array<string, mixed> $data */
        $data = $response->json() ?? [];

        if (($data['Response'] ?? 'False') !== 'True') {
            return response()->json(null);
        }

        $rating = isset($data['imdbRating']) && $data['imdbRating'] !== 'N/A'
            ? (float) $data['imdbRating']
            : null;

        return response()->json([
            'imdbId' => $data['imdbID'] ?? $validated['imdb_id'],
            'rating' => is_finite($rating ?? NAN) ? $rating : null,
            'votes' => isset($data['imdbVotes']) && $data['imdbVotes'] !== 'N/A'
                ? $data['imdbVotes']
                : null,
        ]);
    }
}

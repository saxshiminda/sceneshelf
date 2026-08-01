<?php

namespace App\Http\Controllers;

use App\Models\ShelfItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShelfItemController extends Controller
{
    /**
     * List the authenticated user's shelf items, optionally filtered by list.
     */
    public function index(Request $request): JsonResponse
    {
        $list = $request->query('list');

        $query = ShelfItem::query()
            ->where('user_id', $request->user()->id)
            ->latest('updated_at');

        match ($list) {
            'watched' => $query->where('watched', true),
            'want' => $query->where('want_to_watch', true),
            'favorites' => $query->where('favorite', true),
            default => null,
        };

        return response()->json($query->get());
    }

    /**
     * Get shelf flags for a single title.
     */
    public function show(Request $request, string $mediaType, int $tmdbId): JsonResponse
    {
        $this->assertMediaType($mediaType);

        $item = ShelfItem::query()
            ->where('user_id', $request->user()->id)
            ->where('media_type', $mediaType)
            ->where('tmdb_id', $tmdbId)
            ->first();

        return response()->json($item);
    }

    /**
     * Toggle a shelf flag (watched / want_to_watch / favorite).
     */
    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tmdb_id' => ['required', 'integer', 'min:1'],
            'media_type' => ['required', 'in:movie,tv'],
            'flag' => ['required', 'in:watched,want_to_watch,favorite'],
            'title' => ['required', 'string', 'max:255'],
            'poster_path' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'min:1800', 'max:2100'],
        ]);

        $item = ShelfItem::query()->firstOrNew([
            'user_id' => $request->user()->id,
            'tmdb_id' => $validated['tmdb_id'],
            'media_type' => $validated['media_type'],
        ]);

        $item->title = $validated['title'];
        $item->poster_path = $validated['poster_path'] ?? $item->poster_path;
        $item->year = $validated['year'] ?? $item->year;

        $flag = $validated['flag'];
        $item->{$flag} = ! (bool) $item->{$flag};

        // Marking watched usually means it left the want list.
        if ($flag === 'watched' && $item->watched) {
            $item->want_to_watch = false;
        }

        if (! $item->watched && ! $item->want_to_watch && ! $item->favorite) {
            if ($item->exists) {
                $item->delete();
            }

            return response()->json([
                'item' => null,
                'tmdb_id' => (int) $validated['tmdb_id'],
                'media_type' => $validated['media_type'],
                'watched' => false,
                'want_to_watch' => false,
                'favorite' => false,
            ]);
        }

        $item->save();

        return response()->json([
            'item' => $item->fresh(),
            'tmdb_id' => $item->tmdb_id,
            'media_type' => $item->media_type,
            'watched' => $item->watched,
            'want_to_watch' => $item->want_to_watch,
            'favorite' => $item->favorite,
        ]);
    }

    private function assertMediaType(string $mediaType): void
    {
        if (! in_array($mediaType, ['movie', 'tv'], true)) {
            abort(404);
        }
    }
}

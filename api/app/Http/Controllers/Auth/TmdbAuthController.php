<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TmdbClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class TmdbAuthController extends Controller
{
    public function __construct(private TmdbClient $tmdb) {}

    /**
     * Verify a TMDB session, upsert the local user, and start a Sanctum session.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $account = $this->fetchTmdbAccount($validated['session_id']);
        $tmdbId = (int) $account['id'];
        $displayName = filled($account['name'] ?? null)
            ? (string) $account['name']
            : (string) ($account['username'] ?? 'TMDB User');

        $user = User::query()->firstOrCreate(
            ['tmdb_id' => $tmdbId],
            [
                'name' => $displayName,
                'email' => $this->tmdbEmail($tmdbId),
                'password' => Str::random(40),
            ],
        );

        $user->forceFill([
            'name' => $displayName,
            'tmdb_username' => $account['username'] ?? null,
            'tmdb_session_id' => $validated['session_id'],
            'avatar_path' => $account['avatar']['tmdb']['avatar_path'] ?? null,
            'include_adult' => (bool) ($account['include_adult'] ?? false),
            'iso_639_1' => $account['iso_639_1'] ?? null,
            'iso_3166_1' => $account['iso_3166_1'] ?? null,
        ])->save();

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return response()->json($user->fresh());
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchTmdbAccount(string $sessionId): array
    {
        try {
            $account = $this->tmdb->get('account', ['session_id' => $sessionId]);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'session_id' => 'Invalid or expired TMDB session.',
            ]);
        }

        if (! isset($account['id'])) {
            throw ValidationException::withMessages([
                'session_id' => 'Could not load TMDB account.',
            ]);
        }

        return $account;
    }

    private function tmdbEmail(int $tmdbId): string
    {
        return "tmdb_{$tmdbId}@tmdb.sceneshelf.local";
    }
}

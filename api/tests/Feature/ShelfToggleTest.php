<?php

namespace Tests\Feature;

use App\Models\ShelfItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShelfToggleTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_toggle_favorite_on_a_title(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/shelf/toggle', [
            'tmdb_id' => 550,
            'media_type' => 'movie',
            'flag' => 'favorite',
            'title' => 'Fight Club',
            'poster_path' => '/pB8BM7pdK6w5OJ2aXqlRnxLf4gc.jpg',
            'year' => 1999,
        ]);

        $response->assertOk()
            ->assertJsonPath('favorite', true)
            ->assertJsonPath('tmdb_id', 550)
            ->assertJsonPath('media_type', 'movie');

        $this->assertDatabaseHas('shelf_items', [
            'user_id' => $user->id,
            'tmdb_id' => 550,
            'media_type' => 'movie',
            'title' => 'Fight Club',
            'favorite' => true,
        ]);

        $this->assertSame(1, ShelfItem::query()->where('user_id', $user->id)->count());
    }

    public function test_guest_cannot_toggle_shelf(): void
    {
        $this->postJson('/api/shelf/toggle', [
            'tmdb_id' => 550,
            'media_type' => 'movie',
            'flag' => 'favorite',
            'title' => 'Fight Club',
        ])->assertUnauthorized();
    }

    public function test_toggling_off_last_flag_deletes_shelf_item(): void
    {
        $user = User::factory()->create();

        ShelfItem::query()->create([
            'user_id' => $user->id,
            'tmdb_id' => 550,
            'media_type' => 'movie',
            'title' => 'Fight Club',
            'favorite' => true,
            'watched' => false,
            'want_to_watch' => false,
        ]);

        $response = $this->actingAs($user)->postJson('/api/shelf/toggle', [
            'tmdb_id' => 550,
            'media_type' => 'movie',
            'flag' => 'favorite',
            'title' => 'Fight Club',
        ]);

        $response->assertOk()
            ->assertJsonPath('item', null)
            ->assertJsonPath('favorite', false);

        $this->assertDatabaseMissing('shelf_items', [
            'user_id' => $user->id,
            'tmdb_id' => 550,
            'media_type' => 'movie',
        ]);
    }

    public function test_marking_watched_clears_want_to_watch(): void
    {
        $user = User::factory()->create();

        ShelfItem::query()->create([
            'user_id' => $user->id,
            'tmdb_id' => 1396,
            'media_type' => 'tv',
            'title' => 'Breaking Bad',
            'want_to_watch' => true,
            'watched' => false,
            'favorite' => false,
        ]);

        $response = $this->actingAs($user)->postJson('/api/shelf/toggle', [
            'tmdb_id' => 1396,
            'media_type' => 'tv',
            'flag' => 'watched',
            'title' => 'Breaking Bad',
        ]);

        $response->assertOk()
            ->assertJsonPath('watched', true)
            ->assertJsonPath('want_to_watch', false);

        $this->assertDatabaseHas('shelf_items', [
            'user_id' => $user->id,
            'tmdb_id' => 1396,
            'media_type' => 'tv',
            'watched' => true,
            'want_to_watch' => false,
        ]);
    }

    public function test_batch_statuses_returns_flags_for_requested_titles(): void
    {
        $user = User::factory()->create();

        ShelfItem::query()->create([
            'user_id' => $user->id,
            'tmdb_id' => 550,
            'media_type' => 'movie',
            'title' => 'Fight Club',
            'watched' => true,
            'want_to_watch' => false,
            'favorite' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/shelf/statuses', [
            'items' => [
                ['media_type' => 'movie', 'tmdb_id' => 550],
                ['media_type' => 'tv', 'tmdb_id' => 1396],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('movie:550.watched', true)
            ->assertJsonPath('movie:550.favorite', true)
            ->assertJsonPath('tv:1396.watched', false)
            ->assertJsonPath('tv:1396.want_to_watch', false)
            ->assertJsonPath('tv:1396.favorite', false);
    }
}

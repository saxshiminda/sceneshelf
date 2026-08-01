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
}

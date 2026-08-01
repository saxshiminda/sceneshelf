<?php

namespace Tests\Feature;

use App\Models\ShelfItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShelfIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_shelf_index_can_filter_by_favorites_list(): void
    {
        $user = User::factory()->create();

        ShelfItem::query()->create([
            'user_id' => $user->id,
            'tmdb_id' => 1,
            'media_type' => 'movie',
            'title' => 'Favorite Film',
            'favorite' => true,
            'watched' => false,
            'want_to_watch' => false,
        ]);

        ShelfItem::query()->create([
            'user_id' => $user->id,
            'tmdb_id' => 2,
            'media_type' => 'movie',
            'title' => 'Wanted Film',
            'favorite' => false,
            'watched' => false,
            'want_to_watch' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/api/shelf?list=favorites');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.title', 'Favorite Film');
    }
}

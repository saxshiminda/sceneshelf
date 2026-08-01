<?php

namespace Tests\Feature;

use App\Services\TmdbClient;
use Mockery\MockInterface;
use Tests\TestCase;

class TmdbProxyTest extends TestCase
{
    public function test_disallowed_tmdb_path_returns_not_found(): void
    {
        $this->getJson('/api/tmdb/configuration')
            ->assertNotFound();
    }

    public function test_allowed_tmdb_path_proxies_through_client(): void
    {
        $this->mock(TmdbClient::class, function (MockInterface $mock) {
            $mock->shouldReceive('get')
                ->once()
                ->with('movie/550', \Mockery::type('array'))
                ->andReturn(['id' => 550, 'title' => 'Fight Club']);
        });

        $this->getJson('/api/tmdb/movie/550')
            ->assertOk()
            ->assertJsonPath('title', 'Fight Club');
    }
}

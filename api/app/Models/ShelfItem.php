<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'tmdb_id',
    'media_type',
    'title',
    'poster_path',
    'year',
    'watched',
    'want_to_watch',
    'favorite',
])]
class ShelfItem extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tmdb_id' => 'integer',
            'year' => 'integer',
            'watched' => 'boolean',
            'want_to_watch' => 'boolean',
            'favorite' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

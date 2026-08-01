<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'email',
    'password',
    'tmdb_id',
    'tmdb_username',
    'tmdb_session_id',
    'avatar_path',
    'profile_photo_path',
    'include_adult',
    'iso_639_1',
    'iso_3166_1',
])]
#[Hidden(['password', 'remember_token', 'tmdb_session_id'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'tmdb_session_id' => 'encrypted',
            'include_adult' => 'boolean',
            'tmdb_id' => 'integer',
        ];
    }

    /**
     * Public URL path for an uploaded profile photo (same-origin via /storage).
     */
    protected function profilePhotoUrl(): Attribute
    {
        return Attribute::get(
            fn (): ?string => $this->profile_photo_path
                ? '/storage/'.$this->profile_photo_path
                : null,
        );
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<ShelfItem, $this>
     */
    public function shelfItems()
    {
        return $this->hasMany(ShelfItem::class);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('tmdb_id')->nullable()->unique()->after('id');
            $table->string('tmdb_username')->nullable()->after('tmdb_id');
            $table->text('tmdb_session_id')->nullable()->after('remember_token');
            $table->string('avatar_path')->nullable()->after('tmdb_session_id');
            $table->boolean('include_adult')->default(false)->after('avatar_path');
            $table->string('iso_639_1', 8)->nullable()->after('include_adult');
            $table->string('iso_3166_1', 8)->nullable()->after('iso_639_1');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'tmdb_id',
                'tmdb_username',
                'tmdb_session_id',
                'avatar_path',
                'include_adult',
                'iso_639_1',
                'iso_3166_1',
            ]);
        });
    }
};

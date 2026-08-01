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
        Schema::create('shelf_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('tmdb_id');
            $table->string('media_type', 16); // movie | tv
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->boolean('watched')->default(false);
            $table->boolean('want_to_watch')->default(false);
            $table->boolean('favorite')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'tmdb_id', 'media_type']);
            $table->index(['user_id', 'watched']);
            $table->index(['user_id', 'want_to_watch']);
            $table->index(['user_id', 'favorite']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelf_items');
    }
};

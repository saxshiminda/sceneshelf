<?php

use App\Http\Controllers\OmdbController;
use App\Http\Controllers\ProfilePhotoController;
use App\Http\Controllers\ShelfItemController;
use App\Http\Controllers\TmdbController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('tmdb')->group(function () {
    Route::get('/{path}', [TmdbController::class, 'get'])->where('path', '.*');
    Route::post('/{path}', [TmdbController::class, 'post'])->where('path', '.*');
    Route::delete('/{path}', [TmdbController::class, 'delete'])->where('path', '.*');
});

Route::get('/omdb/rating', [OmdbController::class, 'rating']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/user/profile-photo', [ProfilePhotoController::class, 'update']);
    Route::delete('/user/profile-photo', [ProfilePhotoController::class, 'destroy']);

    Route::get('/shelf', [ShelfItemController::class, 'index']);
    Route::post('/shelf/statuses', [ShelfItemController::class, 'statuses']);
    Route::get('/shelf/{mediaType}/{tmdbId}', [ShelfItemController::class, 'show'])
        ->whereNumber('tmdbId');
    Route::post('/shelf/toggle', [ShelfItemController::class, 'toggle']);
});

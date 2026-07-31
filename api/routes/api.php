<?php

use App\Http\Controllers\ProfilePhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/user/profile-photo', [ProfilePhotoController::class, 'update']);
    Route::delete('/user/profile-photo', [ProfilePhotoController::class, 'destroy']);
});

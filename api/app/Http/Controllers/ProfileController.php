<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Return the authenticated user.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * Update the authenticated user's name and optional password.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'current_password' => ['nullable', 'string'],
        ]);

        $user->name = $validated['name'];

        if (filled($validated['password'] ?? null)) {
            $isTmdbPlaceholder = str_ends_with((string) $user->email, '@tmdb.sceneshelf.local');

            if (! $isTmdbPlaceholder) {
                if (! filled($validated['current_password'] ?? null) ||
                    ! Hash::check((string) $validated['current_password'], (string) $user->password)) {
                    throw ValidationException::withMessages([
                        'current_password' => 'Current password is incorrect.',
                    ]);
                }
            }

            $user->password = $validated['password'];
        }

        $user->save();

        return response()->json($user->fresh());
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'nik' => 'nullable|string|max:16|unique:users',
            'role' => 'required|string|in:super_admin,admin,pimpinan,masyarakat,petugas',
        ]);

        $user = User::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'email' => $request->email,
            'nik' => $request->nik,
            'role' => $request->role,
            'password' => Hash::make(empty($request->password) ? 'Admin123!' : $request->password), // Default password if empty
        ]);

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
            'nik' => 'nullable|string|max:16|unique:users,nik,' . $user->id,
            'role' => 'sometimes|required|string|in:super_admin,admin,pimpinan,masyarakat,petugas',
            'status' => 'nullable|boolean' // Assuming we add a status field, or we might not have it in DB. Wait!
        ]);

        $data = $request->only(['name', 'email', 'nik', 'role']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        // We probably shouldn't delete the super admin
        if ($user->role === 'super_admin') {
            return response()->json(['message' => 'Cannot delete super admin'], 403);
        }
        $user->delete();
        return response()->json(null, 204);
    }
}

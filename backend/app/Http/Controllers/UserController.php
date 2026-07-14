<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        // Mengambil semua user kecuali admin super pertama jika perlu, tapi kita ambil semua saja.
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:user,admin'
        ]);

        $user = User::findOrFail($id);
        
        // Mencegah admin menghapus role admin dirinya sendiri (opsional tapi disarankan)
        if ($user->id === $request->user()->id && $request->role === 'user') {
            return response()->json(['message' => 'Tidak bisa mencabut akses admin dari diri sendiri!'], 400);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => "Hak akses pengguna berhasil diubah menjadi {$request->role}!", 'user' => $user]);
    }
}

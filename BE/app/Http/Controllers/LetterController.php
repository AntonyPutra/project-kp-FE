<?php

namespace App\Http\Controllers;

use App\Models\Letter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LetterController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Jika masyarakat, hanya bisa melihat suratnya sendiri
        if ($user->role === 'masyarakat') {
            return response()->json(Letter::where('user_id', $user->id)->get());
        }

        // Admin dan Pimpinan bisa melihat semua surat
        return response()->json(Letter::with('user:id,name,nik')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string|max:255',
            'attachment' => 'nullable|file|max:3072', // 3MB Max File Size
            'notes' => 'nullable|string',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('letters', 'public');
        }

        $letter = Letter::create([
            'user_id' => $request->user()->id,
            'tracking_code' => 'SRT-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5)),
            'type' => $request->type,
            'status' => 'submitted',
            'attachment_path' => $attachmentPath,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Surat berhasil diajukan',
            'data' => $letter
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $letter = Letter::with('user:id,name,nik')->find($id);
        
        if (!$letter) {
            return response()->json(['message' => 'Surat tidak ditemukan'], 404);
        }

        if ($request->user()->role === 'masyarakat' && $letter->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($letter);
    }

    public function updateStatus(Request $request, $id)
    {
        // Hanya Admin / Pimpinan yang bisa update status
        if (!in_array($request->user()->role, ['admin', 'super_admin', 'pimpinan'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'required|in:submitted,under_review,approved,rejected',
        ]);

        $letter = Letter::find($id);
        if (!$letter) {
            return response()->json(['message' => 'Surat tidak ditemukan'], 404);
        }

        $letter->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status surat berhasil diperbarui',
            'data' => $letter
        ]);
    }
}

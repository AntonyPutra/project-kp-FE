<?php

namespace App\Http\Controllers;

use App\Models\SocialAid;
use App\Models\SocialAidApplication;
use Illuminate\Http\Request;

class SocialAidController extends Controller
{
    // === API PROGRAM BANSOS ===

    public function index()
    {
        // Semua user bisa melihat program bansos
        return response()->json(SocialAid::all());
    }

    public function store(Request $request)
    {
        if (!in_array($request->user()->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'quota' => 'required|integer|min:1',
            'deadline' => 'required|date',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $aid = SocialAid::create($request->all());
        return response()->json($aid, 201);
    }

    // === API PENDAFTARAN BANSOS ===

    public function applications(Request $request)
    {
        // Admin lihat semua, masyarakat lihat pendaftarannya sendiri
        if (in_array($request->user()->role, ['super_admin', 'admin', 'pimpinan'])) {
            return response()->json(SocialAidApplication::with(['user:id,name,nik', 'socialAid:id,name'])->get());
        }

        return response()->json(SocialAidApplication::with('socialAid:id,name')
            ->where('user_id', $request->user()->id)
            ->get());
    }

    public function apply(Request $request, $aid_id)
    {
        if ($request->user()->role !== 'masyarakat') {
            return response()->json(['message' => 'Hanya masyarakat yang bisa mendaftar'], 403);
        }

        $aid = SocialAid::find($aid_id);
        if (!$aid) return response()->json(['message' => 'Program tidak ditemukan'], 404);

        // Check quota & deadline
        if (now() > $aid->deadline) {
            return response()->json(['message' => 'Pendaftaran telah ditutup'], 400);
        }
        
        $currentApplications = SocialAidApplication::where('social_aid_id', $aid_id)->count();
        if ($currentApplications >= $aid->quota) {
            return response()->json(['message' => 'Kuota telah terpenuhi'], 400);
        }

        // Cek duplikasi
        if (SocialAidApplication::where('social_aid_id', $aid_id)->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Anda sudah terdaftar di program ini'], 400);
        }

        $application = SocialAidApplication::create([
            'social_aid_id' => $aid_id,
            'user_id' => $request->user()->id,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Berhasil mendaftar bantuan sosial', 'data' => $application], 201);
    }

    public function updateApplicationStatus(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['super_admin', 'admin'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,approved,rejected,distributed',
        ]);

        $app = SocialAidApplication::find($id);
        if (!$app) return response()->json(['message' => 'Aplikasi tidak ditemukan'], 404);

        $app->update(['status' => $request->status]);

        return response()->json(['message' => 'Status pendaftaran diperbarui', 'data' => $app]);
    }
}

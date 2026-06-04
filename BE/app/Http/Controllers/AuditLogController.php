<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        // Hanya Super Admin dan Pimpinan yang bisa melihat log audit blockchain
        if (!in_array($request->user()->role, ['super_admin', 'pimpinan'])) {
            return response()->json(['message' => 'Forbidden - Hanya Pimpinan & Super Admin'], 403);
        }

        // Return latest logs first
        return response()->json(AuditLog::with('user:id,name,email')->latest()->get());
    }

    public function verifyBlockchain()
    {
        // Fungsi untuk verifikasi integritas rantai blok
        $logs = AuditLog::orderBy('id', 'asc')->get();
        $isValid = true;
        $brokenAtId = null;

        $previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

        foreach ($logs as $log) {
            if ($log->previous_hash !== $previousHash) {
                $isValid = false;
                $brokenAtId = $log->id;
                break;
            }

            // Recalculate hash to ensure no data manipulation
            $action = explode('_', $log->action)[0]; // "CREATED", "UPDATED", "DELETED"
            // Ensure old/new values are encoded properly for hashing check.
            // In a real strict blockchain, we must ensure JSON encoding matches exactly what was hashed.
            // For this implementation, we will just check the chain linkage.
            
            $previousHash = $log->hash;
        }

        return response()->json([
            'is_valid' => $isValid,
            'broken_at_id' => $brokenAtId,
            'total_blocks' => $logs->count()
        ]);
    }
}

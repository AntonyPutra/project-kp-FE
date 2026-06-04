<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditableObserver
{
    private function logAction(Model $model, string $action)
    {
        $lastLog = AuditLog::latest('id')->first();
        $previousHash = $lastLog ? $lastLog->hash : '0000000000000000000000000000000000000000000000000000000000000000';

        $entityType = get_class($model);
        $entityId = $model->id;
        $oldValues = $action === 'created' ? null : json_encode($model->getOriginal());
        $newValues = $action === 'deleted' ? null : json_encode($model->getAttributes());
        $userId = Auth::id();
        $timestamp = now()->toDateTimeString();

        // Calculate SHA-256 Hash (Blockchain concept)
        $dataToHash = $previousHash . $action . $entityType . $entityId . $newValues . $timestamp;
        $currentHash = hash('sha256', $dataToHash);

        AuditLog::create([
            'user_id' => $userId,
            'action' => strtoupper($action) . '_' . class_basename($model),
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $action === 'created' ? null : $model->getOriginal(),
            'new_values' => $action === 'deleted' ? null : $model->getAttributes(),
            'hash' => $currentHash,
            'previous_hash' => $previousHash,
        ]);
    }

    public function created(Model $model): void
    {
        $this->logAction($model, 'created');
    }

    public function updated(Model $model): void
    {
        $this->logAction($model, 'updated');
    }

    public function deleted(Model $model): void
    {
        $this->logAction($model, 'deleted');
    }
}

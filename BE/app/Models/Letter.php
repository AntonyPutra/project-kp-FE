<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Letter extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'tracking_code',
        'type',
        'status',
        'attachment_path',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

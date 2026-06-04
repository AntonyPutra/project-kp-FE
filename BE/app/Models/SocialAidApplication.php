<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SocialAidApplication extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'social_aid_id',
        'user_id',
        'status',
    ];

    public function socialAid()
    {
        return $this->belongsTo(SocialAid::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

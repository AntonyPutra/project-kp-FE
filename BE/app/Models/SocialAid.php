<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SocialAid extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'quota',
        'deadline',
        'amount',
    ];

    public function applications()
    {
        return $this->hasMany(SocialAidApplication::class);
    }
}

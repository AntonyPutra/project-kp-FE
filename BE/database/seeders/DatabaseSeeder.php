<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin
        User::firstOrCreate(
            ['email' => 'admin@whaleestudio.my.id'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('AdminSICAMS2026!'),
                'role' => 'super_admin',
                'nik' => '1234567890123456',
                'phone' => '081234567890',
            ]
        );

        // Create Default Pimpinan
        User::firstOrCreate(
            ['email' => 'kepala@desa.id'],
            [
                'name' => 'Kepala Desa',
                'password' => Hash::make('KepalaDesa2026!'),
                'role' => 'pimpinan',
                'nik' => '1234567890123457',
            ]
        );

        // Create Default Masyarakat
        User::firstOrCreate(
            ['email' => 'warga@desa.id'],
            [
                'name' => 'Warga Teladan',
                'password' => Hash::make('WargaDesa2026!'),
                'role' => 'masyarakat',
                'nik' => '1234567890123458',
            ]
        );
    }
}

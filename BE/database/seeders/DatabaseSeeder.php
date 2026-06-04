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
        // Super Admin
        User::firstOrCreate(
            ['email' => 'superadmin@sicams.id'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin123!'),
                'role' => 'super_admin',
                'nik' => '1111111111111111',
                'phone' => '081111111111',
            ]
        );

        // Admin
        User::firstOrCreate(
            ['email' => 'admin@sicams.id'],
            [
                'name' => 'Admin Kelurahan',
                'password' => Hash::make('Admin123!'),
                'role' => 'admin',
                'nik' => '2222222222222222',
            ]
        );

        // Petugas
        User::firstOrCreate(
            ['email' => 'petugas@sicams.id'],
            [
                'name' => 'Petugas Lapangan',
                'password' => Hash::make('Admin123!'),
                'role' => 'petugas',
                'nik' => '3333333333333333',
            ]
        );

        // Masyarakat
        User::firstOrCreate(
            ['email' => 'user@sicams.id'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('User123!'),
                'role' => 'masyarakat',
                'nik' => '4444444444444444',
            ]
        );

        // Pimpinan
        User::firstOrCreate(
            ['email' => 'pimpinan@sicams.id'],
            [
                'name' => 'Kepala Kelurahan',
                'password' => Hash::make('Admin123!'),
                'role' => 'pimpinan',
                'nik' => '5555555555555555',
            ]
        );
    }
}

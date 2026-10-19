<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class CleanDummyUsersSeeder extends Seeder
{
    public function run(): void
    {
        User::where('email', 'siswa@edusync.sch.id')->update([
            'name' => 'Fajar Pratama',
            'sub_role' => 'Ketua Kelas',
            'is_class_leader' => true,
        ]);

        User::where('name', 'like', 'Siswa Terupdate%')->update([
            'name' => 'Fajar Pratama',
            'sub_role' => 'Ketua Kelas',
            'is_class_leader' => true,
        ]);

        User::where('name', 'like', 'Siswa Baru%')->update([
            'name' => 'Aditya Nugraha',
            'sub_role' => 'Siswa',
            'is_class_leader' => false,
        ]);

        User::where('name', 'Calon Ketua Kelas')->update([
            'name' => 'Muhammad Rizqi Pratama',
            'sub_role' => 'Ketua Kelas',
            'is_class_leader' => true,
        ]);

        User::where('name', 'Calon Siswa Biasa')->update([
            'name' => 'Zahra Salsabila',
            'sub_role' => 'Siswa',
            'is_class_leader' => false,
        ]);

        User::where('name', 'Siswa Izin Test')->update([
            'name' => 'Gilang Ramadhan',
            'sub_role' => 'Siswa',
            'is_class_leader' => false,
        ]);
    }
}

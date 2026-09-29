<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Classroom;

class ClassLeaderSyncSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Mark existing Ketua Kelas users
        User::where('sub_role', 'Ketua Kelas')->update(['is_class_leader' => true]);

        // 2. Link classrooms to their class leaders
        $leaders = User::where('is_class_leader', true)->whereNotNull('classroom_id')->get();
        foreach ($leaders as $leader) {
            Classroom::where('id', $leader->classroom_id)->update(['class_leader_id' => $leader->id]);
        }

        // 3. For any classroom without a class leader, assign the first student if available
        $classrooms = Classroom::whereNull('class_leader_id')->get();
        foreach ($classrooms as $cls) {
            $firstStudent = User::where('classroom_id', $cls->id)->where('role', 'siswa')->first();
            if ($firstStudent) {
                $firstStudent->update([
                    'is_class_leader' => true,
                    'sub_role' => 'Ketua Kelas',
                ]);
                $cls->update(['class_leader_id' => $firstStudent->id]);
            }
        }
    }
}

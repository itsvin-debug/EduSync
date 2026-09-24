<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            EduSyncSeeder::class,
            AdminCoreFeaturesSeeder::class,
            EnterpriseConsolidationSeeder::class,
        ]);
    }
}

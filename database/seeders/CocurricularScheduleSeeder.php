<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CocurricularSchedule;
use App\Models\Classroom;
use Illuminate\Support\Facades\Schema;

class CocurricularScheduleSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate existing records to avoid duplicates
        Schema::disableForeignKeyConstraints();
        CocurricularSchedule::truncate();
        Schema::enableForeignKeyConstraints();

        // Map classroom names to their ID
        $classrooms = Classroom::all()->keyBy(function ($item) {
            return strtolower(trim($item->name));
        });

        $dataset = [
            // Week 1: 29 September - 2 Oktober 2026
            [
                'week' => '29 September - 2 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-09-29',
                'class' => 'OSIS',
                'desc' => 'Pentas seni & kreasi siswa pembuka periode semester ganjil oleh pengurus OSIS.',
            ],
            [
                'week' => '29 September - 2 Oktober 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-09-30',
                'class' => 'ROHIS',
                'desc' => 'Sarapan gizi seimbang bersama & tausiyah kebersamaan dipandu ROHIS.',
            ],
            [
                'week' => '29 September - 2 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-10-01',
                'class' => 'XI BCF 1',
                'desc' => 'Apresiasi sinematografi, monolog, dan karya broadcasting siswa kelas XI BCF 1.',
            ],
            [
                'week' => '29 September - 2 Oktober 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-10-02',
                'class' => 'X BCF 1',
                'desc' => 'Pembacaan Surah Yasin, Asmaul Husna, sholawat berjamaah, dan kultum oleh kelas X BCF 1.',
            ],

            // Week 2: 6 - 9 Oktober 2026
            [
                'week' => '6 - 9 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-10-06',
                'class' => 'XI BCF 2',
                'desc' => 'Pertunjukan kreasi seni vokal dan teater mini oleh kelas XI BCF 2.',
            ],
            [
                'week' => '6 - 9 Oktober 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-10-07',
                'class' => 'X BCF 2',
                'desc' => 'Gerakan makan bekal sehat bersama seluruh warga sekolah dikoordinasi X BCF 2.',
            ],
            [
                'week' => '6 - 9 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-10-08',
                'class' => 'XI PPLG 1',
                'desc' => 'Demo inovasi digital, musikalisasi puisi, dan standup kreasi kelas XI PPLG 1.',
            ],
            [
                'week' => '6 - 9 Oktober 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-10-09',
                'class' => 'X PPLG 1',
                'desc' => 'Tadarus akbar, dzikir pagi, dan tadabbur Al-Quran dipimpin petugas X PPLG 1.',
            ],

            // Week 3: 13 - 16 Oktober 2026
            [
                'week' => '13 - 16 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-10-13',
                'class' => 'XI PPLG 2',
                'desc' => 'Unjuk bakat seni akustik dan tari kontemporer kelas XI PPLG 2.',
            ],
            [
                'week' => '13 - 16 Oktober 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-10-14',
                'class' => 'X PPLG 2',
                'desc' => 'Sarapan sehat bersama, edukasi gizi, dan keakraban kelas dikoordinir X PPLG 2.',
            ],
            [
                'week' => '13 - 16 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-10-15',
                'class' => 'XI PPLG 3',
                'desc' => 'Pentas seni drama pendek dan beatbox modern kelas XI PPLG 3.',
            ],
            [
                'week' => '13 - 16 Oktober 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-10-16',
                'class' => 'X PPLG 3',
                'desc' => 'Kultum islami adab menuntut ilmu dan istighotsah pagi oleh petugas X PPLG 3.',
            ],

            // Week 4: 20 - 23 Oktober 2026
            [
                'week' => '20 - 23 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-10-20',
                'class' => 'XI TPFL',
                'desc' => 'Kreasi yel-yel teknik mesin industri dan parade seni kelas XI TPFL.',
            ],
            [
                'week' => '20 - 23 Oktober 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-10-21',
                'class' => 'X TPFL',
                'desc' => 'Makan bekal bersama di koridor tengah dipandu oleh kelas X TPFL.',
            ],
            [
                'week' => '20 - 23 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-10-22',
                'class' => 'XI TO 1',
                'desc' => 'Pentas vokal grup dan musik perkusi otomotif kelas XI TO 1.',
            ],
            [
                'week' => '20 - 23 Oktober 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-10-23',
                'class' => 'X TO 1',
                'desc' => 'Pembacaan Al-Kahfi dan doa bersama untuk kelancaran studi oleh kelas X TO 1.',
            ],

            // Week 5: 27 - 30 Oktober 2026
            [
                'week' => '27 - 30 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-10-27',
                'class' => 'XI TO 2',
                'desc' => 'Ekspresi kreasi seni teater komedi edukatif kelas XI TO 2.',
            ],
            [
                'week' => '27 - 30 Oktober 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-10-28',
                'class' => 'X TO 2',
                'desc' => 'Sarapan bareng bertema Hari Sumpah Pemuda dipandu kelas X TO 2.',
            ],
            [
                'week' => '27 - 30 Oktober 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-10-29',
                'class' => 'XI Animasi 1',
                'desc' => 'Pameran kreasi live-drawing, cosplay karakter lokal, dan monolog kelas XI Animasi 1.',
            ],
            [
                'week' => '27 - 30 Oktober 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-10-30',
                'class' => 'X Animasi 1',
                'desc' => 'Kegiatan rohani Jumat pagi, kultum kejujuran, dan sholawat oleh X Animasi 1.',
            ],

            // Week 6: 3 - 6 November 2026
            [
                'week' => '3 - 6 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-11-03',
                'class' => 'XI Animasi 2',
                'desc' => 'Penampilan kreasi seni gerak dan vocal harmony kelas XI Animasi 2.',
            ],
            [
                'week' => '3 - 6 November 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-11-04',
                'class' => 'X Animasi 2',
                'desc' => 'Kegiatan makan sehat bersama & bersih piring kelas X Animasi 2.',
            ],
            [
                'week' => '3 - 6 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-11-05',
                'class' => 'X BCF 1',
                'desc' => 'Pentas kreasi puisi berantai dan pantun jenaka siswa kelas X BCF 1.',
            ],
            [
                'week' => '3 - 6 November 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-11-06',
                'class' => 'XI BCF 1',
                'desc' => 'Peringatan Jumat berkah, lantunan qasidah, dan doa belajar kelas XI BCF 1.',
            ],

            // Week 7: 10 - 13 November 2026
            [
                'week' => '10 - 13 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-11-10',
                'class' => 'X BCF 2',
                'desc' => 'Pentas teatrikal Hari Pahlawan 10 November oleh kelas X BCF 2.',
            ],
            [
                'week' => '10 - 13 November 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-11-11',
                'class' => 'XI BCF 2',
                'desc' => 'Sarapan bekal tradisional nusantara bersama kelas XI BCF 2.',
            ],
            [
                'week' => '10 - 13 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-11-12',
                'class' => 'X PPLG 1',
                'desc' => 'Pentas kreasi band akustik dan pidato inspiratif 3 bahasa kelas X PPLG 1.',
            ],
            [
                'week' => '10 - 13 November 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-11-13',
                'class' => 'XI PPLG 1',
                'desc' => 'Kultum etika bermedia sosial dalam pandangan agama oleh kelas XI PPLG 1.',
            ],

            // Week 8: 17 - 20 November 2026
            [
                'week' => '17 - 20 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-11-17',
                'class' => 'X PPLG 2',
                'desc' => 'Penampilan tari kreasi daerah dan solo vokal kelas X PPLG 2.',
            ],
            [
                'week' => '17 - 20 November 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-11-18',
                'class' => 'XI PPLG 2',
                'desc' => 'Program sarapan sehat tanpa sampah plastik terkelola oleh XI PPLG 2.',
            ],
            [
                'week' => '17 - 20 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-11-19',
                'class' => 'X PPLG 3',
                'desc' => 'Unjuk kebolehan pidato bahasa Jepang & pantomim kelas X PPLG 3.',
            ],
            [
                'week' => '17 - 20 November 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-11-20',
                'class' => 'XI PPLG 3',
                'desc' => 'Tadarus pagi, dzikir bersama, dan kultum berbakti kepada orang tua oleh XI PPLG 3.',
            ],

            // Week 9: 24 - 27 November 2026
            [
                'week' => '24 - 27 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-11-24',
                'class' => 'X TPFL',
                'desc' => 'Koreografi modern dance santun dan storytelling kelas X TPFL.',
            ],
            [
                'week' => '24 - 27 November 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-11-25',
                'class' => 'XI TPFL',
                'desc' => 'Makan bersama peringatan Hari Guru Nasional dipandu siswa XI TPFL.',
            ],
            [
                'week' => '24 - 27 November 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-11-26',
                'class' => 'X TO 1',
                'desc' => 'Pentas kreasi parade puisi guru dan musikalitas kelas X TO 1.',
            ],
            [
                'week' => '24 - 27 November 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-11-27',
                'class' => 'XI TO 1',
                'desc' => 'Muhasabah Jumat pagi menyambut akhir semester bersama XI TO 1.',
            ],

            // Week 10: 1 - 4 Desember 2026
            [
                'week' => '1 - 4 Desember 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-12-01',
                'class' => 'X TO 2',
                'desc' => 'Pentas teaterikal motivasi ujian semester oleh kelas X TO 2.',
            ],
            [
                'week' => '1 - 4 Desember 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-12-02',
                'class' => 'XI TO 2',
                'desc' => 'Sarapan sehat berenergi menghadapi asesmen akhir dipandu XI TO 2.',
            ],
            [
                'week' => '1 - 4 Desember 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Kamis',
                'date' => '2026-12-03',
                'class' => 'X Animasi 1',
                'desc' => 'Pentas kreasi komik strip dan seni musik kelas X Animasi 1.',
            ],
            [
                'week' => '1 - 4 Desember 2026',
                'activity' => 'Jumat Taqwa',
                'day' => 'Jumat',
                'date' => '2026-12-04',
                'class' => 'XI Animasi 1',
                'desc' => 'Doa bersama menyambut Penilaian Akhir Semester (PAS) dipimpin XI Animasi 1.',
            ],

            // Week 11: 8 - 11 Desember 2026
            [
                'week' => '8 - 11 Desember 2026',
                'activity' => 'Pentas Kreasi',
                'day' => 'Selasa',
                'date' => '2026-12-08',
                'class' => 'X Animasi 2',
                'desc' => 'Penampilan kreasi penutup semester kelas X Animasi 2.',
            ],
            [
                'week' => '8 - 11 Desember 2026',
                'activity' => 'Makan Bersama',
                'day' => 'Rabu',
                'date' => '2026-12-09',
                'class' => 'XI Animasi 2',
                'desc' => 'Makan bersama tasyakuran akhir semester ganjil dipandu XI Animasi 2.',
            ],
        ];

        foreach ($dataset as $row) {
            $classKey = strtolower(trim($row['class']));
            $classId = isset($classrooms[$classKey]) ? $classrooms[$classKey]->id : null;

            CocurricularSchedule::create([
                'week_range' => $row['week'],
                'activity_name' => $row['activity'],
                'day_name' => $row['day'],
                'date' => $row['date'],
                'class_name' => $row['class'],
                'classroom_id' => $classId,
                'time_start' => '06:45',
                'time_end' => '07:45',
                'location' => $row['activity'] === 'Makan Bersama' ? 'Koridor & Selasar Kelas' : 'Lapangan Utama SMKN 1 Ciomas',
                'description' => $row['desc'],
                'status' => 'scheduled',
            ]);
        }
    }
}

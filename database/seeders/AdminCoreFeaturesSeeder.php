<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Models\Subject;
use App\Models\StudentAttendance;
use App\Models\TeacherAttendance;
use App\Models\LearningTask;
use App\Models\OfficialDutyLeave;
use App\Models\PicketReport;
use App\Models\TrashReport;
use App\Models\ClassFine;
use App\Models\SchoolOrganization;
use App\Models\AuditLog;
use Carbon\Carbon;

class AdminCoreFeaturesSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today()->toDateString();
        $admin = User::where('role', 'admin')->first();
        $students = User::where('role', 'siswa')->get();
        $teachers = Teacher::whereNotNull('name')->get();
        $classrooms = Classroom::all();
        $subjects = Subject::all();

        // 1. Seed Student Attendances
        $statuses = ['hadir', 'hadir', 'hadir', 'hadir', 'sakit', 'izin', 'hadir', 'hadir'];
        $ketua = $students->firstWhere('sub_role', 'Ketua Kelas') ?? $students->first();

        foreach ($students as $idx => $student) {
            $status = $statuses[$idx % count($statuses)];
            StudentAttendance::updateOrCreate(
                [
                    'user_id' => $student->id,
                    'date' => $today,
                ],
                [
                    'classroom_id' => $student->classroom_id ?? $classrooms->first()->id,
                    'submitted_by_user_id' => $ketua?->id,
                    'status' => $status,
                    'notes' => $status === 'sakit' ? 'Surat dokter terlampir' : ($status === 'izin' ? 'Acara keluarga' : 'Tepat waktu'),
                    'submitted_time' => '07:' . str_pad(10 + ($idx % 20), 2, '0', STR_PAD_LEFT) . ' WIB',
                ]
            );
        }

        // 2. Seed Teacher Attendances
        foreach ($teachers->take(15) as $idx => $t) {
            $tStatus = $idx === 2 ? 'izin_dinas' : ($idx === 5 ? 'sakit' : 'hadir');
            TeacherAttendance::updateOrCreate(
                [
                    'teacher_id' => $t->id,
                    'date' => $today,
                ],
                [
                    'status' => $tStatus,
                    'check_in_time' => $tStatus === 'hadir' ? '06:' . str_pad(20 + ($idx % 15), 2, '0', STR_PAD_LEFT) : null,
                    'notes' => $tStatus === 'izin_dinas' ? 'Surat Tugas Disdik Jabar' : ($tStatus === 'sakit' ? 'Rawat jalan' : 'Fingerprint valid'),
                ]
            );
        }

        // 3. Learning Tasks (Tugas KBM Guru Pengganti / Izin)
        $teacher2 = $teachers->skip(2)->first();
        $cls1 = $classrooms->firstWhere('code', 'XI_PPLG_1') ?? $classrooms->first();
        $sub1 = $subjects->first();
        if ($teacher2 && $cls1 && $sub1) {
            LearningTask::updateOrCreate(
                [
                    'teacher_id' => $teacher2->id,
                    'classroom_id' => $cls1->id,
                    'date' => $today,
                ],
                [
                    'subject_id' => $sub1->id,
                    'period_start' => 3,
                    'period_end' => 4,
                    'title' => 'Praktikum Refactoring Clean Architecture & REST API',
                    'instructions' => 'Pelajari modul RESTful API pada LMS, kerjakan studi kasus controller resource, dan kumpulkan commit GitHub sebelum pukul 14:00 WIB.',
                    'file_url' => 'https://edusync.sch.id/docs/modul-kbm-mandiri.pdf',
                    'is_verified' => true,
                ]
            );
        }

        // 4. Official Duty Leaves (Izin Keluar Dinas)
        $teacherDuty = $teachers->firstWhere('code', '41A') ?? $teachers->first();
        if ($teacherDuty) {
            OfficialDutyLeave::updateOrCreate(
                [
                    'teacher_id' => $teacherDuty->id,
                    'date' => $today,
                ],
                [
                    'start_time' => '08:00',
                    'end_time' => '14:30',
                    'destination' => 'Balai Besar Pengembangan Penjaminan Mutu Pendidikan Vokasi (BBPPMPV)',
                    'purpose' => 'Workshop Penyelarasan Kurikulum Berbasis Industri DUDI Skema Kerangka Kualifikasi Nasional Indonesia (KKNI)',
                    'letter_number' => 'ST/084/SMKN1/IX/2026',
                    'document_url' => 'https://edusync.sch.id/docs/surat-tugas-bbppmpv.pdf',
                    'status' => 'approved',
                    'duty_status' => 'di_luar_dinas',
                    'completion_report' => null,
                    'reviewed_by_user_id' => $admin?->id,
                    'reviewed_at' => now()->subHours(2),
                ]
            );
        }

        // 5. Picket Reports (Cleanliness Proof)
        if ($cls1 && $ketua) {
            PicketReport::updateOrCreate(
                [
                    'classroom_id' => $cls1->id,
                    'date' => $today,
                ],
                [
                    'student_id' => $ketua->id,
                    'photo_url' => 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
                    'video_url' => 'https://edusync.sch.id/videos/piket-xi-pplg-1.mp4',
                    'notes' => 'Piket sore selesai: lantai disapu & dipel, papan tulis bersih, jendela terkunci rapat, AC dimatikan.',
                    'delivery_time' => '15:10 WIB',
                    'status' => 'approved',
                    'validator_user_id' => $admin?->id,
                    'validation_notes' => 'Sesuai standar 5R kebersihan ruang kelas vokasi.',
                    'verified_at' => now(),
                ]
            );
        }

        // 6. Trash Reports (Laporan Sampah oleh Guru)
        $teacherTrash = $teachers->firstWhere('code', '26A') ?? $teachers->first();
        $clsTrash = $classrooms->firstWhere('code', 'X_TO_1') ?? $classrooms->skip(1)->first();
        if ($teacherTrash && $clsTrash) {
            $trashRep = TrashReport::updateOrCreate(
                [
                    'classroom_id' => $clsTrash->id,
                    'teacher_id' => $teacherTrash->id,
                    'date' => $today,
                ],
                [
                    'quantity_description' => 'Terdapat tumpukan botol plastik minuman dan remahan snack di area meja sudut belakang setelah jam istirahat pertama.',
                    'photo_url' => 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
                    'period_time' => 'Jam ke-5 (10:15 WIB)',
                    'status' => 'fined',
                ]
            );

            // 7. Class Fine (Denda Kebersihan Kelas)
            ClassFine::updateOrCreate(
                [
                    'trash_report_id' => $trashRep->id,
                    'classroom_id' => $clsTrash->id,
                ],
                [
                    'issued_by_teacher_id' => $teacherTrash->id,
                    'homeroom_teacher_id' => $clsTrash->homeroom_teacher_id,
                    'amount' => 50000,
                    'reason' => 'Denda Pelanggaran Kebersihan: Sampah berserakan di ruang kelas saat jam pembelajaran berlangsung.',
                    'payment_status' => 'menunggu_konfirmasi',
                    'payment_proof_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
                    'payment_notes' => 'Kas kelas telah diserahkan oleh Bendahara Kelas ke Wali Kelas sebesar Rp 50.000 via transfer QRIS.',
                    'submitted_payment_at' => now()->subMinutes(45),
                ]
            );
        }

        // 8. School Organizations & Extracurriculars
        $orgs = [
            [
                'name' => 'Organisasi Siswa Intra Sekolah (OSIS)',
                'type' => 'organisasi',
                'leader_name' => 'Fathir Al Ghifari (XI PPLG 1)',
                'schedule_day' => 'Senin & Kamis',
                'schedule_time' => '15:30 - 17:00 WIB',
                'location' => 'Ruang Sekretariat OSIS & Aula',
                'member_count' => 45,
                'description' => 'Badan eksekutif kesiswaan tertinggi sekolah pelaksana program kerja kepemimpinan dan bela negara.',
            ],
            [
                'name' => 'Majelis Perwakilan Kelas (MPK)',
                'type' => 'organisasi',
                'leader_name' => 'Nabila Syahrani (XI BCF 2)',
                'schedule_day' => 'Selasa',
                'schedule_time' => '15:30 - 17:00 WIB',
                'location' => 'Ruang Sidang MPK',
                'member_count' => 32,
                'description' => 'Lembaga legislatif siswa yang mengawasi kinerja OSIS dan menampung aspirasi perwakilan rombel.',
            ],
            [
                'name' => 'Pramuka Penegak Ambalan',
                'type' => 'ekskul',
                'leader_name' => 'Bintang Pratama (XI TO 1)',
                'schedule_day' => 'Jumat',
                'schedule_time' => '13:30 - 15:30 WIB',
                'location' => 'Lapangan Utama Sekolah',
                'member_count' => 120,
                'description' => 'Kegiatan kepanduan wajib vokasi pembentuk karakter disiplin, kemandirian, dan ketahanan fisik.',
            ],
            [
                'name' => 'Paskibra Satuan Rekayasa',
                'type' => 'ekskul',
                'leader_name' => 'Dimas Arya Saputra (XI TPFL)',
                'schedule_day' => 'Rabu & Sabtu',
                'schedule_time' => '15:30 - 17:30 WIB',
                'location' => 'Plaza Upacara & Lapangan Olahraga',
                'member_count' => 38,
                'description' => 'Pasukan Pengibar Bendera Sekolah terlatih untuk upacara kenegaraan dan kompetisi baris-berbaris.',
            ],
            [
                'name' => 'Palang Merah Remaja (PMR Wira)',
                'type' => 'ekskul',
                'leader_name' => 'Siti Annisa Rahma (X Animasi 1)',
                'schedule_day' => 'Kamis',
                'schedule_time' => '15:30 - 17:00 WIB',
                'location' => 'Ruang UKS Terpadu',
                'member_count' => 42,
                'description' => 'Korp sukarela pertolongan pertama pada kecelakaan dan edukasi kesehatan reproduksi remaja.',
            ],
            [
                'name' => 'Club Riset Coding & Robotika (IT Club)',
                'type' => 'ekskul',
                'leader_name' => 'Rafi Ihsanul (XI PPLG 2)',
                'schedule_day' => 'Jumat',
                'schedule_time' => '13:00 - 15:30 WIB',
                'location' => 'Lab Software & Bengkel IoT',
                'member_count' => 55,
                'description' => 'Klub kejuruan IT pemenang LKS bidang Web Technologies, Mobile App Development, dan IoT.',
            ],
        ];

        foreach ($orgs as $idx => $org) {
            $pembina = $teachers[$idx % $teachers->count()];
            SchoolOrganization::updateOrCreate(
                ['name' => $org['name']],
                array_merge($org, [
                    'supervisor_teacher_id' => $pembina->id,
                    'status' => 'active',
                ])
            );
        }

        // 9. Seed Audit Logs
        $logs = [
            ['action' => 'ATTENDANCE_RECALCULATED', 'description' => 'Sistem melakukan sinkronisasi dinamis rekapitulasi kehadiran 31 rombel.'],
            ['action' => 'DUTY_LEAVE_APPROVED', 'description' => 'Admin menyetujui izin dinas luar BBPPMPV untuk pengajar.'],
            ['action' => 'FINE_ISSUED', 'description' => 'Denda kebersihan kelas Rp 50.000 diterbitkan untuk rombel terverifikasi sampah.'],
            ['action' => 'PICKET_VALIDATED', 'description' => 'Admin memverifikasi dokumentasi piket harian kelas XI PPLG 1 (15:10 WIB).'],
        ];

        foreach ($logs as $l) {
            AuditLog::create([
                'user_id' => $admin?->id,
                'action' => $l['action'],
                'description' => $l['description'],
                'details' => ['ip' => '127.0.0.1', 'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'],
                'ip_address' => '127.0.0.1',
            ]);
        }
    }
}

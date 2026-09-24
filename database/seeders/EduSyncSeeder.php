<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Room;
use App\Models\Classroom;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Models\User;
use App\Models\PicketReport;
use App\Models\InvalRequest;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;

class EduSyncSeeder extends Seeder
{
    public function run(): void
    {
        // 1. TIME SLOTS
        $timeSlots = [
            ['period_number' => 1, 'day_type' => 'regular', 'name' => 'Jam ke-1', 'start_time' => '06:30', 'end_time' => '07:30', 'is_break' => false, 'label' => 'Upacara / Pembinaan / Karakter'],
            ['period_number' => 2, 'day_type' => 'regular', 'name' => 'Jam ke-2', 'start_time' => '07:30', 'end_time' => '08:10', 'is_break' => false, 'label' => 'Sesi Belajar 1'],
            ['period_number' => 3, 'day_type' => 'regular', 'name' => 'Jam ke-3', 'start_time' => '08:10', 'end_time' => '08:50', 'is_break' => false, 'label' => 'Sesi Belajar 2'],
            ['period_number' => 4, 'day_type' => 'regular', 'name' => 'Jam ke-4', 'start_time' => '08:50', 'end_time' => '09:30', 'is_break' => false, 'label' => 'Sesi Belajar 3'],
            ['period_number' => 0, 'day_type' => 'regular', 'name' => 'Istirahat 1', 'start_time' => '09:30', 'end_time' => '10:00', 'is_break' => true, 'label' => 'Istirahat Pertama'],
            ['period_number' => 5, 'day_type' => 'regular', 'name' => 'Jam ke-5', 'start_time' => '10:00', 'end_time' => '10:40', 'is_break' => false, 'label' => 'Sesi Belajar 4'],
            ['period_number' => 6, 'day_type' => 'regular', 'name' => 'Jam ke-6', 'start_time' => '10:40', 'end_time' => '11:20', 'is_break' => false, 'label' => 'Sesi Belajar 5'],
            ['period_number' => 7, 'day_type' => 'regular', 'name' => 'Jam ke-7', 'start_time' => '11:20', 'end_time' => '12:00', 'is_break' => false, 'label' => 'Sesi Belajar 6'],
            ['period_number' => 0, 'day_type' => 'regular', 'name' => 'Istirahat 2', 'start_time' => '12:00', 'end_time' => '13:00', 'is_break' => true, 'label' => 'Istirahat Kedua / ISOMA'],
            ['period_number' => 8, 'day_type' => 'regular', 'name' => 'Jam ke-8', 'start_time' => '13:00', 'end_time' => '13:40', 'is_break' => false, 'label' => 'Sesi Belajar 7'],
            ['period_number' => 9, 'day_type' => 'regular', 'name' => 'Jam ke-9', 'start_time' => '13:40', 'end_time' => '14:20', 'is_break' => false, 'label' => 'Sesi Belajar 8'],
            ['period_number' => 10, 'day_type' => 'regular', 'name' => 'Jam ke-10', 'start_time' => '14:20', 'end_time' => '15:00', 'is_break' => false, 'label' => 'Sesi Belajar 9'],
        ];

        foreach ($timeSlots as $slot) {
            TimeSlot::updateOrCreate(
                ['period_number' => $slot['period_number'], 'day_type' => $slot['day_type'], 'name' => $slot['name']],
                $slot
            );
        }

        // 2. DEPARTMENTS (JURUSAN)
        $departmentsData = [
            ['code' => 'PPLG', 'name' => 'Pengembangan Perangkat Lunak dan Gim', 'head_teacher_name' => 'Didin Sahrudin, M.Kom', 'color' => 'indigo', 'icon' => 'code'],
            ['code' => 'ANM', 'name' => 'Animasi', 'head_teacher_name' => 'Hanna Elhaq, S.Ds', 'color' => 'amber', 'icon' => 'palette'],
            ['code' => 'BCF', 'name' => 'Broadcasting dan Perfilman', 'head_teacher_name' => 'Cynthia Gema Lestari, S.I.Kom', 'color' => 'sky', 'icon' => 'video'],
            ['code' => 'TO', 'name' => 'Teknik Otomotif', 'head_teacher_name' => 'Bachtiar, S.Pd', 'color' => 'emerald', 'icon' => 'tool'],
            ['code' => 'TPFL', 'name' => 'Teknik Pengelasan dan Fabrikasi Logam', 'head_teacher_name' => 'Bambang Nurcahyono, M.Pd', 'color' => 'rose', 'icon' => 'flame'],
        ];

        $deptMap = [];
        foreach ($departmentsData as $d) {
            $deptMap[$d['code']] = Department::updateOrCreate(['code' => $d['code']], $d);
        }

        // 3. PHYSICAL ROOMS & LABS
        $roomsData = [
            ['code' => 'LAB_PPLG_1', 'name' => 'Lab Software Engineering 1', 'building' => 'Gedung A (Lt. 2)', 'capacity' => 36, 'type' => 'lab'],
            ['code' => 'LAB_PPLG_2', 'name' => 'Lab Mobile & Game Dev 2', 'building' => 'Gedung A (Lt. 2)', 'capacity' => 36, 'type' => 'lab'],
            ['code' => 'STUDIO_ANM_1', 'name' => 'Studio Animasi 2D Drawing', 'building' => 'Gedung C (Lt. 1)', 'capacity' => 32, 'type' => 'lab'],
            ['code' => 'STUDIO_ANM_2', 'name' => 'Studio Render 3D CGI', 'building' => 'Gedung C (Lt. 2)', 'capacity' => 32, 'type' => 'lab'],
            ['code' => 'STUDIO_BCF', 'name' => 'Studio Broadcast TV & Audio', 'building' => 'Gedung Media BCF', 'capacity' => 30, 'type' => 'lab'],
            ['code' => 'BENGKEL_TO_1', 'name' => 'Bengkel Chassis & Mesin Otomotif', 'building' => 'Gedung Praktik Otomotif', 'capacity' => 40, 'type' => 'bengkel'],
            ['code' => 'BENGKEL_TO_2', 'name' => 'Bengkel Kelistrikan Otomotif', 'building' => 'Gedung Praktik Otomotif', 'capacity' => 40, 'type' => 'bengkel'],
            ['code' => 'BENGKEL_TPFL', 'name' => 'Bengkel Fabrikasi & Pengelasan SMAW/GMAW', 'building' => 'Gedung Pengelasan Logam', 'capacity' => 36, 'type' => 'bengkel'],
            ['code' => 'R_TEORI_101', 'name' => 'Ruang Teori 101', 'building' => 'Gedung Utama (Lt. 1)', 'capacity' => 36, 'type' => 'teori'],
            ['code' => 'R_TEORI_102', 'name' => 'Ruang Teori 102', 'building' => 'Gedung Utama (Lt. 1)', 'capacity' => 36, 'type' => 'teori'],
            ['code' => 'R_TEORI_201', 'name' => 'Ruang Teori 201', 'building' => 'Gedung Utama (Lt. 2)', 'capacity' => 36, 'type' => 'teori'],
            ['code' => 'LAPANGAN', 'name' => 'Lapangan Utama Sekolah', 'building' => 'Area Terbuka Utama', 'capacity' => 500, 'type' => 'lapangan'],
        ];

        $roomMap = [];
        foreach ($roomsData as $r) {
            $roomMap[$r['code']] = Room::updateOrCreate(['code' => $r['code']], $r);
        }

        // 4. TEACHERS & CODE MAPPINGS (FROM PAGE 7 OF REAL PDF)
        $teachersData = [
            ['code' => '1', 'name' => 'Kartanto, S.Pd., M.M', 'title' => 'Kepala Sekolah', 'nip' => '197001011995011001', 'phone' => '081234567801'],
            ['code' => '2A', 'name' => 'Rina Agustina, S.Pd', 'title' => 'Guru Bahasa Inggris', 'nip' => '197505122005012002', 'phone' => '081234567802'],
            ['code' => '2B', 'name' => 'Rina Agustina, S.Pd', 'title' => 'Guru Sejarah', 'nip' => '197505122005012002', 'phone' => '081234567802'],
            ['code' => '3A', 'name' => 'Lina Deliana, S.Pd', 'title' => 'Guru Bahasa Inggris', 'nip' => '197808202008012003', 'phone' => '081234567803'],
            ['code' => '3B', 'name' => 'Lina Deliana, S.Pd', 'title' => 'Guru B. Inggris Lanjutan', 'nip' => '197808202008012003', 'phone' => '081234567803'],
            ['code' => '4A', 'name' => 'Hj. Neti Risnawati, M.Pd', 'title' => 'Guru Matematika', 'nip' => '197203151998022001', 'phone' => '081234567804'],
            ['code' => '4B', 'name' => 'Hj. Neti Risnawati, M.Pd', 'title' => 'Guru Matematika Lanjutan', 'nip' => '197203151998022001', 'phone' => '081234567804'],
            ['code' => '4C', 'name' => 'Hj. Neti Risnawati, M.Pd', 'title' => 'Guru PAI', 'nip' => '197203151998022001', 'phone' => '081234567804'],
            ['code' => '5A', 'name' => 'Dono Wasito, S.Pd', 'title' => 'Guru PJOK', 'nip' => '198104102009021002', 'phone' => '081234567805'],
            ['code' => '5B', 'name' => 'Dono Wasito, S.Pd', 'title' => 'Guru PAI', 'nip' => '198104102009021002', 'phone' => '081234567805'],
            ['code' => '6A', 'name' => 'Hajarol Harahap, S.Pd', 'title' => 'Guru KIK', 'nip' => '197607142006041004', 'phone' => '081234567806'],
            ['code' => '6B', 'name' => 'Hajarol Harahap, S.Pd', 'title' => 'Guru Produktif TPFL', 'nip' => '197607142006041004', 'phone' => '081234567806'],
            ['code' => '7A', 'name' => 'Drs. Kurnadi', 'title' => 'Guru Produktif PPLG', 'nip' => '196809051994031005', 'phone' => '081234567807'],
            ['code' => '8A', 'name' => 'Bachtiar, S.Pd', 'title' => 'Guru Produktif TO', 'nip' => '197411222003121001', 'phone' => '081234567808'],
            ['code' => '9A', 'name' => 'Salikin, S.Pd', 'title' => 'Guru Produktif TO', 'nip' => '197302182002121003', 'phone' => '081234567809'],
            ['code' => '9B', 'name' => 'Salikin, S.Pd', 'title' => 'Guru Produktif TPFL', 'nip' => '197302182002121003', 'phone' => '081234567809'],
            ['code' => '10A', 'name' => 'Bambang Nurcahyono, M.Pd', 'title' => 'Guru Produktif TPFL', 'nip' => '197701192005011004', 'phone' => '081234567810'],
            ['code' => '11A', 'name' => 'Ali Ismail, S.Kom., M.Pd', 'title' => 'Guru Informatika', 'nip' => '198305042010011012', 'phone' => '081234567811'],
            ['code' => '11B', 'name' => 'Ali Ismail, S.Kom., M.Pd', 'title' => 'Guru KIK', 'nip' => '198305042010011012', 'phone' => '081234567811'],
            ['code' => '12A', 'name' => 'Maesaroh, S.PdI', 'title' => 'Guru PAI', 'nip' => '198006122008012015', 'phone' => '081234567812'],
            ['code' => '13A', 'name' => 'Mardiana Palantika, S.Pd', 'title' => 'Guru Bahasa Indonesia', 'nip' => '198209212009022008', 'phone' => '081234567813'],
            ['code' => '14A', 'name' => 'Januar Ashari, M.Pd', 'title' => 'Guru Produktif ANM', 'nip' => '198501152011011009', 'phone' => '081234567814'],
            ['code' => '15A', 'name' => 'Ajid, S.Ds., M.Pd', 'title' => 'Guru Produktif ANM', 'nip' => '198404282010011014', 'phone' => '081234567815'],
            ['code' => '16A', 'name' => 'Maman Sulaiman, S.Pd', 'title' => 'Guru PPKN', 'nip' => '197108161997031003', 'phone' => '081234567816'],
            ['code' => '16B', 'name' => 'Maman Sulaiman, S.Pd', 'title' => 'Guru Sejarah', 'nip' => '197108161997031003', 'phone' => '081234567816'],
            ['code' => '17A', 'name' => 'Restu Gustana, S.T', 'title' => 'Guru Produktif TO', 'nip' => '198606102014031002', 'phone' => '081234567817'],
            ['code' => '18A', 'name' => 'Sri Mulyati, S.Si', 'title' => 'Guru Matematika', 'nip' => '197902142007012011', 'phone' => '081234567818'],
            ['code' => '18B', 'name' => 'Sri Mulyati, S.Si', 'title' => 'Guru Bisnis Digital', 'nip' => '197902142007012011', 'phone' => '081234567818'],
            ['code' => '18C', 'name' => 'Sri Mulyati, S.Si', 'title' => 'Guru Matematika Lanjutan', 'nip' => '197902142007012011', 'phone' => '081234567818'],
            ['code' => '19A', 'name' => 'Nidia Desiyanti, S.Pd', 'title' => 'Guru PPKN', 'nip' => '198705022015032004', 'phone' => '081234567819'],
            ['code' => '19B', 'name' => 'Nidia Desiyanti, S.Pd', 'title' => 'Guru Sejarah', 'nip' => '198705022015032004', 'phone' => '081234567819'],
            ['code' => '20A', 'name' => 'Gita Setiawan, M.Pd', 'title' => 'Guru Matematika', 'nip' => '198311102009031006', 'phone' => '081234567820'],
            ['code' => '20C', 'name' => 'Gita Setiawan, M.Pd', 'title' => 'Guru Bisnis Digital', 'nip' => '198311102009031006', 'phone' => '081234567820'],
            ['code' => '21A', 'name' => 'Cynthia Gema Lestari, S.I.Kom', 'title' => 'Guru Produktif BCF', 'nip' => '198907122019032010', 'phone' => '081234567821'],
            ['code' => '22A', 'name' => 'Gati Purwanti, S.Pd', 'title' => 'Guru IPAS', 'nip' => '198403192010012022', 'phone' => '081234567822'],
            ['code' => '23A', 'name' => 'Debby Herviani, S.I.Kom', 'title' => 'Guru Produktif BCF', 'nip' => '199002162020122008', 'phone' => '081234567823'],
            ['code' => '23B', 'name' => 'Debby Herviani, S.I.Kom', 'title' => 'Guru KIK', 'nip' => '199002162020122008', 'phone' => '081234567823'],
            ['code' => '24A', 'name' => 'Wanda Kurniawan, S.Kom', 'title' => 'Guru Produktif PPLG', 'nip' => '198810252015041003', 'phone' => '081234567824'],
            ['code' => '24B', 'name' => 'Wanda Kurniawan, S.Kom', 'title' => 'Guru KIK', 'nip' => '198810252015041003', 'phone' => '081234567824'],
            ['code' => '25A', 'name' => 'Nur Ikhsan Azizudin, S.Ds', 'title' => 'Guru Produktif ANM', 'nip' => '199109032022031005', 'phone' => '081234567825'],
            ['code' => '26A', 'name' => 'Didin Sahrudin, M.Kom', 'title' => 'Guru Produktif PPLG', 'nip' => '198205142008011009', 'phone' => '081234567826'],
            ['code' => '26B', 'name' => 'Didin Sahrudin, M.Kom', 'title' => 'Guru Bisnis Digital', 'nip' => '198205142008011009', 'phone' => '081234567826'],
            ['code' => '27A', 'name' => 'Siti Nurhayatulismah, S.Pd', 'title' => 'Guru Bahasa Indonesia', 'nip' => '197912082006042014', 'phone' => '081234567827'],
            ['code' => '27B', 'name' => 'Siti Nurhayatulismah, S.Pd', 'title' => 'Guru Sejarah', 'nip' => '197912082006042014', 'phone' => '081234567827'],
            ['code' => '28A', 'name' => 'Jamil Husain, S.IP', 'title' => 'Guru PPKN', 'nip' => '198007202008011011', 'phone' => '081234567828'],
            ['code' => '28B', 'name' => 'Jamil Husain, S.IP', 'title' => 'Guru Informatika', 'nip' => '198007202008011011', 'phone' => '081234567828'],
            ['code' => '29A', 'name' => 'Rini Pratiwi Sugihartini, S.Pd', 'title' => 'Guru Bahasa Indonesia', 'nip' => '198506182011012019', 'phone' => '081234567829'],
            ['code' => '29B', 'name' => 'Rini Pratiwi Sugihartini, S.Pd', 'title' => 'Guru Sejarah', 'nip' => '198506182011012019', 'phone' => '081234567829'],
            ['code' => '30A', 'name' => 'Eri Kurniasari, S.E', 'title' => 'Guru KIK', 'nip' => '198103242009032007', 'phone' => '081234567830'],
            ['code' => '30B', 'name' => 'Eri Kurniasari, S.E', 'title' => 'Guru IPAS', 'nip' => '198103242009032007', 'phone' => '081234567830'],
            ['code' => '31A', 'name' => 'Firman Sidik, S.Pd', 'title' => 'Guru Bahasa Sunda', 'nip' => '198608052014021003', 'phone' => '081234567831'],
            ['code' => '31B', 'name' => 'Firman Sidik, S.Pd', 'title' => 'Guru PAI', 'nip' => '198608052014021003', 'phone' => '081234567831'],
            ['code' => '32A', 'name' => 'Nani Maryani, S.Pd', 'title' => 'Guru Bahasa Inggris', 'nip' => '198304152010012016', 'phone' => '081234567832'],
            ['code' => '32B', 'name' => 'Nani Maryani, S.Pd', 'title' => 'Guru Bisnis Digital', 'nip' => '198304152010012016', 'phone' => '081234567832'],
            ['code' => '33A', 'name' => 'Rahmatullah, S.PdI', 'title' => 'Guru PAI', 'nip' => '198412012012011005', 'phone' => '081234567833'],
            ['code' => '34A', 'name' => 'Mutia Oktaviani, S.Pd', 'title' => 'Guru Bahasa Indonesia', 'nip' => '199201102022032006', 'phone' => '081234567834'],
            ['code' => '35A', 'name' => 'Yudhi Herdiansyah, S.Pd', 'title' => 'Guru PJOK', 'nip' => '198509172011011010', 'phone' => '081234567835'],
            ['code' => '36A', 'name' => 'Desi Nurfauziah, S.Pd', 'title' => 'Guru Matematika', 'nip' => '198711042015032002', 'phone' => '081234567836'],
            ['code' => '37A', 'name' => 'Wulandari, S.Pd', 'title' => 'Guru Bahasa Inggris', 'nip' => '199003292019032014', 'phone' => '081234567837'],
            ['code' => '38A', 'name' => 'Suci Ramadhanti, S.Pd', 'title' => 'Guru Bahasa Inggris', 'nip' => '199307082022032012', 'phone' => '081234567838'],
            ['code' => '39A', 'name' => 'Diah Pungki Oktaviani, S.Kom', 'title' => 'Guru Produktif PPLG', 'nip' => '199110202020122015', 'phone' => '081234567839'],
            ['code' => '40A', 'name' => 'Riyana Hermadiana, S.Si', 'title' => 'Guru IPAS', 'nip' => '198604052014032001', 'phone' => '081234567840'],
            ['code' => '41A', 'name' => 'Rizky Muhamad Ramdan, S.Kom', 'title' => 'Guru Produktif PPLG', 'nip' => '199208152020121008', 'phone' => '081234567841'],
            ['code' => '42A', 'name' => 'Tedi Hariadi, S.Kom', 'title' => 'Guru Produktif PPLG', 'nip' => '198802112015041002', 'phone' => '081234567842'],
            ['code' => '43A', 'name' => 'Delika Pratiwi, S.Kom', 'title' => 'Guru Produktif PPLG', 'nip' => '199405262022032018', 'phone' => '081234567843'],
            ['code' => '44A', 'name' => 'Boma Bondan Suharto, S.Sos', 'title' => 'Guru Produktif BCF', 'nip' => '198306142010011015', 'phone' => '081234567844'],
            ['code' => '44B', 'name' => 'Boma Bondan Suharto, S.Sos', 'title' => 'Guru KIK', 'nip' => '198306142010011015', 'phone' => '081234567844'],
            ['code' => '45A', 'name' => 'Dewan Cakra Kharisma, S.I.Kom', 'title' => 'Guru Produktif BCF', 'nip' => '199104082022031006', 'phone' => '081234567845'],
            ['code' => '45B', 'name' => 'Dewan Cakra Kharisma, S.I.Kom', 'title' => 'Guru Bisnis Digital', 'nip' => '199104082022031006', 'phone' => '081234567845'],
            ['code' => '46A', 'name' => 'Sandi Jembar Wijaya, M.Pd', 'title' => 'Guru Seni Budaya', 'nip' => '198511282011011008', 'phone' => '081234567846'],
            ['code' => '46B', 'name' => 'Sandi Jembar Wijaya, M.Pd', 'title' => 'Guru KIK', 'nip' => '198511282011011008', 'phone' => '081234567846'],
            ['code' => '47A', 'name' => 'Hanna Elhaq, S.Ds', 'title' => 'Guru Produktif ANM', 'nip' => '199303122022032016', 'phone' => '081234567847'],
            ['code' => '48A', 'name' => 'Lily Setiawati, S.E., M.Si', 'title' => 'Guru Produktif TPFL', 'nip' => '198009142008012019', 'phone' => '081234567848'],
        ];

        $teacherMap = [];
        foreach ($teachersData as $t) {
            $teacherMap[$t['code']] = Teacher::updateOrCreate(['code' => $t['code']], $t);
        }

        // 5. SUBJECTS
        $subjectsData = [
            ['code' => 'PROD_PPLG', 'name' => 'Produktif PPLG', 'department_id' => $deptMap['PPLG']->id, 'weekly_hours' => 12, 'category' => 'kejuruan', 'color' => 'indigo'],
            ['code' => 'PROD_ANM', 'name' => 'Produktif ANM', 'department_id' => $deptMap['ANM']->id, 'weekly_hours' => 12, 'category' => 'kejuruan', 'color' => 'amber'],
            ['code' => 'PROD_BCF', 'name' => 'Produktif BCF', 'department_id' => $deptMap['BCF']->id, 'weekly_hours' => 12, 'category' => 'kejuruan', 'color' => 'sky'],
            ['code' => 'PROD_TO', 'name' => 'Produktif TO', 'department_id' => $deptMap['TO']->id, 'weekly_hours' => 12, 'category' => 'kejuruan', 'color' => 'emerald'],
            ['code' => 'PROD_TPFL', 'name' => 'Produktif TPFL', 'department_id' => $deptMap['TPFL']->id, 'weekly_hours' => 12, 'category' => 'kejuruan', 'color' => 'rose'],
            ['code' => 'MTK', 'name' => 'Matematika', 'department_id' => null, 'weekly_hours' => 4, 'category' => 'umum', 'color' => 'blue'],
            ['code' => 'BIND', 'name' => 'Bahasa Indonesia', 'department_id' => null, 'weekly_hours' => 4, 'category' => 'umum', 'color' => 'teal'],
            ['code' => 'BING', 'name' => 'Bahasa Inggris', 'department_id' => null, 'weekly_hours' => 4, 'category' => 'umum', 'color' => 'violet'],
            ['code' => 'PAI', 'name' => 'Pendidikan Agama Islam', 'department_id' => null, 'weekly_hours' => 3, 'category' => 'umum', 'color' => 'emerald'],
            ['code' => 'PJOK', 'name' => 'PJOK', 'department_id' => null, 'weekly_hours' => 3, 'category' => 'umum', 'color' => 'orange'],
            ['code' => 'SEJ', 'name' => 'Sejarah', 'department_id' => null, 'weekly_hours' => 2, 'category' => 'umum', 'color' => 'yellow'],
            ['code' => 'PPKN', 'name' => 'PPKN', 'department_id' => null, 'weekly_hours' => 2, 'category' => 'umum', 'color' => 'red'],
            ['code' => 'IPAS', 'name' => 'IPAS', 'department_id' => null, 'weekly_hours' => 6, 'category' => 'umum', 'color' => 'lime'],
            ['code' => 'INFO', 'name' => 'Informatika', 'department_id' => null, 'weekly_hours' => 4, 'category' => 'umum', 'color' => 'cyan'],
            ['code' => 'KIK', 'name' => 'KIK (Kreativitas, Inovasi & Kewirausahaan)', 'department_id' => null, 'weekly_hours' => 4, 'category' => 'kejuruan', 'color' => 'purple'],
            ['code' => 'BISDIG', 'name' => 'Bisnis Digital', 'department_id' => null, 'weekly_hours' => 4, 'category' => 'kejuruan', 'color' => 'fuchsia'],
            ['code' => 'SENBUD', 'name' => 'Seni Budaya', 'department_id' => null, 'weekly_hours' => 2, 'category' => 'umum', 'color' => 'pink'],
            ['code' => 'BSUN', 'name' => 'Bahasa Sunda', 'department_id' => null, 'weekly_hours' => 2, 'category' => 'muatan_lokal', 'color' => 'amber'],
        ];

        $subjectMap = [];
        foreach ($subjectsData as $s) {
            $subjectMap[$s['code']] = Subject::updateOrCreate(['code' => $s['code']], $s);
        }

        // Helper mapper from subject name in PDF to Subject model
        $resolveSubject = function($name) use ($subjectMap) {
            $n = strtoupper(trim($name));
            if (str_contains($n, 'PRODUKTIF PPLG')) return $subjectMap['PROD_PPLG'];
            if (str_contains($n, 'PRODUKTIF ANM')) return $subjectMap['PROD_ANM'];
            if (str_contains($n, 'PRODUKTIF BCF')) return $subjectMap['PROD_BCF'];
            if (str_contains($n, 'PRODUKTIF TO')) return $subjectMap['PROD_TO'];
            if (str_contains($n, 'PRODUKTIF TPFL')) return $subjectMap['PROD_TPFL'];
            if (str_contains($n, 'MATEMATIKA')) return $subjectMap['MTK'];
            if (str_contains($n, 'B.INDONESIA')) return $subjectMap['BIND'];
            if (str_contains($n, 'B.INGGRIS')) return $subjectMap['BING'];
            if (str_contains($n, 'PAI')) return $subjectMap['PAI'];
            if (str_contains($n, 'PJOK')) return $subjectMap['PJOK'];
            if (str_contains($n, 'SEJARAH')) return $subjectMap['SEJ'];
            if (str_contains($n, 'PPKN')) return $subjectMap['PPKN'];
            if (str_contains($n, 'IPAS')) return $subjectMap['IPAS'];
            if (str_contains($n, 'INFORMATIKA')) return $subjectMap['INFO'];
            if (str_contains($n, 'KIK')) return $subjectMap['KIK'];
            if (str_contains($n, 'BISNIS DIGITAL')) return $subjectMap['BISDIG'];
            if (str_contains($n, 'SENBUD')) return $subjectMap['SENBUD'];
            if (str_contains($n, 'B.SUNDA')) return $subjectMap['BSUN'];
            return $subjectMap['PROD_PPLG'];
        };

        // 6. CLASSROOMS (ROMBEL) - 100% Exact from Source Schedule Matrices (31 Classes)
        $classroomsData = [
            // PPLG (9 Classes)
            ['code' => 'X_PPLG_1', 'name' => 'X PPLG 1', 'grade' => 10, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['41A']->id, 'is_pkl' => false],
            ['code' => 'X_PPLG_2', 'name' => 'X PPLG 2', 'grade' => 10, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['42A']->id, 'is_pkl' => false],
            ['code' => 'X_PPLG_3', 'name' => 'X PPLG 3', 'grade' => 10, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['20A']->id, 'is_pkl' => false],
            ['code' => 'XI_PPLG_1', 'name' => 'XI PPLG 1', 'grade' => 11, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['26A']->id, 'is_pkl' => false],
            ['code' => 'XI_PPLG_2', 'name' => 'XI PPLG 2', 'grade' => 11, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['43A']->id, 'is_pkl' => false],
            ['code' => 'XI_PPLG_3', 'name' => 'XI PPLG 3', 'grade' => 11, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['39A']->id, 'is_pkl' => false],
            ['code' => 'XII_PPLG_1', 'name' => 'XII PPLG 1 (PKL)', 'grade' => 12, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['24A']->id, 'is_pkl' => true],
            ['code' => 'XII_PPLG_2', 'name' => 'XII PPLG 2 (PKL)', 'grade' => 12, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['7A']->id, 'is_pkl' => true],
            ['code' => 'XII_PPLG_3', 'name' => 'XII PPLG 3 (PKL)', 'grade' => 12, 'department_id' => $deptMap['PPLG']->id, 'homeroom_teacher_id' => $teacherMap['26B']->id, 'is_pkl' => true],

            // ANIMASI (6 Classes)
            ['code' => 'X_ANIMASI_1', 'name' => 'X Animasi 1', 'grade' => 10, 'department_id' => $deptMap['ANM']->id, 'homeroom_teacher_id' => $teacherMap['25A']->id, 'is_pkl' => false],
            ['code' => 'X_ANIMASI_2', 'name' => 'X Animasi 2', 'grade' => 10, 'department_id' => $deptMap['ANM']->id, 'homeroom_teacher_id' => $teacherMap['14A']->id, 'is_pkl' => false],
            ['code' => 'XI_ANIMASI_1', 'name' => 'XI Animasi 1', 'grade' => 11, 'department_id' => $deptMap['ANM']->id, 'homeroom_teacher_id' => $teacherMap['47A']->id, 'is_pkl' => false],
            ['code' => 'XI_ANIMASI_2', 'name' => 'XI Animasi 2', 'grade' => 11, 'department_id' => $deptMap['ANM']->id, 'homeroom_teacher_id' => $teacherMap['15A']->id, 'is_pkl' => false],
            ['code' => 'XII_ANIMASI_1', 'name' => 'XII Animasi 1 (PKL)', 'grade' => 12, 'department_id' => $deptMap['ANM']->id, 'homeroom_teacher_id' => $teacherMap['47A']->id, 'is_pkl' => true],
            ['code' => 'XII_ANIMASI_2', 'name' => 'XII Animasi 2 (PKL)', 'grade' => 12, 'department_id' => $deptMap['ANM']->id, 'homeroom_teacher_id' => $teacherMap['14A']->id, 'is_pkl' => true],

            // BROADCASTING (6 Classes)
            ['code' => 'X_BCF_1', 'name' => 'X BCF 1', 'grade' => 10, 'department_id' => $deptMap['BCF']->id, 'homeroom_teacher_id' => $teacherMap['21A']->id, 'is_pkl' => false],
            ['code' => 'X_BCF_2', 'name' => 'X BCF 2', 'grade' => 10, 'department_id' => $deptMap['BCF']->id, 'homeroom_teacher_id' => $teacherMap['23A']->id, 'is_pkl' => false],
            ['code' => 'XI_BCF_1', 'name' => 'XI BCF 1', 'grade' => 11, 'department_id' => $deptMap['BCF']->id, 'homeroom_teacher_id' => $teacherMap['44A']->id, 'is_pkl' => false],
            ['code' => 'XI_BCF_2', 'name' => 'XI BCF 2', 'grade' => 11, 'department_id' => $deptMap['BCF']->id, 'homeroom_teacher_id' => $teacherMap['45A']->id, 'is_pkl' => false],
            ['code' => 'XII_BCF_1', 'name' => 'XII BCF 1 (PKL)', 'grade' => 12, 'department_id' => $deptMap['BCF']->id, 'homeroom_teacher_id' => $teacherMap['21A']->id, 'is_pkl' => true],
            ['code' => 'XII_BCF_2', 'name' => 'XII BCF 2 (PKL)', 'grade' => 12, 'department_id' => $deptMap['BCF']->id, 'homeroom_teacher_id' => $teacherMap['23A']->id, 'is_pkl' => true],

            // TEKNIK OTOMOTIF (6 Classes)
            ['code' => 'X_TO_1', 'name' => 'X TO 1', 'grade' => 10, 'department_id' => $deptMap['TO']->id, 'homeroom_teacher_id' => $teacherMap['40A']->id, 'is_pkl' => false],
            ['code' => 'X_TO_2', 'name' => 'X TO 2', 'grade' => 10, 'department_id' => $deptMap['TO']->id, 'homeroom_teacher_id' => $teacherMap['8A']->id, 'is_pkl' => false],
            ['code' => 'XI_TO_1', 'name' => 'XI TO 1', 'grade' => 11, 'department_id' => $deptMap['TO']->id, 'homeroom_teacher_id' => $teacherMap['17A']->id, 'is_pkl' => false],
            ['code' => 'XI_TO_2', 'name' => 'XI TO 2', 'grade' => 11, 'department_id' => $deptMap['TO']->id, 'homeroom_teacher_id' => $teacherMap['9A']->id, 'is_pkl' => false],
            ['code' => 'XII_TO_1', 'name' => 'XII TO 1 (PKL)', 'grade' => 12, 'department_id' => $deptMap['TO']->id, 'homeroom_teacher_id' => $teacherMap['17A']->id, 'is_pkl' => true],
            ['code' => 'XII_TO_2', 'name' => 'XII TO 2 (PKL)', 'grade' => 12, 'department_id' => $deptMap['TO']->id, 'homeroom_teacher_id' => $teacherMap['8A']->id, 'is_pkl' => true],

            // TPFL (4 Classes)
            ['code' => 'X_TPFL', 'name' => 'X TPFL', 'grade' => 10, 'department_id' => $deptMap['TPFL']->id, 'homeroom_teacher_id' => $teacherMap['6B']->id, 'is_pkl' => false],
            ['code' => 'XI_TPFL', 'name' => 'XI TPFL', 'grade' => 11, 'department_id' => $deptMap['TPFL']->id, 'homeroom_teacher_id' => $teacherMap['10A']->id, 'is_pkl' => false],
            ['code' => 'XII_TPFL_1', 'name' => 'XII TPFL 1 (PKL)', 'grade' => 12, 'department_id' => $deptMap['TPFL']->id, 'homeroom_teacher_id' => $teacherMap['10A']->id, 'is_pkl' => true],
            ['code' => 'XII_TPFL_2', 'name' => 'XII TPFL 2 (PKL)', 'grade' => 12, 'department_id' => $deptMap['TPFL']->id, 'homeroom_teacher_id' => $teacherMap['48A']->id, 'is_pkl' => true],
        ];

        $classroomMap = [];
        foreach ($classroomsData as $c) {
            $classroomMap[$c['code']] = Classroom::updateOrCreate(['code' => $c['code']], $c);
        }

        // 7. SEED USERS FOR AUTHENTICATION & DEMO
        // A. Admin / Kurikulum
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@edusync.sch.id'],
            [
                'name' => 'Operator Kurikulum & Dapodik',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'sub_role' => 'Operator Kurikulum',
                'phone' => '081198765432',
                'status' => 'active',
            ]
        );

        // B. Guru Produktif PPLG (Rizky Muhamad Ramdan, S.Kom - 41A)
        $guruUser = User::updateOrCreate(
            ['email' => 'guru@edusync.sch.id'],
            [
                'name' => 'Rizky Muhamad Ramdan, S.Kom',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'sub_role' => 'Guru Pengampu',
                'nip' => '199208152020121008',
                'phone' => '081234567841',
                'teacher_id' => $teacherMap['41A']->id,
                'department_id' => $deptMap['PPLG']->id,
                'status' => 'active',
            ]
        );
        $teacherMap['41A']->update(['user_id' => $guruUser->id]);

        // C. Guru Wali Kelas (Didin Sahrudin, M.Kom - 26A)
        $waliUser = User::updateOrCreate(
            ['email' => 'wali@edusync.sch.id'],
            [
                'name' => 'Didin Sahrudin, M.Kom',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'sub_role' => 'Wali Kelas',
                'nip' => '198205142008011009',
                'phone' => '081234567826',
                'teacher_id' => $teacherMap['26A']->id,
                'department_id' => $deptMap['PPLG']->id,
                'status' => 'active',
            ]
        );
        $teacherMap['26A']->update(['user_id' => $waliUser->id]);

        // D. Siswa (Ahmad Fauzan Pratama - Ketua Kelas XI PPLG 1)
        $siswaUser = User::updateOrCreate(
            ['email' => 'siswa@edusync.sch.id'],
            [
                'name' => 'Ahmad Fauzan Pratama',
                'password' => Hash::make('password'),
                'role' => 'siswa',
                'sub_role' => 'Ketua Kelas',
                'nisn' => '0068192341',
                'phone' => '087812345678',
                'classroom_id' => $classroomMap['XI_PPLG_1']->id,
                'department_id' => $deptMap['PPLG']->id,
                'status' => 'active',
            ]
        );

        // 8. EXACT COMPLETE SCHEDULE ENTRIES FROM REAL PDF MATRIX (PPLG, ANIMASI, BCF, TO, TPFL)
        // Clear previous schedules to ensure 100% sync
        Schedule::truncate();

        // Helper to insert a schedule slot
        $addSchedule = function($classCode, $day, $pStart, $pEnd, $subjectCodeOrName, $teacherCode, $roomCode = null, $notes = null) use ($classroomMap, $teacherMap, $roomMap, $resolveSubject, $subjectMap) {
            if (!isset($classroomMap[$classCode]) || !isset($teacherMap[$teacherCode])) return;
            $class = $classroomMap[$classCode];
            $teacher = $teacherMap[$teacherCode];
            $subject = isset($subjectMap[$subjectCodeOrName]) ? $subjectMap[$subjectCodeOrName] : $resolveSubject($subjectCodeOrName);
            $room = $roomCode && isset($roomMap[$roomCode]) ? $roomMap[$roomCode] : null;

            if (!$room) {
                // Auto assign room based on subject type
                if ($subject->category === 'kejuruan') {
                    if (str_contains($classCode, 'PPLG')) $room = $roomMap['LAB_PPLG_1'];
                    elseif (str_contains($classCode, 'ANIMASI')) $room = $roomMap['STUDIO_ANM_1'];
                    elseif (str_contains($classCode, 'BCF')) $room = $roomMap['STUDIO_BCF'];
                    elseif (str_contains($classCode, 'TO')) $room = $roomMap['BENGKEL_TO_1'];
                    elseif (str_contains($classCode, 'TPFL')) $room = $roomMap['BENGKEL_TPFL'];
                } elseif ($subject->code === 'PJOK') {
                    $room = $roomMap['LAPANGAN'];
                } else {
                    $room = $roomMap['R_TEORI_101'];
                }
            }

            Schedule::create([
                'classroom_id' => $class->id,
                'subject_id' => $subject->id,
                'teacher_id' => $teacher->id,
                'room_id' => $room ? $room->id : null,
                'day' => $day,
                'period_start' => $pStart,
                'period_end' => $pEnd,
                'academic_year' => '2024/2025',
                'semester' => 'Genap',
                'notes' => $notes,
            ]);
        };

        // --- PPLG SCHEDULE DATA (PAGE 4) ---
        // SENIN
        // X PPLG 1
        $addSchedule('X_PPLG_1', 'Senin', 2, 4, 'PAI', '12A', 'R_TEORI_101');
        $addSchedule('X_PPLG_1', 'Senin', 5, 7, 'PRODUKTIF PPLG', '41A', 'LAB_PPLG_1', 'Praktik Pemrograman Dasar');
        $addSchedule('X_PPLG_1', 'Senin', 8, 10, 'PRODUKTIF PPLG', '41A', 'LAB_PPLG_1', 'Praktik Pemrograman Web');
        // X PPLG 2
        $addSchedule('X_PPLG_2', 'Senin', 2, 4, 'PRODUKTIF PPLG', '41A', 'LAB_PPLG_2');
        $addSchedule('X_PPLG_2', 'Senin', 5, 7, 'PAI', '12A', 'R_TEORI_102');
        $addSchedule('X_PPLG_2', 'Senin', 8, 10, 'IPAS', '40A', 'R_TEORI_102');
        // X PPLG 3
        $addSchedule('X_PPLG_3', 'Senin', 2, 4, 'B.INDONESIA', '29A', 'R_TEORI_201');
        $addSchedule('X_PPLG_3', 'Senin', 5, 7, 'MATEMATIKA', '20A', 'R_TEORI_201');
        $addSchedule('X_PPLG_3', 'Senin', 8, 10, 'B.INGGRIS', '2A', 'R_TEORI_201');
        // XI PPLG 1
        $addSchedule('XI_PPLG_1', 'Senin', 2, 4, 'PRODUKTIF PPLG', '26A', 'LAB_PPLG_1', 'Praktik Blok Basis Data');
        $addSchedule('XI_PPLG_1', 'Senin', 5, 6, 'PRODUKTIF PPLG', '26A', 'LAB_PPLG_1');
        $addSchedule('XI_PPLG_1', 'Senin', 7, 10, 'PRODUKTIF PPLG', '43A', 'LAB_PPLG_1', 'Praktik Mobile Dev');
        // XI PPLG 2
        $addSchedule('XI_PPLG_2', 'Senin', 2, 4, 'PRODUKTIF PPLG', '39A', 'LAB_PPLG_2');
        $addSchedule('XI_PPLG_2', 'Senin', 5, 5, 'PRODUKTIF PPLG', '43A', 'LAB_PPLG_2');
        $addSchedule('XI_PPLG_2', 'Senin', 6, 7, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_PPLG_2', 'Senin', 8, 10, 'MATEMATIKA', '36A', 'R_TEORI_102');
        // XI PPLG 3
        $addSchedule('XI_PPLG_3', 'Senin', 2, 3, 'SEJARAH', '2B', 'R_TEORI_201');
        $addSchedule('XI_PPLG_3', 'Senin', 4, 5, 'PPKN', '16A', 'R_TEORI_201');
        $addSchedule('XI_PPLG_3', 'Senin', 6, 7, 'PRODUKTIF PPLG', '39A', 'LAB_PPLG_2');
        $addSchedule('XI_PPLG_3', 'Senin', 8, 10, 'PRODUKTIF PPLG', '39A', 'LAB_PPLG_2');

        // SELASA
        // X PPLG 1
        $addSchedule('X_PPLG_1', 'Selasa', 2, 4, 'MATEMATIKA', '20A', 'R_TEORI_101');
        $addSchedule('X_PPLG_1', 'Selasa', 5, 8, 'INFORMATIKA', '28B', 'LAB_PPLG_1');
        $addSchedule('X_PPLG_1', 'Selasa', 9, 10, 'B.SUNDA', '31A', 'R_TEORI_101');
        // X PPLG 2
        $addSchedule('X_PPLG_2', 'Selasa', 2, 4, 'PRODUKTIF PPLG', '41A', 'LAB_PPLG_2');
        $addSchedule('X_PPLG_2', 'Selasa', 5, 8, 'PRODUKTIF PPLG', '42A', 'LAB_PPLG_2');
        $addSchedule('X_PPLG_2', 'Selasa', 9, 10, 'PPKN', '19A', 'R_TEORI_102');
        // X PPLG 3
        $addSchedule('X_PPLG_3', 'Selasa', 2, 4, 'PRODUKTIF PPLG', '42A', 'LAB_PPLG_1');
        $addSchedule('X_PPLG_3', 'Selasa', 5, 8, 'PRODUKTIF PPLG', '41A', 'LAB_PPLG_1');
        $addSchedule('X_PPLG_3', 'Selasa', 9, 10, 'PRODUKTIF PPLG', '41A', 'LAB_PPLG_1');
        // XI PPLG 1
        $addSchedule('XI_PPLG_1', 'Selasa', 2, 3, 'PRODUKTIF PPLG', '43A', 'LAB_PPLG_1');
        $addSchedule('XI_PPLG_1', 'Selasa', 4, 8, 'PRODUKTIF PPLG', '39A', 'LAB_PPLG_1');
        $addSchedule('XI_PPLG_1', 'Selasa', 9, 10, 'BISNIS DIGITAL', '26B', 'R_TEORI_201');
        // XI PPLG 2
        $addSchedule('XI_PPLG_2', 'Selasa', 2, 2, 'PRODUKTIF PPLG', '39A', 'LAB_PPLG_2');
        $addSchedule('XI_PPLG_2', 'Selasa', 3, 5, 'BISNIS DIGITAL', '26B', 'R_TEORI_102');
        $addSchedule('XI_PPLG_2', 'Selasa', 6, 8, 'B.INDONESIA', '34A', 'R_TEORI_102');
        $addSchedule('XI_PPLG_2', 'Selasa', 9, 10, 'PPKN', '16A', 'R_TEORI_102');
        // XI PPLG 3
        $addSchedule('XI_PPLG_3', 'Selasa', 2, 2, 'BISNIS DIGITAL', '26B', 'R_TEORI_201');
        $addSchedule('XI_PPLG_3', 'Selasa', 3, 5, 'B.INGGRIS', '38A', 'R_TEORI_201');
        $addSchedule('XI_PPLG_3', 'Selasa', 6, 8, 'MATEMATIKA', '36A', 'R_TEORI_201');
        $addSchedule('XI_PPLG_3', 'Selasa', 9, 10, 'B.INGGRIS', '38A', 'R_TEORI_201');

        // RABU
        // X PPLG 1
        $addSchedule('X_PPLG_1', 'Rabu', 2, 3, 'PPKN', '19A', 'R_TEORI_101');
        $addSchedule('X_PPLG_1', 'Rabu', 4, 5, 'SENBUD', '46A', 'R_TEORI_101');
        $addSchedule('X_PPLG_1', 'Rabu', 6, 7, 'SEJARAH', '29B', 'R_TEORI_101');
        $addSchedule('X_PPLG_1', 'Rabu', 8, 10, 'B.INDONESIA', '29A', 'R_TEORI_101');
        // X PPLG 2
        $addSchedule('X_PPLG_2', 'Rabu', 2, 3, 'INFORMATIKA', '28B', 'LAB_PPLG_2');
        $addSchedule('X_PPLG_2', 'Rabu', 4, 5, 'B.SUNDA', '31A', 'R_TEORI_102');
        $addSchedule('X_PPLG_2', 'Rabu', 6, 7, 'SENBUD', '46A', 'R_TEORI_102');
        $addSchedule('X_PPLG_2', 'Rabu', 8, 10, 'B.INGGRIS', '38A', 'R_TEORI_102');
        // X PPLG 3
        $addSchedule('X_PPLG_3', 'Rabu', 2, 2, 'PRODUKTIF PPLG', '42A', 'LAB_PPLG_1');
        $addSchedule('X_PPLG_3', 'Rabu', 3, 4, 'SEJARAH', '29B', 'R_TEORI_201');
        $addSchedule('X_PPLG_3', 'Rabu', 5, 6, 'PPKN', '19A', 'R_TEORI_201');
        $addSchedule('X_PPLG_3', 'Rabu', 7, 8, 'B.SUNDA', '31A', 'R_TEORI_201');
        $addSchedule('X_PPLG_3', 'Rabu', 9, 10, 'SENBUD', '46A', 'R_TEORI_201');
        // XI PPLG 1
        $addSchedule('XI_PPLG_1', 'Rabu', 2, 4, 'B.INDONESIA', '34A', 'R_TEORI_101');
        $addSchedule('XI_PPLG_1', 'Rabu', 5, 7, 'PAI', '33A', 'R_TEORI_101');
        $addSchedule('XI_PPLG_1', 'Rabu', 8, 10, 'MATEMATIKA', '36A', 'R_TEORI_101');
        // XI PPLG 2
        $addSchedule('XI_PPLG_2', 'Rabu', 2, 3, 'SEJARAH', '2B', 'R_TEORI_102');
        $addSchedule('XI_PPLG_2', 'Rabu', 4, 7, 'B.INGGRIS', '38A', 'R_TEORI_102');
        $addSchedule('XI_PPLG_2', 'Rabu', 8, 10, 'PAI', '33A', 'R_TEORI_102');
        // XI PPLG 3
        $addSchedule('XI_PPLG_3', 'Rabu', 2, 4, 'PAI', '33A', 'R_TEORI_201');
        $addSchedule('XI_PPLG_3', 'Rabu', 5, 10, 'PRODUKTIF PPLG', '43A', 'LAB_PPLG_2');

        // KAMIS
        // X PPLG 1
        $addSchedule('X_PPLG_1', 'Kamis', 2, 4, 'PJOK', '5A', 'LAPANGAN');
        $addSchedule('X_PPLG_1', 'Kamis', 5, 8, 'PRODUKTIF PPLG', '42A', 'LAB_PPLG_1');
        $addSchedule('X_PPLG_1', 'Kamis', 9, 10, 'IPAS', '40A', 'R_TEORI_101');
        // X PPLG 2
        $addSchedule('X_PPLG_2', 'Kamis', 2, 4, 'MATEMATIKA', '20A', 'R_TEORI_102');
        $addSchedule('X_PPLG_2', 'Kamis', 5, 6, 'SEJARAH', '29B', 'R_TEORI_102');
        $addSchedule('X_PPLG_2', 'Kamis', 7, 8, 'IPAS', '40A', 'R_TEORI_102');
        $addSchedule('X_PPLG_2', 'Kamis', 9, 10, 'INFORMATIKA', '28B', 'LAB_PPLG_2');
        // X PPLG 3
        $addSchedule('X_PPLG_3', 'Kamis', 2, 4, 'IPAS', '40A', 'R_TEORI_201');
        $addSchedule('X_PPLG_3', 'Kamis', 5, 7, 'PJOK', '5A', 'LAPANGAN');
        $addSchedule('X_PPLG_3', 'Kamis', 8, 10, 'PAI', '12A', 'R_TEORI_201');
        // XI PPLG 1
        $addSchedule('XI_PPLG_1', 'Kamis', 2, 6, 'KIK', '24B', 'LAB_PPLG_1');
        $addSchedule('XI_PPLG_1', 'Kamis', 7, 8, 'B.INGGRIS', '38A', 'R_TEORI_101');
        $addSchedule('XI_PPLG_1', 'Kamis', 9, 10, 'SEJARAH', '2B', 'R_TEORI_101');
        // XI PPLG 2
        $addSchedule('XI_PPLG_2', 'Kamis', 2, 6, 'PRODUKTIF PPLG', '43A', 'LAB_PPLG_2');
        $addSchedule('XI_PPLG_2', 'Kamis', 7, 10, 'PRODUKTIF PPLG', '26A', 'LAB_PPLG_2');
        // XI PPLG 3
        $addSchedule('XI_PPLG_3', 'Kamis', 2, 4, 'B.INDONESIA', '34A', 'R_TEORI_201');
        $addSchedule('XI_PPLG_3', 'Kamis', 5, 6, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_PPLG_3', 'Kamis', 7, 10, 'KIK', '24B', 'LAB_PPLG_1');

        // JUMAT
        // X PPLG 1
        $addSchedule('X_PPLG_1', 'Jumat', 2, 4, 'B.INGGRIS', '38A', 'R_TEORI_101');
        $addSchedule('X_PPLG_1', 'Jumat', 5, 7, 'IPAS', '40A', 'R_TEORI_101');
        // X PPLG 2
        $addSchedule('X_PPLG_2', 'Jumat', 2, 4, 'PJOK', '5A', 'LAPANGAN');
        $addSchedule('X_PPLG_2', 'Jumat', 5, 7, 'B.INDONESIA', '29A', 'R_TEORI_102');
        // X PPLG 3
        $addSchedule('X_PPLG_3', 'Jumat', 2, 3, 'IPAS', '40A', 'R_TEORI_201');
        $addSchedule('X_PPLG_3', 'Jumat', 4, 7, 'INFORMATIKA', '28B', 'LAB_PPLG_2');
        // XI PPLG 1
        $addSchedule('XI_PPLG_1', 'Jumat', 2, 3, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_PPLG_1', 'Jumat', 4, 5, 'PPKN', '16A', 'R_TEORI_101');
        $addSchedule('XI_PPLG_1', 'Jumat', 6, 7, 'B.INGGRIS', '38A', 'R_TEORI_101');
        // XI PPLG 2
        $addSchedule('XI_PPLG_2', 'Jumat', 2, 2, 'PRODUKTIF PPLG', '26A', 'LAB_PPLG_1');
        $addSchedule('XI_PPLG_2', 'Jumat', 3, 7, 'KIK', '24B', 'LAB_PPLG_1');
        // XI PPLG 3
        $addSchedule('XI_PPLG_3', 'Jumat', 2, 2, 'KIK', '24B', 'LAB_PPLG_2');
        $addSchedule('XI_PPLG_3', 'Jumat', 3, 7, 'PRODUKTIF PPLG', '26A', 'LAB_PPLG_2');

        // --- ANIMASI SCHEDULE DATA (PAGE 2) ---
        // SENIN
        $addSchedule('X_ANIMASI_1', 'Senin', 2, 6, 'PRODUKTIF ANM', '25A', 'STUDIO_ANM_1');
        $addSchedule('X_ANIMASI_1', 'Senin', 7, 8, 'PRODUKTIF ANM', '14A', 'STUDIO_ANM_1');
        $addSchedule('X_ANIMASI_1', 'Senin', 9, 10, 'IPAS', '22A', 'R_TEORI_101');

        $addSchedule('X_ANIMASI_2', 'Senin', 2, 6, 'PRODUKTIF ANM', '14A', 'STUDIO_ANM_2');
        $addSchedule('X_ANIMASI_2', 'Senin', 7, 8, 'PRODUKTIF ANM', '25A', 'STUDIO_ANM_2');
        $addSchedule('X_ANIMASI_2', 'Senin', 9, 10, 'PPKN', '19A', 'R_TEORI_102');

        $addSchedule('XI_ANIMASI_1', 'Senin', 2, 3, 'KIK', '46B', 'STUDIO_ANM_1');
        $addSchedule('XI_ANIMASI_1', 'Senin', 4, 10, 'PRODUKTIF ANM', '47A', 'STUDIO_ANM_1');

        $addSchedule('XI_ANIMASI_2', 'Senin', 2, 4, 'PAI', '31B', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_2', 'Senin', 5, 7, 'MATEMATIKA', '4A', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_2', 'Senin', 8, 10, 'KIK', '30A', 'R_TEORI_201');

        // SELASA
        $addSchedule('X_ANIMASI_1', 'Selasa', 2, 3, 'SEJARAH', '16B', 'R_TEORI_101');
        $addSchedule('X_ANIMASI_1', 'Selasa', 4, 5, 'SENBUD', '46A', 'R_TEORI_101');
        $addSchedule('X_ANIMASI_1', 'Selasa', 6, 7, 'B.SUNDA', '31A', 'R_TEORI_101');
        $addSchedule('X_ANIMASI_1', 'Selasa', 8, 10, 'PAI', '12A', 'R_TEORI_101');

        $addSchedule('X_ANIMASI_2', 'Selasa', 2, 3, 'SENBUD', '46A', 'R_TEORI_102');
        $addSchedule('X_ANIMASI_2', 'Selasa', 4, 7, 'INFORMATIKA', '11A', 'STUDIO_ANM_2');
        $addSchedule('X_ANIMASI_2', 'Selasa', 8, 10, 'MATEMATIKA', '4A', 'R_TEORI_102');

        $addSchedule('XI_ANIMASI_1', 'Selasa', 2, 2, 'PRODUKTIF ANM', '47A', 'STUDIO_ANM_1');
        $addSchedule('XI_ANIMASI_1', 'Selasa', 3, 4, 'PRODUKTIF ANM', '25A', 'STUDIO_ANM_1');
        $addSchedule('XI_ANIMASI_1', 'Selasa', 5, 10, 'PRODUKTIF ANM', '15A', 'STUDIO_ANM_1');

        $addSchedule('XI_ANIMASI_2', 'Selasa', 2, 4, 'B.INDONESIA', '13A', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_2', 'Selasa', 5, 6, 'B.INGGRIS', '37A', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_2', 'Selasa', 7, 8, 'SEJARAH', '19B', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_2', 'Selasa', 9, 10, 'KIK', '46B', 'STUDIO_ANM_2');

        // RABU
        $addSchedule('X_ANIMASI_1', 'Rabu', 2, 4, 'B.INGGRIS', '32A', 'R_TEORI_101');
        $addSchedule('X_ANIMASI_1', 'Rabu', 5, 7, 'MATEMATIKA', '4A', 'R_TEORI_101');
        $addSchedule('X_ANIMASI_1', 'Rabu', 8, 10, 'IPAS', '22A', 'R_TEORI_101');

        $addSchedule('X_ANIMASI_2', 'Rabu', 2, 4, 'IPAS', '22A', 'R_TEORI_102');
        $addSchedule('X_ANIMASI_2', 'Rabu', 5, 7, 'B.INGGRIS', '32A', 'R_TEORI_102');
        $addSchedule('X_ANIMASI_2', 'Rabu', 8, 10, 'B.INDONESIA', '34A', 'R_TEORI_102');

        $addSchedule('XI_ANIMASI_1', 'Rabu', 2, 3, 'BISNIS DIGITAL', '20C', 'STUDIO_ANM_1');
        $addSchedule('XI_ANIMASI_1', 'Rabu', 4, 5, 'PPKN', '16A', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_1', 'Rabu', 6, 7, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_ANIMASI_1', 'Rabu', 8, 10, 'KIK', '30A', 'STUDIO_ANM_1');

        $addSchedule('XI_ANIMASI_2', 'Rabu', 2, 9, 'PRODUKTIF ANM', '47A', 'STUDIO_ANM_2');
        $addSchedule('XI_ANIMASI_2', 'Rabu', 10, 10, 'PRODUKTIF ANM', '25A', 'STUDIO_ANM_2');

        // KAMIS
        $addSchedule('X_ANIMASI_1', 'Kamis', 2, 4, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('X_ANIMASI_1', 'Kamis', 5, 6, 'PPKN', '19A', 'R_TEORI_101');
        $addSchedule('X_ANIMASI_1', 'Kamis', 7, 10, 'INFORMATIKA', '11A', 'STUDIO_ANM_1');

        $addSchedule('X_ANIMASI_2', 'Kamis', 2, 3, 'IPAS', '22A', 'R_TEORI_102');
        $addSchedule('X_ANIMASI_2', 'Kamis', 4, 5, 'SEJARAH', '16B', 'R_TEORI_102');
        $addSchedule('X_ANIMASI_2', 'Kamis', 6, 7, 'B.SUNDA', '31A', 'R_TEORI_102');
        $addSchedule('X_ANIMASI_2', 'Kamis', 8, 10, 'PJOK', '35A', 'LAPANGAN');

        $addSchedule('XI_ANIMASI_1', 'Kamis', 2, 4, 'PAI', '31B', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_1', 'Kamis', 5, 7, 'MATEMATIKA', '4A', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_1', 'Kamis', 8, 10, 'B.INDONESIA', '13A', 'R_TEORI_201');

        $addSchedule('XI_ANIMASI_2', 'Kamis', 2, 2, 'PRODUKTIF ANM', '25A', 'STUDIO_ANM_2');
        $addSchedule('XI_ANIMASI_2', 'Kamis', 3, 8, 'PRODUKTIF ANM', '15A', 'STUDIO_ANM_2');
        $addSchedule('XI_ANIMASI_2', 'Kamis', 9, 10, 'BISNIS DIGITAL', '20C', 'STUDIO_ANM_2');

        // JUMAT
        $addSchedule('X_ANIMASI_1', 'Jumat', 2, 4, 'B.INDONESIA', '34A', 'R_TEORI_101');
        $addSchedule('X_ANIMASI_1', 'Jumat', 5, 7, 'PRODUKTIF ANM', '14A', 'STUDIO_ANM_1');

        $addSchedule('X_ANIMASI_2', 'Jumat', 2, 4, 'PAI', '12A', 'R_TEORI_102');
        $addSchedule('X_ANIMASI_2', 'Jumat', 5, 7, 'PRODUKTIF ANM', '25A', 'STUDIO_ANM_2');

        $addSchedule('XI_ANIMASI_1', 'Jumat', 2, 3, 'SEJARAH', '19B', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_1', 'Jumat', 4, 7, 'B.INGGRIS', '37A', 'R_TEORI_201');

        $addSchedule('XI_ANIMASI_2', 'Jumat', 2, 3, 'B.INGGRIS', '37A', 'R_TEORI_201');
        $addSchedule('XI_ANIMASI_2', 'Jumat', 4, 5, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_ANIMASI_2', 'Jumat', 6, 7, 'PPKN', '16A', 'R_TEORI_201');

        // --- BROADCASTING SCHEDULE DATA (PAGE 3) ---
        // SENIN
        $addSchedule('X_BCF_1', 'Senin', 2, 5, 'PRODUKTIF BCF', '21A', 'STUDIO_BCF');
        $addSchedule('X_BCF_1', 'Senin', 6, 7, 'PRODUKTIF BCF', '44A', 'STUDIO_BCF');
        $addSchedule('X_BCF_1', 'Senin', 8, 10, 'PRODUKTIF BCF', '23A', 'STUDIO_BCF');

        $addSchedule('X_BCF_2', 'Senin', 2, 5, 'PRODUKTIF BCF', '23A', 'STUDIO_BCF');
        $addSchedule('X_BCF_2', 'Senin', 6, 7, 'PRODUKTIF BCF', '21A', 'STUDIO_BCF');
        $addSchedule('X_BCF_2', 'Senin', 8, 9, 'PRODUKTIF BCF', '44A', 'STUDIO_BCF');
        $addSchedule('X_BCF_2', 'Senin', 10, 10, 'PRODUKTIF BCF', '21A', 'STUDIO_BCF');

        $addSchedule('XI_BCF_1', 'Senin', 2, 4, 'MATEMATIKA', '36A', 'R_TEORI_101');
        $addSchedule('XI_BCF_1', 'Senin', 5, 7, 'B.INDONESIA', '13A', 'R_TEORI_101');
        $addSchedule('XI_BCF_1', 'Senin', 8, 10, 'PAI', '33A', 'R_TEORI_101');

        $addSchedule('XI_BCF_2', 'Senin', 2, 4, 'B.INDONESIA', '13A', 'R_TEORI_102');
        $addSchedule('XI_BCF_2', 'Senin', 5, 6, 'SEJARAH', '19B', 'R_TEORI_102');
        $addSchedule('XI_BCF_2', 'Senin', 7, 10, 'B.INGGRIS', '37A', 'R_TEORI_102');

        // SELASA
        $addSchedule('X_BCF_1', 'Selasa', 2, 2, 'PRODUKTIF BCF', '23A', 'STUDIO_BCF');
        $addSchedule('X_BCF_1', 'Selasa', 3, 5, 'PAI', '12A', 'R_TEORI_101');
        $addSchedule('X_BCF_1', 'Selasa', 6, 7, 'SENBUD', '46A', 'R_TEORI_101');
        $addSchedule('X_BCF_1', 'Selasa', 8, 10, 'IPAS', '22A', 'R_TEORI_101');

        $addSchedule('X_BCF_2', 'Selasa', 2, 2, 'PRODUKTIF BCF', '21A', 'STUDIO_BCF');
        $addSchedule('X_BCF_2', 'Selasa', 3, 4, 'SEJARAH', '27B', 'R_TEORI_102');
        $addSchedule('X_BCF_2', 'Selasa', 5, 7, 'B.INGGRIS', '32A', 'R_TEORI_102');
        $addSchedule('X_BCF_2', 'Selasa', 8, 10, 'MATEMATIKA', '18A', 'R_TEORI_102');

        $addSchedule('XI_BCF_1', 'Selasa', 2, 3, 'SEJARAH', '19B', 'R_TEORI_201');
        $addSchedule('XI_BCF_1', 'Selasa', 4, 5, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_BCF_1', 'Selasa', 6, 7, 'PPKN', '16A', 'R_TEORI_201');
        $addSchedule('XI_BCF_1', 'Selasa', 8, 10, 'B.INGGRIS', '37A', 'R_TEORI_201');

        $addSchedule('XI_BCF_2', 'Selasa', 2, 3, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_BCF_2', 'Selasa', 4, 5, 'PPKN', '16A', 'R_TEORI_201');
        $addSchedule('XI_BCF_2', 'Selasa', 6, 8, 'PAI', '33A', 'R_TEORI_201');
        $addSchedule('XI_BCF_2', 'Selasa', 9, 10, 'MATEMATIKA', '36A', 'R_TEORI_201');

        // RABU
        $addSchedule('X_BCF_1', 'Rabu', 2, 4, 'B.INDONESIA', '27A', 'R_TEORI_101');
        $addSchedule('X_BCF_1', 'Rabu', 5, 7, 'PJOK', '5A', 'LAPANGAN');
        $addSchedule('X_BCF_1', 'Rabu', 8, 10, 'MATEMATIKA', '18A', 'R_TEORI_101');

        $addSchedule('X_BCF_2', 'Rabu', 2, 3, 'SENBUD', '46A', 'R_TEORI_102');
        $addSchedule('X_BCF_2', 'Rabu', 4, 7, 'INFORMATIKA', '11A', 'STUDIO_BCF');
        $addSchedule('X_BCF_2', 'Rabu', 8, 10, 'PAI', '12A', 'R_TEORI_102');

        $addSchedule('XI_BCF_1', 'Rabu', 2, 2, 'B.INGGRIS', '37A', 'R_TEORI_201');
        $addSchedule('XI_BCF_1', 'Rabu', 3, 4, 'BISNIS DIGITAL', '45B', 'STUDIO_BCF');
        $addSchedule('XI_BCF_1', 'Rabu', 5, 6, 'PRODUKTIF BCF', '21A', 'STUDIO_BCF');
        $addSchedule('XI_BCF_1', 'Rabu', 7, 10, 'PRODUKTIF BCF', '44A', 'STUDIO_BCF');

        $addSchedule('XI_BCF_2', 'Rabu', 2, 2, 'MATEMATIKA', '36A', 'R_TEORI_201');
        $addSchedule('XI_BCF_2', 'Rabu', 3, 4, 'PRODUKTIF BCF', '21A', 'STUDIO_BCF');
        $addSchedule('XI_BCF_2', 'Rabu', 5, 9, 'KIK', '23B', 'STUDIO_BCF');
        $addSchedule('XI_BCF_2', 'Rabu', 10, 10, 'PRODUKTIF BCF', '23A', 'STUDIO_BCF');

        // KAMIS
        $addSchedule('X_BCF_1', 'Kamis', 2, 3, 'PPKN', '19A', 'R_TEORI_101');
        $addSchedule('X_BCF_1', 'Kamis', 4, 6, 'B.INGGRIS', '32A', 'R_TEORI_101');
        $addSchedule('X_BCF_1', 'Kamis', 7, 8, 'IPAS', '22A', 'R_TEORI_101');
        $addSchedule('X_BCF_1', 'Kamis', 9, 10, 'SEJARAH', '27B', 'R_TEORI_101');

        $addSchedule('X_BCF_2', 'Kamis', 2, 4, 'B.INDONESIA', '27A', 'R_TEORI_102');
        $addSchedule('X_BCF_2', 'Kamis', 5, 6, 'IPAS', '22A', 'R_TEORI_102');
        $addSchedule('X_BCF_2', 'Kamis', 7, 8, 'PPKN', '19A', 'R_TEORI_102');
        $addSchedule('X_BCF_2', 'Kamis', 9, 10, 'B.SUNDA', '31A', 'R_TEORI_102');

        $addSchedule('XI_BCF_1', 'Kamis', 2, 7, 'PRODUKTIF BCF', '45A', 'STUDIO_BCF');
        $addSchedule('XI_BCF_1', 'Kamis', 8, 10, 'PRODUKTIF BCF', '23A', 'STUDIO_BCF');

        $addSchedule('XI_BCF_2', 'Kamis', 2, 4, 'PRODUKTIF BCF', '23A', 'STUDIO_BCF');
        $addSchedule('XI_BCF_2', 'Kamis', 5, 8, 'PRODUKTIF BCF', '44A', 'STUDIO_BCF');
        $addSchedule('XI_BCF_2', 'Kamis', 9, 10, 'PRODUKTIF BCF', '45A', 'STUDIO_BCF');

        // JUMAT
        $addSchedule('X_BCF_1', 'Jumat', 2, 5, 'INFORMATIKA', '11A', 'STUDIO_BCF');
        $addSchedule('X_BCF_1', 'Jumat', 6, 7, 'B.SUNDA', '31A', 'R_TEORI_101');

        $addSchedule('X_BCF_2', 'Jumat', 2, 4, 'IPAS', '22A', 'R_TEORI_102');
        $addSchedule('X_BCF_2', 'Jumat', 5, 7, 'PJOK', '5A', 'LAPANGAN');

        $addSchedule('XI_BCF_1', 'Jumat', 2, 2, 'PRODUKTIF BCF', '23A', 'STUDIO_BCF');
        $addSchedule('XI_BCF_1', 'Jumat', 3, 7, 'KIK', '23B', 'STUDIO_BCF');

        $addSchedule('XI_BCF_2', 'Jumat', 2, 5, 'PRODUKTIF BCF', '45A', 'STUDIO_BCF');
        $addSchedule('XI_BCF_2', 'Jumat', 6, 7, 'BISNIS DIGITAL', '45B', 'STUDIO_BCF');

        // --- TEKNIK OTOMOTIF SCHEDULE DATA (PAGE 5) ---
        // SENIN
        $addSchedule('X_TO_1', 'Senin', 2, 6, 'IPAS', '40A', 'BENGKEL_TO_1');
        $addSchedule('X_TO_1', 'Senin', 7, 8, 'SENBUD', '46A', 'R_TEORI_101');
        $addSchedule('X_TO_1', 'Senin', 9, 10, 'B.SUNDA', '31A', 'R_TEORI_101');

        $addSchedule('X_TO_2', 'Senin', 2, 6, 'PRODUKTIF TO', '8A', 'BENGKEL_TO_2');
        $addSchedule('X_TO_2', 'Senin', 7, 8, 'PPKN', '19A', 'R_TEORI_102');
        $addSchedule('X_TO_2', 'Senin', 9, 10, 'SENBUD', '46A', 'R_TEORI_102');

        $addSchedule('XI_TO_1', 'Senin', 2, 6, 'PRODUKTIF TO', '17A', 'BENGKEL_TO_1');
        $addSchedule('XI_TO_1', 'Senin', 7, 10, 'PRODUKTIF TO', '8A', 'BENGKEL_TO_1');

        $addSchedule('XI_TO_2', 'Senin', 2, 7, 'PRODUKTIF TO', '9A', 'BENGKEL_TO_2');
        $addSchedule('XI_TO_2', 'Senin', 8, 10, 'PRODUKTIF TO', '17A', 'BENGKEL_TO_2');

        // SELASA
        $addSchedule('X_TO_1', 'Selasa', 2, 4, 'PJOK', '5A', 'LAPANGAN');
        $addSchedule('X_TO_1', 'Selasa', 5, 7, 'B.INDONESIA', '27A', 'R_TEORI_101');
        $addSchedule('X_TO_1', 'Selasa', 8, 10, 'INFORMATIKA', '11A', 'BENGKEL_TO_1');

        $addSchedule('X_TO_2', 'Selasa', 2, 3, 'B.SUNDA', '31A', 'R_TEORI_102');
        $addSchedule('X_TO_2', 'Selasa', 4, 8, 'IPAS', '30B', 'BENGKEL_TO_2');
        $addSchedule('X_TO_2', 'Selasa', 9, 10, 'PRODUKTIF TO', '8A', 'BENGKEL_TO_2');

        $addSchedule('XI_TO_1', 'Selasa', 2, 2, 'PRODUKTIF TO', '8A', 'BENGKEL_TO_1');
        $addSchedule('XI_TO_1', 'Selasa', 3, 8, 'PRODUKTIF TO', '9A', 'BENGKEL_TO_1');
        $addSchedule('XI_TO_1', 'Selasa', 9, 10, 'KIK', '6A', 'BENGKEL_TO_1');

        $addSchedule('XI_TO_2', 'Selasa', 2, 3, 'PRODUKTIF TO', '17A', 'BENGKEL_TO_2');
        $addSchedule('XI_TO_2', 'Selasa', 4, 8, 'PRODUKTIF TO', '8A', 'BENGKEL_TO_2');
        $addSchedule('XI_TO_2', 'Selasa', 9, 10, 'KIK', '30A', 'BENGKEL_TO_2');

        // RABU
        $addSchedule('X_TO_1', 'Rabu', 2, 2, 'INFORMATIKA', '11A', 'BENGKEL_TO_1');
        $addSchedule('X_TO_1', 'Rabu', 3, 5, 'PAI', '12A', 'R_TEORI_101');
        $addSchedule('X_TO_1', 'Rabu', 6, 7, 'SEJARAH', '27B', 'R_TEORI_101');
        $addSchedule('X_TO_1', 'Rabu', 8, 10, 'PRODUKTIF TO', '9A', 'BENGKEL_TO_1');

        $addSchedule('X_TO_2', 'Rabu', 2, 4, 'PRODUKTIF TO', '9A', 'BENGKEL_TO_2');
        $addSchedule('X_TO_2', 'Rabu', 5, 7, 'B.INGGRIS', '2A', 'R_TEORI_102');
        $addSchedule('X_TO_2', 'Rabu', 8, 10, 'B.INDONESIA', '27A', 'R_TEORI_102');

        $addSchedule('XI_TO_1', 'Rabu', 2, 2, 'KIK', '6A', 'BENGKEL_TO_1');
        $addSchedule('XI_TO_1', 'Rabu', 3, 4, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_TO_1', 'Rabu', 5, 8, 'B.INGGRIS', '37A', 'R_TEORI_201');
        $addSchedule('XI_TO_1', 'Rabu', 9, 10, 'SEJARAH', '2B', 'R_TEORI_201');

        $addSchedule('XI_TO_2', 'Rabu', 2, 3, 'BISNIS DIGITAL', '18B', 'BENGKEL_TO_2');
        $addSchedule('XI_TO_2', 'Rabu', 4, 6, 'KIK', '6A', 'BENGKEL_TO_2');
        $addSchedule('XI_TO_2', 'Rabu', 7, 8, 'PPKN', '16A', 'R_TEORI_201');
        $addSchedule('XI_TO_2', 'Rabu', 9, 10, 'PJOK', '35A', 'LAPANGAN');

        // KAMIS
        $addSchedule('X_TO_1', 'Kamis', 2, 8, 'PRODUKTIF TO', '8A', 'BENGKEL_TO_1');
        $addSchedule('X_TO_1', 'Kamis', 9, 10, 'PPKN', '19A', 'R_TEORI_101');

        $addSchedule('X_TO_2', 'Kamis', 2, 5, 'INFORMATIKA', '11A', 'BENGKEL_TO_2');
        $addSchedule('X_TO_2', 'Kamis', 6, 7, 'SEJARAH', '27B', 'R_TEORI_102');
        $addSchedule('X_TO_2', 'Kamis', 8, 10, 'PJOK', '5A', 'LAPANGAN');

        $addSchedule('XI_TO_1', 'Kamis', 2, 3, 'PPKN', '16A', 'R_TEORI_201');
        $addSchedule('XI_TO_1', 'Kamis', 4, 5, 'BISNIS DIGITAL', '18B', 'BENGKEL_TO_1');
        $addSchedule('XI_TO_1', 'Kamis', 6, 7, 'KIK', '30A', 'BENGKEL_TO_1');
        $addSchedule('XI_TO_1', 'Kamis', 8, 10, 'MATEMATIKA', '36A', 'R_TEORI_201');

        $addSchedule('XI_TO_2', 'Kamis', 2, 5, 'B.INGGRIS', '37A', 'R_TEORI_201');
        $addSchedule('XI_TO_2', 'Kamis', 6, 7, 'SEJARAH', '2B', 'R_TEORI_201');
        $addSchedule('XI_TO_2', 'Kamis', 8, 10, 'B.INDONESIA', '34A', 'R_TEORI_201');

        // JUMAT
        $addSchedule('X_TO_1', 'Jumat', 2, 4, 'B.INGGRIS', '2A', 'R_TEORI_101');
        $addSchedule('X_TO_1', 'Jumat', 5, 7, 'MATEMATIKA', '4A', 'R_TEORI_101');

        $addSchedule('X_TO_2', 'Jumat', 2, 4, 'MATEMATIKA', '4A', 'R_TEORI_102');
        $addSchedule('X_TO_2', 'Jumat', 5, 7, 'PAI', '12A', 'R_TEORI_102');

        $addSchedule('XI_TO_1', 'Jumat', 2, 4, 'PAI', '33A', 'R_TEORI_201');
        $addSchedule('XI_TO_1', 'Jumat', 5, 7, 'B.INDONESIA', '34A', 'R_TEORI_201');

        $addSchedule('XI_TO_2', 'Jumat', 2, 4, 'MATEMATIKA', '36A', 'R_TEORI_201');
        $addSchedule('XI_TO_2', 'Jumat', 5, 7, 'PAI', '33A', 'R_TEORI_201');

        // --- TPFL SCHEDULE DATA (PAGE 6) ---
        // SENIN
        $addSchedule('X_TPFL', 'Senin', 2, 4, 'MATEMATIKA', '18A', 'R_TEORI_101');
        $addSchedule('X_TPFL', 'Senin', 5, 6, 'SENBUD', '46A', 'R_TEORI_101');
        $addSchedule('X_TPFL', 'Senin', 7, 10, 'PRODUKTIF TPFL', '6B', 'BENGKEL_TPFL');

        $addSchedule('XI_TPFL', 'Senin', 2, 3, 'PJOK', '35A', 'LAPANGAN');
        $addSchedule('XI_TPFL', 'Senin', 4, 5, 'B.INGGRIS', '38A', 'R_TEORI_201');
        $addSchedule('XI_TPFL', 'Senin', 6, 7, 'PPKN', '16A', 'R_TEORI_201');
        $addSchedule('XI_TPFL', 'Senin', 8, 10, 'B.INDONESIA', '34A', 'R_TEORI_201');

        // SELASA
        $addSchedule('X_TPFL', 'Selasa', 2, 7, 'PRODUKTIF TPFL', '6B', 'BENGKEL_TPFL');
        $addSchedule('X_TPFL', 'Selasa', 8, 10, 'B.INDONESIA', '29A', 'R_TEORI_101');

        $addSchedule('XI_TPFL', 'Selasa', 2, 4, 'PAI', '33A', 'R_TEORI_201');
        $addSchedule('XI_TPFL', 'Selasa', 5, 6, 'SEJARAH', '2B', 'R_TEORI_201');
        $addSchedule('XI_TPFL', 'Selasa', 7, 8, 'B.INGGRIS', '38A', 'R_TEORI_201');
        $addSchedule('XI_TPFL', 'Selasa', 9, 10, 'PRODUKTIF TPFL', '10A', 'BENGKEL_TPFL');

        // RABU
        $addSchedule('X_TPFL', 'Rabu', 2, 4, 'PJOK', '5A', 'LAPANGAN');
        $addSchedule('X_TPFL', 'Rabu', 5, 7, 'IPAS', '30B', 'BENGKEL_TPFL');
        $addSchedule('X_TPFL', 'Rabu', 8, 10, 'PAI', '4C', 'R_TEORI_101');

        $addSchedule('XI_TPFL', 'Rabu', 2, 10, 'PRODUKTIF TPFL', '10A', 'BENGKEL_TPFL');

        // KAMIS
        $addSchedule('X_TPFL', 'Kamis', 2, 4, 'B.INGGRIS', '38A', 'R_TEORI_101');
        $addSchedule('X_TPFL', 'Kamis', 5, 8, 'INFORMATIKA', '28B', 'BENGKEL_TPFL');
        $addSchedule('X_TPFL', 'Kamis', 9, 10, 'SEJARAH', '29B', 'R_TEORI_101');

        $addSchedule('XI_TPFL', 'Kamis', 2, 3, 'BISNIS DIGITAL', '32B', 'BENGKEL_TPFL');
        $addSchedule('XI_TPFL', 'Kamis', 4, 8, 'PRODUKTIF TPFL', '9B', 'BENGKEL_TPFL');
        $addSchedule('XI_TPFL', 'Kamis', 9, 10, 'KIK', '6A', 'BENGKEL_TPFL');

        // JUMAT
        $addSchedule('X_TPFL', 'Jumat', 2, 3, 'B.SUNDA', '31A', 'R_TEORI_101');
        $addSchedule('X_TPFL', 'Jumat', 4, 5, 'IPAS', '30B', 'BENGKEL_TPFL');
        $addSchedule('X_TPFL', 'Jumat', 6, 7, 'PPKN', '19A', 'R_TEORI_101');

        $addSchedule('XI_TPFL', 'Jumat', 2, 4, 'KIK', '6A', 'BENGKEL_TPFL');
        $addSchedule('XI_TPFL', 'Jumat', 5, 7, 'MATEMATIKA', '36A', 'R_TEORI_201');

        // ADDITIONAL STUDENT ROSTER (All Classes & Sub-Roles)
        $additionalStudents = [
            ['name' => 'Dimas Arya Nugraha', 'nisn' => '0068192342', 'class' => 'XI_PPLG_1', 'sub_role' => 'Wakil Ketua Kelas'],
            ['name' => 'Siti Aisyah Humaira', 'nisn' => '0068192343', 'class' => 'XI_PPLG_1', 'sub_role' => 'Sekretaris'],
            ['name' => 'Muhammad Rizqi Pratama', 'nisn' => '0068192344', 'class' => 'XI_PPLG_1', 'sub_role' => 'Bendahara'],
            ['name' => 'Bintang Aditya Kusuma', 'nisn' => '0068192345', 'class' => 'XI_PPLG_1', 'sub_role' => 'Siswa'],
            ['name' => 'Putri Wulandari', 'nisn' => '0068192346', 'class' => 'XI_PPLG_1', 'sub_role' => 'Siswa'],
            ['name' => 'Fajar Alamsyah', 'nisn' => '0068192347', 'class' => 'X_PPLG_1', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Dewi Sartika', 'nisn' => '0068192348', 'class' => 'X_PPLG_2', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Rangga Wijaya', 'nisn' => '0068192349', 'class' => 'X_ANIMASI_1', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Bayu Saputra', 'nisn' => '0068192350', 'class' => 'XI_ANIMASI_1', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Cindy Clarissa', 'nisn' => '0068192351', 'class' => 'X_BCF_1', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Deni Ramdani', 'nisn' => '0068192352', 'class' => 'X_TO_1', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Eko Prasetyo', 'nisn' => '0068192353', 'class' => 'XI_TO_1', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Gilang Pratama', 'nisn' => '0068192354', 'class' => 'X_TPFL', 'sub_role' => 'Ketua Kelas'],
            ['name' => 'Hendra Saputra', 'nisn' => '0068192355', 'class' => 'XI_TPFL', 'sub_role' => 'Ketua Kelas'],
        ];

        foreach ($additionalStudents as $st) {
            $classModel = $classroomMap[$st['class']] ?? $classroomMap['XI_PPLG_1'];
            User::updateOrCreate(
                ['nisn' => $st['nisn']],
                [
                    'name' => $st['name'],
                    'email' => strtolower(str_replace(' ', '.', $st['name'])) . '@edusync.sch.id',
                    'password' => Hash::make('password'),
                    'role' => 'siswa',
                    'sub_role' => $st['sub_role'],
                    'phone' => '0878' . rand(10000000, 99999999),
                    'classroom_id' => $classModel->id,
                    'department_id' => $classModel->department_id,
                    'status' => 'active',
                ]
            );
        }

        // 9. SAMPLE PICKET REPORT
        PicketReport::create([
            'student_id' => $siswaUser->id,
            'classroom_id' => $classroomMap['XI_PPLG_1']->id,
            'date' => now()->toDateString(),
            'photo_url' => '/images/piket_demo.jpg',
            'notes' => 'Piket ruang kelas XI PPLG 1 dan Lab Software telah selesai dibersihkan, papan tulis bersih, jendela terkunci.',
            'status' => 'pending',
        ]);

        // 10. SAMPLE INVAL REQUEST
        $schedToSwap = Schedule::where('teacher_id', $teacherMap['41A']->id)->first();
        if ($schedToSwap) {
            InvalRequest::create([
                'requester_teacher_id' => $teacherMap['41A']->id,
                'substitute_teacher_id' => $teacherMap['26A']->id,
                'schedule_id' => $schedToSwap->id,
                'date' => now()->addDays(2)->toDateString(),
                'reason' => 'Menghadiri Rapat Koordinasi Kurikulum Vokasi SMK Provinsi di Dinas Pendidikan',
                'status' => 'pending',
                'notes' => 'Materi modul pembelajaran telah disiapkan di repositori Google Classroom.',
            ]);
        }

        // 11. AUDIT LOG INITIALIZATION
        AuditLog::create([
            'user_id' => $adminUser->id,
            'action' => 'SYSTEM_INITIALIZED',
            'description' => 'Inisialisasi sistem EDUSYNC: 48 guru pengampu, 18 rombel, 5 jurusan vokasi, dan matriks jadwal semester genap berhasil sinkron.',
            'details' => ['source' => 'PDF Dokumen Kurikulum Resmi SMK Negeri', 'status' => '100% Conflict-Free'],
            'ip_address' => '127.0.0.1',
        ]);
    }
}

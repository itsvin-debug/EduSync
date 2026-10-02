<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Presensi Harian - {{ $classroom->name }} - {{ $dateFormatted }}</title>
    <style>
        @page {
            margin: 25px 35px 30px 35px;
            size: A4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
        }
        .header-kop {
            text-align: center;
            border-bottom: 3px double #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header-kop .instansi-prov {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #334155;
            margin: 0;
        }
        .header-kop .instansi-dinas {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #0f172a;
            margin: 2px 0;
        }
        .header-kop .nama-sekolah {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #1e1b4b;
            margin: 2px 0;
            text-transform: uppercase;
        }
        .header-kop .kontak-sekolah {
            font-size: 9px;
            color: #64748b;
            margin-top: 3px;
        }
        .doc-title {
            text-align: center;
            margin: 12px 0 10px 0;
        }
        .doc-title h2 {
            margin: 0;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #0f172a;
        }
        .doc-title p {
            margin: 3px 0 0 0;
            font-size: 10px;
            color: #475569;
        }

        .meta-table {
            width: 100%;
            margin-bottom: 12px;
            border-collapse: collapse;
        }
        .meta-table td {
            font-size: 10px;
            padding: 2.5px 0;
            vertical-align: top;
        }
        .meta-table .label {
            width: 110px;
            color: #475569;
            font-weight: 600;
        }
        .meta-table .colon {
            width: 12px;
            color: #64748b;
        }
        .meta-table .value {
            color: #0f172a;
            font-weight: 700;
        }

        .stats-box {
            width: 100%;
            margin-bottom: 12px;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
        }
        .stats-box td {
            text-align: center;
            padding: 6px 4px;
            border-right: 1px solid #e2e8f0;
        }
        .stats-box td:last-child {
            border-right: none;
        }
        .stats-box .stat-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            display: block;
        }
        .stats-box .stat-val {
            font-size: 15px;
            font-weight: 800;
            margin-top: 2px;
            display: block;
        }
        .stat-hadir { color: #15803d; }
        .stat-sakit { color: #b45309; }
        .stat-izin { color: #0284c7; }
        .stat-disp { color: #4338ca; }
        .stat-alpa { color: #b91c1c; }
        .stat-rate { color: #0f172a; }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }
        .data-table th, .data-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 6px;
            font-size: 9.5px;
        }
        .data-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            text-align: center;
        }
        .data-table td.col-center {
            text-align: center;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .check-mark {
            font-size: 11px;
            font-weight: bold;
        }
        .badge-hadir { color: #15803d; font-weight: bold; }
        .badge-sakit { color: #b45309; font-weight: bold; }
        .badge-izin { color: #0284c7; font-weight: bold; }
        .badge-disp { color: #4338ca; font-weight: bold; }
        .badge-alpa { color: #b91c1c; font-weight: bold; }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 10px;
        }
        .signature-space {
            height: 55px;
        }
        .signature-name {
            font-weight: 700;
            text-decoration: underline;
            color: #0f172a;
        }
        .signature-sub {
            font-size: 9px;
            color: #475569;
            margin-top: 2px;
        }
        .footer-note {
            margin-top: 16px;
            padding-top: 6px;
            border-top: 1px dashed #cbd5e1;
            font-size: 8px;
            color: #64748b;
            text-align: justify;
        }
    </style>
</head>
<body>
    <!-- KOP RESMI SEKOLAH -->
    <div class="header-kop">
        <p class="instansi-prov">Pemerintah Daerah Provinsi Jawa Barat</p>
        <p class="instansi-dinas">Dinas Pendidikan — Cabang Dinas Wilayah VII</p>
        <h1 class="nama-sekolah">SMK Negeri 1 Ciomas</h1>
        <p class="kontak-sekolah">Jl. Rekayasa No. 101, Kota Bandung, Jawa Barat | Telp: (022) 7234567 | Pos: 40124 | info@smkn1rekayasa.sch.id</p>
    </div>

    <!-- JUDUL DOKUMEN -->
    <div class="doc-title">
        <h2>Laporan Rekapitulasi Presensi Harian Kelas</h2>
        <p>EDUSYNC System • Terintegrasi Dapodik & Manajemen Presensi Digital</p>
    </div>

    <!-- METADATA TABEL -->
    <table class="meta-table">
        <tr>
            <td style="width: 50%;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td class="label">Kelas / Rombel</td>
                        <td class="colon">:</td>
                        <td class="value">{{ $classroom->name }}</td>
                    </tr>
                    <tr>
                        <td class="label">Program Keahlian</td>
                        <td class="colon">:</td>
                        <td class="value">{{ $classroom->department->name ?? 'Pengembangan Perangkat Lunak dan Gim' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Tahun Ajaran / Sem.</td>
                        <td class="colon">:</td>
                        <td class="value">2026/2027 • Semester Ganjil</td>
                    </tr>
                </table>
            </td>
            <td style="width: 50%;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td class="label">Hari / Tanggal</td>
                        <td class="colon">:</td>
                        <td class="value">{{ $dayName }}, {{ $dateFormatted }}</td>
                    </tr>
                    <tr>
                        <td class="label">Wali Kelas</td>
                        <td class="colon">:</td>
                        <td class="value">{{ $classroom->homeroomTeacher->name ?? 'Didin Sahrudin, M.Kom' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Ketua Kelas</td>
                        <td class="colon">:</td>
                        <td class="value">{{ $classLeader->name ?? $student->name }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- RINGKASAN STATISTIK -->
    <table class="stats-box">
        <tr>
            <td>
                <span class="stat-label">Total Siswa</span>
                <span class="stat-val">{{ $stats['total'] }}</span>
            </td>
            <td>
                <span class="stat-label">Hadir</span>
                <span class="stat-val stat-hadir">{{ $stats['hadir'] }}</span>
            </td>
            <td>
                <span class="stat-label">Sakit</span>
                <span class="stat-val stat-sakit">{{ $stats['sakit'] }}</span>
            </td>
            <td>
                <span class="stat-label">Izin</span>
                <span class="stat-val stat-izin">{{ $stats['izin'] }}</span>
            </td>
            <td>
                <span class="stat-label">Dispensasi</span>
                <span class="stat-val stat-disp">{{ $stats['dispensasi'] }}</span>
            </td>
            <td>
                <span class="stat-label">Alpa</span>
                <span class="stat-val stat-alpa">{{ $stats['alpha'] }}</span>
            </td>
            <td>
                <span class="stat-label">% Kehadiran</span>
                <span class="stat-val stat-rate">{{ $stats['total'] > 0 ? round(($stats['hadir'] / $stats['total']) * 100, 1) : 0 }}%</span>
            </td>
        </tr>
    </table>

    <!-- TABEL RINCIAN KEHADIRAN SISWA -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25px;">No</th>
                <th style="width: 35px;">No. Abs</th>
                <th>Nama Lengkap Siswa</th>
                <th style="width: 80px;">NISN</th>
                <th style="width: 42px;">Hadir</th>
                <th style="width: 40px;">Sakit</th>
                <th style="width: 40px;">Izin</th>
                <th style="width: 40px;">Disp.</th>
                <th style="width: 40px;">Alpa</th>
                <th style="width: 140px;">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $idx => $st)
                @php
                    $att = $attendances->firstWhere('user_id', $st->id);
                    $status = $att->status ?? 'hadir';
                    $notes = $att->notes ?? '-';
                @endphp
                <tr>
                    <td class="col-center">{{ $idx + 1 }}</td>
                    <td class="col-center font-mono">{{ $st->attendance_number ?? ($idx + 1) }}</td>
                    <td style="font-weight: 600;">{{ $st->name }}</td>
                    <td class="col-center" style="font-family: monospace;">{{ $st->nisn ?? '-' }}</td>
                    <td class="col-center">
                        @if($status === 'hadir') <span class="badge-hadir">&#10003;</span> @else - @endif
                    </td>
                    <td class="col-center">
                        @if($status === 'sakit') <span class="badge-sakit">&#10003;</span> @else - @endif
                    </td>
                    <td class="col-center">
                        @if($status === 'izin') <span class="badge-izin">&#10003;</span> @else - @endif
                    </td>
                    <td class="col-center">
                        @if($status === 'dispensasi') <span class="badge-disp">&#10003;</span> @else - @endif
                    </td>
                    <td class="col-center">
                        @if($status === 'alpha') <span class="badge-alpa">&#10003;</span> @else - @endif
                    </td>
                    <td style="font-size: 8.5px; color: #475569;">{{ $notes }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- LEMBAR PENGESAHAN / TANDA TANGAN -->
    <table class="signature-table">
        <tr>
            <td>
                Mengetahui,<br>
                <strong>Wali Kelas {{ $classroom->name }}</strong>
                <div class="signature-space"></div>
                <div class="signature-name">{{ $classroom->homeroomTeacher->name ?? 'Didin Sahrudin, M.Kom' }}</div>
                <div class="signature-sub">NIP: {{ $classroom->homeroomTeacher->nip ?? '19840215 200801 1 004' }}</div>
            </td>
            <td>
                Bandung, {{ $dateFormatted }}<br>
                <strong>Ketua Kelas</strong>
                <div class="signature-space"></div>
                <div class="signature-name">{{ $classLeader->name ?? $student->name }}</div>
                <div class="signature-sub">NISN: {{ $classLeader->nisn ?? $student->nisn }}</div>
            </td>
        </tr>
    </table>

    <!-- CATATAN KAKI SISTEM -->
    <div class="footer-note">
        Dokumen ini diterbitkan secara otomatis melalui platform <strong>EDUSYNC Sistem Informasi Akademik SMKN 1 Ciomas</strong>. Waktu cetak: {{ now()->timezone('Asia/Jakarta')->isoFormat('D MMMM YYYY, HH:mm:ss') }}. Berkas ini sah dan terverifikasi secara digital.
    </div>
</body>
</html>

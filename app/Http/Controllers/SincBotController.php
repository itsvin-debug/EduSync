<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;

class SincBotController extends Controller
{
    /**
     * Handle incoming chat message for SINC-BOT.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'session_id' => 'nullable|string|max:100',
        ]);

        $message = trim($validated['message']);
        $sessionId = $validated['session_id'] ?? session()->getId();

        // 1. Try FastAPI microservice endpoint first (default port 8001)
        try {
            $response = Http::timeout(15)->post('http://127.0.0.1:8001/chat', [
                'message' => $message,
                'session_id' => $sessionId,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'status' => 'success',
                    'reply' => $data['reply'] ?? '',
                    'is_out_of_topic' => (bool) ($data['is_out_of_topic'] ?? false),
                    'session_id' => $sessionId,
                ]);
            }
        } catch (\Throwable $e) {
            // FastAPI service might not be running as a standalone daemon, use process fallback
        }

        // 2. Direct Python process fallback for zero-downtime execution
        try {
            $pythonPath = 'python';
            $scriptPath = base_path('python/sinc_bot.py');
            $payload = json_encode([
                'message' => $message,
                'session_id' => $sessionId,
            ]);

            $process = Process::timeout(25)->run([$pythonPath, $scriptPath, '--json', $payload]);

            if ($process->successful()) {
                $output = trim($process->output());
                $data = json_decode($output, true);

                if (is_array($data) && isset($data['reply'])) {
                    return response()->json([
                        'status' => 'success',
                        'reply' => $data['reply'],
                        'is_out_of_topic' => (bool) ($data['is_out_of_topic'] ?? false),
                        'session_id' => $sessionId,
                    ]);
                }
            }
        } catch (\Throwable $processErr) {
            Log::error('SINC-BOT fallback execution failed: ' . $processErr->getMessage());
        }

        // 3. Graceful failure response if both methods fail
        return response()->json([
            'status' => 'success',
            'reply' => 'Maaf, sistem SINC-BOT sedang menyelaraskan data dengan server. Silakan coba tanyakan kembali seputar jadwal dan portal SMKN 1 Ciomas.',
            'is_out_of_topic' => false,
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Clear and reset conversation session.
     */
    public function reset(Request $request): JsonResponse
    {
        $sessionId = $request->input('session_id', session()->getId());

        // Notify FastAPI if active
        try {
            Http::timeout(3)->post('http://127.0.0.1:8001/reset', [
                'session_id' => $sessionId,
            ]);
        } catch (\Throwable $e) {
            // Ignore if service is offline
        }

        return response()->json([
            'status' => 'cleared',
            'session_id' => $sessionId,
            'message' => 'Riwayat sesi SINC-BOT berhasil dibersihkan.',
        ]);
    }
}

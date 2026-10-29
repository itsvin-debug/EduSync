<?php

namespace Tests\Feature;

use Tests\TestCase;

class SincBotTest extends TestCase
{
    /**
     * Test chat endpoint requires a valid message.
     */
    public function test_chat_requires_message(): void
    {
        $response = $this->postJson('/api/sinc-bot/chat', [
            'message' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    /**
     * Test asking in-context school question returns accurate reply.
     */
    public function test_in_context_question_success(): void
    {
        $response = $this->postJson('/api/sinc-bot/chat', [
            'message' => 'Di mana letak lab animasi?',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_out_of_topic' => false,
            ]);

        $this->assertNotEmpty($response->json('reply'));
        $this->assertTrue(
            str_contains(strtolower($response->json('reply')), 'animasi') ||
            str_contains(strtolower($response->json('reply')), 'gedung c') ||
            str_contains(strtolower($response->json('reply')), 'lantai 2')
        );
    }

    /**
     * Test out-of-topic question triggers strict rejection.
     */
    public function test_out_of_topic_question_is_rejected(): void
    {
        $response = $this->postJson('/api/sinc-bot/chat', [
            'message' => 'Bagaimana ramalan cuaca besok di Jakarta?',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_out_of_topic' => true,
            ]);

        $this->assertStringContainsString(
            'Maaf, saya adalah SINC-BOT, asisten khusus untuk website SMKN 1 Ciomas',
            $response->json('reply')
        );
    }

    /**
     * Test session reset endpoint clears session.
     */
    public function test_session_reset_endpoint(): void
    {
        $response = $this->postJson('/api/sinc-bot/reset', [
            'session_id' => 'test-sess-123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'cleared',
                'session_id' => 'test-sess-123',
            ]);
    }
}


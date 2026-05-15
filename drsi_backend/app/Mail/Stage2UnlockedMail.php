<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class Stage2UnlockedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Application $application,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Required — Your I-130 Has Been Approved! Upload Stage 2 Documents',
            cc: [config('app.admin_email', 'meir@drsi.com')],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.stage2-unlocked',
            with: [
                'application' => $this->application,
                'userName' => $this->application->user->name,
                'portalUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')),
            ],
        );
    }
}

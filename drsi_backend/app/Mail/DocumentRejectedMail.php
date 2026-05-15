<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Application $application,
        public string $documentType,
        public string $adminComment,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Required — A Document in Your DRSI Application Was Rejected',
            cc: [config('app.admin_email', 'meir@drsi.com')],
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.document-rejected',
            with: [
                'application' => $this->application,
                'userName' => $this->application->user->name,
                'documentType' => str_replace('-', ' ', ucwords($this->documentType, '-')),
                'adminComment' => $this->adminComment,
                'portalUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')),
            ],
        );
    }
}

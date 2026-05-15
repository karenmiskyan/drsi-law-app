<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class Stage1SubmittedAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Application $application,
    ) {}

    public function envelope(): Envelope
    {
        $petitioner = data_get($this->application->form_data, 'petitioner.fullName', 'Unknown');
        $beneficiary = data_get($this->application->form_data, 'beneficiary.fullName', 'Unknown');

        return new Envelope(
            subject: "New Application Submitted — {$petitioner} / {$beneficiary}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.stage1-submitted',
            with: [
                'application' => $this->application,
                'petitioner' => data_get($this->application->form_data, 'petitioner', []),
                'beneficiary' => data_get($this->application->form_data, 'beneficiary', []),
                'adminUrl' => config('app.url').'/admin/applications/'.$this->application->id,
            ],
        );
    }
}

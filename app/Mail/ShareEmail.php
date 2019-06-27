<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ShareEmail extends Mailable
{
    use Queueable, SerializesModels;
    public $data;
    public $text;

    public function __construct($data)
    {
        $this->data = $data;
        $this->text = $data['text'];
    }

    public function build()
    {
        return $this->from('support@cloud-ultrasound.com')->view('emails.share');
    }
}

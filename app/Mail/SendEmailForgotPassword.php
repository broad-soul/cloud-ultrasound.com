<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendEmailForgotPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $pass;
    public $msg;
    public function __construct($pass, $msg)
    {
        $this->pass = $pass;
        $this->msg = $msg;
    }

    public function build()
    {
        return $this->from('support@cloud-ultrasound.com')->view('emails.recovery');
    }
}

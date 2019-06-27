<?php

namespace App\Http\Controllers\Auth;

use App\DB_SQLServer;
use App\Http\Controllers\Controller;
use App\Mail\SendEmailForgotPassword;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function __invoke(Request $request)
    {
        $email = $request->email;
        $msg = $request->msg;
        $db = DB_SQLServer::connection();

        $pass = ''; //out variables

        $tsql = "{call sp_forgot_password(?, ?)}";
        $params = [[$email], [&$pass, SQLSRV_PARAM_OUT]];

        $stmt = sqlsrv_query($db, $tsql, $params);

        if(is_numeric($pass)) {
            try {
                Mail::to($email)->send(new SendEmailForgotPassword($pass, $msg));

                return response()->json('Email sent', 200);
            } catch (\Exception $e) {
                return response()->json('Email not sent', 200);
            }
        } else {
            return response()->json('Email not found', 422);
        }
    }
}

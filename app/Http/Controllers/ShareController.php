<?php

namespace App\Http\Controllers;

use App\Mail\ShareEmail;
use App\Share;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ShareController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
    */
    public function share_session(Request $request)
    {
        $data = $request->all();
        if ($data['name'] === null)  $data['name'] = '';
        $shareData = $data;
        try {
            foreach ($data['email'] as $email) {
                $shareData['email'] = $email;
                $pass = Share::create($shareData);
                $data['pass'] = $pass;
                Mail::to($email)->send(new ShareEmail($data));
            }
        } catch (\Exception $e) {
            return response()->json(["message" => $e->getMessage()], 422);
        }

        return response()->json(['message' => "Session shared success"], 200);
    }

    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
    */
    public function get_shared_emails()
    {
        $user_id = request()->user_id;
        $array = DB::select("SELECT t.to_user_id FROM tbl_shares t WHERE shared_user_id = '$user_id'");
        if (empty($array)) return response()->json(["message" => null], 422);
        $array = Arr::pluck($array, 'to_user_id');
        $users_id = implode(', ', $array);
        $emails = DB::select("SELECT t.email FROM tbl_users t WHERE t.user_id IN ($users_id)");

        $res = [];

        foreach ($emails as $obg) {
            if ($obg->email) $res[] = ['Description' => $obg->email];
        }

        return $res;
    }
}

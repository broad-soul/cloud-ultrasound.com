<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SessionsController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function get_doctor_sessions(Request $request)
    {
        $user = Auth::user();
        $doctor_email = $user->email ?? null;
        if(!$doctor_email)
            return response()->json(["message" => "Unauthenticated."], 422);

        $name = $request->name ?? null;
        $date_start = $request->date_start ?? null;
        $date_end = $request->date_end ?? null;

        $sql = "SELECT DISTINCT 
                t.session_id, 
                t.patient_name, 
                t.patient_email, 
                t.creation_time, 
                t.comment_editable,
                t.watched,
                t.comment,
                t.is_shared,
                CONVERT(nvarchar,t.creation_time, 110) AS mydate,
                CONVERT(nvarchar,t.expire_date, 110) AS  my_expire_date,
                t.closed
                FROM v_session_search t  WHERE 1=1";
        if($name || $date_start || $date_end) {
            if($name && !$date_start && !$date_end) {

                $sql .= " AND (UPPER(t.patient_email) LIKE UPPER (N'%$name%') 
                          OR UPPER(t.patient_name) LIKE UPPER (N'%$name%'))";

            } else if($date_start && !$name && !$date_end) {

                $sql .= " AND CONVERT(date, t.creation_time) >= CONVERT(date, '$date_start')";

            } else if($date_end && !$name && !$date_start) {

                $sql .= " AND CONVERT(date, t.creation_time) <= CONVERT(date, '$date_end')";

            } else if($name && $date_start && !$date_end) {

                $sql .= " AND (UPPER(t.patient_email) LIKE UPPER (N'%$name%' ) 
                          OR UPPER(t.patient_name) LIKE UPPER (N'%$name%'))
                          AND CONVERT(date, t.creation_time) >= CONVERT(date, '$date_start')";

            } else if($name && $date_end && !$date_start) {

                $sql .= " AND (UPPER(t.patient_email) LIKE UPPER (N'%$name%' ) 
                          OR UPPER(t.patient_name) LIKE UPPER (N'%$name%'))
                          AND CONVERT(date, t.creation_time) <= CONVERT(date, '$date_end')";

            } else if($date_start && $date_end && !$name) {

                $sql .= " AND CONVERT(date, t.creation_time) BETWEEN CONVERT(date, '$date_start') 
                          AND CONVERT(date, '$date_end')";

            } else if($name && $date_start && $date_end) {

                $sql .= " AND (UPPER(t.patient_email) LIKE UPPER (N'%$name%' ) 
                          OR UPPER(t.patient_name) LIKE UPPER (N'%$name%'))
                          AND CONVERT(date, t.creation_time) BETWEEN CONVERT(date, '$date_start') 
                          AND CONVERT(date, '$date_end')";

            }
        }
        $sql .= " AND UPPER (t.doctor_email ) = '$doctor_email' ORDER BY creation_time DESC";

        $sessions = DB::select($sql);

        if($sessions != null && is_array($sessions)) {
            foreach ($sessions as $session) {
                $newSessions[] = [
                    'session_id' => $session->session_id,
                    'user_name' => $session->patient_name,
                    'user_email' => $session->patient_email,
                    'date' => $session->mydate,
                    'time' => explode(' ', substr($session->creation_time, 0, -4))[1],
                    'is_shared' => $session->is_shared,
                    'expire_date' => $session->my_expire_date,
                    'comment_editable' => $session->comment_editable,
                    'session_closed' => $session->closed,
                    'watched' => $session->watched,
                    'comment' => $session->comment,
                ];
            }
            return $newSessions;
        }


        return response()->json(["message" => "Sessions not found"], 422);
    }

    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function get_patient_sessions()
    {
        $user_id = Auth::user()->user_id;

        if($user_id <= 0) return response()->json(["message" => "Unauthenticated."], 422);

        $sessions = DB::select("SELECT DISTINCT session_id,
                                      MAX(t.creation_time) AS creation_time,
                                      CONVERT(NVARCHAR,MAX(t.creation_time),110) AS mydate, 
                                      CONVERT(NVARCHAR,MAX(t.expire_date),110) AS my_expire_date,
                                      MAX(t.patient_name) AS patient_name,
                                      MAX(t.patient_email) AS patient_email,
                                      MAX(t.doctor_name) AS doctor_name,
                                      MAX(t.doctor_email) AS doctor_email,
                                      MAX(t.from_user_name) AS from_user_name,
                                      MAX(t.from_user_email) AS from_user_email,
                                      MAX(t.comment) AS comment,
                                      user_id,
                                      MAX(t.is_shared) AS is_shared,
                                      MAX(t.expire_date) AS expire_date,
                                      MAX(t.comment_editable) AS comment_editable,
                                      MAX(t.closed) AS closed,
                                      MAX(CONVERT(int,t.watched)) AS watched
                                      FROM v_patient_session2 t 
                                      WHERE t.user_id='$user_id'
                                      GROUP BY t.session_id,user_id
                                      ORDER BY creation_time DESC");
        $newSessions = [];

        if($sessions != null && is_array($sessions)) {
            foreach ($sessions as $session) {
                $newSessions[] = [
                    'session_id' => $session->session_id,
                    'user_name' => $session->patient_name,
                    'user_email' => $session->patient_email,
                    'date' => $session->mydate,
                    'time' => explode(' ', substr($session->creation_time, 0, -4))[1],
                    'is_shared' => $session->is_shared,
                    'expire_date' => $session->my_expire_date,
                    'comment_editable' => $session->comment_editable,
                    'from_user_name' => $session->from_user_name,
                    'from_user_email' => $session->from_user_email,
                    'session_closed' => $session->closed,
                    'watched' => $session->watched,
                    'comment' => $session->comment
                ];
            }
            return $newSessions;
        }

        return response()->json(["message" => "Sessions not found"], 422);
    }

}

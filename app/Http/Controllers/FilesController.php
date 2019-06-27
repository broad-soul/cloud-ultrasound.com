<?php

namespace App\Http\Controllers;

use App\Comment;
use App\Files;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FilesController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function post_session_files(Request $request)
    {
        if(!$request->session_id) return response()->json(["message" => "Give me session id. Example: session_id: 1111"], 422);
        return $this->get_session_files($request->session_id);
    }

    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
    */
    public function get_session_files($session_id)
    {
        $sessions = DB::select("SELECT t.name, 
                                            t.creation_date, 
                                            t.duration, 
                                            t.url, 
                                            t.Browse_key, 
                                            convert(NVARCHAR,t.creation_date,110) AS my_date, 
                                            convert(NVARCHAR,t.creation_date,108) AS my_time
                                            FROM v_files t 
                                            WHERE t.session_id = $session_id  
                                            ORDER BY t.creation_date ASC");
        $newSessions = [];

        if($sessions != null && is_array($sessions)) {
            foreach ($sessions as $session) {
                $fileId = $session->url;
                $driveKey = $session->Browse_key;
                $extension = explode('.', $session->name)[1];

                $type = ($extension == 'mp4') ? 'video' : 'photo';

                $newSessions[] = [
                    'name' => $session->my_date . '_' . $session->my_time,
                    'duration' => trim(gmdate("H:i:s\\", round($session->duration / 1000))),
                    'downloadLink' => 'https://drive.google.com/uc?id=' . $fileId . '&export=download',
                    'thumbnail' => 'https://drive.google.com/thumbnail?authuser=0&sz=w240&id=' . $fileId,
                    'thumbnail_image' => 'https://drive.google.com/thumbnail?authuser=0&sz=w10&id=' . $fileId,
                    'resource_v1' => 'https://drive.google.com/uc?id=' . $fileId,
                    'resource_v2' => 'https://www.googleapis.com/drive/v3/files/' . $fileId . '?key=' . $driveKey . '&alt=media&' . $type,
                    'extension' => $extension,
                    'type' => $type
                ];
            }
            return $newSessions;
        }
        return response()->json([
            'errors' => true
        ], 422);
    }

    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function get_linked_patients()
    {
        $doc_email = request()->email;
        $names = DB::select("SELECT t.patient_email, t.patient_name
                FROM v_session_search t  WHERE upper (t.doctor_email ) = '$doc_email'");

        $res = [];

        foreach ($names as $name) {
            if($name->patient_name) $res[] = ['Description' => $name->patient_name];
            if($name->patient_email) $res[] = ['Description' => $name->patient_email];
        }

        return $res;
    }
}

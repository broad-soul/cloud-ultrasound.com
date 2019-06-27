<?php

namespace App\Http\Controllers;

use App\DB_SQLServer;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function get_session_comment($id)
    {
        return DB::select("SELECT comment FROM v_session_comment WHERE session_id = $id")[0]->comment;
    }
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function edit_session_comment(Request $request)
    {
        $id = $request->id;
        $comment = $request->comment;
        $db = DB_SQLServer::connection();
        $tsql = "{call sp_edit_session_comment(?, ?)}";
        $stmt = sqlsrv_query($db, $tsql, [ [$id], [$comment] ]);

        if ($stmt) return response()->json(["message" => "Comment edit success"]);
        else return response()->json(["message" => "Error comment edit"]);
    }
}

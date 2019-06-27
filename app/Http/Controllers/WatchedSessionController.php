<?php
/**
 * Created by PhpStorm.
 * User: sarvar
 * Date: 11.04.2019
 * Time: 11:18
 */

namespace App\Http\Controllers;


use App\DB_SQLServer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WatchedSessionController
{
    /**
     * Handle the incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
    */
    public function make_session_watched(Request $request)
    {
        $db = DB_SQLServer::connection();
        $error = '';

        $tsql = "{call sp_makeSessionWatched(?, ?, ?)}";
        $params = [
            [$request->session_id],
            [Auth::user()->user_id],
            [&$error, SQLSRV_PARAM_OUT]
        ];
        $stmt = sqlsrv_query($db, $tsql, $params);
        if ($error != -1) {
            return response()->json(["message" => "Watched session success"], 201);
        } else {
            return response()->json(["message" => "Error watched session"], 403);
        }
    }
}

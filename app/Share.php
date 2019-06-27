<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Share extends Model
{
    public static function create($data)
    {
        $db = DB_SQLServer::connection();
        $is_new_user = 0;
        $password = '';

        $tsql = "{call sp_share_session(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
        $params = [
            [$data['user_id']],
            [$data['session_id']],
            [$data['expire_period_type']],
            [$data['expire_day']],
            [$data['email']],
            [$data['name']],
            [$data['editable']],
            [&$is_new_user, SQLSRV_PARAM_OUT],
            [&$password, SQLSRV_PARAM_OUT],
            [$data['clientMessage']]
        ];
        $stmt = sqlsrv_query($db, $tsql, $params);
        return $password;
    }
}

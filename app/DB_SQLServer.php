<?php

namespace App;

class DB_SQLServer
{
	public static function connection()
	{
		$serverName = config('database.connections.sqlsrv.host').',1433';
		$connectionInfo = [
			"Database"=> config('database.connections.sqlsrv.database'),
			"UID"=> config('database.connections.sqlsrv.username'),
			"PWD" => config('database.connections.sqlsrv.password'),
			"CharacterSet" => "UTF-8"
		];
        return sqlsrv_connect($serverName, $connectionInfo);
	}
}

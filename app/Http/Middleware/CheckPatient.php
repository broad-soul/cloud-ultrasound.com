<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckPatient
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user = Auth::user();
        $is_patient = false;
        if ($user->shared_role) $is_patient = true;
        else if ($user->patient_role) $is_patient = true;
        if(!$is_patient)
            return response()->json(["message" => "You are not a patient."], 422);

        return $next($request);
    }
}

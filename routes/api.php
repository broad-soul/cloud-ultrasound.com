<?php

use Illuminate\Http\Request;

Route::middleware('auth:api', 'throttle:60,1')->get('/get_user', function (Request $request) {
    return $request->user();
});

Route::group(['namespace' => 'Auth'], function () {
    Route::post('/login', 'LoginController');
    Route::middleware('auth:api')->post('/logout', 'LogoutController');
    Route::post('/forgot_password', 'ForgotPasswordController');
});


Route::group(['middleware' => 'auth:api'], function () {
    Route::post('/get_doctor_sessions', 'SessionsController@get_doctor_sessions')->middleware('doctor');
    Route::post('/get_patient_sessions', 'SessionsController@get_patient_sessions')->middleware('patient');

    Route::get('/get_session_files/{session_id}', 'FilesController@get_session_files');
    Route::post('/get_session_files', 'FilesController@post_session_files');
    Route::post('/get_linked_patients', 'FilesController@get_linked_patients');

    Route::post('/get_session_comment/{session_id}', 'CommentController@get_session_comment');
    Route::post('/edit_session_comment', 'CommentController@edit_session_comment');

    Route::post('/share_session', 'ShareController@share_session');
    Route::post('/get_shared_emails', 'ShareController@get_shared_emails');

    Route::post('/make_session_watched', 'WatchedSessionController@make_session_watched');
});

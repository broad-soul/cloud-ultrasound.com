<?php

Route::get('/get-ssm-ip-address', function () {
    return '20.185.208.3';
});
Route::get('/get-relay-ip-address', function () {
    return '52.232.228.171';
});

Route::get('/{any}', 'SpaController@index')->where('any', '.*');

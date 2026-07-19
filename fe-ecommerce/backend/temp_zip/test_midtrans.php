<?php
$keys = [
    'SB-Mid-server-ToO1qRuih81Bqqk00z1O80M9', // the one we used
    'SB-Mid-server-T85-8G-sCndFw-r1k0q9fXF0',
    'SB-Mid-server-GwUP_WbPcG3X-6j3EHYgE4bZ',
];

foreach ($keys as $key) {
    $ch = curl_init('https://app.sandbox.midtrans.com/snap/v1/transactions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['transaction_details'=>['order_id'=>'test-'.time().rand(), 'gross_amount'=>10000]]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Basic ' . base64_encode($key . ':')
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $res = curl_exec($ch);
    echo "Key: $key \nResult: $res \n\n";
}

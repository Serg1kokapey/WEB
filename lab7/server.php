<?php
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data) {
    $serverTime = date("H:i:s") . "." . substr((string)microtime(), 2, 3);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'serverTime' => $serverTime]);
} else {
    echo json_encode(['status' => 'ready']);
}
?>
<?php
header('Content-Type: application/json');

$file = 'data.json';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data) {
    
        file_put_contents($file, json_encode($data));
        echo json_encode(['status' => 'success', 'message' => 'Дані збережено']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Некоректні дані']);
    }
} elseif ($method === 'GET') {
    
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode(['text' => 'Glitch', 'color1' => '#ff00ff', 'color2' => '#00ffff', 'duration' => 2, 'fontSize' => 48]);
    }
}
?>
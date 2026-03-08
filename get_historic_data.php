<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// --- DB CONFIG — update these ---
$host = 'localhost';
$db   = 'weather_station';
$user = 'patrizio';
$pass = 'stocazzo';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}

// Sanitize inputs
$from = isset($_GET['from']) ? $conn->real_escape_string($_GET['from']) : date('Y-m-d H:i:s', strtotime('-7 days'));
$to   = isset($_GET['to'])   ? $conn->real_escape_string($_GET['to'])   : date('Y-m-d H:i:s');

$sql = "
    SELECT 
        reading_time AS timestamp,
        temperature,
        humidity,
        pressure,
        altitude
    FROM environment_logs
    WHERE reading_time BETWEEN '$from' AND '$to'
    ORDER BY reading_time ASC
";

$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => $conn->error]);
    exit;
}

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = [
        'timestamp'   => $row['timestamp'],
        'temperature' => (float) $row['temperature'],
        'humidity'    => (float) $row['humidity'],
        'pressure'    => (float) $row['pressure'],
        'altitude'    => (float) $row['altitude'],
    ];
}

echo json_encode($rows);
$conn->close();
?>

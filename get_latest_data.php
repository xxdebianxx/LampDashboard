<?php
header('Content-Type: application/json');
$conn = new mysqli("localhost", "patrizio", "stocazzo", "weather_station");

$result = $conn->query("SELECT temperature, humidity FROM environment_logs ORDER BY id DESC LIMIT 1");
echo json_encode($result->fetch_assoc());
$conn->close();
?>

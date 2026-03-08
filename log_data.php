<?php
header("Content-Type: application/json");
// Allow the simulator to talk to the API even if hosted differently
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$conn = new mysqli("localhost", "patrizio", "stocazzo", "weather_station");

// Read the JSON sent by the JavaScript simulator
$json = file_get_contents('php://input');
$data = json_decode($json);

if ($data) {
    $stmt = $conn->prepare("INSERT INTO environment_logs (temperature, pressure, humidity, altitude) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("dddd", $data->temp, $data->press, $data->hum, $data->alt);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Data Saved"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}
?>

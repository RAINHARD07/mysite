<?php
// Database connection
$conn = new mysqli("localhost", "root", "", "portfolio");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get form data
$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];

// Simple validation
if(empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo "All fields are required";
    exit();
}

// Insert into database
$sql = "INSERT INTO contacts (name, email, subject, message)
        VALUES ('$name', '$email', '$subject', '$message')";

if ($conn->query($sql) === TRUE) {
    echo "Message sent successfully!";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();
?>
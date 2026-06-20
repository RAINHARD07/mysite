<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // Your email
    $to = "asanteboahrainhard8@gmail.com";

    $fullMessage = "Name: $name\nEmail: $email\n\nMessage:\n$message";

    $headers = "From: $email";

    if (mail($to, $subject, $fullMessage, $headers)) {
        header("Location: index.php?success=1");
    } else {
        echo "Message failed to send.";
    }
}
?>
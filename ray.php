<?php
// Optional success message after form submission
$success = "";
if (isset($_GET['success'])) {
    $success = "Message sent successfully!";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asante Boah Rainhard | Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>

<!-- SUCCESS MESSAGE -->
<?php if ($success): ?>
    <div style="background: green; color: white; padding: 10px; text-align:center;">
        <?php echo $success; ?>
    </div>
<?php endif; ?>

<!-- NAVBAR -->
<nav class="navbar">
    <div class="container">
        <div class="nav-wrapper">
            <div class="logo">
                <img src="Images/Asante.jpeg" width="50">
                <span>Asante Boah Rainhard</span>
            </div>
        </div>
    </div>
</nav>

<!-- HERO -->
<section id="home">
    <h1>Welcome to My Portfolio</h1>
    <p>Full-Stack Developer | Cybersecurity Analyst</p>
</section>

<!-- PROJECTS -->
<section id="projects">
    <h2>Projects</h2>

    <?php
    $projects = [
        ["name" => "E-Commerce Platform", "tech" => "React, Node.js"],
        ["name" => "Chat App", "tech" => "Firebase, Socket.io"],
        ["name" => "Analytics Dashboard", "tech" => "Vue, PostgreSQL"]
    ];

    foreach ($projects as $project) {
        echo "<div>";
        echo "<h3>{$project['name']}</h3>";
        echo "<p>{$project['tech']}</p>";
        echo "</div>";
    }
    ?>
</section>

<!-- CONTACT -->
<section id="contact">
    <h2>Contact Me</h2>

    <form action="send_message.php" method="POST">
        <input type="text" name="name" placeholder="Your Name" required><br><br>
        <input type="email" name="email" placeholder="Your Email" required><br><br>
        <input type="text" name="subject" placeholder="Subject" required><br><br>
        <textarea name="message" placeholder="Message" required></textarea><br><br>
        <button type="submit">Send Message</button>
    </form>
</section>

<footer>
    <p>© 2026 Asante Boah Rainhard</p>
</footer>

</body>
</html>
// ===================================
// BACKEND SERVER - Node.js with Express
// ===================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const validatorJs = require('validator');
const nodemailer = require('nodemailer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ===================================
// SECURITY MIDDLEWARE
// ===================================

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all requests
app.use(limiter);

// More strict rate limiting for API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30
});

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ===================================
// BODY PARSER MIDDLEWARE
// ===================================

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// ===================================
// STATIC FILES
// ===================================

app.use(express.static(path.join(__dirname, 'public')));

// ===================================
// VALIDATION MIDDLEWARE
// ===================================

const validateEmail = (email) => {
    return validatorJs.isEmail(email);
};

const validateContactForm = (name, email, subject, message) => {
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!email || !validateEmail(email)) {
        errors.push('Valid email is required');
    }
    
    if (!subject || subject.trim().length < 5) {
        errors.push('Subject must be at least 5 characters long');
    }
    
    if (!message || message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    if (message && message.trim().length > 5000) {
        errors.push('Message cannot exceed 5000 characters');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// ===================================
// EMAIL CONFIGURATION
// ===================================

const emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email configuration
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    emailTransporter.verify((error, success) => {
        if (error) {
            console.log('Email configuration error:', error);
        } else {
            console.log('Email service is ready');
        }
    });
}

// ===================================
// LOGGING MIDDLEWARE
// ===================================

const logRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
};

app.use(logRequest);

// ===================================
// ROUTES
// ===================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Get portfolio information
app.get('/api/portfolio', (req, res) => {
    try {
        const portfolioData = {
            name: 'Your Name',
            title: 'Full-Stack Developer & Cybersecurity Expert',
            bio: 'Building secure solutions with code and passion',
            email: 'hello@example.com',
            phone: '+1 (234) 567-890',
            location: 'San Francisco, CA',
            social: {
                github: 'https://github.com/yourprofile',
                linkedin: 'https://linkedin.com/in/yourprofile',
                twitter: 'https://twitter.com/yourprofile'
            },
            skills: {
                backend: ['Node.js', 'Python', 'Java', 'Express.js', 'Django'],
                frontend: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS'],
                security: ['Penetration Testing', 'Vulnerability Assessment', 'Network Security'],
                devops: ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
            },
            experience: [
                {
                    position: 'Senior Security Engineer',
                    company: 'TechCorp Security',
                    duration: '2022 - Present',
                    description: 'Leading security architecture and implementation'
                }
            ]
        };
        
        res.status(200).json({
            status: 'success',
            data: portfolioData
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve portfolio data',
            error: error.message
        });
    }
});

// Contact form submission endpoint
app.post('/api/contact', apiLimiter, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate input
        const validation = validateContactForm(name, email, subject, message);
        
        if (!validation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        
        // Sanitize input
        const sanitizedData = {
            name: validatorJs.trim(validatorJs.escape(name)),
            email: validatorJs.normalizeEmail(email),
            subject: validatorJs.trim(validatorJs.escape(subject)),
            message: validatorJs.trim(validatorJs.escape(message))
        };
        
        // Log the submission (in production, save to database)
        console.log('Contact form submission:', {
            ...sanitizedData,
            timestamp: new Date().toISOString(),
            ip: req.ip
        });
        
        // Send email notification to admin
        await sendContactEmail(sanitizedData);
        
        // Send confirmation email to user
        await sendConfirmationEmail(sanitizedData.email, sanitizedData.name);
        
        res.status(200).json({
            status: 'success',
            message: 'Message sent successfully. I will get back to you soon!',
            data: {
                submittedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Contact form error:', error);
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to send message',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get all projects
app.get('/api/projects', (req, res) => {
    try {
        const projects = [
            {
                id: 1,
                title: 'SecureVault API',
                description: 'Enterprise-grade encrypted data storage API',
                technologies: ['Node.js', 'PostgreSQL', 'Encryption'],
                link: 'https://github.com/yourprofile/securevault',
                features: [
                    'End-to-end encryption',
                    'Role-based access control',
                    'Audit logging'
                ]
            },
            {
                id: 2,
                title: 'ThreatDetect Dashboard',
                description: 'Real-time security monitoring dashboard',
                technologies: ['React', 'WebSocket', 'D3.js'],
                link: 'https://github.com/yourprofile/threatdetect',
                features: [
                    'Real-time threat intelligence',
                    'Anomaly detection',
                    'Incident response'
                ]
            },
            {
                id: 3,
                title: 'VulnScanner Pro',
                description: 'Automated vulnerability scanning tool',
                technologies: ['Python', 'Security Scanning', 'CLI'],
                link: 'https://github.com/yourprofile/vulnscanner',
                features: [
                    'Detailed reporting',
                    'CVSS scoring',
                    'Remediation recommendations'
                ]
            }
        ];
        
        res.status(200).json({
            status: 'success',
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve projects',
            error: error.message
        });
    }
});

// Get skills
app.get('/api/skills', (req, res) => {
    try {
        const skills = {
            backend: {
                category: 'Backend Development',
                items: ['Node.js', 'Python', 'Java', 'Express.js', 'Django', 'RESTful APIs']
            },
            frontend: {
                category: 'Frontend Development',
                items: ['React', 'Vue.js', 'TypeScript', 'HTML/CSS', 'JavaScript', 'Tailwind CSS']
            },
            security: {
                category: 'Cybersecurity',
                items: ['Penetration Testing', 'Vulnerability Assessment', 'Encryption', 'Network Security']
            },
            devops: {
                category: 'DevOps & Cloud',
                items: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'GitHub Actions', 'Terraform']
            },
            databases: {
                category: 'Databases',
                items: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Firebase']
            }
        };
        
        res.status(200).json({
            status: 'success',
            data: skills
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve skills',
            error: error.message
        });
    }
});

// Get experience
app.get('/api/experience', (req, res) => {
    try {
        const experience = [
            {
                id: 1,
                position: 'Senior Security Engineer',
                company: 'TechCorp Security',
                duration: '2022 - Present',
                description: 'Leading security architecture and implementation',
                responsibilities: [
                    'Led security architecture reviews for 15+ microservice applications',
                    'Implemented zero-trust architecture reducing security incidents by 89%',
                    'Conducted penetration testing and vulnerability assessments'
                ]
            },
            {
                id: 2,
                position: 'Full-Stack Developer',
                company: 'InnovateLabs',
                duration: '2020 - 2022',
                description: 'Full-stack web application development',
                responsibilities: [
                    'Developed and deployed 25+ production applications',
                    'Built scalable React and Node.js applications',
                    'Optimized database queries reducing load times by 60%'
                ]
            }
        ];
        
        res.status(200).json({
            status: 'success',
            count: experience.length,
            data: experience
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve experience',
            error: error.message
        });
    }
});

// ===================================
// HELPER FUNCTIONS
// ===================================

async function sendContactEmail(data) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `New Contact Form Submission: ${data.subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <h3>Message:</h3>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
                <p><small>Submitted at: ${new Date().toISOString()}</small></p>
            `
        };
        
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await emailTransporter.sendMail(mailOptions);
            console.log('Admin email sent successfully');
        }
    } catch (error) {
        console.error('Error sending admin email:', error);
    }
}

async function sendConfirmationEmail(userEmail, userName) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Thank you for contacting me',
            html: `
                <h2>Thank You, ${userName}!</h2>
                <p>I've received your message and will get back to you as soon as possible.</p>
                <p>Best regards,<br>Your Name</p>
            `
        };
        
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            await emailTransporter.sendMail(mailOptions);
            console.log('Confirmation email sent to user');
        }
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

// ===================================
// ERROR HANDLING
// ===================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    
    console.error(`Error: ${message}`);
    
    res.status(status).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ===================================
// SERVER STARTUP
// ===================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   Portfolio Server Started           ║
    ║   ${HOST}:${PORT}                      ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
    ╚══════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = app;
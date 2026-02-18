const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('Testing Resend configuration...');
    console.log('API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
    console.log('Admin Email:', process.env.ADMIN_EMAIL);

    try {
        const { data, error } = await resend.emails.send({
            from: "Spacechico & Winnit <no-reply@spacechico-winnit.online>",
            to: [process.env.ADMIN_EMAIL || 'test@example.com'],
            subject: 'Test Resend Configuration',
            html: '<p>Ceci est un test de configuration Resend.</p>'
        });

        if (error) {
            console.error('Resend Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Success!', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testResend();

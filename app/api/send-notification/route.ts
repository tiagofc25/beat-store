import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mailjet = require('node-mailjet').apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, beatTitles } = body;

    if (!firstName || !lastName || !email || !beatTitles) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const beatsList = beatTitles.join(', ');

    // Email à l'admin
    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_SENDER_EMAIL || 'noreply@beatstore.com',
              Name: 'Beat Store',
            },
            To: [
              {
                Email: adminEmail,
                Name: 'Admin',
              },
            ],
            Subject: `🎵 Nouvelle demande de beats - ${firstName} ${lastName}`,
            HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A0A0B; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8B5CF6; margin: 0;">🎵 Beat Store</h1>
                <p style="color: #71717A; margin-top: 5px;">Nouvelle demande de beats</p>
              </div>
              
              <div style="background-color: #18181B; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="color: #fff; margin-top: 0; font-size: 18px;">Informations du demandeur</h2>
                <table style="width: 100%; color: #A1A1AA;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #27272A;"><strong>Nom</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #27272A; color: #fff;">${firstName} ${lastName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #27272A;"><strong>Email</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #27272A;"><a href="mailto:${email}" style="color: #8B5CF6;">${email}</a></td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #18181B; border-radius: 12px; padding: 24px;">
                <h2 style="color: #fff; margin-top: 0; font-size: 18px;">Beats demandés</h2>
                <p style="color: #22D3EE; font-size: 16px; margin: 0;">${beatsList}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" 
                   style="display: inline-block; background: linear-gradient(to right, #8B5CF6, #22D3EE); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Voir dans l'admin
                </a>
              </div>
              
              <p style="color: #71717A; font-size: 12px; text-align: center; margin-top: 30px;">
                Cet email a été envoyé automatiquement par Beat Store
              </p>
            </div>
          `,
            TextPart: `
Nouvelle demande de beats

Nom: ${firstName} ${lastName}
Email: ${email}

Beats demandés: ${beatsList}

Connectez-vous à l'admin pour valider ou refuser cette demande.
          `,
          },
          {
            From: {
              Email: process.env.MAILJET_SENDER_EMAIL || 'noreply@beatstore.com',
              Name: 'Beat Store',
            },
            To: [
              {
                Email: email,
                Name: `${firstName} ${lastName}`,
              },
            ],
            Subject: `🎵 Confirmation de votre demande - Beat Store`,
            HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A0A0B; color: #fff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8B5CF6; margin: 0;">🎵 Beat Store</h1>
                <p style="color: #71717A; margin-top: 5px;">Confirmation de demande</p>
              </div>
              
              <div style="background-color: #18181B; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <h2 style="color: #fff; margin-top: 0; font-size: 18px;">Bonjour ${firstName},</h2>
                <p style="color: #A1A1AA; line-height: 1.6;">
                  Nous avons bien reçu votre demande pour les beats suivants. Nous allons l'examiner dans les plus brefs délais.
                </p>
              </div>
              
              <div style="background-color: #18181B; border-radius: 12px; padding: 24px;">
                <h2 style="color: #fff; margin-top: 0; font-size: 18px;">Votre sélection</h2>
                <p style="color: #22D3EE; font-size: 16px; margin: 0;">${beatsList}</p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #A1A1AA;">
                  Une fois votre demande validée, vous recevrez un email contenant les liens de téléchargement.
                </p>
              </div>
              
              <p style="color: #71717A; font-size: 12px; text-align: center; margin-top: 30px;">
                Merci de votre confiance,<br>L'équipe Beat Store
              </p>
            </div>
          `,
            TextPart: `
Bonjour ${firstName},

Nous avons bien reçu votre demande pour les beats suivants : ${beatsList}

Nous allons l'examiner dans les plus brefs délais. Une fois validée, vous recevrez un email avec les liens de téléchargement.

Merci de votre confiance,
L'équipe Beat Store
          `,
          },
        ],
      });

    console.log('Email sent successfully:', result.body);
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

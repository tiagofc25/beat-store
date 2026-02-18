import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use your verified domain email, fallback to test email
const fromEmail = process.env.RESEND_FROM_EMAIL;

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
    const { error: adminError } = await resend.emails.send({
      from: `Spacechico & Winnit <${fromEmail}>`,
      to: [adminEmail],
      subject: `🎵 Nouvelle demande de beats - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A0A0B; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0;">🎵 Spacechico & Winnit</h1>
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
            Cet email a été envoyé automatiquement par Spacechico & Winnit On The Track
          </p>
        </div>
      `,
      text: `Nouvelle demande de beats\n\nNom: ${firstName} ${lastName}\nEmail: ${email}\n\nBeats demandés: ${beatsList}\n\nConnectez-vous à l'admin pour valider ou refuser.`,
    });

    if (adminError) {
      console.error('Resend admin email error:', adminError);
    }

    // Email de confirmation au client
    const { error: clientError } = await resend.emails.send({
      from: `Spacechico & Winnit <${fromEmail}>`,
      to: [email],
      subject: `🎵 Confirmation de votre demande - Spacechico & Winnit`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A0A0B; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B5CF6; margin: 0;">🎵 Spacechico & Winnit</h1>
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
            Merci de votre confiance,<br>L'équipe Spacechico & Winnit On The Track
          </p>
        </div>
      `,
      text: `Bonjour ${firstName},\n\nNous avons bien reçu votre demande pour : ${beatsList}\n\nUne fois validée, vous recevrez les liens de téléchargement.\n\nMerci !\nSpacechico & Winnit`,
    });

    if (clientError) {
      console.error('Resend client email error:', clientError);
    }

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}

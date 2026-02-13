import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BeatDownload {
  title: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, beats } = body as {
      firstName: string;
      lastName: string;
      email: string;
      beats: BeatDownload[];
    };

    if (!firstName || !lastName || !email || !beats || beats.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const beatLinksHtml = beats
      .map(
        (beat) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #27272A;">
            <span style="color: #fff; font-weight: 500;">🎵 ${beat.title}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #27272A; text-align: right;">
            <a href="${beat.url}" 
               style="display: inline-block; background: linear-gradient(to right, #8B5CF6, #22D3EE); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
              Télécharger
            </a>
          </td>
        </tr>
      `
      )
      .join('');

    const beatLinksText = beats
      .map((beat) => `${beat.title}: ${beat.url}`)
      .join('\n');

    const { data, error } = await resend.emails.send({
      from: 'Spacechico & Winnit <onboarding@resend.dev>',
      to: [email],
      subject: `🎵 Vos beats sont prêts ! - Spacechico & Winnit`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #0A0A0B;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%); padding: 40px 20px; text-align: center; border-radius: 0 0 24px 24px;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 700;">🎧 Spacechico & Winnit</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 16px;">Vos beats sont prêts !</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #fff; font-size: 18px; margin: 0 0 8px 0;">
              Salut <strong>${firstName}</strong> ! 👋
            </p>
            <p style="color: #A1A1AA; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Bonne nouvelle ! Ta demande a été acceptée. Voici tes beats prêts à être téléchargés :
            </p>
            <div style="background-color: #18181B; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
              <div style="padding: 16px 20px; border-bottom: 1px solid #27272A;">
                <h2 style="color: #fff; margin: 0; font-size: 16px; font-weight: 600;">
                  📦 Tes téléchargements (${beats.length})
                </h2>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                ${beatLinksHtml}
              </table>
            </div>
            <div style="background-color: #1E1B4B; border-radius: 12px; padding: 16px 20px; border-left: 4px solid #8B5CF6;">
              <p style="color: #C4B5FD; font-size: 14px; margin: 0; line-height: 1.5;">
                💡 <strong>Note :</strong> Les liens de téléchargement sont valides pendant 24 heures. 
                Assure-toi de télécharger tes beats rapidement !
              </p>
            </div>
          </div>
          <div style="padding: 24px; text-align: center; border-top: 1px solid #27272A;">
            <p style="color: #71717A; font-size: 13px; margin: 0;">Merci de ta confiance ! 🙏</p>
            <p style="color: #52525B; font-size: 12px; margin-top: 12px;">
              Cet email a été envoyé automatiquement par Spacechico & Winnit On The Track
            </p>
          </div>
        </div>
      `,
      text: `Salut ${firstName} !\n\nBonne nouvelle ! Ta demande a été acceptée. Voici tes beats :\n\n${beatLinksText}\n\nNote : Les liens sont valides 24 heures.\n\nMerci !\nSpacechico & Winnit`,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully', data });
  } catch (error: any) {
    console.error('Send beats email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

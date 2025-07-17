import { Resend } from 'resend';

// Lazy initialization to avoid crashes when API key is missing
let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

interface SendPasswordResetEmailParams {
  to: string;
  username: string;
  resetUrl: string;
}

export const sendPasswordResetEmail = async ({ to, username, resetUrl }: SendPasswordResetEmailParams) => {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'SoloDevelopment <onboarding@resend.dev>', // Using Resend's free domain
      to,
      subject: 'Reset Your Password - SoloDevelopment',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SoloDevelopment</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi <strong>${username}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password for your SoloDevelopment account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 15 minutes for security reasons.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin-bottom: 0;">
              This email was sent by SoloDevelopment. If you have any questions, please contact support.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${username},
        
        We received a request to reset your password for your SoloDevelopment account.
        
        Click this link to reset your password: ${resetUrl}
        
        This link will expire in 15 minutes for security reasons.
        
        If you didn't make this request, you can safely ignore this email.
        
        Thanks,
        SoloDevelopment Team
      `
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    console.log('Password reset email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};
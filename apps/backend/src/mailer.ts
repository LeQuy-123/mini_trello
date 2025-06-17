import nodemailer from 'nodemailer';
// utils/mailer.ts

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: parseInt(process.env.EMAIL_PORT || '587'),
	secure: false, // true for 465, false for 587
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export async function sendOtpEmail(to: string, otp: string) {
	const mailOptions = {
		from: `Mini Trello <${process.env.EMAIL_USER}>`,
		to,
		text: `Your OTP code is: ${otp}`,
		html: `<p>Your OTP code is:
			<b>${otp}</b>
		</p>
		<p>This code will expire in 5 minutes.</p>`,
	};
	console.log('🚀 ~ sendOtpEmail ~ mailOptions:', mailOptions);

	await transporter.sendMail(mailOptions);
}

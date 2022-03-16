import nodemailer, { Transporter } from "nodemailer";

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

export default class EmailService {
    protected host: string;
    protected port: number;
    protected secure: boolean;
    protected transporter: Transporter;

    constructor() {
        this.host = String(EMAIL_HOST);
        this.port = Number(EMAIL_PORT);
        this.secure = false;
        this.transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: this.secure,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASSWORD,
            },
        });
    }

    public sendMail = async (
        toEmail: string,
        subject: string,
        template: string
    ) => {
        try {
            const result = await this.transporter.sendMail({
                from: "test@cdsa365.com",
                to: toEmail,
                subject: subject,
                text: "Hello",
            });
            // console.log(nodemailer.getTestMessageUrl(result));
            return { sent: true, email: toEmail };
        } catch (error) {
            console.log("SENDING ERROR", error);
            return { sent: false, email: toEmail };
        }
    };
}

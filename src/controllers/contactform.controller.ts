import { Request, Response } from "express";
// import DB from "../constructs/db";
import EmailService from "../services/mail-service";
import { ContactFormBody } from "../types/types";

const { SENDER_EMAIL } = process.env;

export default class ContactFormController {
    // protected db: DB;
    protected email: EmailService;

    constructor() {
        // this.db = new DB();
        this.email = new EmailService();
    }

    public sendContactFormEmails = async (req: Request, res: Response) => {
        // const conn = await this.db.getConnection();
        try {
            const messageBody = this.frameHTML(req.body);
            this.email
                .send({
                    from: "no-reply@cdsa365.com",
                    to: String(SENDER_EMAIL),
                    subject: "New submission received from contact form",
                    text: "Test",
                    html: messageBody,
                })
                .then(() => res.status(200).json("Email sent"))
                .catch((err) => {
                    console.log("ERR==>", err);
                    res.status(500).json({ error: true, ...err });
                });
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        } finally {
            // conn.release();
        }
    };

    private frameHTML = (data: ContactFormBody) => {
        const { first_name, last_name, email, subject, message } = data;
        let body = `<p><b>Name:</b> ${first_name} ${last_name}</p>`;
        body += `<p><b>Email:</b> ${email}</p>`;
        body += `<p><b>Subject:</b> ${subject}</p>`;
        body += `<p><b>Message:</b></p>`;
        body += `<p>${message}</p>`;
        return body;
    };
}

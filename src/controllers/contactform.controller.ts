import { Request, Response } from "express";
import EmailService from "../services/mail-service";
import {
    ContactFormBody,
    ContactFormEmailContext,
    TransportInfo,
} from "../types/types";

const { SENDER_EMAIL } = process.env;

export default class ContactFormController {
    protected email: EmailService;

    constructor() {
        this.email = new EmailService();
    }

    public sendContactFormEmails = async (req: Request, res: Response) => {
        try {
            const messageBody: ContactFormEmailContext = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                subject: req.body.subject,
                message: req.body.message,
            };
            const transportInfo: TransportInfo = {
                from: "no-reply@cdsa365.com",
                to: String(SENDER_EMAIL),
                subject: "New submission received from contact form",
            };
            this.email
                .sendContactFormEmail(transportInfo, messageBody)
                .then(() => res.status(200).json("Email sent"))
                .catch((err) =>
                    res.status(500).json({ error: true, message: err.message })
                );
        } catch (error: any) {
            res.status(500).json({ error: true, message: error.message });
        }
    };
}

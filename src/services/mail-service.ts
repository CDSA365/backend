import Email from "@sendgrid/mail";
import { getFromSSM } from "../helpers/helpers";
import {
    ContactFormEmailContext,
    InvitationEmailContext,
    TransportInfo,
    VerificationEmailContext,
} from "../types/types";
import { compile } from "handlebars";
import mjml2html from "mjml";
import * as fs from "fs";
import * as path from "path";

const { EMAIL_API_KEY, SENDER_EMAIL } = process.env;
export default class EmailService {
    protected mjmlOptions: any;

    constructor() {
        this.mjmlOptions = {
            keepComments: false,
            validationLevel: "strict",
        };
    }

    public sendInvitationMail = async (
        sendingInfo: TransportInfo,
        context: InvitationEmailContext
    ) => {
        const location = `../email-templates/invitation-template.mjml`;
        const templatePath = path.join(__dirname, location);
        return await this.send(templatePath, sendingInfo, context);
    };

    public sendVerificationEmail = async (
        info: TransportInfo,
        context: VerificationEmailContext
    ) => {
        const location = `../email-templates/email-verification-template.mjml`;
        const templatePath = path.join(__dirname, location);
        info.subject = info.subject ?? "Verify your email";
        return await this.send(templatePath, info, context);
    };

    public sendContactFormEmail = async (
        info: TransportInfo,
        context: ContactFormEmailContext
    ) => {
        const location = `../email-templates/contact-form-template.mjml`;
        const templatePath = path.join(__dirname, location);
        return await this.send(templatePath, info, context);
    };

    protected renderTemplate = (
        templatePath: string,
        context:
            | InvitationEmailContext
            | VerificationEmailContext
            | ContactFormEmailContext
    ) => {
        try {
            const fileContent = fs.readFileSync(templatePath).toString();
            const { html } = mjml2html(fileContent, this.mjmlOptions);
            const compiler = compile(html);
            return compiler(context);
        } catch (error) {
            console.log(error);
            return "";
        }
    };

    protected getKeys = async () => {
        const key = await getFromSSM(String(EMAIL_API_KEY)).then((key) => key);
        console.log("SSM KEY", key);
        Email.setApiKey(String(key));
    };

    public send = async (
        templatePath: string,
        info: TransportInfo,
        context:
            | InvitationEmailContext
            | VerificationEmailContext
            | ContactFormEmailContext
    ) => {
        return new Promise(async (resolve, reject) => {
            const { from, to, subject, cc, bcc } = info;
            const toEmail = typeof to === "string" ? to : to.join(", ");
            try {
                const emailBody = this.renderTemplate(templatePath, context);
                await this.getKeys();
                await Email.send({
                    from: from || String(SENDER_EMAIL),
                    to: toEmail,
                    subject: subject,
                    text: JSON.stringify(emailBody),
                    html: emailBody,
                });
                resolve({ sent: true, email: toEmail });
            } catch (error: any) {
                console.log("EMAIL ERROR:", error);
                reject({ sent: false, email: toEmail });
            }
        });
    };
}

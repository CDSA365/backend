import nodemailer, { Transporter } from "nodemailer";
import { compile, template } from "handlebars";
import mjml2html from "mjml";
import * as fs from "fs";
import * as path from "path";
import {
    InvitationEmailContext,
    TransportInfo,
    VerificationEmailContext,
} from "../types/types";

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

export default class EmailService {
    protected host: string;
    protected port: number;
    protected secure: boolean;
    protected transporter: Transporter;
    protected mjmlOptions: any;

    constructor() {
        this.host = String(EMAIL_HOST);
        this.port = Number(EMAIL_PORT);
        this.secure = false;
        this.mjmlOptions = {
            beautify: true,
            keepComments: false,
            validationLevel: "strict",
        };
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

    public sendInvitationMail = async (
        info: TransportInfo,
        context: InvitationEmailContext
    ) => {
        const location = `../email-templates/invitation-template.mjml`;
        const templatePath = path.join(__dirname, location);
        return await this.sendMail(templatePath, info, context);
    };

    public sendVerificationEmail = async (
        info: TransportInfo,
        context: VerificationEmailContext
    ) => {
        const location = `../email-templates/invitation-template.mjml`;
        const templatePath = path.join(__dirname, location);
        info.subject = info.subject ?? "Verify your email";
        return await this.sendMail(templatePath, info, context);
    };

    private sendMail = async (
        templatePath: string,
        info: TransportInfo,
        context: InvitationEmailContext | VerificationEmailContext
    ) => {
        try {
            const { from, to, subject, cc, bcc } = info;
            const toEmail = typeof to === "string" ? to : to.join(", ");
            const html = this.renderTemplate(templatePath, context);
            const result = await this.transporter.sendMail({
                from: from ?? "info@cdsa365.com",
                to: toEmail,
                subject: subject,
                cc: cc ?? "",
                bcc: bcc ?? "",
                html: html,
                text: html,
            });
            console.log(nodemailer.getTestMessageUrl(result));
            return { sent: true, email: info.to };
        } catch (error) {
            console.log("SENDING ERROR", error);
            return { sent: false, email: info.to };
        }
    };

    protected renderTemplate = (
        templatePath: string,
        context: InvitationEmailContext | VerificationEmailContext
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

    protected writeFile = (html: any) => {
        const location = path.join(__dirname, "../email-templates/output.json");
        fs.writeFile(
            location,
            JSON.stringify(html),
            { encoding: "utf8" },
            function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved to the output folder");
            }
        );
    };
}

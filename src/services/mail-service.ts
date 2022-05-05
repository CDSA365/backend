import Email from "@sendgrid/mail";
import { getFromSSM } from "../helpers/helpers";
import { EmailBody } from "../types/types";

const { EMAIL_API_KEY } = process.env;
export default class EmailService {
    constructor() {}

    private getKeys = async () => {
        const key = await getFromSSM(String(EMAIL_API_KEY)).then((key) => key);
        Email.setApiKey(String(key));
    };

    public send = async (message: EmailBody) => {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getKeys();
                await Email.send(message);
                resolve({ sent: true, email: message.to });
            } catch (error) {
                console.log("EMAIL ERROR:", error);
                reject({ sent: false, email: message.to });
            }
        });
    };
}

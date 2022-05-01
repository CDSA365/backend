import Email from "@sendgrid/mail";

const { EMAIL_API_KEY } = process.env;

export default class EmailService {
    constructor() {
        Email.setApiKey(String(EMAIL_API_KEY));
    }

    public send = async (message: any) => {
        return new Promise(async (resolve, reject) => {
            try {
                await Email.send(message);
                resolve({ sent: true, email: message.to });
            } catch (error) {
                console.log("EMAIL ERROR:", error);
                reject({ sent: false, email: message.to });
            }
        });
    };
}

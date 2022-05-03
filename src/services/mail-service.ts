import Email from "@sendgrid/mail";
import { SSM } from "aws-sdk";
import { getFromSSM } from "../helpers/helpers";

const { EMAIL_API_KEY } = process.env;
export default class EmailService {
    protected ssm: SSM;
    protected apikey: any;
    constructor() {
        this.ssm = new SSM({ region: "ap-south-1" });
        this.apikey = getFromSSM(String(EMAIL_API_KEY)).then((key) => key);
        this.apikey.then((key: string) => Email.setApiKey(key));
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

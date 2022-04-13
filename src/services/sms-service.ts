import { Twilio } from "twilio";

const { TWILIO_SID, TWILIO_AUTH_TOKEN } = process.env;

export default class SMS {
    protected client: Twilio;

    constructor() {
        this.client = new Twilio(String(TWILIO_SID), String(TWILIO_AUTH_TOKEN));
    }

    public send = (message: string = "Hello!") => {
        return new Promise((resolve, reject) => {
            this.client.messages
                .create({
                    from: "whatsapp:+14155238886",
                    to: "whatsapp:+916379106229",
                    body: message,
                })
                .then((msg) => resolve(msg))
                .catch((err) => reject(err));
        });
    };
}

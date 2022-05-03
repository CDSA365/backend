import { getFromSSM } from "../helpers/helpers";
import { Twilio } from "twilio";

const { TWILIO_SID: SID, TWILIO_AUTH_TOKEN: TKN } = process.env;
let CLIENT: Twilio;

export default class SMS {
    protected sid: any;
    protected authToken: any;
    constructor() {
        const sid = getFromSSM(String(SID)).then((key: any) => key);
        const token = getFromSSM(String(TKN)).then((k: any) => k);
        (async () => {
            this.sid = await sid;
            this.authToken = await token;
            CLIENT = new Twilio(this.sid, this.authToken);
        })();
    }

    public send = (message: string = "Hello!") => {
        return new Promise((resolve, reject) => {
            CLIENT.messages
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

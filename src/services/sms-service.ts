import { getFromSSM } from "../helpers/helpers";
import { Twilio } from "twilio";

const { TWILIO_SID: SID, TWILIO_AUTH_TOKEN: TKN } = process.env;

export default class SMS {
    constructor() {}

    private getKeys = async (): Promise<string[]> => {
        const sid = await getFromSSM(String(SID)).then((key: any) => key);
        const token = await getFromSSM(String(TKN)).then((k: any) => k);
        return [sid, token];
    };

    public send = (message: string = "Hello!") => {
        return new Promise((resolve, reject) => {
            this.getKeys()
                .then(([sid, token]) => {
                    const client = new Twilio(sid, token);
                    client.messages
                        .create({
                            from: "whatsapp:+14155238886",
                            to: "whatsapp:+916379106229",
                            body: message,
                        })
                        .then((msg) => resolve(msg))
                        .catch((err) => reject(err));
                })
                .catch((err) => reject(err));
        });
    };
}

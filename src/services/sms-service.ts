import { formatPhone, getFromSSM } from "../helpers/helpers";
import { Twilio } from "twilio";

const {
    TWILIO_SID: SID,
    TWILIO_AUTH_TOKEN: TKN,
    SMS_SENDER,
    WHATSAPP_SENDER,
} = process.env;

export default class SMS {
    constructor() {}

    private getKeys = async (): Promise<string[]> => {
        const sid = await getFromSSM(String(SID)).then((key: any) => key);
        const token = await getFromSSM(String(TKN)).then((k: any) => k);
        return [sid, token];
    };

    public send = (
        message: string = "Hello!",
        to: number = 6379106229,
        throughWhatsapp: boolean = false
    ) => {
        return new Promise((resolve, reject) => {
            this.getKeys()
                .then(([sid, token]) => {
                    const client = new Twilio(sid, token);
                    const fromNumber = throughWhatsapp
                        ? `whatsapp:${String(WHATSAPP_SENDER)}`
                        : String(SMS_SENDER);
                    const toNumber = throughWhatsapp
                        ? `whatsapp:${formatPhone(to)}`
                        : formatPhone(to);
                    client.messages
                        .create({
                            from: String(fromNumber),
                            to: String(toNumber),
                            body: message,
                        })
                        .then((msg) => resolve(msg))
                        .catch((err) => reject(err));
                })
                .catch((err) => reject(err));
        });
    };
}

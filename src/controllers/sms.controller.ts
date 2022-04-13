import { Request, Response } from "express";
import SMS from "../services/sms-service";

export default class SMSController {
    protected sms: SMS;

    constructor() {
        this.sms = new SMS();
    }

    public send = (req: Request, res: Response) => {
        const { message } = req.body;
        this.sms
            .send(message)
            .then((resp) => {
                res.status(200).json(resp);
            })
            .catch((err) => res.status(500).json(err));
    };
}

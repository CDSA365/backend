import { Request, Response } from "express";

export default class InviteController {
    constructor() {}

    public sendInvite = (req: Request, res: Response) => {
        const { email } = req.body;
    };
}

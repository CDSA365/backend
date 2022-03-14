import { Request, Response } from "express";

export default class IndexController {
    constructor() {}

    index = (req: Request, res: Response) => {
        res.status(200).json({ message: "SUCCESS!" });
    };
}

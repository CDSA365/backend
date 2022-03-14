import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { MESSAGES } from "../constants/messages";

export default class Validator {
    constructor() {}

    public register = () => {
        return [
            body("first_name")
                .not()
                .isEmpty()
                .trim()
                .escape()
                .withMessage(MESSAGES.NON_EMPTY_FIRSTNAME),
            body("last_name")
                .not()
                .isEmpty()
                .trim()
                .escape()
                .withMessage(MESSAGES.NON_EMPTY_LASTNAME),
            body("email")
                .isEmail()
                .normalizeEmail()
                .withMessage(MESSAGES.INVALID_EMAIL),
            body("phone")
                .isMobilePhone("en-IN")
                .withMessage(MESSAGES.INVALID_PHONE),
            body("password")
                .isStrongPassword({
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                })
                .withMessage(MESSAGES.PASSWORD_RULE),
        ];
    };

    public login = () => {
        return [
            body("email")
                .isEmail()
                .normalizeEmail()
                .withMessage(MESSAGES.INVALID_EMAIL),
            body("password")
                .notEmpty()
                .withMessage(MESSAGES.NON_EMPTY_PASSWORD),
        ];
    };

    public validate = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json({ error: true, errors: errors.array() });
        } else {
            next();
        }
    };
}

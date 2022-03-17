import JWT, { SignOptions } from "jsonwebtoken";

const { SIGNING_KEY } = process.env;

export default class Token {
    protected jwtoption: SignOptions;
    protected key: string;

    constructor(expiry: number = 60 * 60 * 24) {
        this.key = SIGNING_KEY as string;
        this.jwtoption = {
            expiresIn: expiry,
        };
    }

    public get = (payload: any, expiry?: number) => {
        if (expiry) this.jwtoption.expiresIn = expiry;
        const token = JWT.sign(payload, this.key, this.jwtoption);
        return token;
    };

    public verify = (token: string) => {
        try {
            return JWT.verify(token, this.key);
        } catch (error: any) {
            throw new Error(error);
        }
    };
}

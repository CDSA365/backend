import { JwtPayload } from "jsonwebtoken";

export interface RegisterUserDataType {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
}

export interface Messages {
    NON_EMPTY_FIRSTNAME: string;
    NON_EMPTY_LASTNAME: string;
    INVALID_EMAIL: string;
    INVALID_PHONE: string;
    PASSWORD_RULE: string;
    NON_EMPTY_PASSWORD: string;
}

export interface WriteResult {
    qrcode?: string;
    constructor: Constructor;
    affectedRows: number;
    fieldCount: number;
    info: string;
    insertId: number;
    serverStatus: number;
    warningStatus: number;
    changedRows?: number | undefined;
}

export interface Constructor {
    name: string;
}

export interface RotuePaths {
    [key: string]: string;
    index: string;
    getAdmin: string;
    getAllTrainers: string;
    getTrainers: string;
    adminRegister: string;
    adminLogin: string;
    adminVerifyOTP: string;
    createTrainer: string;
    sendInvite: string;
    verifyEmail: string;
    createCat: string;
    getCategory: string;
    addToCat: string;
    getTrainer: string;
    createClass: string;
    fetchClasses: string;
    updateClass: string;
}

export interface TransportInfo {
    to: string[] | string;
    subject?: string;
    from?: string;
    cc?: string[] | string;
    bcc?: string[] | string;
}

export interface EmailContext {
    id?: string | number;
    first_name?: string;
    last_name?: string;
}
export interface InvitationEmailContext extends EmailContext {
    token: string;
    url: string;
}

export interface VerificationEmailContext extends EmailContext {
    token: string;
    email: string;
    url: string;
}

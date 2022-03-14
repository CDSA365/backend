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
    index: string;
    getTrainers: string;
    adminRegister: string;
    adminLogin: string;
    adminVerifyOTP: string;
    createTrainer: string;
}

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
    smsTest: string;
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
    fetchAllClasses: string;
    updateClass: string;
    deleteClass: string;
    getAssignedClasses: string;
    unassignClasses: string;
    verifyTrainer: string;
    updateTrainer: string;
    trainerLogin: string;
    createTrianerLog: string;
    updateTrainerLog: string;
    getAttendance: string;
    getMonthlyDurations: string;
    getYearlyDurations: string;
    registerStudent: string;
    getAllStudents: string;
    updateStudent: string;
    assignStudentToClass: string;
    studentLogin: string;
    getStudentClasses: string;
    createPaymentOrder: string;
    verifyPayment: string;
    capturePaymentFailure: string;
    getPaymentHistory: string;
    getStudentsInClass: string;
    extendDueDate: string;
    addRemarks: string;
    getRemarks: string;
    getClassBySlug: string;
    getClassById: string;
    markStudentAttendance: string;
    fetchRemarksForAdmin: string;
    addLeads: string;
    getLeads: string;
    attendanceReport: string;
    getCountReport: string;
    getPaymentDataForManualEntry: string;
    createManualPaymentOrder: string;
    createAnnouncement: string;
    fetchAnnouncement: string;
    deleteAnnouncement: string;
    findAnnouncement: string;
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

export interface PromiseFulfilledResult<T> {
    status: "fulfilled";
    value: T;
}

export interface PromiseRejectedResult {
    status: "rejected";
    reason: any;
}

export type PromiseSettledResult<T> =
    | PromiseFulfilledResult<T>
    | PromiseRejectedResult;

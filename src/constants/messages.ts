import { Messages } from "../types/types";

export const MESSAGES: Messages = {
    NON_EMPTY_FIRSTNAME: "First name cannot be empty",
    NON_EMPTY_LASTNAME: "Last name cannot be empty",
    INVALID_EMAIL: "Email is not valid",
    INVALID_PHONE: "Phone number is invalid",
    PASSWORD_RULE: `Password must be atleast 8 character long and must contain atleast 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character`,
    NON_EMPTY_PASSWORD: "Password cannot be empty",
};

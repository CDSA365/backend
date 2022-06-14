import shortid from "shortid";
import { SSM } from "aws-sdk";
import moment from "moment";

export const createSlug = (string: string) => {
    return string
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
};

export const createSlugWithKey = (string: string) => {
    let slug = string
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
    slug = slug + "-" + shortid.generate().toLowerCase();
    return slug;
};

export const generateReceipt = () => {
    const multiplier = 8999999999999999;
    const roundOff = 1000000000000000;
    return String(Math.floor(Math.random() * multiplier + roundOff));
};

export const getFromSSM = (key: string): Promise<string | undefined> => {
    const ssm = new SSM({ region: "ap-south-1" });
    return new Promise((resolve, reject) => {
        ssm.getParameter({ Name: key }, (err, data) => {
            if (err) reject(err);
            resolve(data?.Parameter?.Value);
        });
    });
};

export const formatPhone = (num: number | string) => {
    let phone = String(num);
    phone = phone.slice(phone.length - 10);
    phone = `+91${phone}`;
    return phone.length === 13 ? phone : num;
};

export const getBusinessDays = (endDate: string, startDate: string) => {
    var lastDay = moment(endDate);
    var firstDay = moment(startDate);
    let calcBusinessDays =
        1 +
        (lastDay.diff(firstDay, "days") * 5 -
            (firstDay.day() - lastDay.day()) * 2) /
            7;

    if (lastDay.day() == 6) calcBusinessDays--; //SAT
    if (firstDay.day() == 0) calcBusinessDays--; //SUN

    return calcBusinessDays;
};

import shortid from "shortid";

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

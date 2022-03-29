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

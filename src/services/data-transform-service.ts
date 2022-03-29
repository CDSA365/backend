import crypto from "crypto";
import assert from "assert";
import moment from "moment";

const { SIGNING_KEY } = process.env;
export default class DataTransformer {
    constructor() {}

    public transformForCategories = (datas: any[]) => {
        let transformedData: any[] = [];
        datas.map((data) => {
            const index = transformedData.findIndex((d) => d.id == data.id);
            if (index == -1) {
                const targetData = datas.filter((d) => d.id == data.id);
                const categories: any[] = [];
                targetData.map((tdata) => {
                    if (tdata.category_name !== null) {
                        categories.push({
                            id: tdata.category_id,
                            name: tdata.category_name,
                        });
                    }
                });
                data.categories = categories;
                if ("password" in data) delete data.password;
                if ("auth_token" in data) delete data.auth_token;
                if ("category_id" in data) delete data.category_id;
                if ("category_name" in data) delete data.category_name;
                transformedData.push(data);
            }
        });
        return transformedData;
    };

    public encrypt = (value: string) => {
        var algorithm = "aes256";
        var key = SIGNING_KEY as string;
        var cipher = crypto.createCipher(algorithm, key);
        return cipher.update(value, "utf8", "hex") + cipher.final("hex");
    };

    public decrypt = (value: string) => {
        var algorithm = "aes256";
        var key = SIGNING_KEY as string;
        var decipher = crypto.createDecipher(algorithm, key);
        return decipher.update(value, "hex", "utf8") + decipher.final("utf8");
    };

    protected getTimeline = (day: any[]) => {
        const timeline: any = [];
        day.forEach((item, i) => {
            timeline.push({
                title: item.title,
                date: item.date,
                duration: item.duration,
                start: item.start_time,
                end: item.end_time,
                start_unix: moment(item.start_time).unix(),
                end_unix: moment(item.end_time).unix(),
                idle: false,
            });
            if (i < day.length - 1) {
                timeline.push({
                    title: "",
                    date: item.date,
                    duration: Math.abs(
                        moment(day[i + 1].start_time).diff(
                            item.end_time,
                            "seconds"
                        )
                    ),
                    start: item.end_time,
                    end: day[i + 1].start_time,
                    start_unix: moment(item.end_time).unix(),
                    end_unix: moment(day[i + 1].start_time).unix(),
                    idle: true,
                });
            } else {
                timeline.push({
                    title: "",
                    date: item.date,
                    duration: 9 * 60 * 60 - item.duration,
                    start: "",
                    end: "",
                    idle: true,
                });
            }
        });
        return timeline;
    };

    public transformAttendance = (result: any[]) => {
        const monday = result.filter((o) => o.day_of_week === "Monday");
        const tuesday = result.filter((o) => o.day_of_week === "Tuesday");
        const wednesday = result.filter((o) => o.day_of_week === "Wednesday");
        const thursday = result.filter((o) => o.day_of_week === "Thursday");
        const friday = result.filter((o) => o.day_of_week === "Friday");
        const saturday = result.filter((o) => o.day_of_week === "Saturday");
        const sunday = result.filter((o) => o.day_of_week === "Sunday");

        // duration
        const d_monday = monday.reduce((a, b) => a + b.duration, 0);
        const d_tuesday = tuesday.reduce((a, b) => a + b.duration, 0);
        const d_wednesday = wednesday.reduce((a, b) => a + b.duration, 0);
        const d_thursday = thursday.reduce((a, b) => a + b.duration, 0);
        const d_friday = friday.reduce((a, b) => a + b.duration, 0);
        const d_saturday = saturday.reduce((a, b) => a + b.duration, 0);
        const d_sunday = sunday.reduce((a, b) => a + b.duration, 0);

        return {
            start: 0,
            end: 9 * 60 * 60,
            duration:
                d_monday +
                d_tuesday +
                d_wednesday +
                d_thursday +
                d_friday +
                d_saturday +
                d_sunday,
            monday: {
                duration: d_monday,
                timeline: this.getTimeline(monday),
            },
            tuesday: {
                duration: d_tuesday,
                timeline: this.getTimeline(tuesday),
            },
            wednesday: {
                duration: d_wednesday,
                timeline: this.getTimeline(wednesday),
            },
            thursday: {
                duration: d_thursday,
                timeline: this.getTimeline(thursday),
            },
            friday: {
                duration: d_friday,
                timeline: this.getTimeline(friday),
            },
            saturday: {
                duration: d_saturday,
                timeline: this.getTimeline(saturday),
            },
            sunday: {
                duration: d_sunday,
                timeline: this.getTimeline(sunday),
            },
        };
    };
}

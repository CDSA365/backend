import moment from "moment";
import { RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    find_student_by_id_bulk,
    get_class_by_id,
} from "../queries/admin_queries";
import SMS from "./sms-service";
import { compile } from "handlebars";

export default class StudentService {
    protected db: DB;
    protected sms: SMS;

    constructor() {
        this.db = new DB();
        this.sms = new SMS();
    }

    public notifyStudentOnAssignedClass = (
        student_ids: number[],
        class_id: string
    ) => {
        return new Promise(async (resolve, reject) => {
            const conn = await this.db.getConnection();
            try {
                const q1 = conn.query<RowDataPacket[]>(get_class_by_id, [
                    class_id,
                ]);
                const q2 = conn.query<RowDataPacket[]>(
                    find_student_by_id_bulk,
                    [student_ids]
                );
                const [r1, r2] = await Promise.allSettled([q1, q2]);
                if (r1.status === "fulfilled" && r2.status === "fulfilled") {
                    r2.value[0].map((student) => {
                        const [[cls]] = r1.value;
                        const message = this.compileClassNotificationMessage(
                            student,
                            cls
                        );
                        this.sms
                            .send(message, student.phone)
                            .then(() => resolve(true))
                            .catch(() => reject(false));
                    });
                } else {
                    reject(false);
                }
            } catch (error) {
                reject(false);
            } finally {
                conn.release();
            }
        });
    };

    public transformAttendanceResult = (result: any[]) => {
        let groups = ["student_name", "title"];
        return result.reduce((r, o) => {
            groups
                .reduce(
                    (group, key, i, { length }) =>
                        (group[o[key]] =
                            group[o[key]] || (i + 1 === length ? [] : {})),
                    r
                )
                .push(o);
            return r;
        }, {});
    };

    protected compileClassNotificationMessage = (student: any, cls: any) => {
        const source = `Hi {{1}}, You have been assigned to {{2}} class which is scheduled to start at {{3}} on {{4}}. Please login to https://www.cdsa365.com to view class details.`;
        const messageData = {
            1: student.first_name,
            2: cls.title,
            3: moment(cls.start_time).tz("Asia/Kolkata").format("LT"),
            4: moment(cls.start_time).tz("Asia/Kolkata").format("LL"),
        };
        const template = compile(source);
        const result = template(messageData);
        return result;
    };
}

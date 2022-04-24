import moment from "moment";
import { RowDataPacket } from "mysql2";
import DB from "../constructs/db";
import {
    find_student_by_id_bulk,
    get_class_by_id,
} from "../queries/admin_queries";
import SMS from "./sms-service";

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
                        const message = `Hello ${
                            student.first_name
                        }, You have been assigned to the class '${
                            cls.title
                        }'. The class is scheduled for ${moment(cls.start_time)
                            .tz("Asia/Kolkata")
                            .format("LT")} on ${moment(cls.start_time)
                            .tz("Asia/Kolkata")
                            .format(
                                "LL"
                            )}. For more information, please login to your CDSA365 portal.
                        `;
                        this.sms
                            .send(message)
                            .then((resp) => {
                                console.log(resp);
                                resolve(true);
                            })
                            .catch((err) => {
                                console.log(err);
                                reject(false);
                            });
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
}

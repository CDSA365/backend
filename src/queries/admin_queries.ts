export const admin_lookup = `select count(*) as count from admins where email = ? or phone = ?`;
export const create_admin = `insert into admins (first_name, last_name, email, phone, password, secret_token) values (?, ?, ?, ?, ?, ?)`;
export const get_secret = `select secret_token from admins where id = ?`;
export const find_user = `select id, first_name, last_name, email, phone, email_verified, phone_verified, password from admins where email = ?`;
export const find_trainer = `select count(*) as count from trainers where email = ?`;
export const find_trainer_with_token = `select count(*) as count from trainers where email = ? and auth_token = ?`;
export const create_trainer = `insert into trainers (first_name,last_name,email,salary,auth_token) values (?,?,?,?,?)`;
export const fetch_all_trainers = `select t.*, tc.id as category_id, tc.name as category_name from trainers t left join trainer_in_categories tic on t.id = tic.trainer_id left join trainer_categories tc on tic.trainer_category_id = tc.id`;
export const fetch_all_classes = `select c.*, t.id as trainer_id, concat(t.first_name, ' ', t.last_name) as trainer_name, cc.id as category_id, cc.name as category_name from classes c left join class_in_categories cic on c.id = cic.class_id left join class_categories cc on cic.class_category_id = cc.id left join trainer_in_classes tic on tic.class_id = c.id left join trainers t on t.id = tic.trainer_id order by start_time asc`;
export const fetch_trainers = `select t.*, tc.id as category_id, tc.name as category_name from trainers t left join trainer_in_categories tic on t.id = tic.trainer_id left join trainer_categories tc on tic.trainer_category_id = tc.id where t.status = 1`;
export const fetch_classes = `select c.*, t.id as trainer_id, concat(t.first_name, ' ', t.last_name) as trainer_name, cc.id as category_id, cc.name as category_name from classes c inner join class_in_categories cic on c.id = cic.class_id inner join class_categories cc on cic.class_category_id = cc.id inner join trainer_in_classes tic on tic.class_id = c.id inner join trainers t on t.id = tic.trainer_id; where t.status = 1 order by start_time asc`;
export const find_user_by_id = `select * from trainers where id in (?)`;
export const update_invite_status = `update trainers set invite_status = 1 where email = ? and invite_status = 0`;
export const find_admin = `select first_name, last_name, email, phone, email_verified, phone_verified from admins where id = ?`;
export const update_email_status = `update admins set email_verified = '1' where id = ? and email = ? and secret_token = ? and email_verified = '0'`;
export const create_category = `insert into ?? (name,description) values (?,?)`;
export const get_trainer_categories = `select tc.*, count(tic.id) as count from trainer_categories tc left join trainer_in_categories tic on tc.id = tic.trainer_category_id GROUP BY tc.id;`;
export const get_student_categories = `select sc.*, count(sic.id) as count from student_categories sc left join student_in_categories sic on sc.id = sic.student_category_id GROUP BY sc.id;`;
export const get_class_categories = `select cc.*, count(cic.id) as count from class_categories cc left join class_in_categories cic on cc.id = cic.class_category_id GROUP BY cc.id;`;
export const add_to_trainer_category = `insert into trainer_in_categories (trainer_id, trainer_category_id) values ?`;
export const add_to_student_category = `insert into student_in_categories (student_id, student_category_id) values ?`;
export const add_to_class_category = `insert into class_in_categories (class_id, class_category_id) values ?`;
export const find_one_trainer = `select t.*, tc.id as category_id, tc.name as category_name from trainers t left join trainer_in_categories tic on t.id = tic.trainer_id left join trainer_categories tc on tic.trainer_category_id = tc.id where t.id = ?`;
export const create_class = `insert into classes set ?`;
export const udpate_class = `update classes set ? where id = ?`;
export const delete_class = `delete from classes where id in (?)`;
export const create_trainer_in_classes = `insert into trainer_in_classes (trainer_id,class_id) values (?,?)`;
export const get_trainer_in_classes = `select c.*, tic.trainer_id, CONCAT(t.first_name, ' ', t.last_name) as trainer_name, t.email from trainer_in_classes tic inner join classes c on c.id = tic.class_id inner join trainers t on t.id = tic.trainer_id where tic.trainer_id = ? and c.status = 1`;
export const unassign_trainer = `delete from trainer_in_classes where trainer_id = ? and class_id = ?`;
export const update_trainer_by_token = `update trainers set ? where auth_token = ?`;
export const login_trainer = `select * from trainers where email = ? and password = ? limit 1`;
export const create_class_in_cat = `insert into class_in_categories (class_id,class_category_id) values (?,?)`;
export const create_trainer_time_log = `insert into trainer_class_attendance set ?`;
export const update_trainer_time_log = `update trainer_class_attendance set ? where trainer_id = ? and class_id = ? and end_time is null`;
export const get_trainer_week_attendance = `select ta.trainer_id, ta.day_of_week, ta.day, ta.week, ta.month, ta.year, ta.date, ta.start_time, ta.end_time, TIMESTAMPDIFF(SECOND,ta.start_time,ta.end_time) as duration, c.title from trainer_class_attendance ta inner join classes c on c.id = ta.class_id where ta.start_time is not null and ta.end_time is not null and trainer_id = ? and year = ? and month = ? and week = ?`;
export const get_trainer_month_attendance = `select ta.trainer_id, ta.day_of_week, ta.day, ta.week, ta.month, ta.year, ta.date, ta.start_time, ta.end_time, TIMESTAMPDIFF(SECOND,ta.start_time,ta.end_time) as duration, c.title from trainer_class_attendance ta inner join classes c on c.id = ta.class_id where ta.start_time is not null and ta.end_time is not null and trainer_id = ? and year = ? and month = ?`;
export const get_trainer_year_attendance = `select ta.trainer_id, ta.day_of_week, ta.day, ta.week, ta.month, ta.year, ta.date, ta.start_time, ta.end_time, ta.salary, TIMESTAMPDIFF(SECOND,ta.start_time,ta.end_time) as duration, c.title from trainer_class_attendance ta inner join classes c on c.id = ta.class_id where ta.start_time is not null and ta.end_time is not null and trainer_id = ? and year = ?`;
export const register_student = `insert into students set ?`;
export const check_if_student_exists = `select count(*) as count from students where (email = ? or phone = ?)`;
export const get_all_students = `select s.*, sc.id as category_id, sc.name as category_name, sph.id as payment_id, sph.next_due from students s left join student_in_categories sic on s.id = sic.student_id left join student_categories sc on sic.student_category_id = sc.id left outer join student_payment_history sph on sph.student_id = s.id group by s.id;`;
export const update_student = `update students set ? where id = ?`;
export const assign_student_to_class = `insert into student_in_classes (combined_id, student_id, class_id) values ? on duplicate key update combined_id = values(combined_id), student_id = values(student_id), class_id = values(class_id)`;
export const assign_student_in_classes_bluk = `insert into student_in_classes (combined_id, student_id, class_id) values ? on duplicate key update combined_id = values(combined_id), student_id = values(student_id), class_id = values(class_id)`;
export const find_student = `select * from students where email = ?`;
export const find_student_by_id = `select * from students where id = ?`;
export const find_student_by_id_bulk = `select * from students where id in (?)`;
export const get_students_classes = `select c.*, concat(t.first_name, ' ', t.last_name) as trainer_name from classes c inner join student_in_classes sic on c.id = sic.class_id inner join trainer_in_classes tic on tic.class_id = c.id inner join trainers t on t.id = tic.trainer_id where sic.student_id = ?`;
export const create_payment_history = `insert into student_payment_history set ?`;
export const update_payment_history = `update student_payment_history set ? where order_id = ?`;
export const get_payment_history = `select * from student_payment_history where student_id = ? and status != 'created' order by updated_at desc`;
export const update_trainer_in_class = `update trainer_in_classes set combined_id = ?, trainer_id = ? where class_id = ?`;
export const update_class_category = `update class_in_categories set class_category_id = ? where class_id = ?`;
export const get_student_in_category = `select student_id from student_in_categories where student_category_id = ?;`;
export const get_students_in_class = `select s.id, sic.class_id, concat(s.first_name, " ", s.last_name) as student_name, s.email, s.phone, sca.attendance from students s inner join student_in_classes sic on sic.student_id = s.id left join student_payment_history sph on sph.student_id = s.id left join student_class_attendance sca on (sca.class_id = sic.class_id and sca.student_id = s.id) where sic.class_id = ? and sph.next_due > current_timestamp and sph.status = 'paid' group by sph.student_id;`;
export const extend_due_date = `update student_payment_history set next_due = ? where id = ?`;
export const add_remarks = `insert into class_remarks set ?`;
export const get_remarks = `select * from class_remarks where class_id = ? and trainer_id = ? order by created_at desc`;
export const get_class_by_slug = `select c.*, t.id as trainer_id, concat(t.first_name, " ", t.last_name) as trainer_name from classes c inner join trainer_in_classes tic on tic.class_id = c.id left join trainers t on t.id = tic.trainer_id where c.slug = ?`;
export const get_class_by_id = `select * from classes where id = ?`;
export const mark_student_attendance = `insert into student_class_attendance set ? on duplicate key update combined_id = values(combined_id), student_id = values(student_id), class_id = values(class_id), attendance = values(attendance), year = values(year), month = values(month), week = values(week), date = values(date)`;
export const get_remarks_for_admin = `select * from class_remarks where class_id = ? order by created_at desc`;
export const add_leads = `insert into leads set ?`;
export const get_leads = `select * from leads group by phone order by created_at desc;`;
export const get_counts_report = `SELECT (SELECT COUNT(*) FROM students) as all_students, (SELECT COUNT(*) FROM students where status = 1) as active_students, (SELECT COUNT(*) FROM classes) as all_classes, (SELECT COUNT(*) FROM classes where status = 1) as active_classes, (SELECT COUNT(*) FROM classes where progress_state = 'SCHEDULED') as scheduled_classes, (SELECT COUNT(*) FROM classes where progress_state = 'IN PROGRESS') as in_progress_classes, (SELECT COUNT(*) FROM classes where progress_state = 'COMPLETED') as completed_classes, (SELECT COUNT(*) FROM trainers) as trainers, (SELECT COUNT(*) FROM trainers where status = 1) as active_trainers;`;
export const get_student_attendance_report = `select s.id, concat(s.first_name, " ", s.last_name) as student_name, 
concat(t.first_name, " ", t.last_name) as trainer_name, c.title,
sca.year, sca.month, sca.week, sca.date, sca.attendance from students s
join student_in_classes sic on sic.student_id = s.id
join classes c on c.id = sic.class_id
join trainer_in_classes tic on tic.class_id = c.id
join trainers t on t.id = tic.trainer_id
left join student_class_attendance sca on (sca.student_id = s.id and sca.class_id = c.id)
where sca.year = ? and sca.month = ?`;
export const get_payment_history_by_id = `select s.*, sph.* from students s inner join student_payment_history sph on sph.student_id = s.id where s.id = ? and sph.status != 'created' order by sph.updated_at desc;`;
export const get_payment_history_by_email = `select s.*, sph.* from students s inner join student_payment_history sph on sph.student_id = s.id where s.email = ? and sph.status != 'created' order by sph.updated_at desc;`;
export const get_payment_history_by_phone = `select s.*, sph.* from students s inner join student_payment_history sph on sph.student_id = s.id where s.phone = ? and sph.status != 'created' order by sph.updated_at desc;`;

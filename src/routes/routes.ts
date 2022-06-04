import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import AuthController from "../controllers/auth.controller";
import ClassController from "../controllers/class.controller";
import CommonController from "../controllers/common.controller";
import IndexController from "../controllers/index.controller";
import LeadsController from "../controllers/leads.controller";
import PaymentController from "../controllers/payment.controller";
import SMSController from "../controllers/sms.controller";
import StudentController from "../controllers/student.controller";
import TrainerController from "../controllers/trainer.controller";
import DashController from "../controllers/dash-controller";
import Validator from "../middlewares/validator";
import AnnouncementController from "../controllers/announcement.controller";
import { RotuePaths } from "../types/types";
import ContactFormController from "../controllers/contactform.controller";
import OTPController from "../controllers/otp.controller";

export default class Routes {
    public router: Router;
    protected smsCtrl: SMSController;
    protected indexCtrl: IndexController;
    protected authCtrl: AuthController;
    protected validator: Validator;
    protected trainerCtrl: TrainerController;
    protected adminCtrl: AdminController;
    protected commonCtrl: CommonController;
    protected classCtrl: ClassController;
    protected studentCtrl: StudentController;
    protected paymentCtrl: PaymentController;
    protected leadsCtrl: LeadsController;
    protected dashCtrl: DashController;
    protected paths: RotuePaths;
    protected announcementCtrl: AnnouncementController;
    protected contactFormCtrl: ContactFormController;
    protected otpCntrl: OTPController;

    constructor() {
        this.router = Router();
        this.smsCtrl = new SMSController();
        this.trainerCtrl = new TrainerController();
        this.adminCtrl = new AdminController();
        this.indexCtrl = new IndexController();
        this.authCtrl = new AuthController();
        this.validator = new Validator();
        this.commonCtrl = new CommonController();
        this.classCtrl = new ClassController();
        this.studentCtrl = new StudentController();
        this.paymentCtrl = new PaymentController();
        this.leadsCtrl = new LeadsController();
        this.dashCtrl = new DashController();
        this.announcementCtrl = new AnnouncementController();
        this.contactFormCtrl = new ContactFormController();
        this.otpCntrl = new OTPController();
        this.paths = this.setRoutePaths();
        this.init();
    }

    protected init = () => {
        this.initGetRoutes();
        this.initPutRoutes();
        this.initPostRoutes();
        this.initPatchRoutes();
        this.initDeleteRoutes();
    };

    protected setRoutePaths = (): RotuePaths => {
        return {
            index: "/",
            smsTest: "/sms/test",
            getAdmin: "/admin/:id",
            getAllTrainers: "/admin/trainers/all",
            getTrainers: "/admin/trainers",
            adminRegister: "/admin/register",
            adminLogin: "/admin/login",
            adminVerifyOTP: "/admin/verify-otp",
            createTrainer: "/admin/trainer/create",
            sendInvite: "/admin/trainer/send-invite",
            verifyEmail: "/admin/email/verify/:token",
            createCat: "/admin/category/create",
            getCategory: "/admin/category/:entity",
            addToCat: "/admin/category/add/:entity",
            viewCategory: "/admin/category/detail/:entity/:cat_id",
            updateCategory: "/admin/category/:entity/:cat_id",
            getTrainer: "/admin/trainer/:id",
            createClass: "/admin/classes",
            fetchClasses: "/admin/classes",
            fetchAllClasses: "/admin/classes/all",
            deleteClass: "/admin/classes",
            updateClass: "/classes/:id",
            getAssignedClasses: "/trainer/classes/:id",
            unassignClasses: "/trainer/classes/:trainer/:class_id",
            verifyTrainer: "/trainer/verify/:token",
            updateTrainer: "/trainer/:token",
            trainerLogin: "/trainer/login",
            createTrianerLog: "/trainer/log-time/create",
            updateTrainerLog: "/trainer/log-time/end/:trainer_id/:class_id",
            getAttendance: "/trainer/attendance/:trainer_id/:year/:month/:week",
            getMonthlyDurations: `/trainer/attendance/month/:trainer_id/:year/:month`,
            getYearlyDurations: "/trainer/attendance/year/:trainer_id/:year",
            registerStudent: "/student/register",
            getAllStudents: "/admin/students/all",
            updateStudent: "/admin/student/:id",
            assignStudentToClass: "/admin/student/assign-to-class/:id",
            studentLogin: "/student/login",
            getStudentClasses: "/student/classes/:id",
            createPaymentOrder: "/payment/create",
            verifyPayment: "/payment/verify",
            capturePaymentFailure: "/payment/capture-failure",
            getPaymentHistory: "/payments/:id",
            getStudentsInClass: "/classes/students/:class_id",
            extendDueDate: "/payments/extend/:payment_id",
            addRemarks: "/classes/remarks",
            getRemarks: "/classes/remarks/:class_id/:trainer_id",
            getClassBySlug: "/class/slug/:slug",
            getClassById: "/class/:class_id",
            markStudentAttendance: "/student/attendance",
            fetchRemarksForAdmin: "/classes/remarks/:class_id",
            addLeads: "/leads/add",
            getLeads: "/leads",
            attendanceReport: "/student/attendance/report",
            getCountReport: "/report/count-report",
            getPaymentDataForManualEntry: "/payments/make-entry/:key/:entity",
            createManualPaymentOrder: "/payment/create-manual-order",
            createAnnouncement: "/announcement",
            fetchAnnouncement: "/announcement",
            deleteAnnouncement: "/announcement/:id",
            findAnnouncement: "/announcement/:entity",
            sendContactFormEmail: "/contact-form",
            sendOTP: "/send-otp",
            verifyOTP: "/verify-otp",
            sendResetPasswordLink: "/rest-password/send-email",
            deleteTrainer: "/admin/trainer/:trainer_id",
            updatePaymentHistory: "/payments/update/:id",
            getFeeData: "/student/fee-data/:student_id",
            removeCategoryEntity: `/admin/category/remove-entity/:entity/:cat_id/:entity_id`,
            deleteCategory: "/admin/category/delete/:entity/:cat_id",
            updatePassword: "/update-password",
            verifyToken: "/verify-token/:token",
            deletePaymentEntry: "/payments/delete/:receipt_no",
            getStudent: "/admin/student/:student_id",
        };
    };

    /*******************
     * GET ROUTES
     ******************/
    protected initGetRoutes = () => {
        this.router.get(this.paths.index, this.indexCtrl.index);
        this.router.get(this.paths.getCountReport, this.dashCtrl.getCounts);
        this.router.get(
            this.paths.getAllTrainers,
            this.trainerCtrl.fetchAllTrainers
        );
        this.router.get(this.paths.verifyEmail, this.authCtrl.verifyEmail);
        this.router.get(
            this.paths.viewCategory,
            this.commonCtrl.getCategoryDetails
        );
        this.router.get(this.paths.getCategory, this.commonCtrl.getCategory);
        this.router.get(this.paths.fetchClasses, this.classCtrl.fetchclasses);
        this.router.get(
            this.paths.fetchAllClasses,
            this.classCtrl.fetchAllClasses
        );
        this.router.get(
            this.paths.getStudentsInClass,
            this.classCtrl.getStudentsInClass
        );
        this.router.get(
            this.paths.getAssignedClasses,
            this.trainerCtrl.getAssignedClasses
        );
        this.router.get(
            this.paths.verifyTrainer,
            this.trainerCtrl.verifyTrainer
        );
        this.router.get(
            this.paths.getAllStudents,
            this.studentCtrl.getAllStudents
        );
        this.router.get(
            this.paths.getStudentClasses,
            this.studentCtrl.getStudentClasses
        );
        this.router.get(
            this.paths.getPaymentHistory,
            this.paymentCtrl.getPaymentHistory
        );
        this.router.get(this.paths.getRemarks, this.classCtrl.getRemarks);
        this.router.get(
            this.paths.getClassBySlug,
            this.classCtrl.getClassBySlug
        );
        this.router.get(
            this.paths.fetchRemarksForAdmin,
            this.classCtrl.fetchRemarksForAdmin
        );
        this.router.get(this.paths.getLeads, this.leadsCtrl.getLeads);
        this.router.get(this.paths.getClassById, this.classCtrl.getClassById);
        this.router.get(
            this.paths.getPaymentDataForManualEntry,
            this.paymentCtrl.getPaymentHistoryforManualCapture
        );
        this.router.get(
            this.paths.findAnnouncement,
            this.announcementCtrl.findAnnouncement
        );
        this.router.get(this.paths.getFeeData, this.studentCtrl.getFeeData);
        this.router.get(
            this.paths.removeCategoryEntity,
            this.commonCtrl.removeEntity
        );
        this.router.get(this.paths.verifyToken, this.authCtrl.verifyToken);
        this.router.get(this.paths.getStudent, this.studentCtrl.getStudent);
        this.router.get(
            this.paths.fetchAnnouncement,
            this.announcementCtrl.getAnnouncements
        ); // Keep this last
        this.router.get(
            this.paths.getYearlyDurations,
            this.trainerCtrl.getYearlyDurations
        ); // Keep this last
        this.router.get(
            this.paths.getMonthlyDurations,
            this.trainerCtrl.getMonthlyDurations
        ); // Keep this last
        this.router.get(
            this.paths.getAttendance,
            this.trainerCtrl.getAttendance
        ); // Keep this last
        this.router.get(this.paths.getTrainers, this.trainerCtrl.fetchTrainers); // KEEP IT LAST
        this.router.get(this.paths.getTrainer, this.trainerCtrl.getTrainer); // KEEP IT LAST
        this.router.get(this.paths.getAdmin, this.adminCtrl.getAdmin); // KEEP IT LAST
    };

    /*****************
     * PUT ROUTES
     ****************/
    protected initPutRoutes = () => {
        this.router.put(
            this.paths.updateTrainer,
            this.trainerCtrl.updateTrainer
        );
        this.router.put(this.paths.updateClass, this.classCtrl.updateClass);
        this.router.put(
            this.paths.updateTrainerLog,
            this.trainerCtrl.udpateTrainerLog
        );
        this.router.put(
            this.paths.updateStudent,
            this.studentCtrl.updateStudent
        );
        this.router.put(
            this.paths.updateCategory,
            this.commonCtrl.udpateCategory
        );
    };

    /*****************
     * POST ROUTES
     ****************/
    protected initPostRoutes = () => {
        this.router.post(this.paths.smsTest, this.smsCtrl.send);
        this.router.post(
            this.paths.adminRegister,
            this.validator.register(),
            this.validator.validate,
            this.authCtrl.register
        );
        this.router.post(
            this.paths.adminLogin,
            this.validator.login(),
            this.validator.validate,
            this.authCtrl.login
        );
        this.router.post(this.paths.adminVerifyOTP, this.authCtrl.verifyTotp);
        this.router.post(
            this.paths.createTrainer,
            this.trainerCtrl.createTrainer
        );
        this.router.post(this.paths.sendInvite, this.trainerCtrl.sendInvite);
        this.router.post(this.paths.createCat, this.commonCtrl.createCategory);
        this.router.post(this.paths.addToCat, this.commonCtrl.addToCategory);
        this.router.post(this.paths.createClass, this.classCtrl.createClass);
        this.router.post(
            this.paths.createTrianerLog,
            this.trainerCtrl.createTrainerLog
        );
        this.router.post(
            this.paths.trainerLogin,
            this.validator.login(),
            this.validator.validate,
            this.authCtrl.trainerLogin
        );
        this.router.post(
            this.paths.registerStudent,
            this.studentCtrl.registerStudent
        );
        this.router.post(
            this.paths.assignStudentToClass,
            this.studentCtrl.assignStudentToClass
        );
        this.router.post(this.paths.studentLogin, this.studentCtrl.login);
        this.router.post(
            this.paths.createPaymentOrder,
            this.paymentCtrl.createOrder
        );
        this.router.post(
            this.paths.verifyPayment,
            this.paymentCtrl.verifyPayment
        );
        this.router.post(
            this.paths.capturePaymentFailure,
            this.paymentCtrl.captureFailedPayment
        );
        this.router.post(
            this.paths.extendDueDate,
            this.paymentCtrl.extendDueDate
        );
        this.router.post(this.paths.addRemarks, this.classCtrl.addRemarks);
        this.router.post(
            this.paths.markStudentAttendance,
            this.studentCtrl.markAttendance
        );
        this.router.post(this.paths.addLeads, this.leadsCtrl.addLead);
        this.router.post(
            this.paths.attendanceReport,
            this.studentCtrl.getAttendanceReport
        );
        this.router.post(
            this.paths.createManualPaymentOrder,
            this.paymentCtrl.createManualPaymentOrder
        );
        this.router.post(
            this.paths.createAnnouncement,
            this.announcementCtrl.makeAnouncement
        );
        this.router.post(
            this.paths.sendContactFormEmail,
            this.contactFormCtrl.sendContactFormEmails
        );
        this.router.post(this.paths.sendOTP, this.otpCntrl.sendOTPSMS);
        this.router.post(this.paths.verifyOTP, this.otpCntrl.verifyOtp);
        this.router.post(
            this.paths.sendResetPasswordLink,
            this.authCtrl.sendPasswordResetEmail
        );
        this.router.post(
            this.paths.updatePaymentHistory,
            this.paymentCtrl.updatePaymentHistory
        );
        this.router.post(
            this.paths.updatePassword,
            this.authCtrl.updatePassword
        );
    };

    /*******************
     * PATCH ROUTES
     ******************/
    protected initPatchRoutes = () => {
        this.router.patch(this.paths.updateClass, this.classCtrl.updateClass);
    };

    /******************
     * DELETE ROUTES
     *****************/
    protected initDeleteRoutes = () => {
        this.router.delete(this.paths.deleteClass, this.classCtrl.deleteClass);
        this.router.delete(
            this.paths.unassignClasses,
            this.trainerCtrl.unassignClassToTrainer
        );
        this.router.delete(
            this.paths.deleteAnnouncement,
            this.announcementCtrl.deleteAnnouncement
        );
        this.router.delete(
            this.paths.deleteTrainer,
            this.trainerCtrl.deleteTrainer
        );
        this.router.delete(
            this.paths.deleteCategory,
            this.commonCtrl.deleteCategory
        );
        this.router.delete(
            this.paths.deletePaymentEntry,
            this.paymentCtrl.deletePayment
        );
    };
}

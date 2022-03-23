import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import AuthController from "../controllers/auth.controller";
import ClassController from "../controllers/class.controller";
import CommonController from "../controllers/common.controller";
import IndexController from "../controllers/index.controller";
import TrainerController from "../controllers/trainer.controller";
import Validator from "../middlewares/validator";
import { RotuePaths } from "../types/types";

export default class Routes {
    public router: Router;
    protected indexCtrl: IndexController;
    protected authCtrl: AuthController;
    protected validator: Validator;
    protected trainerCtrl: TrainerController;
    protected adminCtrl: AdminController;
    protected commonCtrl: CommonController;
    protected classCtrl: ClassController;
    protected paths: RotuePaths;

    constructor() {
        this.router = Router();
        this.trainerCtrl = new TrainerController();
        this.adminCtrl = new AdminController();
        this.indexCtrl = new IndexController();
        this.authCtrl = new AuthController();
        this.validator = new Validator();
        this.commonCtrl = new CommonController();
        this.classCtrl = new ClassController();
        this.paths = this.setRoutePaths();
        this.init();
    }

    protected init = () => {
        this.initGetRoutes();
        this.initPostRoutes();
        this.initPatchRoutes();
        this.initDeleteRoutes();
    };

    protected setRoutePaths = (): RotuePaths => {
        return {
            index: "/",
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
            getTrainer: "/admin/trainer/:id",
            createClass: "/admin/classes",
            fetchClasses: "/admin/classes",
            deleteClass: "/admin/classes/:id",
            updateClass: "/admin/classes",
        };
    };

    protected initGetRoutes = () => {
        this.router.get(this.paths.index, this.indexCtrl.index);
        this.router.get(
            this.paths.getAllTrainers,
            this.trainerCtrl.fetchAllTrainers
        );
        this.router.get(this.paths.verifyEmail, this.authCtrl.verifyEmail);
        this.router.get(this.paths.getCategory, this.commonCtrl.getCategory);
        this.router.get(this.paths.fetchClasses, this.classCtrl.fetchclasses);
        this.router.get(this.paths.getTrainers, this.trainerCtrl.fetchTrainers); // KEEP IT LAST
        this.router.get(this.paths.getTrainer, this.trainerCtrl.getTrainer); // KEEP IT LAST
        this.router.get(this.paths.getAdmin, this.adminCtrl.getAdmin); // KEEP IT LAST
    };

    protected initPostRoutes = () => {
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
    };

    protected initPatchRoutes = () => {
        this.router.patch(this.paths.updateClass, this.classCtrl.updateClass);
    };

    protected initDeleteRoutes = () => {
        this.router.delete(this.paths.deleteClass, this.classCtrl.deleteClass);
    };
}

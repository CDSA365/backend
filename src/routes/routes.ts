import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import IndexController from "../controllers/index.controller";
import TrainerController from "../controllers/trainer.controller";
import Validator from "../middlewares/validator";
import { RotuePaths } from "../types/types";

export default class Routes {
    public router: Router;
    protected indexController: IndexController;
    protected authController: AuthController;
    protected validator: Validator;
    protected trainerController: TrainerController;
    protected paths: RotuePaths;

    constructor() {
        this.router = Router();
        this.trainerController = new TrainerController();
        this.indexController = new IndexController();
        this.authController = new AuthController();
        this.validator = new Validator();
        this.paths = this.setRoutePaths();
        this.init();
    }

    protected init = () => {
        this.initGetRoutes();
        this.initPostRoutes();
    };

    protected setRoutePaths = () => {
        return {
            index: "/",
            getTrainers: "/admin/trainers",
            adminRegister: "/admin/register",
            adminLogin: "/admin/login",
            adminVerifyOTP: "/admin/verify-otp",
            createTrainer: "/admin/trainer/create",
            sendInvite: "/admin/trainer/send-invite",
        };
    };

    protected initGetRoutes = () => {
        this.router.get(this.paths.index, this.indexController.index);
        this.router.get(
            this.paths.getTrainers,
            this.trainerController.fetchTrainers
        );
    };

    protected initPostRoutes = () => {
        this.router.post(
            this.paths.adminRegister,
            this.validator.register(),
            this.validator.validate,
            this.authController.register
        );
        this.router.post(
            this.paths.adminLogin,
            this.validator.login(),
            this.validator.validate,
            this.authController.login
        );
        this.router.post(
            this.paths.adminVerifyOTP,
            this.authController.verifyTotp
        );
        this.router.post(
            this.paths.createTrainer,
            this.trainerController.createTrainer
        );
        this.router.post(
            this.paths.sendInvite,
            this.trainerController.sendInvite
        );
    };
}

import { body } from "express-validator";
import { inputValidationErrors } from "../input-validation-middleware";


const loginValidation = body('login')
                                            .isString()
                                            .isLength({min: 3, max: 10})
                                            .trim()
                                            .matches(/^[a-zA-Z0-9_-]*$/)
                                            .withMessage('incorrect login')

const passwordValidation = body('password')
                                            .isString()
                                            .isLength({min: 6, max: 20})
                                            .trim()
                                            .withMessage('incorrect password')

const emailValidation = body('email')
                                            .isString()
                                            .trim()
                                            .isEmail()
                                            .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
                                            .withMessage('incorrect email')

const loginOrEmailValidation = body('loginOrEmail').isString().trim().isLength({min: 3, max: 30})       //todo


export const loginUserValidation = [loginOrEmailValidation, passwordValidation] //TODO
export const createUserValidation = [loginValidation, passwordValidation, emailValidation, inputValidationErrors]
export const updateUserValidation = [loginValidation, passwordValidation, emailValidation, inputValidationErrors]
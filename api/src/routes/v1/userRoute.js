import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'

const Router = express.Router()

// User registration route
Router.route('/register').post(userValidation.createNew, userController.createNew)

// Account verification route
Router.route('/verify-account').put(userValidation.verifyAccount, userController.verifyAccount)

// User login route
Router.route('/login').post(userValidation.login, userController.login)

// Refresh token route
Router.route('/refresh-token').get(userController.refreshToken)

// User logout route
Router.route('/logout').delete(userController.logout)

export const userRoute = Router

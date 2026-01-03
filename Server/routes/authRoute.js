import express from 'express'
import {z } from 'zod'
import {login , signup , getProfile , updateProfile , changePassword} from '../controllers/authController.js'
import e from 'express'
import protect from '../middlewares/auth.js'

const router = express.Router()

// Validation Schemas
const strongPassword = z
                        .string()
                        .min(8, 'Password must be at least 8 characters long')
                        .max(64 , "Password is too long")
                        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
                        .regex(/[a-z]/ , 'Password must contain at least one lowercase letter')
                        .regex(/[0-9]/ , 'Password must contain at least one number')
                        .regex(/[\!\@\#\$\%\^\&\*]/ , 'Password must contain at least one special character (!@#$%^&*)')

const signupSchema = z.object({
    name : z
            .string()
            .min(2, 'Name must be at least 2 characters long')
            .max(50, 'Name must be at most 50 characters long')
            .trim(),
    email : z
            .string()
            .email('Invalid email address')
            .trim()
            .toLowerCase(),
    password : strongPassword ,

})

const loginSchema = z.object({
    email : z
            .string()
            .email('Invalid email address')
            .trim()
            .toLowerCase()
            .min(1, "Email is required"),
    password : z.string().min(1, "Password is required") ,
})

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors,
    });
  }

  req.body = result.data; // cleaned + validated data
  next();
};


// Public Routes
router.post('/signup' , validate(signupSchema), signup)
router.post('/login', validate(loginSchema), login)

// Protected Routes
router.get('/profile',protect,  getProfile)
router.put('/profile', protect, updateProfile)
router.post('/change-password', protect, changePassword)
router.put('/change-password', protect, changePassword)

export default router ;
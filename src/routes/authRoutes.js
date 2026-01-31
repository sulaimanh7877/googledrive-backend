const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Simplification: Using inline validator setup for brevity or creating a wrapper
// For this output, we'll assume validate takes the chain
const validateRequest = (schemas) => {
  return async (req, res, next) => {
    await Promise.all(schemas.map((schema) => schema.run(req)));
    const result = require('express-validator').validationResult(req);
    if (result.isEmpty()) return next();
    res.status(400).json({ success: false, errors: result.array() });
  };
};

router.post('/register', validateRequest([
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('firstName').notEmpty(),
  check('lastName').notEmpty()
]), authController.register);

router.get('/activate/:token', authController.activate);

router.post('/login', validateRequest([
  check('email').isEmail(),
  check('password').exists()
]), authController.login);

router.post('/forgot-password', validateRequest([
  check('email').isEmail()
]), authController.forgotPassword);

router.post('/reset-password/:token', validateRequest([
  check('newPassword').isLength({ min: 8 })
]), authController.resetPassword);

module.exports = router;
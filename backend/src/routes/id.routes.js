const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');

const controller = require('../controllers/id.controller');

const VerificationLog = require('../models/verificationLog');
/* ADMIN */
router.post('/student', auth, controller.createStudent);
router.post('/employee', auth, controller.createEmployee);

router.get('/students', auth, controller.getStudents);
router.get('/employees', auth, controller.getEmployees);

router.patch('/student/:id/status', controller.updateStudentStatus);
router.patch('/employee/:id/status', controller.updateEmployeeStatus);

router.delete('/student/:id', controller.deleteStudent);
router.delete('/employee/:id', controller.deleteEmployee);

router.put('/student/:id', controller.updateStudent);
router.put('/employee/:id', controller.updateEmployee);

router.post('/verify-qr', auth, controller.verifyQr);

router.get('/my-id', auth, controller.getMyId);

router.get('/logs', auth, controller.getLogs);

router.get('/get-stats', auth, controller.getStats);
module.exports = router;
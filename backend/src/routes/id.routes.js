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

router.get('/logs', auth, async (req, res) => {
  try {

    const { from, to, result } = req.query;

    let filter = {};

    // 🧠 role based
    if (req.user.role === 'Employee') {
      filter.scannedBy = req.user._id;
    }

    // 📅 date filter
    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    // 🔎 result filter
    if (result) {
      filter.result = result;
    }

    const logs = await VerificationLog.find(filter)
      .sort({ date: -1 })
      .populate('scannedBy', 'username role');

    res.json(logs);

  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

router.get('/get-stats', auth, controller.getStats);
module.exports = router;
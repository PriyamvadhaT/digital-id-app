const Student = require('../models/student.model');
const Employee = require('../models/employee.model');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ===================== CREATE STUDENT (ADMIN) ===================== */
exports.createStudent = async (req, res) => {
  try {

    const department = req.body.department;
    const batch = req.body.batch;
    const course = req.body.course;

    /* ---------- DEPARTMENT CODE ---------- */
    const deptCode = department
      .replace(/and/gi, "")
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();

    /* ---------- COURSE CODE ---------- */
    let courseCode = "1";

    if (course.toLowerCase().includes("technology")) {
      courseCode = "2";
    }

    /* ---------- BATCH CODE ---------- */
    const batchCode = batch.split("-")[0].trim().slice(-2);

    /* ---------- SERIAL NUMBER ---------- */
    const count = await Student.countDocuments({
      department: department,
      batch: batch,
      course: course
    });

    const number = (count + 1).toString().padStart(3, "0");

    /* ---------- FINAL ID ---------- */
    const generatedId = `${deptCode}${courseCode}${batchCode}${number}`;

    const student = await Student.create({
      name: req.body.name,
      id: generatedId,
      department: department,
      batch: batch,
      course: course,
      email: req.body.email,
      mobile: req.body.phone,
      parentMobile: req.body.parentMobile || "",
      photo: req.body.photo,
      isActive: true
    });

    const hashedPassword = await bcrypt.hash(student.mobile, 10);

    const user = await User.create({
      username: student.email,
      password: hashedPassword,
      role: "Student",
      profileId: student._id,
      isActive: true,
      adminId: req.user._id
    });

    res.status(201).json({
      message: "Student created",
      username: user.username,
      password: student.mobile,
      studentId: generatedId
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== CREATE EMPLOYEE (ADMIN) ===================== */
exports.createEmployee = async (req, res) => {
  try {

    const department = req.body.department;

    /* ---------- DEPARTMENT CODE ---------- */
    const deptCode = department
      .replace(/and/gi, "")
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();

    /* ---------- SERIAL ---------- */
    const count = await Employee.countDocuments({
      department: department
    });

    const number = (count + 1).toString().padStart(3, "0");

    const generatedId = `${deptCode}${number}`;

    const employee = await Employee.create({
      name: req.body.name,
      id: generatedId,
      department: department,
      email: req.body.email,
      mobile: req.body.phone,
      photo: req.body.photo,
      isActive: true
    });

    const hashedPassword = await bcrypt.hash(employee.mobile, 10);

    const user = await User.create({
      username: employee.email,
      password: hashedPassword,
      role: "Employee",
      profileId: employee._id,
      isActive: true,
      adminId: req.user._id
    });

    res.status(201).json({
      message: "Employee created",
      username: user.username,
      password: employee.mobile,
      generatedId: generatedId
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== READ (ADMIN) ===================== */
exports.getStudents = async (req, res) => {
  try {
    const users = await User.find({
      adminId: req.user._id,
      role: "Student"
    });

    const studentIds = users.map(u => u.profileId);

    const students = await Student.find({
      _id: { $in: studentIds }
    });

    res.json(students);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const users = await User.find({
      adminId: req.user._id,
      role: "Employee"
    });

    const employeeIds = users.map(u => u.profileId);

    const employees = await Employee.find({
      _id: { $in: employeeIds }
    });

    res.json(employees);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ===================== UPDATE STATUS (ADMIN) ===================== */
exports.updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await Student.findByIdAndUpdate(id, { isActive });
    await User.findOneAndUpdate(
      { profileId: id, role: 'Student' },
      { isActive }
    );

    res.json({ message: 'Student status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await Employee.findByIdAndUpdate(id, { isActive });
    await User.findOneAndUpdate(
      { profileId: id, role: 'Employee' },
      { isActive }
    );

    res.json({ message: 'Employee status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ===================== DELETE (ADMIN) ===================== */
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // 🧠 Delete student profile
    await Student.findByIdAndDelete(id);

    // 🔥 Delete linked user account
    await User.findOneAndDelete({ profileId: id, role: 'Student' });

    res.json({ message: 'Student deleted permanently' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    await Employee.findByIdAndDelete(id);
    await User.findOneAndDelete({ profileId: id, role: 'Employee' });

    res.json({ message: 'Employee deleted permanently' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== GET MY ID (ID CARD) ===================== */
exports.getMyId = async (req, res) => {

  try {

    const user = req.user;

    let profile = null;

    if (user.role === 'Student') {
      profile = await Student.findById(user.profileId);
    }

    if (user.role === 'Employee') {
      profile = await Employee.findById(user.profileId);
    }

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    const profileObj = profile.toObject();

    if (!profileObj.id) {
      profileObj.id = profileObj._id.toString().slice(-6).toUpperCase();
    }

    console.log(`Generating ID for ${user.username}, Profile: ${profileObj.id}`);

    const idToken = jwt.sign(
      {
        userId: user._id.toString(),
        name: profileObj.name,
        id: profileObj.id,
        department: profileObj.department,
        mobile: profileObj.mobile,
        photo: profileObj.photo?.toString() || '',
        batch: profileObj.batch || '',
        course: profileObj.course || '',
        parentMobile: profileObj.parentMobile || '',
        role: user.role
      },
      process.env.JWT_SECRET
    );

    // Lightweight token for QR code - Short ID for instant scanning clarity
    const qrToken = `V1:${user._id}`;

    res.json({
      idToken,
      qrToken
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

/* ===================== UPDATE EMPLOYEE (ADMIN) ===================== */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    await Employee.findByIdAndUpdate(id, {
      name: req.body.name,
      department: req.body.department,
      mobile: req.body.mobile
    });

    res.json({ message: "Employee updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== UPDATE STUDENT (ADMIN) ===================== */
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await Student.findByIdAndUpdate(id, {
      name: req.body.name,
      department: req.body.department,
      batch: req.body.batch,
      mobile: req.body.mobile
    });

    res.json({ message: "Student updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== VERIFY QR SCAN ============================== */
const VerificationLog = require('../models/verificationLog');

exports.verifyQr = async (req, res) => {
  const { token } = req.body;
  const scanner = req.user;

  try {
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, message: 'Invalid or missing QR token' });
    }

    let userId = null;

    if (token.startsWith('V1:')) {
      userId = token.split(':')[1];
    } else {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {
        return res.status(400).json({ valid: false, message: 'Expired or invalid QR token' });
      }
    }

    if (!userId) {
      return res.status(400).json({ valid: false, message: 'Malformed QR data' });
    }

    let user;
    try {
      user = await User.findById(userId);
    } catch {
      return res.status(400).json({ valid: false, message: 'Invalid ID format in QR' });
    }

    if (!user) {
      // ✅ FIXED INVALID LOG
      VerificationLog.create({
        scannedBy: scanner?._id,
        scannedName: 'Unknown User',
        scannedId: 'N/A',
        scannedRole: 'Unknown',
        result: 'INVALID'
      }).catch(() => {});

      return res.status(404).json({ valid: false, message: 'Identity not found' });
    }

    // ✅ GET PROFILE
    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findById(user.profileId);
    } else if (user.role === 'Employee') {
      profile = await Employee.findById(user.profileId);
    }

    const name = profile?.name || 'User';
    const id = profile?.id || 'N/A';
    const role = user.role;

    // 🛡️ ROLE RESTRICTION
    if (scanner.role === 'Employee' && user.role !== 'Student') {

      VerificationLog.create({
        scannedBy: scanner._id,
        scannedUser: user._id,
        scannedName: name,
        scannedId: id,          // ✅ FIX
        scannedRole: role,      // ✅ FIX
        result: 'NOT ALLOWED'
      }).catch(() => {});

      return res.status(403).json({
        valid: false,
        message: 'Restricted: Non-Student ID scanned'
      });
    }

    // 🛡️ ACCOUNT STATUS
    if (user.isActive === false) {

      VerificationLog.create({
        scannedBy: scanner._id,
        scannedUser: user._id,
        scannedName: name,
        scannedId: id,          // ✅ FIX
        scannedRole: role,      // ✅ FIX
        result: 'INACTIVE'
      }).catch(() => {});

      return res.json({
        valid: false,
        isActive: false,
        message: 'ID DEACTIVATED',
        name,
        id,
        role
      });
    }

    // ✅ SUCCESS
    VerificationLog.create({
      scannedBy: scanner._id,
      scannedUser: user._id,
      scannedName: name,
      scannedId: id,            // ✅ FIX
      scannedRole: role,        // ✅ FIX
      result: 'VALID'
    }).catch(() => {});

    return res.json({
      valid: true,
      isActive: true,
      name,
      id,
      department: profile?.department || '',
      role,
      photo: profile?.photo || ''
    });

  } catch (err) {
    console.error('🚀 VERIFY_QR CRASH:', err);
    return res.status(500).json({
      valid: false,
      message: 'Server verification error',
      error: err.message
    });
  }
};
/* ===================== GET SCOPED LOGS (ADMIN/EMPLOYEE) ===================== */
exports.getLogs = async (req, res) => {
  try {
    const { from, to, result, verifierRole } = req.query;
    const currentUser = req.user;

    let filter = {};

    if (currentUser.role === 'Admin') {
      // 🛡️ ADMIN: See all logs for students/employees created by THIS admin
      const managedUsers = await User.find({ adminId: currentUser._id }).select('_id');
      const managedIds = managedUsers.map(u => u._id);
      
      // Include the admin's own ID as a potential scanner
      managedIds.push(currentUser._id);

      filter = {
        $or: [
          { scannedBy: { $in: managedIds } },
          { scannedUser: { $in: managedIds } }
        ]
      };
    } else {
      // 🛡️ EMPLOYEE: See only logs they performed
      filter = { scannedBy: currentUser._id };
    }

    // 📅 Date Filter
    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    // 🔎 Result Filter
    if (result) {
      filter.result = result;
    }

    // 🔦 Verifier Role Filter (Admin vs Staff)
    if (verifierRole) {
      filter.scannedBy = { $in: await getManagedVerifierIds(currentUser, verifierRole) };
    }

    const logs = await VerificationLog.find(filter)
      .sort({ date: -1 })
      .populate({
        path: 'scannedBy',
        select: 'username role'
      })
      .populate({
        path: 'scannedUser',
        select: 'username role profileId',
        populate: { path: 'profileId' }
      });

    // 🔄 Map through logs to provide fallbacks for older entries
    const optimizedLogs = logs.map(log => {
      const logObj = log.toObject();

      // Fallback if missing (for legacy logs)
      if (!logObj.scannedName && logObj.scannedUser?.profileId?.name) {
        logObj.scannedName = logObj.scannedUser.profileId.name;
      }
      if (!logObj.scannedId && logObj.scannedUser?.profileId?.id) {
        logObj.scannedId = logObj.scannedUser.profileId.id;
      }
      
      // Secondary fallback for invalid scans
      if (!logObj.scannedName && logObj.result === 'INVALID') {
        logObj.scannedName = 'Unknown User';
        logObj.scannedId = 'N/A';
      }

      return logObj;
    });

    res.json(optimizedLogs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== DELETE LOGS (ADMIN) ===================== */

exports.deleteLogs = async (req, res) => {
  try {
    const { from, to, result, verifierRole } = req.query;
    const currentUser = req.user;

    let filter = {};

    // 🔐 SAME ROLE LOGIC AS getLogs
    if (currentUser.role === 'Admin') {
      const managedUsers = await User.find({ adminId: currentUser._id }).select('_id');
      const managedIds = managedUsers.map(u => u._id);
      managedIds.push(currentUser._id);

      filter = {
        $or: [
          { scannedBy: { $in: managedIds } },
          { scannedUser: { $in: managedIds } }
        ]
      };
    } else {
      filter = { scannedBy: currentUser._id };
    }

    // 📅 DATE FILTER
    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    } else {
      // default → today
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    // 🔎 RESULT FILTER
    if (result) {
      filter.result = result;
    }

    // 🔦 VERIFIER ROLE FILTER
    if (verifierRole) {
      filter.scannedBy = { $in: await getManagedVerifierIds(currentUser, verifierRole) };
    }

    const deleted = await VerificationLog.deleteMany(filter);

    res.json({
      message: 'Logs deleted',
      count: deleted.deletedCount
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== GET DASHBOARD STATS (ADMIN) ===================== */
exports.getStats = async (req, res) => {
  try {
    const adminId = req.user._id;

    const studentCount = await User.countDocuments({ adminId, role: 'Student' });
    const employeeCount = await User.countDocuments({ adminId, role: 'Employee' });
    const scanCount = await VerificationLog.countDocuments();

    res.json({
      students: studentCount,
      employees: employeeCount,
      scans: scanCount
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== HELPERS ===================== */
async function getManagedVerifierIds(currentUser, role) {
  if (role === 'Admin') {
    return [currentUser._id];
  } else if (role === 'Employee') {
    // Return all employees managed by this admin
    const employees = await User.find({ adminId: currentUser._id, role: 'Employee' }).select('_id');
    return employees.map(e => e._id);
  }
  return [];
}

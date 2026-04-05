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

  const { id } = req.params;
  const { isActive } = req.body;

  await Student.findByIdAndUpdate(id, { isActive });

  await User.findOneAndUpdate(
    { profileId: id, role: 'Student' },
    { isActive }
  );

  res.json({ message: 'Student status updated' });
};


exports.updateEmployeeStatus = async (req, res) => {

  const { id } = req.params;
  const { isActive } = req.body;

  await Employee.findByIdAndUpdate(id, { isActive });

  await User.findOneAndUpdate(
    { profileId: id, role: 'Employee' },
    { isActive }
  );

  res.json({ message: 'Employee status updated' });
};


/* ===================== DELETE (ADMIN) ===================== */
exports.deleteStudent = async (req, res) => {

  const { id } = req.params;

  await Student.findByIdAndUpdate(id, { isActive: false });
  await User.findOneAndUpdate({ profileId: id, role: 'Student' }, { isActive: false });

  res.json({ message: 'Student soft deleted' });

};


exports.deleteEmployee = async (req, res) => {

  const { id } = req.params;

  await Employee.findByIdAndUpdate(id, { isActive: false });
  await User.findOneAndUpdate({ profileId: id, role: 'Employee' }, { isActive: false });

  res.json({ message: 'Employee soft deleted' });

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

    res.json({
      idToken
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};

/* ===================== UPDATE EMPLOYEE (ADMIN) ===================== */
exports.updateEmployee = async (req, res) => {

  const { id } = req.params;

  await Employee.findByIdAndUpdate(id, {
    name: req.body.name,
    department: req.body.department,
    mobile: req.body.mobile
  });

  res.json({ message: "Employee updated" });

};

/* ===================== UPDATE STUDENT (ADMIN) ===================== */
exports.updateStudent = async (req, res) => {

  const { id } = req.params;

  await Student.findByIdAndUpdate(id, {
    name: req.body.name,
    department: req.body.department,
    batch: req.body.batch,
    mobile: req.body.mobile
  });

  res.json({ message: "Student updated" });

};

/* ===================== VERIFY QR SCAN ============================== */
const VerificationLog = require('../models/verificationLog');

exports.verifyQr = async (req, res) => {
  try {
    const { token } = req.body;

    const scanner = req.user; // from auth middleware
 
    // 🛡️ Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    const user = await User.findById(decoded.userId)
      .populate('profileId');

    if (!user) {
      await VerificationLog.create({
        scannedBy: scanner._id,
        result: 'INVALID'
      });

      return res.json({ valid: false, message: 'User not found' });
    }

    // 🚨 EMPLOYEE restriction
    if (scanner.role === 'Employee' && user.role !== 'Student') {

      await VerificationLog.create({
        scannedBy: scanner._id,
        scannedUser: user._id,
        scannedName: user.profileId?.name,
        scannedRole: user.role,
        result: 'NOT ALLOWED'
      });

      return res.json({
        valid: false,
        message: 'Employees can scan only students'
      });
    }

    // ❌ inactive
    if (!user.isActive) {

      await VerificationLog.create({
        scannedBy: scanner._id,
        scannedUser: user._id,
        scannedName: user.profileId?.name,
        scannedRole: user.role,
        result: 'INVALID'
      });

      return res.json({
        valid: false,
        message: 'ID INACTIVE'
      });
    }

    // ✅ VALID
    await VerificationLog.create({
      scannedBy: scanner._id,
      scannedUser: user._id,
      scannedName: user.profileId?.name,
      scannedRole: user.role,
      result: 'VALID'
    });

    res.json({
      valid: true,
      name: user.profileId?.name,
      id: user.profileId?._id,
      department: user.profileId?.department,
      role: user.role,
      photo: user.profileId?.photo // 👈 important
    });

  } catch (err) {

    await VerificationLog.create({
      scannedBy: req.user?._id,
      result: 'INVALID'
    });

    res.json({ valid: false, message: 'Invalid QR' });
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
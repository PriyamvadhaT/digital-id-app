const mongoose = require('mongoose');
const Student = require('./src/models/student.model');
const Employee = require('./src/models/employee.model');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/digital_id');
  
  const students = await Student.find();
  console.log('STUDENTS Detals:', JSON.stringify(students, null, 2));
  
  const employees = await Employee.find();
  console.log('EMPLOYEES Details:', JSON.stringify(employees, null, 2));

  mongoose.connection.close();
}

check();

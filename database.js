const mysql = require('mysql2')
const dotenv = require('dotenv')
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function getData(){
    try {
        const [rows] = await pool.query(`
          SELECT * 
          FROM account`
        )
        return rows;
      } catch (error) {
        // Handle database query error here
        throw error;
      }
}

async function getDep(){
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM department`
    )
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function getEmp(){
  try {
      const [rows] = await pool.query(`
        SELECT * 
        FROM employee`
      )
      return rows
    } catch (error) {
      // Handle database query error here
      throw error;
    }
}

async function getDepName(depid){
  try {
    const dep_id = depid
    const [rows] = await pool.query(`
      SELECT department_name
      FROM department
      WHERE department_id = ?
      `, [dep_id]
    )
    return rows[0].department_name
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function addEmployee(employeeData) {
  try {
    const department_name = employeeData.department_id; 
    console.log(employeeData)
    // First, fetch the 'department_id' using the 'department' name
    const [departmentResult] = await pool.query(
      'SELECT department_id FROM department WHERE department_name = ?',
      [department_name]
    )
    console.log(departmentResult[0].department_id)
    const departmentId = departmentResult[0].department_id
    employeeData.department_id = departmentId
    const query = `
    INSERT INTO employee 
    SET ?
  `
  const params = [employeeData]

  const [results, fields] = await pool.query(query, params)
  return results
  } catch (error) {
    throw error;
  }
}

async function delEmployee(employee_id){
  try {
    // Delete the employee based on the employee_id
    const query = 'DELETE FROM employee WHERE employee_id = ?'
    const params = [employee_id]

    const [results, fields] = await pool.query(query, params)

    if (results.affectedRows === 1) {
      return 'Employee record deleted successfully'
    } else {
      return 'Employee not found'
    }
  } catch (error) {
    throw error;
  }
}

async function editEmployee(employeeData) {
  try {
    const department_name = employeeData.department_id; 
    console.log(employeeData)
    // First, fetch the 'department_id' using the 'department' name
    const [departmentResult] = await pool.query(
      'SELECT department_id FROM department WHERE department_name = ?',
      [department_name]
    )
    console.log(departmentResult[0].department_id)
    const departmentId = departmentResult[0].department_id
    employeeData.department_id = departmentId

    const employee_id = employeeData.employee_id
    const query = `
    UPDATE employee
    SET ?
    WHERE employee_id = ?
    `
    const params = [employeeData, employee_id]

    const [results, fields] = await pool.query(query, params)
    console.log(results)
    var flag = false
    if (results.affectedRows === 1) {
      return flag = true
    } else {
      return flag
    }
  } catch (error) {
    throw error;
  }
}



module.exports = {
    getData,
    getEmp,
    getDep,
    getDepName,
    addEmployee,
    delEmployee,
    editEmployee
}
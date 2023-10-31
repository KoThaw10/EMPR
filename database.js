const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

async function getData() {
  try {
    const [rows] = await pool.query(`
          SELECT * 
          FROM admin_account`);
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function getDataId(id) {
  try {
    const [rows] = await pool.query(
      `
        SELECT * 
        FROM admin_account
        WHERE acc_id = ?
        `,
      [id]
    );
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function getDep() {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM department`);
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function getEmp() {
  try {
    const [rows] = await pool.query(`
        SELECT * 
        FROM employee`);
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function getDepName(depid) {
  try {
    const dep_id = depid;
    const [rows] = await pool.query(
      `
      SELECT department_name
      FROM department
      WHERE department_id = ?
      `,
      [dep_id]
    );
    return rows[0].department_name;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function addEmployee(employeeData) {
  try {
    const department_name = employeeData.department_id;
    // First, fetch the 'department_id' using the 'department' name
    const [departmentResult] = await pool.query(
      "SELECT department_id FROM department WHERE department_name = ?",
      [department_name]
    );
    const departmentId = departmentResult[0].department_id;
    employeeData.department_id = departmentId;
    const query = `
    INSERT INTO employee 
    SET ?
  `;
    const params = [employeeData];

    const [results, fields] = await pool.query(query, params);
    return results;
  } catch (error) {
    throw error;
  }
}

async function delEmployee(employee_id) {
  try {
    // Delete the employee based on the employee_id
    const query = "DELETE FROM employee WHERE employee_id = ?";
    const params = [employee_id];

    const [results, fields] = await pool.query(query, params);

    if (results.affectedRows === 1) {
      return "Employee record deleted successfully";
    } else {
      return "Employee not found";
    }
  } catch (error) {
    throw error;
  }
}

async function editEmployee(employeeData) {
  try {
    const department_name = employeeData.department_id;
    // First, fetch the 'department_id' using the 'department' name
    const [departmentResult] = await pool.query(
      "SELECT department_id FROM department WHERE department_name = ?",
      [department_name]
    );
    const departmentId = departmentResult[0].department_id;
    employeeData.department_id = departmentId;

    //Update employee data
    const employee_id = employeeData.employee_id;
    const query = `
    UPDATE employee
    SET ?
    WHERE employee_id = ?
    `;
    const params = [employeeData, employee_id];

    const [results, fields] = await pool.query(query, params);
    var flag = false;
    if (results.affectedRows === 1) {
      return (flag = true);
    } else {
      return flag;
    }
  } catch (error) {
    throw error;
  }
}

async function insertAttendance(data) {
  // Insert data into MySQL database
  const insertQuery =
    "INSERT INTO attendance ( employee_id, employee_name, casual_leave, medical_leave, marriage_leave, maternity_leave, balance_casual_leave, balance_medical_leave, balance_marriage_leave, balance_maternity_leave, attendance, total_attendance, month, year) VALUES ?";
  const values = data.map((row) => [
    row["Employee_id"],
    row["Employee_name"],
    row["Casual Leave"],
    row["Medical Leave"],
    row["Maternity Leave"],
    row["Marriage Leave"],
    row["balance of casual leave"],
    row["balance of medical leave"],
    row["balance of maternity leave"],
    row["balance of marriage leave"],
    row["attendance"],
    row["total_attendance"],
    row["month"],
    row["year"],
  ]);

  await pool.query(insertQuery, [values], (err, results) => {
    if (err) {
      console.error("Error inserting data into the database: " + err.message);
      return { success: false };
    } else {
      console.log("Insert complete");
      return { success: true };
    }
  });
}

async function updateAcc(acc, accountID) {
  const query = `
    UPDATE admin_account 
    SET ?
    WHERE acc_id = ?
    `;
  const params = [acc, accountID];

  const [results, fields] = await pool.query(query, params);
}

async function addAdmin(acc) {
  try {
    const query = `
    INSERT INTO admin_account 
    SET ?
  `;
    const params = [acc];

    const [results, fields] = await pool.query(query, params);
    return results;
  } catch (error) {
    throw error;
  }
}

async function delAccount(acc_id) {
  try {
    // Delete the account based on the account id
    const query = "DELETE FROM admin_account WHERE acc_id = ?";
    const params = [acc_id];

    const [results, fields] = await pool.query(query, params);

    if (results.affectedRows === 1) {
      return "Account record deleted successfully";
    } else {
      return "Account not found";
    }
  } catch (error) {
    throw error;
  }
}

async function getAttendance() {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM attandance`);
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function checkPaid(data) {
  try {
    const query =
      "SELECT * FROM salary WHERE employee_id = ? AND month = ? AND year = ?";
    const params = [data.empId, data.month, data.year];

    const [results, fields] = await pool.query(query, params);
    console.log(results.length + " in checkPaid");
    return results;
  } catch (error) {
    throw error;
  }
}

async function getPayCheck(data) {
  const emp_id = parseInt(data["empId"]);
  var emp_data;
  try {
    const query = "SELECT * FROM employee WHERE employee_id = ?";
    const params = [emp_id];

    const [results, fields] = await pool.query(query, params);
    emp_data = results;
  } catch (error) {
    throw error;
  }
  const dep_name = await getDepName(emp_data[0].department_id);
  const leave = 0;
  if (data["casual_l"] > data["b_casual_l"]) {
    leave += data["casual_l"] - data["b_casual_l"];
  } else if (data["medical_l"] > data["b_medical_l"]) {
    leave += data["medical_l"] - data["b_medical_l"];
  } else if (data["maternity_l"] > data["b_maternity_l"]) {
    leave += data["maternity_l"] - data["b_maternity_l"];
  } else if (data["marriage_l"] > data["b_marriage_l"]) {
    leave += data["marriage_l"] - data["b_marriage_l"];
  }
  const leave_reduction_rate = 150;
  const tax = 0.05;

  var total_salary = 0;
  var decucted_amount = 0;

  if (leave == 0) {
    total_salary = emp_data[0].basic_salary - emp_data[0].basic_salary * tax;
  } else {
    total_salary =
      emp_data[0].basic_salary -
      (emp_data[0].basic_salary - leave_reduction_rate * leave) * tax;
    decucted_amount = leave_reduction_rate * leave;
  }

  const return_data = {
    employee_id: emp_data[0].employee_id,
    employee_name: emp_data[0].employee_name,
    position: emp_data[0].position,
    department_name: dep_name,
    basic_salary: emp_data[0].basic_salary,
    leave: leave,
    deduction: decucted_amount,
    tax: "5%",
    total: total_salary,
    month: data.month,
    year: data.year,
  };

  return return_data;
}

async function insertSalary(data) {
  // Convert specific fields to integers
  const integerFields = ["employee_id", "basic_salary", "deduction", "total"];

  for (const item of data) {
    if (integerFields.includes(item.key)) {
      item.value = parseInt(item.value);
    }
  }

  try {
    const sql =
      "INSERT INTO salary (employee_id, employee_name, basic_salary, tax, deduction, total_salary, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    const values = data.map((item) => item.value);
    console.log(data);
    const [rows] = await pool.query(sql, values);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function searchAttByDate(params) {
  console.log(params)
  try{
    const sqlQuery = `
      SELECT a.employee_id, a.employee_name, a.casual_leave, a.medical_leave, a.marriage_leave, a.maternity_leave,
      a.balance_casual_leave, a.balance_medical_leave,  a.balance_marriage_leave, a.balance_maternity_leave, a.attendance, a.total_attendance, a.month, a.year,
          CASE
              WHEN s.employee_id IS NOT NULL THEN 'Paid'
              ELSE 'Not Paid'
          END AS payment_status
    FROM attendance a
    LEFT JOIN salary s
    ON a.employee_id = s.employee_id AND a.month = s.month AND a.year = s.year
    WHERE a.month = ? AND a.year = ?;
    `;

    const [results] = await pool.query(sqlQuery, params);
    console.log(results);
    return results
  } catch (error) {
    throw error;
  }
  

  // try {
  //   const sql = `SELECT employee_id, employee_name, casual_leave, medical_leave, marriage_leave, maternity_leave,
  //    balance_casual_leave, balance_medical_leave,  balance_marriage_leave, balance_maternity_leave, attendance, total_attendance, month, year
  //   FROM attendance WHERE month = ? AND year = ?`;

  //   const [rows] = await pool.query(sql, params);

  //   return rows;
  // } catch (error) {
  //   throw error;
  // }
}

async function getSalary() {
  try {
    const [rows] = await pool.query(`
        SELECT salary_id, employee_id, employee_name, basic_salary, tax, total_salary, month, year
        FROM salary
        ORDER BY year DESC,
         CASE
            WHEN month = 'Jan' THEN 1
            WHEN month = 'Feb' THEN 2
            WHEN month = 'Mar' THEN 3
            WHEN month = 'Apr' THEN 4
            WHEN month = 'May' THEN 5
            WHEN month = 'Jun' THEN 6
            WHEN month = 'Jul' THEN 7
            WHEN month = 'Aug' THEN 8
            WHEN month = 'Sep' THEN 9
            WHEN month = 'Oct' THEN 10
            WHEN month = 'Nov' THEN 11
            WHEN month = 'Dec' THEN 12
         END DESC
        `);
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function getSalaryByMth(month) {
  try {
    const [rows] = await pool.query(
      `
      SELECT salary_id
      FROM salary
      WHERE month = ?
      `,
      [month]
    );
    return rows;
  } catch (error) {
    // Handle database query error here
    throw error;
  }
}

async function searchSalaryByDate(params) {
  try {
    const sql = `SELECT salary_id, employee_id, employee_name, basic_salary, tax, total_salary, month, year
    FROM salary WHERE month = ? AND year = ?`;

    const [rows] = await pool.query(sql, params);

    return rows;
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
  editEmployee,
  insertAttendance,
  updateAcc,
  addAdmin,
  delAccount,
  getAttendance,
  getPayCheck,
  insertSalary,
  searchAttByDate,
  getSalary,
  getSalaryByMth,
  getDataId,
  searchSalaryByDate,
  checkPaid,
};

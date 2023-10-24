const express = require('express')
const router = express.Router()
const { format } = require('date-fns');
const { getData, getEmp, getDep, getDepName, addEmployee, delEmployee, editEmployee, insertAttendance, updateAcc, addAdmin, delAccount } = require('../database')
const multer = require('multer')
const XLSX = require('xlsx');
const { ro } = require('date-fns/locale');
var user =[]

router.post('/login', async (req, res) => {
    const users = await getData()
    user = users.find(user => user.user_name === req.body.username)
    if (user == null) {
        const message = 'User not found'
        const redirectUrl = '/';
        res.render('message', { message, redirectUrl })
        return
    }
    if(req.body.password === user.password){
        req.session.user = user
        res.redirect('/index')
    }else{
        const message = 'Password incorrect'
        const redirectUrl = '/';
    
        res.render('message', { message, redirectUrl })
    }
})


router.get('/index', async (req, res) => {
    
    if(req.session.user){
        const {user} = req.session
        res.render('index', {user: user})
    }else{
        const message = 'You need to login first'
        const redirectUrl = '/';
    
        res.render('message', { message, redirectUrl })
    }
    
})


router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err){
            console.log(err)
            res.send(err)
        }else{
            res.redirect('/')
        }
    })
})

router.get('/dashboard', async (req, res) => {
    const dep = await getDep()
    const emp = await getEmp()
    const {user} = req.session
    res.render('dashboard', {userData: user, empData: emp, empDep: dep})
})


router.get('/employee', async(req, res) => {
    const emp = await getEmp()
    const exactedEmp = await Promise.all(emp.map(async (employee) => ({
        id: employee.employee_id,
        name: employee.employee_name,
        gender: employee.gender,
        address: employee.address,
        position: employee.position,
        department: await getDepName(employee.department_id),
        dob: format(employee.date_of_birth, 'yyyy-MM-dd'),
        email: employee.email,
        phone: employee.phone,
      })))
    res.render('employee', {empData: exactedEmp})
})

router.get('/attendance', async(req, res) => {
    res.render('attendance')
})

router.get('/employees/:name', async (req, res) => {
    const empName = req.params.name
    const emp = await getEmp()
    const matchingEmployees = emp.filter(employee => employee.employee_name === empName);
    
    res.json(matchingEmployees);
});

router.post('/addEmployee', async (req, res) => {
    const employeeData = req.body
  try {
    const result = await addEmployee(employeeData);
    res.status(200).send('Employee data saved successfully');
  } catch (error) {
    console.error('Error: ' + error.sqlMessage)
    res.status(500).json({ error: error.sqlMessage });
  }
})

router.post('/delEmployee', async (req, res) => {
    try{
        const employee_id = req.body;
        const result = await delEmployee(employee_id.employee_id)
        console.log(result)
        res.status(200).send('Employee record deleted successfully')
    } catch (error) {
        console.error('Error deleting employee data:', error);
        res.status(500).send('Error deleting employee data');
    }   

})

router.post('/editEmployee', async (req, res) => {
    const employeeData = req.body
    console.log(employeeData)
    console.log("enter server")
  try {
    const flag = await editEmployee(employeeData);
    if (flag){
        console.log("enter lop")

        res.status(200).send('Employee data saved successfully');
    }else {
        console.log("enter lop flag error")
        res.status(500).send('Error updating employee data')
    }
    
  } catch (error) {
    console.error('Error saving employee data:', error);
    res.status(500).send('Error updating employee data');
  }
})

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



router.post('/upload', upload.single('excelFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const result = insertAttendance(data)
    if(result){
        res.status(200).json({ data: data });
    }else{
        res.status(500).json({ error: 'Failed to process data.' });
    }
})


router.get('/admin', async(req, res) => {
    account = await getData()
    res.render('admin', {'account': account})
})

router.get('/admin/:id', async (req, res) => {
    const accountIdToSearch = req.params.id;
    accountData = await getData()
    // Assuming accountData is an array of account objects
    const account = accountData.find(acc => acc.acc_id == accountIdToSearch);
    if (account) {
        // Account with the specified ID was found
        console.log('Found account:', account);
        res.status(200).json({'account': account})
        // You can send this account data as a response to the client or perform further operations.
    } else {
        // Account with the specified ID was not found
        console.log('Account not found');
        res.status(500).json({error: 'Account not found'})
        // You can send an appropriate response to the client, such as a 404 Not Found.
    }
})

router.post('/editAdmin/:id', async (req, res) => {
    console.log("enter server")
    const accountId = parseInt(req.params.id);
    const acc = req.body
    try{
        updateAcc(acc, accountId)
        console.log('complete')
        res.status(200).send("Update admin account successfully")
    }catch{
        console.log("error")
        res.status(500).send("Error in updating admin")
    }
})

router.post('/addAdmin', async (req, res) => {
    const acc = req.body
    try{
        const result = addAdmin(acc)
        res.status(200).send("Account added successfully")
    }catch{
        console.log(result)
        res.status(500).send("Error in adding account")
    }
})

router.post('/delAcc', async (req, res) => {
    try{
        const acc_id = req.body;
        const result = await delAccount(acc_id.acc_id)
        console.log(result)
        res.status(200).send('Account record deleted successfully')
    } catch (error) {
        console.error('Error deleting account data:', error);
        res.status(500).send('Error deleting account data');
    }   

})

module.exports = router
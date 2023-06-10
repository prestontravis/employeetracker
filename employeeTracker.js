const mysql = require('mysql');
const inquirer = require('inquirer');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'your_username',
  password: 'your_password',
  database: 'employee_db',
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the employee database.');
  // Call the function to display the main menu
  mainMenu();
});

// Function to display the main menu
function mainMenu() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all employees',
        'View employees by department',
        'View employees by manager',
        'Add employee',
        'Update employee role',
        'Exit',
      ],
    })
    .then((answer) => {
      // Call the appropriate function based on user choice
      switch (answer.action) {
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'View employees by department':
          viewEmployeesByDepartment();
          break;
        case 'View employees by manager':
          viewEmployeesByManager();
          break;
        case 'Add employee':
          addEmployee();
          break;
        case 'Update employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          break;
      }
    });
}

// Function to view all employees
function viewAllEmployees() {
  // Query the database to get all employees
  connection.query('SELECT * FROM employees', (err, res) => {
    if (err) throw err;
    console.table(res);
    // After displaying the employees, show the main menu again
    mainMenu();
  });
}

// Function to view employees by department
function viewEmployeesByDepartment() {
  // Query the database to get all departments
  connection.query('SELECT * FROM departments', (err, res) => {
    if (err) throw err;
    // Create an array of department names for Inquirer choices
    const departmentChoices = res.map((department) => department.name);
    // Prompt the user to select a department
    inquirer
      .prompt({
        name: 'department',
        type: 'list',
        message: 'Select a department:',
        choices: departmentChoices,
      })
      .then((answer) => {
        // Query the database to get employees by the selected department
        connection.query(
          'SELECT * FROM employees WHERE department = ?',
          answer.department,
          (err, res) => {
            if (err) throw err;
            console.table(res);
            // After displaying the employees, show the main menu again
            mainMenu();
          }
        );
      });
  });
}

// Function to view employees by manager
function viewEmployeesByManager() {
  // Query the database to get all managers
  connection.query('SELECT * FROM employees WHERE manager_id IS NOT NULL', (err, res) => {
    if (err) throw err;
    // Create an array of manager names for Inquirer choices
    const managerChoices = res.map((employee) => `${employee.first_name} ${employee.last_name}`);
    // Prompt the user to select a manager
    inquirer
      .prompt({
        name: 'manager',
        type: 'list',
        message: 'Select a manager:',
        choices: managerChoices,
      })
      .then((answer) => {
        // Query the database to get employees by the selected manager
        connection.query(
          'SELECT * FROM employees WHERE manager_id IN (SELECT id FROM employees WHERE CONCAT(first_name, " ", last_name) = ?)',
          answer.manager,
          (err, res) => {
            if (err) throw err;
            console.table(res);
            // After displaying the employees, show the main menu again
            mainMenu();
          }
        );
      });
  });
}

// Function to add a new employee
function addEmployee() {
  // Query the database to get all roles
  connection.query('SELECT * FROM roles', (err, res) => {
    if (err) throw err;
    // Create an array of role titles for Inquirer choices
    const roleChoices = res.map((role) => role.title);
    // Query the database to get all employees (managers)
    connection.query('SELECT * FROM employees WHERE manager_id IS NULL', (err, res) => {
      if (err) throw err;
      // Create an array of manager names for Inquirer choices
      const managerChoices = res.map((employee) => `${employee.first_name} ${employee.last_name}`);
      // Prompt the user to enter the new employee details
      inquirer
        .prompt([
          {
            name: 'first_name',
            type: 'input',
            message: 'Enter the first name of the new employee:',
          },
          {
            name: 'last_name',
            type: 'input',
            message: 'Enter the last name of the new employee:',
          },
          {
            name: 'role',
            type: 'list',
            message: 'Select the role of the new employee:',
            choices: roleChoices,
          },
          {
            name: 'manager',
            type: 'list',
            message: 'Select the manager of the new employee:',
            choices: managerChoices,
          },
        ])
        .then((answers) => {
          // Find the role ID based on the selected role title
          const selectedRole = res.find((role) => role.title === answers.role);
          // Find the manager ID based on the selected manager name
          const selectedManager = res.find(
            (employee) => `${employee.first_name} ${employee.last_name}` === answers.manager
          );
          // Insert the new employee into the database
          connection.query(
            'INSERT INTO employees SET ?',
            {
              first_name: answers.first_name,
              last_name: answers.last_name,
              role_id: selectedRole.id,
              manager_id: selectedManager.id,
            },
            (err) => {
              if (err) throw err;
              console.log('New employee added successfully!');
              // After adding the employee, show the main menu again
              mainMenu();
            }
          );
        });
    });
  });
}

// Function to update an employee's role
function updateEmployeeRole() {
  // Query the database to get all employees
  connection.query('SELECT * FROM employees', (err, res) => {
    if (err) throw err;
    // Create an array of employee names for Inquirer choices
    const employeeChoices = res.map((employee) => `${employee.first_name} ${employee.last_name}`);
    // Query the database to get all roles
    connection.query('SELECT * FROM roles', (err, res) => {
      if (err) throw err;
      // Create an array of role titles for Inquirer choices
      const roleChoices = res.map((role) => role.title);
      // Prompt the user to select an employee and a new role
      inquirer
        .prompt([
          {
            name: 'employee',
            type: 'list',
            message: 'Select an employee:',
            choices: employeeChoices,
          },
          {
            name: 'role',
            type: 'list',
            message: 'Select a new role:',
            choices: roleChoices,
          },
        ])
        .then((answers) => {
          // Find the employee ID based on the selected employee name
          const selectedEmployee = res.find(
            (employee) => `${employee.first_name} ${employee.last_name}` === answers.employee
          );
          // Find the role ID based on the selected role title
          const selectedRole = res.find((role) => role.title === answers.role);
          // Update the employee's role in the database
          connection.query(
            'UPDATE employees SET ? WHERE ?',
            [
              {
                role_id: selectedRole.id,
              },
              {
                id: selectedEmployee.id,
              },
            ],
            (err) => {
              if (err) throw err;
              console.log('Employee role updated successfully!');
              // After updating the employee's role, show the main menu again
              mainMenu();
            }
          );
        });
    });
  });
}

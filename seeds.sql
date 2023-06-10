-- Insert sample departments
INSERT INTO departments (name) VALUES
  ('Sales'),
  ('Engineering'),
  ('Finance'),
  ('Human Resources');

-- Insert sample roles
INSERT INTO roles (title, salary, department_id) VALUES
  ('Sales Representative', 50000, 1),
  ('Sales Manager', 80000, 1),
  ('Software Engineer', 70000, 2),
  ('Lead Engineer', 100000, 2),
  ('Accountant', 60000, 3),
  ('HR Coordinator', 45000, 4);

-- Insert sample employees
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, 1),
  ('Mike', 'Johnson', 3, 4),
  ('Emily', 'Davis', 4, 3),
  ('Alex', 'Wilson', 5, 2),
  ('Sarah', 'Taylor', 6, NULL);

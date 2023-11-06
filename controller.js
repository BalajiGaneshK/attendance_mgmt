// Controller.js

const dao = require("./dao");

module.exports = {
  registerEmployee: (req, res) => {
    const EmployeeData = req.body;
    dao.insertEmployee(EmployeeData, (err) => {
      if (err) {
        res.status(500).json({ error: "Registration failed" });
      } else {
        res.status(201).json({ message: "Registration successful" });
      }
    });
  },
  loginEmployee: (req, res) => {
    const { Emp_Id } = req.body;
    const Login_DateTime = new Date().toISOString();
    const Business_Date = new Date().toISOString().split("T")[0];
    const LoginData = [Emp_Id, Login_DateTime, Business_Date];
    dao.loginEmployee(LoginData, (err) => {
      if (err) {
        res.status(500).json({ error: "Login failed" });
      } else {
        res.status(201).json({ message: "Login successful" });
      }
    });
  },
  logoutEmployee: (req, res) => {
    const { Emp_Id } = req.body;
    const Logout_DateTime = new Date().toISOString();
    const LogoutData = [Logout_DateTime, Emp_Id];
    dao.logoutEmployee(LogoutData, (err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
      } else {
        res.status(201).json({ message: "Logout successful" });
      }
    });
  },
};

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
};

// dao.js

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../attendance.db");

module.exports = {
  executeQuery: function (query, values, callback) {
    // Execute the provided query with parameters
    db.run(query, values, function (err) {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        callback(null);
      }
    });
  },
  insertEmployee: function (EmployeeData, callback) {
    const { Emp_Id, Emp_Name, Manager_Id } = EmployeeData;

    const query = `
    INSERT INTO Employee (Emp_Id, Emp_Name, Manager_Id)
    VALUES (?, ?, ?)`;

    const values = [Emp_Id, Emp_Name, Manager_Id];

    this.executeQuery(query, values, (err) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        callback(null);
      }
    });
  },
  // Export other database-related functions
};

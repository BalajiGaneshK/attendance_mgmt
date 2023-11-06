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
  loginEmployee: function (LoginData, callback) {
    const loginQuery = `
    INSERT INTO Attendance (Emp_Id, Login_DateTime, Logout_DateTime, Business_Date)
    VALUES (?, ?, 0, ?)
  `;
    this.executeQuery(loginQuery, LoginData, (err) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        console.log("Successfully executed login query");
        callback(null);
      }
    });
  },
  logoutEmployee: function (LogoutData, callback) {
    const logoutQuery = `
    UPDATE Attendance
    SET Logout_DateTime = ? 
    WHERE Emp_Id = ? AND Logout_DateTime = '0'
  `;
    this.executeQuery(logoutQuery, LogoutData, (err) => {
      if (err) {
        console.error(err);
        throw { error: "Sign-out failed" };
      } else {
        console.log("Logout Successful", LogoutData);
        callback(null);
      }
    });
  },
  
  // Export other database-related functions
};

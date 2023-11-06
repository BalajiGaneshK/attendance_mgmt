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
  getManagerId: function (Emp_Id, callback) {
    const query = "SELECT Manager_Id FROM Employee WHERE Emp_Id = ?";
    db.get(query, [Emp_Id], (err, result) => {
      if (err) {
        callback(err);
      } else {
        console.log(result);
        if (result && result.Manager_Id) {
          callback(result.Manager_Id);
        } else {
          callback(null);
        }
      }
    });
  },
  getLeaveBalance: function (Emp_Id, leaveBalanceColumn, callback) {
    const query = `SELECT ${leaveBalanceColumn} FROM Employee WHERE Emp_Id = ?`;
    db.get(query, [Emp_Id], (err, result) => {
      if (err) {
        callback(0);
      } else {
        console.log("LeaveBalance result:",result);
        if (result) {
          callback(result[leaveBalanceColumn]);
        } else {
          callback(0);
        }
      }
    });
  },
  insertLeave: function (
    Emp_Id,
    Manager_Id,
    Leave_Type,
    Leave_Reason,
    Leave_Start_Date,
    Leave_End_Date,
    callback
  ) {
    const query =
      "INSERT INTO Leave (Emp_Id, Manager_Id, Leave_Type, Leave_Reason, Leave_Start_Date, Leave_End_Date) VALUES (?, ?, ?, ?, ?, ?)";
    this.executeQuery(
      query,
      [
        Emp_Id,
        Manager_Id,
        Leave_Type,
        Leave_Reason,
        Leave_Start_Date,
        Leave_End_Date,
      ],
      (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      }
    );
  },

  // Export other database-related functions
};

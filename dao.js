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
        console.log("LeaveBalance result:", result);
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
  getPendingLeaveRequests: function (Manager_Id, callback) {
    const query =
      'SELECT * FROM Leave WHERE Manager_Id = ? AND Approval_Status = "Pending"';
    db.all(query, [Manager_Id], (err, rows) => {
      if (err) {
        callback(null);
      } else {
        console.log("pending leaves:", rows);
        if (rows) {
          callback(rows);
        } else {
          callback(null);
        }
      }
    });
  },
  updateLeaveBalance: function (
    Emp_Id,
    Leave_Type,
    numberOfLeaveDays,
    callback
  ) {
    // Implement the logic to update the total available leave balance
    const leaveBalanceColumn =
      Leave_Type === "SL" ? "Total_Available_SL" : "Total_Available_PL";
    const query = `UPDATE Employee SET ${leaveBalanceColumn} = ${leaveBalanceColumn} - ? WHERE Emp_Id = ?`;

    this.executeQuery(query, [numberOfLeaveDays, Emp_Id], (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  },
  getLeaveInfo: function (Leave_Id, callback) {
    const query =
      "SELECT Leave_Type, Emp_Id,Manager_Id,Leave_Start_Date, Leave_End_Date FROM Leave WHERE Leave_Id = ?";
    db.get(query, [Leave_Id], (err, row) => {
      if (err) {
        callback(null);
      } else {
        if (row) {
          console.log("LeaveInfo:", row);
          callback(row);
        } else {
          callback(null);
        }
      }
    });
  },
  approveLeave: function (Leave_Id, callback) {
    const query =
      'UPDATE Leave SET Approval_Status = "Approved" WHERE Leave_Id = ?';
    this.executeQuery(query, [Leave_Id], (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  },
  calculateLeaveDays: function (startDate, endDate) {
    // Implement the logic to calculate the number of leave days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const numberOfLeaveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    console.log("No of LeaveDays:", numberOfLeaveDays);
    return numberOfLeaveDays;
  },
  getReportees(Manager_Id, callback) {
    const query =
      "SELECT Emp_Id, Emp_Name, Total_Available_PL, Total_Available_SL, Total_Available_CL FROM Employee WHERE Manager_Id = ?";
    db.all(query, [Manager_Id], (err, rows) => {
      if (err) {
        callback(null);
      } else {
        if (rows && rows.length > 0) {
          callback(rows);
        } else {
          callback(null);
        }
      }
    });
  },
  getEmployeeLeaveBalances(Emp_Id, callback) {
    const query =
      "SELECT Total_Available_PL, Total_Available_SL, Total_Available_CL FROM Employee WHERE Emp_Id = ?";
    db.get(query, [Emp_Id], (err, row) => {
      if (err) {
        callback(null);
      } else {
        if (row) {
          callback(row);
        } else {
          callback(null);
        }
      }
    });
  },
  getWeeklyLoggedHours(Manager_Id, oneWeekAgo, callback) {
    const query = `
    SELECT Emp_Id, SUM(Logged_Hours) AS Total_Logged_Hours
    FROM Attendance_Logs
    WHERE Emp_Id IN (SELECT Emp_Id FROM Employee WHERE Manager_Id = ?)
      AND Business_Date >= ?
    GROUP BY Emp_Id`;
    db.all(query, [Manager_Id, oneWeekAgo.toISOString()], (err, rows) => {
      if (err) {
        callback(null);
      } else {
        if (rows && rows.length > 0) {
          callback(rows);
        } else {
          callback(null);
        }
      }
    });
  },

  // Export other database-related functions
};

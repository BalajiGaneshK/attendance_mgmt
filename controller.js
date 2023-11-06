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
  applyLeave: (req, res) => {
    const {
      Emp_Id,
      Leave_Type,
      Leave_Reason,
      Leave_Start_Date,
      Leave_End_Date,
    } = req.body;

    // Fetch Manager_Id based on Emp_Id from the Employee table
    dao.getManagerId(Emp_Id, (managerId) => {
      if (managerId) {
        // Determine the appropriate leave balance column based on Leave_Type
        let leaveBalanceColumn = "";
        if (Leave_Type === "PL") {
          leaveBalanceColumn = "Total_Available_PL";
        } else if (Leave_Type === "SL") {
          leaveBalanceColumn = "Total_Available_SL";
        } else if (Leave_Type === "CL") {
          leaveBalanceColumn = "Total_Available_CL";
        }
        console.log(leaveBalanceColumn);
        let appliedLeaveDays = dao.calculateLeaveDays(
          Leave_Start_Date,
          Leave_End_Date
        );
        // Check if the employee has enough leave balance
        dao.getLeaveBalance(Emp_Id, leaveBalanceColumn, (leaveBalance) => {
          if (leaveBalance > appliedLeaveDays) {
            // Insert leave information into the Leave table
            dao.insertLeave(
              Emp_Id,
              managerId,
              Leave_Type,
              Leave_Reason,
              Leave_Start_Date,
              Leave_End_Date,
              (error) => {
                if (error) {
                  res.status(500).json({ error: "Failed to apply leave" });
                } else {
                  res
                    .status(201)
                    .json({ message: "Leave applied successfully" });
                }
              }
            );
          } else {
            res.status(400).json({
              error: "Insufficient leave balance",
              "Leave Balance": leaveBalance,
              "Applied Leave Days": appliedLeaveDays,
            });
          }
        });
      } else {
        res.status(404).json({ error: "Employee not Registered yet" });
      }
    });
  },
  viewLeaveRequests: (req, res) => {
    const { Manager_Id } = req.body;

    // Query the Leave table for leave requests with the provided Manager_Id and Approval_Status = 'Pending'
    dao.getPendingLeaveRequests(Manager_Id, (leaveRequests) => {
      if (leaveRequests) {
        res.status(200).json({ leaveRequests });
      } else {
        res.status(404).json({ error: "No pending leave requests found" });
      }
    });
  },
  approveLeaveRequest: function (req, res) {
    const { Leave_Id, Action, Manager_Id } = req.body;

    // Fetch leave information based on Leave_Id
    dao.getLeaveInfo(Leave_Id, (leaveInfo) => {
      if (leaveInfo) {
        const { Leave_Type, Emp_Id, Leave_Start_Date, Leave_End_Date } =
          leaveInfo;
        if (leaveInfo.Manager_Id !== Manager_Id)
          return res.status(500).json({
            "Access Error":
              "You are not Approved to Approve this Leave Request",
          });
        if (Action === "Approve") {
          // Update the Approval_Status to "Approved" in the Leave table
          dao.approveLeave(Leave_Id, (error) => {
            if (error) {
              res
                .status(500)
                .json({ error: "Failed to approve/deny leave request" });
            } else {
              // Calculate the number of leave days
              const numberOfLeaveDays = dao.calculateLeaveDays(
                Leave_Start_Date,
                Leave_End_Date
              );

              // Update the total available leave balance in the Employee table
              dao.updateLeaveBalance(
                Emp_Id,
                Leave_Type,
                numberOfLeaveDays,
                (updateError) => {
                  if (updateError) {
                    res
                      .status(500)
                      .json({ error: "Failed to update leave balance" });
                  } else {
                    res
                      .status(200)
                      .json({ message: "Leave request approved successfully" });
                  }
                }
              );
            }
          });
        } else {
          res.status(400).json({
            error:
              'Invalid action. Use "Approve" to approve the leave request.',
          });
        }
      } else {
        res.status(404).json({ error: "Leave request not found" });
      }
    });
  },
  viewTeamLeaveBalances: function (req, res) {
    const { Manager_Id } = req.body;

    // Query the Employee table for employees managed by the provided Manager_Id
    dao.getReportees(Manager_Id, (reportees) => {
      if (reportees && reportees.length > 0) {
        // Prepare a list of reportees and their leave balances
        const reporteeBalances = reportees.map((reportee) => ({
          Emp_Id: reportee.Emp_Id,
          Emp_Name: reportee.Emp_Name,
          Total_Available_PL: reportee.Total_Available_PL,
          Total_Available_SL: reportee.Total_Available_SL,
          Total_Available_CL: reportee.Total_Available_CL,
        }));

        res.status(200).json({ reporteeBalances });
      } else {
        res
          .status(404)
          .json({ error: "No reportees found for the provided Manager_Id" });
      }
    });
  },
  viewEmployeeLeaveBalances: function (req, res) {
    const { Emp_Id } = req.body;

    // Query the Employee table to retrieve leave balances for the provided Emp_Id
    dao.getEmployeeLeaveBalances(Emp_Id, (leaveBalances) => {
      if (leaveBalances) {
        res.status(200).json({ leaveBalances });
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    });
  },
  viewWeeklyLoggedHours: function (req, res) {
    const { Manager_Id } = req.body;

    // Calculate the date for one week ago from the current date
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Query the Attendance table to retrieve total logged hours for employees managed by the provided Manager_Id in the last 7 days
    dao.getWeeklyLoggedHours(Manager_Id, oneWeekAgo, (weeklyLoggedHours) => {
      if (weeklyLoggedHours && weeklyLoggedHours.length > 0) {
        res.status(200).json(weeklyLoggedHours);
      } else {
        res
          .status(404)
          .json({ error: "No employees found for the provided Manager_Id" });
      }
    });
  },
  viewEmployeesOnLeave(req, res) {
    const { Manager_Id } = req.body;

    // Get the current date as the Viewing_Date
    const currentDateTime = new Date();
    const Viewing_Date = currentDateTime.toISOString().split("T")[0]; // Get the date part only

    // Query the Leave table to retrieve approved leaves for employees managed by the provided Manager_Id
    dao.getApprovedLeaves(Manager_Id, Viewing_Date, (approvedLeaves) => {
      if (approvedLeaves && approvedLeaves.length > 0) {
        // Extract Emp_Id values from the approved leave records
        const empIds = approvedLeaves.map((leave) => leave.Emp_Id);

        // Query the Employee table to retrieve employee names
        dao.getEmployeeNames(empIds, (employeeNames) => {
          if (employeeNames && employeeNames.length > 0) {
            res.status(200).json(employeeNames);
          } else {
            res
              .status(404)
              .json({
                error: "No employees found on leave on the specified date",
              });
          }
        });
      } else {
        res
          .status(404)
          .json({
            error:
              "No approved leaves found for the provided Manager_Id and date",
          });
      }
    });
  },
};

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
            res
              .status(400)
              .json({
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
};

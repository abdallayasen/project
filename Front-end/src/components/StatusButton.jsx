import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { UserContext } from "../context/UserContext";

const StatusButton = ({ initialStatus, type, orderId, updateOrderStatus }) => {
  const statuses = ["Success", "Pending", "Processing", "Refunded"];
  const { user } = useContext(UserContext);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleClick = () => {
    if (!user || user.userType === "customer" ||
        (type === "fieldStatus" && user.userType === "employee_office") ||
        (type === "officeStatus" && user.userType === "field_worker")) {
      return; // Prevent unauthorized status changes
    }

    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    setStatus(newStatus);
    updateOrderStatus(orderId, type, newStatus); // Update status in the database
  };

  const getButtonStyle = (status) => {
    switch (status) {
      case "Success":
        return { backgroundColor: "#4caf50" };
      case "Pending":
        return { backgroundColor: "#ff5722" };
      case "Processing":
        return { backgroundColor: "#29B6F6" };
      default:
        return { backgroundColor: "#D9250F" };
    }
  };

  return (
    <Button
      variant="contained"
      style={getButtonStyle(status)}
      onClick={handleClick}
      disabled={!user || user.userType === "customer"}
    >
      {status}
    </Button>
  );
};
export default StatusButton;

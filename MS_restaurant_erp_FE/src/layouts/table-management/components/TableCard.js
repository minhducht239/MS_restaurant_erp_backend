import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

function TableCard({
  table,
  onTableClick,
  onDeleteTable,
  onToggleReservation,
  getStatusColor,
  getStatusText,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  // THÊM debug khi component render
  console.log("TableCard rendered with table:", table);
  console.log("TableCard table.id:", table?.id);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    console.log("Delete table called with ID:", table.id);
    onDeleteTable(table.id); // ID là đủ cho delete
    handleMenuClose();
  };

  const handleToggleReservation = (event) => {
    event.stopPropagation();

    console.log("TableCard handleToggleReservation called");
    console.log("- table object:", table);
    console.log("- table.id:", table?.id);
    console.log("- table.status:", table?.status);
    console.log("- onToggleReservation type:", typeof onToggleReservation);

    if (!table) {
      console.error("TableCard: table prop is null/undefined");
      return;
    }

    if (!table.id) {
      console.error("TableCard: table.id is missing", table);
      return;
    }

    // QUAN TRỌNG: Truyền toàn bộ table object (không chỉ ID)
    onToggleReservation(table);
    handleMenuClose();
  };

  return (
    <>
      <Card
        sx={{
          height: 200,
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          },
          bgcolor: "white",
          borderLeft: `4px solid ${
            table.status === "occupied"
              ? "#f44336"
              : table.status === "reserved"
              ? "#ff9800"
              : "#4caf50"
          }`,
          boxShadow: 1,
        }}
        onClick={() => onTableClick(table)}
      >
        <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header với tên bàn và menu */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {table.name}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <Icon fontSize="small">more_vert</Icon>
            </IconButton>
          </Box>

          {/* Thông tin bàn */}
          <Box flex={1} display="flex" flexDirection="column" justifyContent="center">
            <Typography variant="body2" color="text.secondary" mb={1}>
              <Icon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }}>
                layers
              </Icon>
              Tầng {Number(table.floor) + 1}
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={1}>
              <Icon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }}>
                people
              </Icon>
              {table.capacity} người
            </Typography>

            {/* Status chip */}
            <Box mt="auto">
              <Chip
                label={getStatusText(table.status)}
                color={getStatusColor(table.status)}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Box>
          </Box>

          {/* Footer với action button */}
          <Box mt={2}>
            <MDButton
              variant="gradient"
              color={getStatusColor(table.status)}
              size="small"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onTableClick(table);
              }}
            >
              {table.status === "occupied"
                ? "Xem chi tiết"
                : table.status === "reserved"
                ? "Quản lý đặt bàn"
                : "Sử dụng bàn"}
            </MDButton>
          </Box>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleToggleReservation}>
          <Icon sx={{ mr: 1 }}>{table.status === "reserved" ? "cancel" : "event"}</Icon>
          {table.status === "reserved" ? "Hủy đặt bàn" : "Đặt bàn"}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <Icon sx={{ mr: 1 }}>delete</Icon>
          Xóa bàn
        </MenuItem>
      </Menu>
    </>
  );
}

TableCard.propTypes = {
  table: PropTypes.object.isRequired,
  onTableClick: PropTypes.func.isRequired,
  onDeleteTable: PropTypes.func.isRequired,
  onToggleReservation: PropTypes.func.isRequired,
  getStatusColor: PropTypes.func.isRequired,
  getStatusText: PropTypes.func.isRequired,
};

export default TableCard;

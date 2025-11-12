import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";

function ReservationForm({ open, title, formData, onChange, onSave, onCancel }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: darkMode ? theme.palette.background.card : theme.palette.background.paper,
          color: darkMode ? theme.palette.white.main : theme.palette.text.main,
          boxShadow: darkMode ? theme.boxShadows.xxl : theme.boxShadows.lg,
        },
      }}
    >
      <DialogTitle sx={{ color: darkMode ? theme.palette.white.main : theme.palette.text.main }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <MDBox display="flex" flexDirection="column" gap={3} p={2}>
          <MDInput
            label="Tên khách hàng"
            value={formData.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              height: "56px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                color: darkMode ? theme.palette.white.main : undefined,
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? theme.palette.grey[400] : undefined,
              },
            }}
          />
          <MDInput
            label="Số người"
            type="number"
            inputProps={{ min: 1 }}
            value={formData.people || ""}
            onChange={(e) => onChange("people", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              height: "56px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                color: darkMode ? theme.palette.white.main : undefined,
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? theme.palette.grey[400] : undefined,
              },
            }}
          />
          <MDInput
            label="Số điện thoại"
            value={formData.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              height: "56px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                color: darkMode ? theme.palette.white.main : undefined,
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? theme.palette.grey[400] : undefined,
              },
            }}
          />
          <MDInput
            label="Thời gian"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={formData.time || ""}
            onChange={(e) => onChange("time", e.target.value)}
            fullWidth
            sx={{
              height: "56px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                color: darkMode ? theme.palette.white.main : undefined,
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? theme.palette.grey[400] : undefined,
              },
              "& input::-webkit-calendar-picker-indicator": {
                filter: darkMode ? "invert(1)" : "none",
              },
            }}
          />
          <MDInput
            label="Ngày"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.date || ""}
            onChange={(e) => onChange("date", e.target.value)}
            fullWidth
            sx={{
              height: "56px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                color: darkMode ? theme.palette.white.main : undefined,
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? theme.palette.grey[400] : undefined,
              },
              "& input::-webkit-calendar-picker-indicator": {
                filter: darkMode ? "invert(1)" : "none",
              },
            }}
          />
        </MDBox>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={onCancel}
          sx={{
            color: darkMode ? theme.palette.light.main : theme.palette.dark.main,
          }}
        >
          Hủy
        </Button>
        <MDButton
          onClick={onSave}
          color="info"
          variant="gradient"
          disabled={
            !formData.name ||
            !formData.phone ||
            !formData.people ||
            !formData.date ||
            !formData.time
          }
        >
          Lưu
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

ReservationForm.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ReservationForm;

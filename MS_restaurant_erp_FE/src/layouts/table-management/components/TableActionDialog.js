import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

function TableActionDialog({ open, onClose, table, onReserve, onOrder }) {
  if (!table) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "primary.main", color: "white", py: 2 }}>
        <Box display="flex" alignItems="center">
          <Icon sx={{ mr: 1 }}>table_restaurant</Icon>
          <Typography variant="h5" component="span" fontWeight="bold">
            {table.name} - Bàn trống
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 3 }}>
          <Typography variant="body1" align="center" paragraph>
            Vui lòng chọn hành động bạn muốn thực hiện với bàn này:
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box
                onClick={onReserve}
                sx={{
                  bgcolor: "warning.light",
                  p: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "warning.main", transform: "translateY(-4px)" },
                  transition: "all 0.2s",
                  boxShadow: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 60, color: "warning.dark", mb: 1 }}>event</Icon>
                <Typography variant="h5" fontWeight="bold" color="warning.dark">
                  Đặt bàn trước
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đặt giữ chỗ cho khách
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                onClick={onOrder}
                sx={{
                  bgcolor: "success.light",
                  p: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "success.main", transform: "translateY(-4px)" },
                  transition: "all 0.2s",
                  boxShadow: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 60, color: "success.dark", mb: 1 }}>restaurant_menu</Icon>
                <Typography variant="h5" fontWeight="bold" color="success.dark">
                  Gọi món
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Khách đã đến - gọi món ngay
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ py: 2, px: 3 }}>
        <MDButton onClick={onClose} color="dark">
          <Icon sx={{ mr: 1 }}>close</Icon>
          Đóng
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

TableActionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  table: PropTypes.object,
  onReserve: PropTypes.func.isRequired,
  onOrder: PropTypes.func.isRequired,
};

export default TableActionDialog;

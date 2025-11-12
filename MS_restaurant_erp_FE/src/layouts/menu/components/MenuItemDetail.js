import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";

function MenuItemDetail({ open, onClose, itemId, menuItems }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const theme = useTheme();

  const item = menuItems.find((menuItem) => menuItem.id === itemId);

  if (!item) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: darkMode ? theme.palette.background.card : theme.palette.background.paper,
          color: darkMode ? theme.palette.white.main : theme.palette.text.main,
          borderRadius: "12px",
          boxShadow: darkMode ? theme.boxShadows.xxl : theme.boxShadows.lg,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDTypography variant="h5" fontWeight="medium">
            {item.name}
          </MDTypography>
          <Chip
            label={item.category === "food" ? "Đồ ăn" : "Đồ uống"}
            color={item.category === "food" ? "warning" : "success"}
            size="small"
            icon={<Icon>{item.category === "food" ? "restaurant" : "local_drink"}</Icon>}
          />
        </MDBox>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* Image Section */}
          <Grid item xs={12}>
            {item.image ? (
              <CardMedia
                component="img"
                height="300"
                image={
                  typeof item.image === "string" ? item.image : URL.createObjectURL(item.image)
                }
                alt={item.name}
                sx={{
                  borderRadius: 2,
                  objectFit: "cover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <MDBox
                height="300px"
                bgcolor="grey.200"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                borderRadius={2}
                border="2px dashed"
                borderColor="grey.300"
              >
                <Icon sx={{ fontSize: "3rem", color: "grey.400", mb: 1 }}>image_not_supported</Icon>
                <MDTypography color="text.secondary">Không có hình ảnh</MDTypography>
              </MDBox>
            )}
          </Grid>

          {/* Price Section */}
          <Grid item xs={12}>
            <MDBox display="flex" alignItems="center" gap={1}>
              <Icon color="success">attach_money</Icon>
              <MDTypography variant="h4" color="success" fontWeight="bold">
                {typeof item.price === "number"
                  ? item.price.toLocaleString("vi-VN")
                  : Number(item.price).toLocaleString("vi-VN")}{" "}
                VNĐ
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Status Section */}
          <Grid item xs={12}>
            <MDBox display="flex" alignItems="center" gap={1}>
              <Icon color={item.is_available ? "success" : "error"}>
                {item.is_available ? "check_circle" : "cancel"}
              </Icon>
              <Chip
                label={item.is_available ? "Còn phục vụ" : "Hết món"}
                color={item.is_available ? "success" : "error"}
                size="medium"
                variant={item.is_available ? "filled" : "outlined"}
              />
            </MDBox>
          </Grid>

          {/* Description Section */}
          {item.description && (
            <Grid item xs={12}>
              <MDBox>
                <MDTypography variant="h6" mb={1} display="flex" alignItems="center" gap={1}>
                  <Icon color="info">description</Icon>
                  Mô tả
                </MDTypography>
                <MDBox
                  p={2}
                  sx={{
                    bgcolor: darkMode ? "rgba(255,255,255,0.05)" : "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <MDTypography variant="body2" color="text">
                    {item.description}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          pt: 1,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <MDButton variant="gradient" color="info" onClick={onClose} fullWidth>
          <Icon sx={{ mr: 1 }}>close</Icon>
          Đóng
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

MenuItemDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemId: PropTypes.number,
  menuItems: PropTypes.array.isRequired,
};

export default MenuItemDetail;

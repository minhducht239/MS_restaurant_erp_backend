import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

function AddOrderDialog({
  open,
  onClose,
  tableName,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  filteredMenuItems,
  selectedItems,
  addItemToSelection,
  removeItemFromSelection,
  changeItemQuantity,
  onAddItems,
  tableStatus,
  tableId,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  console.log("🎭 AddOrderDialog rendered:");
  console.log("- open:", open);
  console.log("- tableId prop:", tableId, typeof tableId);
  console.log("- tableName:", tableName);
  console.log("- tableStatus:", tableStatus);
  const handleAddToTable = async () => {
    console.log("🍽️ AddOrderDialog handleAddToTable called:");
    console.log("- tableId prop:", tableId, typeof tableId);
    console.log("- selectedItems:", selectedItems);

    if (!tableId) {
      console.error("❌ AddOrderDialog: tableId prop is missing");
      console.error("- Props received:", {
        tableId,
        tableName,
        tableStatus,
        open,
      });
      alert("Lỗi: Không xác định được bàn. Vui lòng thử lại.");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một món ăn.");
      return;
    }

    // Gọi callback với tableId
    const success = await onAddItems(tableId);

    if (success) {
      console.log("✅ Items added successfully, closing dialog");
      onClose(); // Đóng dialog sau khi thành công
    }
  };

  // Tính tổng tiền hóa đơn
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Tiêu đề đổi sang màu xanh */}
      <DialogTitle
        sx={{
          bgcolor: "primary.main", // Màu xanh primary
          color: "white",
          py: 2,
          px: 3, // Tăng padding ngang
          fontSize: { xs: "1.2rem", sm: "1.5rem" },
        }}
      >
        <Box display="flex" alignItems="center">
          <Icon sx={{ mr: 1, fontSize: "1.8rem" }}>restaurant_menu</Icon>
          <Typography variant="h4" component="span" fontWeight="bold">
            {tableStatus === "available" ? "Gọi món cho " : "Gọi thêm món cho "}
            {tableName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Phần tìm kiếm và danh sách món - Chỉnh căn lề */}
          <Grid item xs={12} md={6}>
            {/* Phần tìm kiếm - Thêm padding và làm rõ các ô */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                Tìm kiếm món
              </Typography>

              <TextField
                fullWidth
                label="Nhập tên món để tìm kiếm"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                size="large"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon>search</Icon>
                    </InputAdornment>
                  ),
                  sx: { fontSize: "1.1rem", py: 0.8 }, // Tăng kích thước ô tìm kiếm
                }}
                sx={{ mb: 2 }}
              />

              {/* Tăng kích thước ô danh mục */}
              <FormControl fullWidth margin="normal" size="large" sx={{ mb: 1 }}>
                <InputLabel id="category-label">Danh mục</InputLabel>
                <Select
                  labelId="category-label"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Danh mục"
                  sx={{
                    fontSize: "1.1rem",
                    height: "56px", // Tăng kích thước chiều cao
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Danh sách món - Chỉnh căn lề đồng nhất */}
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Box sx={{ bgcolor: "success.main", color: "white", py: 1.8, px: 2.5 }}>
                <Typography variant="h5" fontWeight="bold">
                  Danh sách món
                </Typography>
              </Box>

              <List
                sx={{
                  maxHeight: 450,
                  overflow: "auto",
                  p: 0,
                }}
              >
                {filteredMenuItems.length > 0 ? (
                  filteredMenuItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem
                        button
                        onClick={() => addItemToSelection(item)}
                        sx={{
                          py: 2,
                          px: 2.5, // Tăng padding ngang
                          ":hover": {
                            bgcolor: "rgba(0, 171, 85, 0.08)",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{ fontWeight: 500, mt: 0.5 }}
                            >
                              {item.price.toLocaleString("vi-VN")} đ
                            </Typography>
                          }
                        />
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToSelection(item);
                          }}
                          sx={{
                            color: "success.main",
                            "&:hover": {
                              bgcolor: "rgba(0, 171, 85, 0.08)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s",
                          }}
                        >
                          <Icon sx={{ fontSize: "1.8rem" }}>add_circle</Icon>
                        </IconButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem sx={{ py: 4, px: 2.5 }}>
                    <ListItemText
                      primary={
                        <Box textAlign="center">
                          <Icon sx={{ fontSize: "3rem", color: "text.secondary", mb: 1 }}>
                            search_off
                          </Icon>
                          <Typography variant="h6" color="text.secondary">
                            Không tìm thấy món ăn nào
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Phần món đã chọn */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ bgcolor: "primary.main", color: "white", py: 1.8, px: 2.5 }}>
                <Typography variant="h5" fontWeight="bold">
                  Món đã chọn
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1, overflow: "auto", maxHeight: "60vh" }}>
                <List sx={{ p: 0 }}>
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                      <React.Fragment key={item.id}>
                        <ListItem sx={{ py: 2, px: 2.5 }}>
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item xs={7}>
                              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                {item.name}
                              </Typography>
                              <Typography variant="body1" color="text.secondary">
                                {item.price.toLocaleString("vi-VN")} đ
                              </Typography>
                            </Grid>
                            <Grid item xs={5}>
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                <IconButton
                                  size="medium"
                                  onClick={() =>
                                    changeItemQuantity(item.id, (item.quantity || 1) - 1)
                                  }
                                  disabled={(item.quantity || 1) <= 1}
                                  sx={{
                                    bgcolor: "grey.100",
                                    "&:hover": { bgcolor: "grey.300" },
                                  }}
                                >
                                  <Icon>remove</Icon>
                                </IconButton>
                                <Typography
                                  mx={2}
                                  variant="h6"
                                  fontWeight="bold"
                                  sx={{ minWidth: "30px", textAlign: "center" }}
                                >
                                  {item.quantity || 1}
                                </Typography>
                                <IconButton
                                  size="medium"
                                  onClick={() =>
                                    changeItemQuantity(item.id, (item.quantity || 1) + 1)
                                  }
                                  sx={{
                                    bgcolor: "success.light",
                                    color: "white",
                                    "&:hover": { bgcolor: "success.main" },
                                  }}
                                >
                                  <Icon>add</Icon>
                                </IconButton>
                                <IconButton
                                  size="medium"
                                  color="error"
                                  onClick={() => removeItemFromSelection(item.id)}
                                  sx={{ ml: 1 }}
                                >
                                  <Icon>delete</Icon>
                                </IconButton>
                              </Box>
                            </Grid>
                          </Grid>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  ) : (
                    <ListItem sx={{ py: 8, px: 2.5 }}>
                      <ListItemText
                        primary={
                          <Box textAlign="center">
                            <Icon sx={{ fontSize: "5rem", color: "text.secondary", mb: 2 }}>
                              shopping_cart
                            </Icon>
                            <Typography variant="h5" color="text.secondary">
                              Chưa chọn món nào
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                              Vui lòng chọn món từ danh sách bên trái
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              {selectedItems.length > 0 && (
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    mt: "auto",
                    bgcolor: "grey.50",
                    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" fontWeight="bold">
                      Tổng cộng:
                    </Typography>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      {totalAmount.toLocaleString("vi-VN")} đ
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ py: 2, px: 3, borderTop: "1px solid rgba(0, 0, 0, 0.12)" }}>
        <MDButton
          onClick={onClose}
          color="dark"
          size="large"
          sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
        >
          <Icon sx={{ mr: 1 }}>cancel</Icon>
          Hủy
        </MDButton>
        <MDButton
          onClick={handleAddToTable}
          color="success"
          size="large"
          disabled={selectedItems.length === 0}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            "&:not(:disabled)": {
              boxShadow: "0 8px 16px 0 rgba(0,171,85,0.24)",
            },
          }}
        >
          <Icon sx={{ mr: 1 }}>check_circle</Icon>
          Thêm món
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

AddOrderDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tableName: PropTypes.string,
  categories: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  setSelectedCategory: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  filteredMenuItems: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  addItemToSelection: PropTypes.func.isRequired,
  removeItemFromSelection: PropTypes.func.isRequired,
  changeItemQuantity: PropTypes.func.isRequired,
  onAddItems: PropTypes.func.isRequired,
  tableStatus: PropTypes.string,
  tableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AddOrderDialog;

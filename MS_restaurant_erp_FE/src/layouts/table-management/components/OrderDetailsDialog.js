import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";

function OrderDetailsDialog({
  open,
  onClose,
  table,
  tableOrders,
  onAddOrder,
  onCreateBill,
  calculateTotal,
}) {
  if (!table) return null;

  const groupOrdersByName = (orders) => {
    if (!orders || !Array.isArray(orders)) return [];

    const grouped = {};

    orders.forEach((order) => {
      const key = (order.menu_item_name || order.name || "").toLowerCase().trim();

      if (grouped[key]) {
        grouped[key].quantity += order.quantity;
        grouped[key].total = grouped[key].price * grouped[key].quantity;
      } else {
        grouped[key] = {
          ...order,
          name: order.menu_item_name || order.name,
          total: order.price * order.quantity,
        };
      }
    });

    return Object.values(grouped);
  };

  const groupedOrders = groupOrdersByName(tableOrders);

  console.log("🔍 OrderDetailsDialog Debug:");
  console.log("- tableOrders:", tableOrders);
  console.log("- groupedOrders:", groupedOrders);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Icon sx={{ mr: 1, color: "primary.main" }}>restaurant</Icon>
          Chi tiết bàn {table.name}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="h6" gutterBottom color="primary.main">
          Danh sách món đã gọi
        </Typography>

        {groupedOrders && groupedOrders.length > 0 ? (
          <>
            <Box sx={{ mb: 2 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" }}
                    >
                      Tên món
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Số lượng
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Đơn giá
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedOrders.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {item.quantity}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {item.price ? `${item.price.toLocaleString("vi-VN")} đ` : "Chưa có giá"}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {item.total ? `${item.total.toLocaleString("vi-VN")} đ` : "Chưa có giá"}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                    <td
                      colSpan="3"
                      style={{ padding: "12px", textAlign: "right", borderTop: "2px solid #ddd" }}
                    >
                      Tổng cộng:
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        borderTop: "2px solid #ddd",
                        color: "#d32f2f",
                      }}
                    >
                      {calculateTotal(tableOrders).toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>

            <MDBox mt={3} display="flex" justifyContent="space-between" gap={2}>
              <MDButton
                variant="outlined"
                color="info"
                startIcon={<Icon>add</Icon>}
                onClick={onAddOrder}
                size="large"
              >
                Gọi thêm món
              </MDButton>
              <MDButton
                variant="gradient"
                color="success"
                startIcon={<Icon>receipt_long</Icon>}
                onClick={() => onCreateBill(table)}
                size="large"
              >
                Tạo hóa đơn
              </MDButton>
            </MDBox>
          </>
        ) : (
          <Box textAlign="center" py={6}>
            <Icon sx={{ fontSize: "4rem", color: "text.secondary", mb: 2 }}>restaurant_menu</Icon>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Bàn này chưa gọi món
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Nhấn nút bên dưới để bắt đầu thêm món ăn
            </Typography>
            <MDButton
              variant="gradient"
              color="primary"
              startIcon={<Icon>add</Icon>}
              onClick={onAddOrder}
              size="large"
            >
              Gọi món ngay
            </MDButton>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <MDButton onClick={onClose} color="dark" size="large">
          <Icon sx={{ mr: 1 }}>close</Icon>
          Đóng
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

OrderDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  table: PropTypes.object,
  tableOrders: PropTypes.array,
  onAddOrder: PropTypes.func.isRequired,
  onCreateBill: PropTypes.func.isRequired,
  calculateTotal: PropTypes.func.isRequired,
};

export default OrderDetailsDialog;

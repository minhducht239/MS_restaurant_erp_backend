import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Card, Alert, Snackbar, CircularProgress } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { createBill } from "services/BillingService";
import { getMenuItems } from "services/MenuService";
import { useLocation } from "react-router-dom";
import { getTableOrders } from "services/TableService";

function Payment() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    phone: "",
    total: 0,
    date: new Date().toISOString().split("T")[0],
    items: [],
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableId = queryParams.get("tableId");
  const tableName = queryParams.get("tableName");

  const pageTitle = tableId
    ? `Tạo hóa đơn cho ${tableName || `Bàn ${tableId}`}`
    : "Tạo hóa đơn thanh toán mới";

  // Tải dữ liệu menu từ API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await getMenuItems();
        setMenuItems(data.results || []);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setError("Không thể tải danh sách món ăn. Vui lòng thử lại sau.");
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (tableId) {
      fetchTableOrders(tableId);
    }
  }, [tableId]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddItem = (item) => {
    // Kiểm tra nếu món đã tồn tại trong danh sách
    const existingItem = formData.items.find((i) => i.id === item.id);
    if (existingItem) {
      // Tăng số lượng nếu món đã tồn tại
      setFormData((prevFormData) => ({
        ...prevFormData,
        items: prevFormData.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      // Thêm món mới với số lượng mặc định là 1
      setFormData((prevFormData) => ({
        ...prevFormData,
        items: [...prevFormData.items, { ...item, quantity: 1 }],
      }));
    }
  };

  const handleQuantityChange = (id, quantity) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      items: prevFormData.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  };

  const handleRemoveItem = (id) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      items: prevFormData.items.filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.customer || !formData.phone || formData.items.length === 0) {
      setError("Vui lòng nhập đầy đủ thông tin khách hàng và chọn ít nhất một món");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let billData;

      if (tableId) {
        // Hóa đơn từ bàn
        billData = {
          customer: formData.customer.trim(),
          phone: formData.phone.trim(),
          date: formData.date,
          table_id: tableId,
          table_name: tableName,
        };

        console.log("Creating bill from table with data:", billData);
      } else {
        // Hóa đơn thường
        billData = {
          customer: formData.customer.trim(),
          phone: formData.phone.trim(),
          date: formData.date,
          total: totalAmount,
          items: formData.items.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: extractPriceValue(item.price),
            item_name: item.name,
          })),
        };

        console.log("Creating regular bill with data:", billData);
      }

      // Gọi API tạo hóa đơn
      const response = await createBill(billData);
      console.log("Bill created successfully:", response);

      // Hiển thị thông báo thành công chi tiết
      let successMessage = "Hóa đơn đã được tạo thành công!";
      if (tableId) {
        successMessage = `Hóa đơn cho ${tableName || `Bàn ${tableId}`} đã được tạo thành công!`;
        if (response.table_status_new === "available") {
          successMessage += `\n${tableName} đã được chuyển về trạng thái trống.`;
        }
      }

      setSuccess(true);

      // Reset form
      setFormData({
        customer: "",
        phone: "",
        total: 0,
        date: new Date().toISOString().split("T")[0],
        items: [],
      });

      // Hiển thị alert với thông tin chi tiết
      alert(`${successMessage}
            Mã hóa đơn: ${response.bill_id || "N/A"}
            ${
              response.total_amount
                ? `Tổng tiền: ${response.total_amount.toLocaleString("vi-VN")} đ`
                : ""
            }
            ${response.items_count ? `Số món: ${response.items_count}` : ""}`);

      // Chờ 2 giây rồi chuyển hướng
      setTimeout(() => {
        navigate("/billing");
      }, 2000);
    } catch (error) {
      console.error("Error creating bill:", error);
      setError(`Không thể tạo hóa đơn: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableOrders = async (tableId) => {
    try {
      setTableLoading(true);
      setError(null);

      console.log("🍽️ Fetching orders from table:", tableId);

      const orderData = await getTableOrders(tableId);
      console.log(" Table orders received:", orderData);

      if (orderData && Array.isArray(orderData) && orderData.length > 0) {
        // Chuyển đổi orders từ backend sang format của Payment
        const items = orderData.map((item) => ({
          id: item.menu_item || item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
        }));

        console.log("🔄 Converted items:", items);

        // Cập nhật formData với orders từ bàn
        setFormData((prev) => ({
          ...prev,
          items: items,
        }));

        console.log("✅ Form data updated with table orders");
      } else {
        console.log("ℹ️ No orders found for table");

        setFormData((prev) => ({
          ...prev,
          items: [],
        }));
      }
    } catch (error) {
      console.error("❌ Error fetching table orders:", error);
      setError(`Không thể tải thông tin từ bàn: ${error.message}`);

      // Fallback: Vẫn cho phép tạo hóa đơn thủ công
      setFormData((prev) => ({
        ...prev,
        items: [],
      }));
    } finally {
      setTableLoading(false);
    }
  };

  // Lọc món ăn theo danh mục
  const foodItems = menuItems.filter((item) => item.category === "food");
  const drinkItems = menuItems.filter((item) => item.category === "drink");

  // Tính tổng tiền
  const extractPriceValue = (priceInput) => {
    if (typeof priceInput === "number") {
      return priceInput;
    }
    const priceString = priceInput.toString();
    const numericPart = priceString.replace(/[^\d.,]/g, "");
    const withoutCommas = numericPart.replace(/,/g, "");
    const price = parseFloat(withoutCommas);
    return isNaN(price) ? 0 : price;
  };

  const totalAmount = formData.items.reduce(
    (total, item) => total + item.quantity * extractPriceValue(item.price),
    0
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={8} p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <MDTypography variant="h6" fontWeight="medium">
                    {pageTitle}
                  </MDTypography>
                  {tableId && (
                    <MDBox>
                      <MDTypography variant="caption" color="info" fontWeight="bold">
                        Mã bàn: {tableId}
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>

                {tableLoading && tableId && (
                  <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                    <MDBox display="flex" alignItems="center">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Đang tải thông tin từ {tableName || `Bàn ${tableId}`}...
                    </MDBox>
                  </Alert>
                )}

                {tableId && formData.items.length > 0 && !tableLoading && (
                  <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                    ✅ Đã tải {formData.items.length} món từ {tableName || `Bàn ${tableId}`}
                  </Alert>
                )}

                {tableId && formData.items.length === 0 && !tableLoading && !error && (
                  <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                    ⚠️ {tableName || `Bàn ${tableId}`} chưa có món nào. Bạn có thể thêm món thủ công
                    bên dưới.
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <MDBox mt={3}>
                  <MDInput
                    label="Tên khách hàng"
                    fullWidth
                    value={formData.customer}
                    onChange={(e) => handleChange("customer", e.target.value)}
                    margin="dense"
                    required
                  />
                  <MDInput
                    label="Số điện thoại"
                    fullWidth
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    margin="dense"
                    required
                  />
                  <MDInput
                    label="Ngày thanh toán"
                    fullWidth
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    margin="dense"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </MDBox>

                {!tableLoading && (
                  <MDBox mt={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                      {tableId ? "Thêm món (nếu cần)" : "Chọn món ăn"}
                    </MDTypography>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info">
                        Món ăn
                      </MDTypography>
                      {foodItems.map((item) => (
                        <MDButton
                          key={item.id}
                          variant="outlined"
                          color="info"
                          onClick={() => handleAddItem(item)}
                          style={{ marginRight: "8px", marginBottom: "8px" }}
                        >
                          {item.name} -{" "}
                          {typeof item.price === "number"
                            ? item.price.toLocaleString("vi-VN")
                            : item.price}
                          VNĐ
                        </MDButton>
                      ))}
                    </MDBox>
                    <MDBox mt={2}>
                      <MDTypography variant="h6" fontWeight="medium" color="info">
                        Đồ uống
                      </MDTypography>
                      {drinkItems.map((item) => (
                        <MDButton
                          key={item.id}
                          variant="outlined"
                          color="info"
                          onClick={() => handleAddItem(item)}
                          style={{ marginRight: "8px", marginBottom: "8px" }}
                        >
                          {item.name} -{" "}
                          {typeof item.price === "number"
                            ? item.price.toLocaleString("vi-VN")
                            : item.price}{" "}
                          VNĐ
                        </MDButton>
                      ))}
                    </MDBox>
                  </MDBox>
                )}

                <MDBox mt={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Danh sách món ăn
                    {tableId && (
                      <MDTypography variant="caption" color="text.secondary" ml={1}>
                        (từ {tableName || `Bàn ${tableId}`})
                      </MDTypography>
                    )}
                  </MDTypography>
                  <MDBox mt={2}>
                    {formData.items.length > 0 ? (
                      formData.items.map((item) => (
                        <MDBox
                          key={item.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          <MDTypography>
                            {item.name} -{" "}
                            {typeof item.price === "number"
                              ? item.price.toLocaleString("vi-VN")
                              : item.price}{" "}
                            VNĐ
                          </MDTypography>
                          <MDBox display="flex" alignItems="center">
                            <MDInput
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.id, parseInt(e.target.value, 10))
                              }
                              style={{ width: "60px", marginRight: "8px" }}
                            />
                            <MDButton
                              variant="outlined"
                              color="error"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Xóa
                            </MDButton>
                          </MDBox>
                        </MDBox>
                      ))
                    ) : (
                      <MDTypography variant="body2" color="text.secondary">
                        {tableLoading ? "Đang tải..." : "Chưa có món ăn nào được chọn"}
                      </MDTypography>
                    )}
                  </MDBox>
                </MDBox>

                <MDBox mt={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Thành tiền: {totalAmount.toLocaleString("vi-VN")} VNĐ
                  </MDTypography>
                </MDBox>

                <MDBox mt={3} display="flex" justifyContent="flex-end">
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleSubmit}
                    disabled={
                      loading ||
                      tableLoading ||
                      !formData.customer ||
                      !formData.phone ||
                      formData.items.length === 0
                    }
                  >
                    {loading ? "Đang xử lý..." : "Tạo hóa đơn"}
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
        message={`Hóa đơn${
          tableId ? ` cho ${tableName || `Bàn ${tableId}`}` : ""
        } đã được tạo thành công`}
      />
      <Footer />
    </DashboardLayout>
  );
}

export default Payment;

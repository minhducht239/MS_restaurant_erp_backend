import { Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Function để tạo dữ liệu bảng từ danh sách customers
export function buildCustomerTableData(customers, handlers) {
  const { handleView } = handlers;

  const columns = [
    { Header: "Khách hàng", accessor: "customer", width: "30%", align: "left" },
    { Header: "Điện thoại", accessor: "phone", align: "center" },
    { Header: "Điểm tích lũy", accessor: "loyalty_points", align: "center" },
    { Header: "Tổng chi tiêu", accessor: "total_spent", align: "center" },
    { Header: "Thao tác", accessor: "action", align: "center" },
  ];

  const rows = customers.map((customer) => ({
    customer: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <MDBox
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "info.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
          }}
        >
          <Icon sx={{ color: "white", fontSize: "1.2rem" }}>person</Icon>
        </MDBox>
        <MDBox lineHeight={1}>
          <MDTypography variant="button" fontWeight="medium">
            {customer.name || "Khách hàng"}
          </MDTypography>
        </MDBox>
      </MDBox>
    ),
    phone: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {customer.phone || "Chưa có"}
      </MDTypography>
    ),
    loyalty_points: (
      <MDBox
        sx={{
          backgroundColor: "success.main",
          color: "white",
          px: 1.5,
          py: 0.5,
          borderRadius: "12px",
          display: "inline-block",
        }}
      >
        <MDTypography variant="caption" fontWeight="bold">
          {Number(customer.loyalty_points || 0).toFixed(2)} điểm
        </MDTypography>
      </MDBox>
    ),
    total_spent: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {Number(customer.total_spent || 0).toLocaleString("vi-VN")} VNĐ
      </MDTypography>
    ),
    action: (
      <MDBox display="flex" justifyContent="center" gap={1}>
        <MDButton
          variant="text"
          color="info"
          size="small"
          onClick={() => handleView(customer.id)}
          sx={{ minWidth: "auto", p: 1 }}
        >
          <Icon fontSize="small">visibility</Icon>
        </MDButton>
      </MDBox>
    ),
  }));

  return { columns, rows };
}

// Sample data function (nếu cần thiết)
export function getSampleCustomerData() {
  return [
    {
      id: 1,
      name: "Nguyễn Văn A",
      phone: "0123456789",
      loyalty_points: 125,
      total_spent: 2500000,
    },
    {
      id: 2,
      name: "Trần Thị B",
      phone: "0987654321",
      loyalty_points: 89,
      total_spent: 1800000,
    },
  ];
}

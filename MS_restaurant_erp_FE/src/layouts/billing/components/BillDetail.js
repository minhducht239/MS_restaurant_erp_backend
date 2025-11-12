import { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Grid,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  Fab,
} from "@mui/material";
import { Close, Print, Download } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { getBillDetail } from "services/BillingService";
import Alert from "@mui/material/Alert";
import { useMaterialUIController } from "context";

function BillDetail({ open, onClose, billId }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const styles = useMemo(
    () => ({
      borderColor: darkMode ? theme.palette.dark.main : "#ddd",
      headerBgColor: darkMode ? theme.palette.background.default : "#f5f5f5",
      hoverBgColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
      textColor: darkMode ? theme.palette.text.main : "inherit",
    }),
    [darkMode, theme]
  );

  const handlePrint = useCallback(() => {
    if (!bill) {
      setError("Không thể in: dữ liệu hóa đơn không có sẵn");
      return;
    }

    try {
      const printContent = document.getElementById("bill-detail-print");
      if (!printContent) {
        setError("Không thể in: không tìm thấy nội dung cần in");
        return;
      }

      const printStyles = `
        <style>
          @page { 
            margin: 20mm; 
            size: A4;
          }
          body { 
            font-family: 'Roboto', sans-serif; 
            line-height: 1.6;
            color: #333;
          }
          .bill-header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .bill-info { 
            margin-bottom: 20px; 
          }
          .bill-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          .bill-table th, .bill-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          .bill-table th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          .total-row { 
            font-weight: bold; 
            background-color: #f9f9f9;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      `;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setError("Vui lòng cho phép mở cửa sổ pop-up để in hóa đơn");
        return;
      }

      const formattedDate = new Date(bill.date).toLocaleDateString("vi-VN");
      const totalAmount = Number(bill.total || 0).toLocaleString("vi-VN");

      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa Đơn #${bill.id}</title>
            <meta charset="utf-8">
            ${printStyles}
          </head>
          <body>
            <div class="bill-header">
              <h1>HÓA ĐƠN THANH TOÁN</h1>
              <p>Mã hóa đơn: #${bill.id}</p>
              <p>Ngày: ${formattedDate}</p>
            </div>
            
            <div class="bill-info">
              <p><strong>Khách hàng:</strong> ${bill.customer || "Khách vãng lai"}</p>
              <p><strong>Số điện thoại:</strong> ${bill.phone || "N/A"}</p>
              <p><strong>Nhân viên:</strong> ${bill.staff_name || "N/A"}</p>
            </div>

            <table class="bill-table">
              <thead>
                <tr>
                  <th class="text-center">STT</th>
                  <th>Tên món</th>
                  <th class="text-right">Đơn giá</th>
                  <th class="text-center">SL</th>
                  <th class="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${
                  bill.items
                    ?.map((item, index) => {
                      const productName = item.item_name || item.menu_item_name || "Không có tên";
                      const price = Number(item.price || 0);
                      const quantity = Number(item.quantity || 1);
                      const subtotal = price * quantity;

                      return `
                    <tr>
                      <td class="text-center">${index + 1}</td>
                      <td>${productName}</td>
                      <td class="text-right">${price.toLocaleString("vi-VN")} VNĐ</td>
                      <td class="text-center">${quantity}</td>
                      <td class="text-right">${subtotal.toLocaleString("vi-VN")} VNĐ</td>
                    </tr>
                  `;
                    })
                    .join("") ||
                  '<tr><td colspan="5" class="text-center">Không có món ăn nào</td></tr>'
                }
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>TỔNG CỘNG:</strong></td>
                  <td class="text-right"><strong>${totalAmount} VNĐ</strong></td>
                </tr>
              </tbody>
            </table>
            
            <div style="margin-top: 40px; text-align: center;">
              <p><em>Cảm ơn quý khách đã sử dụng dịch vụ!</em></p>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 500);
      }, 500);
    } catch (error) {
      console.error("Print error:", error);
      setError("Có lỗi xảy ra khi in hóa đơn");
    }
  }, [bill]);

  const handleDownload = useCallback(() => {
    // Placeholder for PDF download functionality
    setError("Tính năng tải PDF sẽ được cập nhật trong phiên bản tiếp theo");
  }, []);

  const fetchBillDetail = useCallback(async () => {
    if (!billId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getBillDetail(billId);
      console.log("Bill detail loaded:", data);
      setBill(data);
    } catch (error) {
      console.error("Error fetching bill detail:", error);
      setError("Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    if (open && billId) {
      fetchBillDetail();
    }
  }, [open, billId, fetchBillDetail]);

  const tableRows = useMemo(() => {
    if (!bill?.items || bill.items.length === 0) {
      return (
        <MDBox sx={{ display: "table-row" }}>
          <MDBox
            sx={{
              display: "table-cell",
              padding: "10px",
              textAlign: "center",
              borderBottom: `1px solid ${styles.borderColor}`,
              color: styles.textColor,
              colSpan: 5,
            }}
          >
            Không có món ăn nào trong hóa đơn
          </MDBox>
        </MDBox>
      );
    }

    return bill.items.map((item, index) => {
      const productName =
        item.item_name ||
        item.menu_item_name ||
        (item.menu_item && item.menu_item.name) ||
        "Không có tên";
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 1);

      return (
        <MDBox
          key={index}
          sx={{
            display: "table-row",
            "&:hover": { backgroundColor: styles.hoverBgColor },
          }}
        >
          <MDBox
            sx={{
              display: "table-cell",
              padding: "8px",
              textAlign: "center",
              borderBottom: `1px solid ${styles.borderColor}`,
              color: styles.textColor,
            }}
          >
            {index + 1}
          </MDBox>
          <MDBox
            sx={{
              display: "table-cell",
              padding: "8px",
              textAlign: "left",
              borderBottom: `1px solid ${styles.borderColor}`,
              color: styles.textColor,
            }}
          >
            {productName}
          </MDBox>
          <MDBox
            sx={{
              display: "table-cell",
              padding: "8px",
              textAlign: "right",
              borderBottom: `1px solid ${styles.borderColor}`,
              color: styles.textColor,
            }}
          >
            {price.toLocaleString("vi-VN")} VNĐ
          </MDBox>
          <MDBox
            sx={{
              display: "table-cell",
              padding: "8px",
              textAlign: "center",
              borderBottom: `1px solid ${styles.borderColor}`,
              color: styles.textColor,
            }}
          >
            {quantity}
          </MDBox>
          <MDBox
            sx={{
              display: "table-cell",
              padding: "8px",
              textAlign: "right",
              borderBottom: `1px solid ${styles.borderColor}`,
              color: styles.textColor,
            }}
          >
            {(price * quantity).toLocaleString("vi-VN")} VNĐ
          </MDBox>
        </MDBox>
      );
    });
  }, [bill?.items, styles]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: darkMode ? theme.palette.background.default : theme.palette.background.paper,
          boxShadow: darkMode ? theme.boxShadows.xxl : theme.boxShadows.lg,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="medium" color={darkMode ? "white" : "dark"}>
            Chi tiết hóa đơn {bill && `#${bill.id}`}
          </MDTypography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </MDBox>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {loading ? (
          <MDBox display="flex" justifyContent="center" p={5}>
            <CircularProgress color="info" />
          </MDBox>
        ) : error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : bill ? (
          <>
            <MDBox id="bill-detail-print">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6" color={darkMode ? "white" : "dark"}>
                      Mã hóa đơn: #{bill.id || "N/A"}
                    </MDTypography>
                    <MDTypography variant="body1" color={styles.textColor}>
                      Ngày: {bill.date ? new Date(bill.date).toLocaleDateString("vi-VN") : "N/A"}
                    </MDTypography>
                  </MDBox>
                  <Divider sx={{ my: 2, borderColor: styles.borderColor }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDTypography variant="body1" color={styles.textColor}>
                    <strong>Khách hàng:</strong> {bill.customer || "Khách vãng lai"}
                  </MDTypography>
                  <MDTypography variant="body1" color={styles.textColor}>
                    <strong>Số điện thoại:</strong> {bill.phone || "N/A"}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDTypography variant="body1" color={styles.textColor}>
                    <strong>Nhân viên:</strong> {bill.staff_name || "N/A"}
                  </MDTypography>
                  <MDTypography variant="body1" color={styles.textColor}>
                    <strong>Điểm tích lũy:</strong> +
                    {bill && bill.total ? Math.floor(Number(bill.total) / 100000) : 0} điểm
                  </MDTypography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2, borderColor: styles.borderColor }} />
                  <MDTypography variant="h6" mb={2} color={darkMode ? "white" : "dark"}>
                    Danh sách món ăn
                  </MDTypography>

                  <MDBox sx={{ width: "100%", overflowX: "auto" }}>
                    <MDBox sx={{ display: "table", width: "100%", borderCollapse: "collapse" }}>
                      {/* Table Header */}
                      <MDBox sx={{ display: "table-header-group" }}>
                        <MDBox sx={{ display: "table-row", backgroundColor: styles.headerBgColor }}>
                          {["STT", "Tên món", "Đơn giá", "SL", "Thành tiền"].map(
                            (header, index) => (
                              <MDBox
                                key={header}
                                sx={{
                                  display: "table-cell",
                                  width:
                                    index === 0
                                      ? "10%"
                                      : index === 1
                                      ? "30%"
                                      : index === 4
                                      ? "25%"
                                      : "17.5%",
                                  padding: "10px",
                                  fontWeight: "bold",
                                  textAlign:
                                    index === 0 || index === 3
                                      ? "center"
                                      : index === 2 || index === 4
                                      ? "right"
                                      : "left",
                                  borderBottom: `2px solid ${styles.borderColor}`,
                                  color: darkMode ? "white" : "inherit",
                                }}
                              >
                                {header}
                              </MDBox>
                            )
                          )}
                        </MDBox>
                      </MDBox>

                      {/* Table Body */}
                      <MDBox sx={{ display: "table-row-group" }}>{tableRows}</MDBox>
                    </MDBox>
                  </MDBox>

                  {/* Total */}
                  {bill.total && (
                    <MDBox
                      mt={2}
                      p={2}
                      sx={{ backgroundColor: styles.headerBgColor, borderRadius: 1 }}
                    >
                      <MDTypography
                        variant="h6"
                        textAlign="right"
                        color={darkMode ? "white" : "dark"}
                      >
                        <strong>Tổng cộng: {Number(bill.total).toLocaleString("vi-VN")} VNĐ</strong>
                      </MDTypography>
                    </MDBox>
                  )}
                </Grid>
              </Grid>
            </MDBox>

            {/* Action Buttons */}
            <MDBox mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Tooltip title="Tải PDF">
                <Fab size="small" color="secondary" onClick={handleDownload}>
                  <Download />
                </Fab>
              </Tooltip>
              <Tooltip title="In hóa đơn">
                <Fab size="small" color="info" onClick={handlePrint}>
                  <Print />
                </Fab>
              </Tooltip>
              <MDButton variant="contained" color="info" onClick={onClose}>
                Đóng
              </MDButton>
            </MDBox>
          </>
        ) : (
          <Alert severity="info">Không tìm thấy thông tin hóa đơn</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}

BillDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  billId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default BillDetail;

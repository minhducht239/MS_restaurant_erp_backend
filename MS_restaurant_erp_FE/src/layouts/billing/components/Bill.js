import { memo } from "react";
import { Card, Icon, Chip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";

const Bill = memo(({ id, customer, phone, total, date, status, onView, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 3,
        },
      }}
    >
      <MDBox p={3} display="flex" flexDirection="column" height="100%">
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium" color="dark">
              Hóa đơn #{id}
            </MDTypography>
            {status && (
              <Chip label={status} size="small" color={getStatusColor(status)} sx={{ mt: 0.5 }} />
            )}
          </MDBox>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatDate(date)}
          </MDTypography>
        </MDBox>

        {/* Customer Info */}
        <MDBox mb={2} flex={1}>
          <MDBox display="flex" alignItems="center" mb={1}>
            <Icon fontSize="small" sx={{ mr: 1, color: "text.secondary" }}>
              person
            </Icon>
            <MDTypography variant="body2" color="text">
              <strong>{customer || "Khách vãng lai"}</strong>
            </MDTypography>
          </MDBox>

          {phone && (
            <MDBox display="flex" alignItems="center" mb={1}>
              <Icon fontSize="small" sx={{ mr: 1, color: "text.secondary" }}>
                phone
              </Icon>
              <MDTypography variant="body2" color="text">
                {phone}
              </MDTypography>
            </MDBox>
          )}

          <MDBox display="flex" alignItems="center">
            <Icon fontSize="small" sx={{ mr: 1, color: "success.main" }}>
              payments
            </Icon>
            <MDTypography variant="h6" fontWeight="medium" color="success">
              {formatCurrency(total)}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Actions */}
        <MDBox display="flex" gap={1} mt="auto">
          <MDButton
            variant="outlined"
            color="info"
            size="small"
            onClick={() => onView(id)}
            startIcon={<Icon>visibility</Icon>}
            fullWidth
          >
            Chi tiết
          </MDButton>
          <MDButton
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onDelete(id)}
            startIcon={<Icon>delete</Icon>}
            fullWidth
          >
            Xóa
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
});

Bill.displayName = "Bill";

Bill.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  customer: PropTypes.string,
  phone: PropTypes.string,
  total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  date: PropTypes.string.isRequired,
  status: PropTypes.string,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Bill.defaultProps = {
  customer: "Khách vãng lai",
  phone: "",
  status: "paid",
};

export default Bill;

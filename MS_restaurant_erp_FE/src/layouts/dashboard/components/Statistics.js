import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, Icon, CircularProgress, Skeleton } from "@mui/material";

function Statistics({ data, loading, error }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Tổng quan kinh doanh
          </MDTypography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={6} lg={3} key={item}>
                <MDBox display="flex" alignItems="center">
                  <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                  <MDBox>
                    <Skeleton variant="text" width={80} height={24} />
                    <Skeleton variant="text" width={100} height={16} />
                  </MDBox>
                </MDBox>
              </Grid>
            ))}
          </Grid>
        </MDBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <MDBox p={3} textAlign="center">
          <Icon color="error" sx={{ fontSize: 48, mb: 1 }}>
            error_outline
          </Icon>
          <MDTypography variant="h6" color="error">
            Không thể tải thống kê
          </MDTypography>
          <MDTypography variant="caption" color="text">
            {error}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const stats = {
    totalBills: data?.totalOrders || 0,
    totalRevenue: data?.monthlyRevenue || 0,
    avgOrderValue: data?.averageOrderValue || 0,
    totalSalaries: data?.totalSalaries || 0,
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("vi-VN").format(number);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const statisticsItems = [
    {
      icon: "receipt_long",
      color: "info",
      value: formatNumber(stats.totalBills),
      label: "Tổng số hóa đơn",
      description: "Hóa đơn đã tạo",
    },
    {
      icon: "monetization_on",
      color: "success",
      value: formatCurrency(stats.totalRevenue),
      label: "Doanh thu tháng",
      description: "Doanh thu hiện tại",
    },
    {
      icon: "shopping_cart",
      color: "warning",
      value: formatCurrency(stats.avgOrderValue),
      label: "Giá trị TB/đơn",
      description: "Trung bình mỗi đơn",
    },
    {
      icon: "people",
      color: "error",
      value: formatCurrency(stats.totalSalaries),
      label: "Tổng lương nhân viên",
      description: "Chi phí nhân sự",
    },
  ];

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6" fontWeight="medium">
            Tổng quan kinh doanh
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Cập nhật: {new Date().toLocaleString("vi-VN")}
          </MDTypography>
        </MDBox>

        <Grid container spacing={2}>
          {statisticsItems.map((item, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <MDBox display="flex" alignItems="center">
                <MDBox
                  bgColor={item.color}
                  color="white"
                  width="3rem"
                  height="3rem"
                  borderRadius="lg"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  shadow="md"
                  mr={2}
                  sx={{
                    background: (theme) =>
                      theme.functions.linearGradient(
                        theme.palette[item.color].main,
                        theme.palette[item.color].dark
                      ),
                  }}
                >
                  <Icon fontSize="medium">{item.icon}</Icon>
                </MDBox>
                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium" lineHeight={1.2}>
                    {item.value}
                  </MDTypography>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    {item.label}
                  </MDTypography>
                  <MDTypography variant="caption" color="text" display="block">
                    {item.description}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Grid>
          ))}
        </Grid>

        <MDBox mt={3} pt={2} sx={{ borderTop: 1, borderColor: "divider" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <MDBox textAlign="center">
                <MDTypography variant="h6" color="success">
                  {stats.totalBills > 0 ? "↗" : "→"}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Xu hướng đơn hàng
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <MDBox textAlign="center">
                <MDTypography variant="h6" color="info">
                  {((stats.totalRevenue / (stats.totalSalaries || 1)) * 100).toFixed(1)}%
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Tỷ lệ doanh thu/chi phí
                </MDTypography>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <MDBox textAlign="center">
                <MDTypography variant="h6" color="warning">
                  {stats.totalBills > 0 ? Math.round(stats.totalRevenue / stats.totalBills) : 0}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  VNĐ/hóa đơn trung bình
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

Statistics.propTypes = {
  data: PropTypes.shape({
    totalOrders: PropTypes.number,
    monthlyRevenue: PropTypes.number,
    averageOrderValue: PropTypes.number,
    totalSalaries: PropTypes.number,
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
};

Statistics.defaultProps = {
  data: {
    totalOrders: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    totalSalaries: 0,
  },
  loading: false,
  error: null,
};

export default Statistics;

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { Grid, Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import PropTypes from "prop-types"; // Thêm PropTypes

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import PieChart from "examples/Charts/PieChart";

function PopularItems({ foodDetails = [], drinkDetails = [] }) {
  // Kiểm tra dữ liệu trống
  const hasFoodData = Array.isArray(foodDetails) && foodDetails.length > 0;
  const hasDrinkData = Array.isArray(drinkDetails) && drinkDetails.length > 0;

  // Tạo dữ liệu biểu đồ từ foodDetails và drinkDetails
  const foodChart = {
    labels: hasFoodData ? foodDetails.map((item) => item.name) : ["Không có dữ liệu"],
    datasets: {
      label: "Món ăn",
      data: hasFoodData ? foodDetails.map((item) => item.value) : [100],
      backgroundColors: ["info", "primary", "dark", "secondary", "success"],
    },
  };

  const drinkChart = {
    labels: hasDrinkData ? drinkDetails.map((item) => item.name) : ["Không có dữ liệu"],
    datasets: {
      label: "Đồ uống",
      data: hasDrinkData ? drinkDetails.map((item) => item.value) : [100],
      backgroundColors: ["info", "success", "primary", "warning", "secondary"],
    },
  };

  const getTrendIcon = (trend) => {
    return trend === "up" ? (
      <Icon fontSize="small" sx={{ color: "success.main" }}>
        trending_up
      </Icon>
    ) : (
      <Icon fontSize="small" sx={{ color: "error.main" }}>
        trending_down
      </Icon>
    );
  };

  // Tính tổng số lượng đã bán an toàn
  const totalFoodSold = hasFoodData
    ? foodDetails.reduce((total, item) => total + (item.sold || 0), 0)
    : 0;
  const totalDrinkSold = hasDrinkData
    ? drinkDetails.reduce((total, item) => total + (item.sold || 0), 0)
    : 0;

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Thực đơn phổ biến
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="caption" color="text">
            Thống kê top 5 món ăn và đồ uống bán chạy nhất tháng này
          </MDTypography>
        </MDBox>
      </MDBox>
      <Grid container spacing={2} sx={{ px: 2 }}>
        {/* Biểu đồ món ăn */}
        <Grid item xs={12} md={6}>
          <MDBox textAlign="center">
            <MDTypography variant="button" fontWeight="medium" color="text">
              Món ăn bán chạy
            </MDTypography>
            <MDBox sx={{ height: 200 }}>
              <PieChart chart={foodChart} height="200px" />
            </MDBox>
          </MDBox>
        </Grid>
        {/* Biểu đồ đồ uống */}
        <Grid item xs={12} md={6}>
          <MDBox textAlign="center">
            <MDTypography variant="button" fontWeight="medium" color="text">
              Đồ uống bán chạy
            </MDTypography>
            <MDBox sx={{ height: 200 }}>
              <PieChart chart={drinkChart} height="200px" />
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
      <Divider sx={{ my: 1 }} />
      {/* Phần danh sách chi tiết */}
      <Grid container spacing={2} sx={{ px: 2, py: 1 }}>
        {/* Danh sách món ăn */}
        <Grid item xs={12} md={6}>
          <MDBox>
            <MDTypography variant="caption" fontWeight="medium" color="text">
              Chi tiết món ăn (số suất đã bán)
            </MDTypography>
            <List dense sx={{ maxHeight: 180, overflow: "auto" }}>
              {hasFoodData ? (
                foodDetails.map((item) => (
                  <ListItem key={item.name} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>{getTrendIcon(item.trend)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <MDBox display="flex" justifyContent="space-between">
                          <MDTypography variant="button">{item.name}</MDTypography>
                          <MDTypography variant="button" fontWeight="medium">
                            {item.sold} suất
                          </MDTypography>
                        </MDBox>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Không có dữ liệu món ăn" />
                </ListItem>
              )}
            </List>
            <MDBox textAlign="center" mt={1}>
              <MDTypography variant="caption" color="text">
                * Tổng số suất món ăn đã bán: {totalFoodSold}
              </MDTypography>
            </MDBox>
          </MDBox>
        </Grid>
        {/* Danh sách đồ uống */}
        <Grid item xs={12} md={6}>
          <MDBox>
            <MDTypography variant="caption" fontWeight="medium" color="text">
              Chi tiết đồ uống (số ly đã bán)
            </MDTypography>
            <List dense sx={{ maxHeight: 180, overflow: "auto" }}>
              {hasDrinkData ? (
                drinkDetails.map((item) => (
                  <ListItem key={item.name} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>{getTrendIcon(item.trend)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <MDBox display="flex" justifyContent="space-between">
                          <MDTypography variant="button">{item.name}</MDTypography>
                          <MDTypography variant="button" fontWeight="medium">
                            {item.sold} ly
                          </MDTypography>
                        </MDBox>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="Không có dữ liệu đồ uống" />
                </ListItem>
              )}
            </List>
            <MDBox textAlign="center" mt={1}>
              <MDTypography variant="caption" color="text">
                * Tổng số đồ uống đã bán: {totalDrinkSold}
              </MDTypography>
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
    </Card>
  );
}

// Thêm kiểm tra kiểu dữ liệu với PropTypes
PopularItems.propTypes = {
  foodDetails: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      sold: PropTypes.number.isRequired,
      trend: PropTypes.oneOf(["up", "down"]).isRequired,
    })
  ),
  drinkDetails: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      sold: PropTypes.number.isRequired,
      trend: PropTypes.oneOf(["up", "down"]).isRequired,
    })
  ),
};

export default PopularItems;

import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import { Alert, Skeleton, Box } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";

// Services
import { getBills, getMonthlyRevenue } from "services/BillingService";
import { getStaff } from "services/StaffService";
import { getWeeklyRevenue, getTopSellingItems } from "services/DashboardService";

// Dashboard components
import Tablestate from "layouts/dashboard/components/Reservation";
import PopularItems from "layouts/dashboard/components/PopularItems";
import Statistics from "layouts/dashboard/components/Statistics";

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardLayout>
          <DashboardNavbar />
          <MDBox py={3}>
            <Alert severity="error" sx={{ mb: 3 }}>
              Dashboard gặp lỗi không mong muốn. Vui lòng làm mới trang.
            </Alert>
          </MDBox>
          <Footer />
        </DashboardLayout>
      );
    }

    return this.props.children;
  }
}

DashboardErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      averageOrderValue: 0,
      monthlyRevenue: 0,
      totalSalaries: 0,
    },
    weeklyRevenue: {
      labels: [],
      datasets: { label: "", data: [] },
    },
    monthlyRevenue: {
      labels: [],
      datasets: { label: "", data: [] },
    },
    popularItems: {
      food: [],
      drinks: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fallbackData = useMemo(
    () => ({
      monthlyRevenue: [
        5000000, 7500000, 9000000, 8500000, 10000000, 11000000, 12000000, 10500000, 9800000,
        11500000, 13000000, 14000000,
      ],
      weeklyRevenue: [1200000, 1500000, 1800000, 2000000, 2200000, 2500000, 2800000],
      popularItems: {
        food: [
          { name: "Gà rán", value: 35, sold: 24, trend: "up" },
          { name: "Phở bò", value: 25, sold: 18, trend: "up" },
          { name: "Bánh mì", value: 20, sold: 14, trend: "down" },
          { name: "Cơm tấm", value: 15, sold: 10, trend: "up" },
          { name: "Bún chả", value: 5, sold: 3, trend: "down" },
        ],
        drinks: [
          { name: "Trà sữa", value: 40, sold: 28, trend: "up" },
          { name: "Cà phê", value: 30, sold: 21, trend: "up" },
          { name: "Nước cam", value: 15, sold: 10, trend: "down" },
          { name: "Sinh tố", value: 10, sold: 7, trend: "up" },
          { name: "Nước ngọt", value: 5, sold: 4, trend: "down" },
        ],
      },
    }),
    []
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching dashboard data...");

      const results = await Promise.allSettled([
        getMonthlyRevenue(),
        getTopSellingItems(),
        getBills({ limit: 1000 }),
        getStaff({ limit: 1000 }),
        getWeeklyRevenue(),
      ]);

      const [monthlyRes, topItemsRes, billsRes, staffRes, weeklyRes] = results;

      let monthlyRevenueData = fallbackData.monthlyRevenue;
      if (monthlyRes.status === "fulfilled" && Array.isArray(monthlyRes.value)) {
        const hasData = monthlyRes.value.some((val) => val > 0);
        if (hasData) {
          monthlyRevenueData = monthlyRes.value;
        }
      }

      let weeklyRevenueData = fallbackData.weeklyRevenue;
      if (weeklyRes.status === "fulfilled" && Array.isArray(weeklyRes.value)) {
        weeklyRevenueData = weeklyRes.value;
      }

      let popularItems = fallbackData.popularItems;
      if (topItemsRes.status === "fulfilled" && topItemsRes.value) {
        const items = topItemsRes.value;
        if (items.food?.length > 0 || items.drinks?.length > 0) {
          popularItems = items;
        }
      }

      let totalOrders = 0;
      let averageOrderValue = 0;
      let monthlyRevenue = 0;

      if (billsRes.status === "fulfilled" && billsRes.value) {
        const billsData = billsRes.value;
        totalOrders = billsData.count || 0;

        const bills = billsData.results || [];
        const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
        averageOrderValue = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;

        // Get current month revenue
        const currentMonth = new Date().getMonth();
        monthlyRevenue = monthlyRevenueData[currentMonth] || 0;
      }

      let totalSalaries = 0;
      if (staffRes.status === "fulfilled" && staffRes.value?.results) {
        totalSalaries = staffRes.value.results.reduce(
          (sum, staff) => sum + Number(staff.salary || 0),
          0
        );
      }

      setDashboardData({
        stats: {
          totalOrders,
          averageOrderValue,
          monthlyRevenue,
          totalSalaries,
        },
        weeklyRevenue: {
          labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
          datasets: { label: "VNĐ", data: weeklyRevenueData },
        },
        monthlyRevenue: {
          labels: [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
          ],
          datasets: { label: "VNĐ", data: monthlyRevenueData },
        },
        popularItems,
      });

      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Critical error in dashboard:", error);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [fallbackData]);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const LoadingSkeleton = () => (
    <MDBox py={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={120} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
      </Grid>
    </MDBox>
  );

  return (
    <DashboardErrorBoundary>
      <DashboardLayout>
        <DashboardNavbar />

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <MDBox py={3}>
            <Alert
              severity="error"
              action={
                <button onClick={handleRetry} style={{ marginLeft: 10 }}>
                  Thử lại
                </button>
              }
            >
              {error}
            </Alert>
          </MDBox>
        ) : (
          <MDBox py={3}>
            <MDBox mb={3}>
              <Statistics data={dashboardData.stats} loading={loading} error={error} />
            </MDBox>

            <MDBox mt={4.5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox mb={3}>
                    <ReportsLineChart
                      color="success"
                      title="Doanh thu tuần"
                      description="Doanh thu theo ngày trong tuần hiện tại"
                      date={`Tuần ${Math.ceil(
                        new Date().getDate() / 7
                      )} - ${new Date().toLocaleDateString("vi-VN")}`}
                      chart={dashboardData.weeklyRevenue}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <MDBox mb={3}>
                    <ReportsLineChart
                      color="dark"
                      title="Doanh thu tháng"
                      description="Doanh thu theo tháng trong năm hiện tại"
                      date={`Năm ${new Date().getFullYear()}`}
                      chart={dashboardData.monthlyRevenue}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            <MDBox>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={8}>
                  <Tablestate />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <PopularItems
                    foodDetails={dashboardData.popularItems.food}
                    drinkDetails={dashboardData.popularItems.drinks}
                  />
                </Grid>
              </Grid>
            </MDBox>
          </MDBox>
        )}

        <Footer />
      </DashboardLayout>
    </DashboardErrorBoundary>
  );
}

export default Dashboard;

import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CircularProgress,
  Icon,
  InputAdornment,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import BillGrid from "./components/BillGrid";
import BillDetail from "./components/BillDetail";
import { getBills, deleteBill, getMonthlyRevenue } from "services/BillingService";
import Alert from "@mui/material/Alert";
import MDInput from "components/MDInput";
import { generateRevenueData } from "./components/IncomeGraphdata";

function Billing() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBills, setTotalBills] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [revenueData, setRevenueData] = useState(Array(12).fill(0));

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

  // Filter States
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    search: "",
    showAll: false,
    sort: "date_desc",
  });

  const formatDate = useCallback((dateString) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;

    // Format to YYYY-MM-DD for API
    return date.toISOString().split("T")[0];
  }, []);

  // const apiParams = useMemo(() => {
  //   // ... code
  // }, [currentPage, filters, formatDate]);

  const fetchBills = useCallback(
    async (page = 1, customFilters = null) => {
      setIsLoading(true);
      setError(null);

      try {
        const activeFilters = customFilters || filters;
        const params = {
          page,
          limit: activeFilters.showAll ? 100 : 10,
          from_date: formatDate(activeFilters.from_date),
          to_date: formatDate(activeFilters.to_date),
          search: activeFilters.search?.trim() || undefined,
          sort: activeFilters.sort || "date_desc",
        };

        // Remove undefined params
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== undefined)
        );

        console.log("API Request params:", cleanParams);

        const data = await getBills(cleanParams);

        setBills(data.results || []);
        setTotalPages(Math.ceil((data.count || 0) / params.limit));
        setCurrentPage(page);
        setTotalBills(data.count || 0);

        // Calculate total amount more efficiently
        const sum = (data.results || []).reduce(
          (total, bill) => total + Number(bill.total || 0),
          0
        );
        setTotalAmount(sum);
      } catch (error) {
        setError("Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.");
        console.error("Error fetching bills:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, formatDate]
  );

  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleFilterChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Auto-search for text input with debounce
      if (name === "search") {
        if (searchTimeout) clearTimeout(searchTimeout);

        const timeout = setTimeout(() => {
          fetchBills(1, { ...filters, [name]: value });
        }, 500);

        setSearchTimeout(timeout);
      }
    },
    [filters, fetchBills, searchTimeout]
  );

  const applyFilters = useCallback(() => {
    console.log("Applying filters:", filters);
    fetchBills(1, filters);
  }, [filters, fetchBills]);

  const resetFilters = useCallback(() => {
    const resetState = {
      from_date: "",
      to_date: "",
      search: "",
      showAll: false,
      sort: "date_desc",
    };
    setFilters(resetState);
    fetchBills(1, resetState);
  }, [fetchBills]);

  const fetchRevenueData = useCallback(async () => {
    try {
      const data = await getMonthlyRevenue();
      setRevenueData(data);
    } catch (error) {
      console.error("Error fetching revenue data:", error);

      setRevenueData(Array(12).fill(0));
    }
  }, []);

  const handleView = useCallback((id) => {
    setSelectedBillId(id);
    setShowDetail(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedBillId(null);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) {
        try {
          await deleteBill(id);
          fetchBills(currentPage);
        } catch (error) {
          setError("Không thể xóa hóa đơn. Vui lòng thử lại sau.");
        }
      }
    },
    [currentPage, fetchBills]
  );

  const handlePageChange = useCallback(
    (event, page) => {
      fetchBills(page);
    },
    [fetchBills]
  );

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  useEffect(() => {
    fetchBills();
  }, []); // Only on mount

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const chartData = useMemo(() => {
    return generateRevenueData(revenueData);
  }, [revenueData]);

  return (
    <DashboardLayout>
      <DashboardNavbar absolute isMini />
      <MDBox mt={8}>
        {/* Revenue Chart */}
        <MDBox mb={3}>
          <ReportsBarChart
            color="info"
            title="Biểu đồ doanh thu theo tháng"
            description="Tổng doanh thu nhà hàng theo từng tháng"
            date={`${new Date().getFullYear()}`}
            chart={chartData}
          />
        </MDBox>

        {/* Bills Management */}
        <MDBox mt={8} p={3}>
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h6" fontWeight="medium">
                    Danh sách hóa đơn
                  </MDTypography>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => navigate("/create-payment-bill")}
                    startIcon={<Icon>add</Icon>}
                  >
                    Tạo hóa đơn thanh toán
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>

            {/* Statistics */}
            {!isLoading && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={2} display="flex" justifyContent="space-between">
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      Tìm thấy: <strong>{totalBills.toLocaleString()}</strong> hóa đơn
                    </MDTypography>
                    <MDTypography variant="button" fontWeight="medium" color="info">
                      Tổng giá trị: <strong>{totalAmount.toLocaleString("vi-VN")} VNĐ</strong>
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            )}

            {/* Filters */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Tra cứu hóa đơn
                  </MDTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <MDInput
                        fullWidth
                        label="Từ ngày"
                        type="date"
                        name="from_date"
                        value={filters.from_date}
                        onChange={handleFilterChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MDInput
                        fullWidth
                        label="Đến ngày"
                        type="date"
                        name="to_date"
                        value={filters.to_date}
                        onChange={handleFilterChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDInput
                        fullWidth
                        label="Tìm kiếm"
                        placeholder="Tên khách hàng, SĐT, mã hóa đơn..."
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Icon>search</Icon>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={applyFilters}
                        fullWidth
                        startIcon={<Icon>search</Icon>}
                      >
                        Tìm kiếm
                      </MDButton>
                    </Grid>

                    {/* Filter controls */}
                    <Grid item xs={12}>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <MDBox>
                          <FormControl size="small" sx={{ minWidth: 140, mr: 2 }}>
                            <InputLabel>Sắp xếp</InputLabel>
                            <Select
                              value={filters.sort}
                              name="sort"
                              onChange={handleFilterChange}
                              label="Sắp xếp"
                            >
                              <MenuItem value="date_desc">Ngày gần nhất</MenuItem>
                              <MenuItem value="date_asc">Ngày xa nhất</MenuItem>
                              <MenuItem value="total_desc">Giá trị cao nhất</MenuItem>
                              <MenuItem value="total_asc">Giá trị thấp nhất</MenuItem>
                            </Select>
                          </FormControl>
                          <MDButton
                            variant="text"
                            color="secondary"
                            onClick={resetFilters}
                            startIcon={<Icon>refresh</Icon>}
                          >
                            Làm mới
                          </MDButton>
                        </MDBox>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={filters.showAll}
                              onChange={(e) =>
                                setFilters((prev) => ({ ...prev, showAll: e.target.checked }))
                              }
                              color="info"
                            />
                          }
                          label="Hiển thị tất cả"
                        />
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {/* Error Display */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Grid>
            )}

            {/* Bills Grid */}
            <Grid item xs={12}>
              {isLoading ? (
                <MDBox display="flex" justifyContent="center" p={5}>
                  <CircularProgress color="info" />
                </MDBox>
              ) : (
                <BillGrid
                  bills={bills}
                  onView={handleView}
                  onDelete={handleDelete}
                  loading={isLoading}
                />
              )}
            </Grid>

            {!isLoading && totalPages > 1 && (
              <Grid item xs={12}>
                <MDBox display="flex" justifyContent="center" p={3}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </MDBox>
              </Grid>
            )}
          </Grid>
        </MDBox>
      </MDBox>

      {/* Bill Detail Modal */}
      {showDetail && (
        <BillDetail open={showDetail} onClose={handleCloseDetail} billId={selectedBillId} />
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default Billing;

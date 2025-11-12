import { memo } from "react";
import PropTypes from "prop-types";
import { Grid, Skeleton, Box } from "@mui/material";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import Bill from "./Bill";

const BillGrid = memo(({ bills, onView, onDelete, loading = false }) => {
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
          <Box p={3}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="50%" height={20} />
            <Box display="flex" gap={1} mt={2}>
              <Skeleton variant="rectangular" width={80} height={32} />
              <Skeleton variant="rectangular" width={60} height={32} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  const EmptyState = () => (
    <Grid item xs={12}>
      <MDBox
        p={6}
        textAlign="center"
        sx={{
          backgroundColor: "grey.50",
          borderRadius: 2,
          border: "2px dashed",
          borderColor: "grey.300",
        }}
      >
        <MDTypography variant="h6" color="text.secondary" mb={1}>
          📄 Không có hóa đơn nào
        </MDTypography>
        <MDTypography variant="body2" color="text.secondary">
          Hãy tạo hóa đơn đầu tiên của bạn
        </MDTypography>
      </MDBox>
    </Grid>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Grid container spacing={3}>
      {bills && bills.length > 0 ? (
        bills.map((bill) => (
          <Grid item xs={12} md={6} lg={4} key={bill.id}>
            <Bill
              id={bill.id}
              customer={bill.customer}
              phone={bill.phone}
              total={bill.total}
              date={bill.date}
              status={bill.status}
              onView={onView}
              onDelete={onDelete}
            />
          </Grid>
        ))
      ) : (
        <EmptyState />
      )}
    </Grid>
  );
});

BillGrid.displayName = "BillGrid";

BillGrid.propTypes = {
  bills: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default BillGrid;

import { useState, useEffect, useMemo, useCallback } from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Button from "@mui/material/Button";
import { Alert, Skeleton } from "@mui/material";
import AddEditDialog from "./ReservationForm";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDPagination from "components/MDPagination";

import DataTable from "examples/Tables/DataTable";

import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from "services/ReservationService";

function Tablestate() {
  const columns = [
    { Header: "Tên khách hàng", accessor: "name", width: "20%" },
    { Header: "Số người", accessor: "people", width: "15%" },
    { Header: "Số điện thoại", accessor: "phone", width: "20%" },
    { Header: "Thời gian", accessor: "time", width: "20%" },
    { Header: "Ngày", accessor: "date", width: "15%" },
  ];

  const [state, setState] = useState({
    rows: [],
    loading: true,
    currentPage: 1,
    totalPages: 1,
    error: null,
    deleteMode: false,
  });

  const [dialogs, setDialogs] = useState({
    openAdd: false,
    openEdit: false,
  });

  const [formData, setFormData] = useState({
    add: { name: "", people: "", phone: "", time: "", date: "" },
    edit: { name: "", people: "", phone: "", time: "", date: "" },
  });

  const [selectedRow, setSelectedRow] = useState(null);

  const validateReservationForm = useCallback((data) => {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = "Tên khách hàng không được để trống";
    }

    if (!data.phone?.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9+\-\s]{10,15}$/.test(data.phone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ (10-15 số)";
    }

    if (!data.people || parseInt(data.people) < 1) {
      errors.people = "Số người phải ít nhất 1";
    } else if (parseInt(data.people) > 20) {
      errors.people = "Số người không được quá 20";
    }

    if (!data.date) {
      errors.date = "Vui lòng chọn ngày";
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = "Không thể đặt bàn cho ngày trong quá khứ";
      }
    }

    if (!data.time) {
      errors.time = "Vui lòng chọn thời gian";
    }

    return errors;
  }, []);

  const fetchReservations = useCallback(async (page = 1) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const data = await getReservations({ page, limit: 6 });

      setState((prev) => ({
        ...prev,
        rows: data.results || [],
        totalPages: Math.ceil((data.count || 0) / 6),
        currentPage: page,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setState((prev) => ({
        ...prev,
        error: "Không thể tải danh sách đặt bàn. Vui lòng thử lại sau.",
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleAddRow = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      add: { name: "", people: "", phone: "", time: "", date: "" },
    }));
    setDialogs((prev) => ({ ...prev, openAdd: true }));
  }, []);

  const handleAddChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      add: { ...prev.add, [field]: value },
    }));
  }, []);

  const handleAddSave = useCallback(async () => {
    const errors = validateReservationForm(formData.add);

    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, error: Object.values(errors)[0] }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));
      await createReservation(formData.add);

      setDialogs((prev) => ({ ...prev, openAdd: false }));
      setFormData((prev) => ({
        ...prev,
        add: { name: "", people: "", phone: "", time: "", date: "" },
      }));

      await fetchReservations(state.currentPage);
    } catch (error) {
      console.error("Error adding reservation:", error);
      setState((prev) => ({
        ...prev,
        error: "Không thể thêm đặt bàn. Vui lòng kiểm tra lại thông tin.",
        loading: false,
      }));
    }
  }, [formData.add, validateReservationForm, fetchReservations, state.currentPage]);

  const handleEditClick = useCallback((row) => {
    setSelectedRow(row);
    setFormData((prev) => ({ ...prev, edit: { ...row } }));
    setDialogs((prev) => ({ ...prev, openEdit: true }));
  }, []);

  const handleEditChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      edit: { ...prev.edit, [field]: value },
    }));
  }, []);

  const handleEditSave = useCallback(async () => {
    const errors = validateReservationForm(formData.edit);

    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, error: Object.values(errors)[0] }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));
      await updateReservation(selectedRow.id, formData.edit);

      setDialogs((prev) => ({ ...prev, openEdit: false }));
      setSelectedRow(null);

      await fetchReservations(state.currentPage);
    } catch (error) {
      console.error("Error updating reservation:", error);
      setState((prev) => ({
        ...prev,
        error: "Không thể cập nhật đặt bàn. Vui lòng kiểm tra lại thông tin.",
        loading: false,
      }));
    }
  }, [formData.edit, selectedRow, validateReservationForm, fetchReservations, state.currentPage]);

  const handleDelete = useCallback(
    async (rowId) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa đơn đặt này?")) return;

      try {
        setState((prev) => ({ ...prev, loading: true }));
        await deleteReservation(rowId);
        await fetchReservations(state.currentPage);
      } catch (error) {
        console.error("Error deleting reservation:", error);
        setState((prev) => ({
          ...prev,
          error: "Không thể xóa đặt bàn. Vui lòng thử lại sau.",
          loading: false,
        }));
      }
    },
    [fetchReservations, state.currentPage]
  );

  const toggleDeleteMode = useCallback(() => {
    setState((prev) => ({ ...prev, deleteMode: !prev.deleteMode }));
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      fetchReservations(page);
    },
    [fetchReservations]
  );

  const handleCloseDialog = useCallback((type) => {
    setDialogs((prev) => ({ ...prev, [type]: false }));
    if (type === "openEdit") {
      setSelectedRow(null);
    }
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const renderRows = useMemo(() => {
    return state.rows.map((row) => ({
      ...row,
      actions: (
        <MDBox display="flex" gap={1}>
          {!state.deleteMode ? (
            <Button
              size="small"
              color="primary"
              onClick={() => handleEditClick(row)}
              startIcon={<Icon>edit</Icon>}
            >
              Sửa
            </Button>
          ) : (
            <Button
              size="small"
              color="error"
              onClick={() => handleDelete(row.id)}
              startIcon={<Icon>delete</Icon>}
            >
              Xóa
            </Button>
          )}
        </MDBox>
      ),
    }));
  }, [state.rows, state.deleteMode, handleEditClick, handleDelete]);

  if (state.loading && state.rows.length === 0) {
    return (
      <Card sx={{ height: "100%" }}>
        <MDBox p={3}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
        </MDBox>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6">Danh sách đặt bàn</MDTypography>
          <MDTypography variant="caption" color="text">
            Quản lý các đơn đặt bàn của khách hàng
          </MDTypography>
        </MDBox>
        <MDBox display="flex" gap={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddRow}
            startIcon={<Icon>add</Icon>}
            size="small"
          >
            Thêm
          </Button>
          <Button
            variant={state.deleteMode ? "contained" : "outlined"}
            color={state.deleteMode ? "success" : "error"}
            onClick={toggleDeleteMode}
            startIcon={<Icon>{state.deleteMode ? "close" : "delete"}</Icon>}
            size="small"
          >
            {state.deleteMode ? "Hủy" : "Xóa"}
          </Button>
        </MDBox>
      </MDBox>

      {/* Error Alert */}
      {state.error && (
        <MDBox px={3} pb={2}>
          <Alert severity="error" onClose={() => setState((prev) => ({ ...prev, error: null }))}>
            {state.error}
          </Alert>
        </MDBox>
      )}

      {/* Data Table */}
      <MDBox flex={1} sx={{ overflow: "auto", minHeight: 0 }}>
        <DataTable
          table={{
            columns: [...columns, { Header: "Thao tác", accessor: "actions" }],
            rows: renderRows,
          }}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
          canSearch={false}
          showTotalEntries={false}
        />
      </MDBox>

      {/* Pagination */}
      {state.totalPages > 1 && (
        <MDBox
          mt="auto"
          display="flex"
          justifyContent="center"
          p={2}
          sx={{ borderTop: 1, borderColor: "divider" }}
        >
          <MDPagination>
            <MDPagination
              item
              onClick={() => handlePageChange(1)}
              disabled={state.currentPage === 1}
            >
              <Icon>keyboard_double_arrow_left</Icon>
            </MDPagination>
            <MDPagination
              item
              onClick={() => handlePageChange(state.currentPage - 1)}
              disabled={state.currentPage === 1}
            >
              <Icon>keyboard_arrow_left</Icon>
            </MDPagination>

            {Array.from({ length: Math.min(state.totalPages, 5) }, (_, index) => {
              const pageNum = Math.max(1, state.currentPage - 2) + index;
              if (pageNum <= state.totalPages) {
                return (
                  <MDPagination
                    key={pageNum}
                    item
                    active={state.currentPage === pageNum}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </MDPagination>
                );
              }
              return null;
            })}

            <MDPagination
              item
              onClick={() => handlePageChange(state.currentPage + 1)}
              disabled={state.currentPage === state.totalPages}
            >
              <Icon>keyboard_arrow_right</Icon>
            </MDPagination>
            <MDPagination
              item
              onClick={() => handlePageChange(state.totalPages)}
              disabled={state.currentPage === state.totalPages}
            >
              <Icon>keyboard_double_arrow_right</Icon>
            </MDPagination>
          </MDPagination>
        </MDBox>
      )}

      {/* Dialogs */}
      <AddEditDialog
        open={dialogs.openAdd}
        title="Thêm đặt bàn mới"
        formData={formData.add}
        onChange={handleAddChange}
        onSave={handleAddSave}
        onCancel={() => handleCloseDialog("openAdd")}
      />

      <AddEditDialog
        open={dialogs.openEdit}
        title="Chỉnh sửa đặt bàn"
        formData={formData.edit}
        onChange={handleEditChange}
        onSave={handleEditSave}
        onCancel={() => handleCloseDialog("openEdit")}
      />
    </Card>
  );
}

export default Tablestate;

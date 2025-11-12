import { useState, useCallback } from "react";
import {
  getTables,
  getTableOrders,
  createTable,
  deleteTable,
  createBillFromTable,
  updateTableStatus as updateTableStatusAPI,
  addOrderToTable,
} from "services/TableService";

function useTableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableOrders, setTableOrders] = useState([]);

  // Fetch tables
  const fetchTables = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log("⏳ Đang gọi API lấy danh sách bàn...");

      const data = await getTables(filters);
      console.log("✅ Dữ liệu bàn nhận được:", data);

      if (!data || !Array.isArray(data)) {
        console.error("❌ Dữ liệu API không đúng định dạng:", data);
        setTables([]);
        return [];
      }

      // Đảm bảo floor là kiểu số
      const processedData = data.map((table) => ({
        ...table,
        floor: Number(table.floor), // Chuyển đổi floor thành số
      }));

      console.log("🔧 Dữ liệu sau khi chuẩn hóa:", processedData);

      // Cập nhật state với dữ liệu đã chuẩn hóa
      setTables(processedData);
      return processedData;
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách bàn:", error);
      setError("Không thể tải danh sách bàn. Vui lòng thử lại.");
      setTables([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm định nghĩa cho fetchTableOrders - đây là hàm đang bị thiếu
  const fetchTableOrders = useCallback(async (table) => {
    if (!table || !table.id) {
      console.error("Không thể lấy thông tin món cho bàn không xác định");
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`⏳ Đang lấy danh sách món cho bàn ${table.id}...`);

      const data = await getTableOrders(table.id);
      console.log(` Dữ liệu món của bàn ${table.id}:`, data);

      setTableOrders(data);
      return data;
    } catch (error) {
      console.error(` Lỗi khi lấy danh sách món cho bàn ${table.id}:`, error);
      setError("Không thể lấy danh sách món. Vui lòng thử lại.");
      setTableOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add table
  const addTable = useCallback(
    async (tableData) => {
      try {
        setLoading(true);
        setError(null);
        await createTable(tableData);
        await fetchTables(); // Refresh tables after adding
        return true;
      } catch (error) {
        console.error("Error adding table:", error);
        setError(error.message || "Không thể thêm bàn. Vui lòng thử lại sau.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTables]
  );

  // Remove table
  const removeTable = useCallback(
    async (tableId) => {
      try {
        setLoading(true);
        setError(null);
        await deleteTable(tableId);
        await fetchTables(); // Refresh tables after deleting
        return true;
      } catch (error) {
        console.error("Error removing table:", error);
        setError(error.message || "Không thể xóa bàn. Vui lòng thử lại sau.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchTables]
  );

  // Create bill
  const createBill = useCallback(async (tableId, billData = {}) => {
    try {
      setLoading(true);
      setError("");

      console.log("🧾 Hook createBill called:", { tableId, billData });

      const result = await createBillFromTable(tableId, billData);

      console.log("🔍 Hook createBill result:", result);
      console.log("🔍 Result type:", typeof result);
      console.log("🔍 Result keys:", result ? Object.keys(result) : "null");

      return result;
    } catch (error) {
      console.error("❌ Error in hook createBill:", error);
      setError("Không thể tạo hóa đơn");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  // Update table status
  const updateTableStatus = useCallback(async (tableId, newStatus) => {
    console.log("🔄 Hook updateTableStatus called:");
    console.log("- tableId:", tableId, typeof tableId);
    console.log("- newStatus:", newStatus);

    if (!tableId) {
      console.error("❌ updateTableStatus: tableId is required");
      throw new Error("Table ID is required");
    }

    if (!newStatus) {
      console.error("❌ updateTableStatus: newStatus is required");
      throw new Error("Status is required");
    }

    try {
      setLoading(true);

      const response = await updateTableStatusAPI(tableId, newStatus); // ← SỬA: Đổi từ updateTableStatus thành updateTableStatusAPI
      console.log("✅ API updateTableStatus response:", response);

      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === tableId || table.id === Number(tableId)
            ? { ...table, status: newStatus }
            : table
        )
      );

      console.log(`✅ Table ${tableId} status updated to ${newStatus} in local state`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating table ${tableId} status:`, error);
      setError(`Không thể cập nhật trạng thái bàn: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tables,
    loading,
    error,
    selectedTable,
    setSelectedTable,
    tableOrders,
    fetchTables,
    fetchTableOrders,
    addTable,
    removeTable,
    createBill,
    updateTableStatus,
    setError,
    setLoading,
  };
}

export default useTableManagement;

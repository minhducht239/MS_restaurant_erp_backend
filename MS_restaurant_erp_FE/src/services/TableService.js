import axios from "axios";
import { API_BASE_URL } from "./config";

// Hàm lấy header xác thực
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lấy danh sách bàn với khả năng lọc
export const getTables = async (filters = {}) => {
  try {
    console.log("Getting tables with filters:", filters);
    const { floor, status } = filters;
    let url = `${API_BASE_URL}/api/tables/`;

    // Thêm query params nếu có
    const params = new URLSearchParams();
    if (floor !== undefined) params.append("floor", floor);
    if (status) params.append("status", status);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log("API URL for tables:", url);

    const response = await axios.get(url, {
      headers: getAuthHeader(),
    });

    console.log("Tables API response:", response);
    console.log("Tables data:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    // Log chi tiết lỗi
    if (error.response) {
      console.error("Status code:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
  }
};

// Lấy chi tiết bàn
export const getTableDetails = async (tableId) => {
  if (!tableId) throw new Error("Table ID is required");

  try {
    const response = await axios.get(`${API_BASE_URL}/api/tables/${tableId}/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching table ${tableId}:`, error);
    if (error.response && error.response.status === 404) {
      throw new Error("Không tìm thấy bàn");
    }
    throw error;
  }
};

// Lấy danh sách món đã gọi của bàn
export const getTableOrders = async (tableId) => {
  if (!tableId) throw new Error("Table ID is required");

  try {
    const response = await axios.get(`${API_BASE_URL}/api/tables/${tableId}/orders/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for table ${tableId}:`, error);
    throw error;
  }
};

// Cập nhật trạng thái bàn
export const updateTableStatus = async (tableId, status) => {
  if (!tableId) {
    console.error("❌ updateTableStatus: Table ID is required");
    throw new Error("Table ID is required");
  }

  if (!status) {
    console.error("❌ updateTableStatus: Status is required");
    throw new Error("Status is required");
  }

  try {
    console.log(`🔄 API: Updating table ${tableId} status to: ${status}`);

    const response = await axios.patch(
      `${API_BASE_URL}/api/tables/${tableId}/`,
      { status },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API: Table status updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ API: Error updating table ${tableId} status:`, error);
    throw error;
  }
};

// Thêm món vào bàn
export const addOrderToTable = async (tableId, items) => {
  if (!tableId) throw new Error("Table ID is required");
  if (!items || !items.length) throw new Error("Items are required");

  try {
    console.log(`🍽️ Adding items to table ${tableId}:`, items);

    const response = await axios.post(
      `${API_BASE_URL}/api/tables/${tableId}/add_order/`,
      { items }, // Gửi items đã được merge
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Items added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error adding orders to table ${tableId}:`, error);
    throw error;
  }
};

// Tạo hóa đơn từ bàn
export const createBillFromTable = async (tableId, billData = {}) => {
  console.log("🧾 API: Creating bill from table");
  console.log("- tableId:", tableId, typeof tableId);
  console.log("- billData:", billData);

  if (!tableId) {
    console.error("❌ API: Table ID is required");
    throw new Error("Table ID is required");
  }

  try {
    const requestData = {
      date: billData.date || new Date().toISOString().split("T")[0],
    };

    console.log("📤 Sending bill creation request:");
    console.log("- URL:", `${API_BASE_URL}/api/tables/${tableId}/create_bill/`);
    console.log("- Data:", requestData);

    const response = await axios.post(
      `${API_BASE_URL}/api/tables/${tableId}/create_bill/`,
      requestData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Raw axios response:", response);
    console.log("✅ Response status:", response.status);
    console.log("✅ Response data:", response.data);
    console.log("✅ Response data type:", typeof response.data);
    console.log("✅ Response data keys:", response.data ? Object.keys(response.data) : "null");

    return response.data;
  } catch (error) {
    console.error("❌ Error creating bill:", error);

    if (error.response) {
      console.error("- Status:", error.response.status);
      console.error("- Data:", error.response.data);

      if (error.response.status === 400) {
        throw new Error(error.response.data?.detail || "Dữ liệu không hợp lệ");
      } else if (error.response.status === 404) {
        throw new Error("Không tìm thấy bàn");
      } else if (error.response.status === 500) {
        throw new Error("Lỗi server khi tạo hóa đơn");
      }

      throw new Error(
        `Lỗi ${error.response.status}: ${error.response.data?.detail || "Không xác định"}`
      );
    } else if (error.request) {
      throw new Error("Không thể kết nối đến server");
    } else {
      throw new Error(`Lỗi request: ${error.message}`);
    }
  }
};

// Thêm bàn mới
export const createTable = async (tableData) => {
  if (!tableData || !tableData.name) throw new Error("Table name is required");

  try {
    const response = await axios.post(`${API_BASE_URL}/api/tables/`, tableData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating table:`, error);

    // Xử lý các lỗi validation từ server
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }

    throw error;
  }
};

// Xóa bàn
export const deleteTable = async (tableId) => {
  if (!tableId) throw new Error("Table ID is required");

  try {
    const response = await axios.delete(`${API_BASE_URL}/api/tables/${tableId}/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting table ${tableId}:`, error);

    // Xử lý các lỗi cụ thể
    if (error.response && error.response.status === 403) {
      throw new Error("Không thể xóa bàn đang có khách");
    }

    throw error;
  }
};

import axios from "axios";
import { API_BASE_URL } from "./config";

// Hàm lấy header xác thực
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCustomers = async (page = 1, filters = {}, forceRefresh = false) => {
  console.log(`🚀 [FIXED] API Call:`, { page, filters, forceRefresh });
  console.log("🔑 Token:", localStorage.getItem("access_token")?.substring(0, 10) + "...");

  try {
    // Build query parameters
    const params = {
      page,
      limit: 10,
    };

    // THÊM: Cache busting khi force refresh hoặc có bill update
    if (forceRefresh || window.customerDataNeedRefresh) {
      params._t = new Date().getTime();
      params._refresh = "true";
      console.log("🔄 Added cache busting timestamp:", params._t);

      // Reset flag
      window.customerDataNeedRefresh = false;
    }

    if (filters.search && filters.search.trim()) {
      params.search = filters.search.trim();
      console.log("🔍 Added search filter:", params.search);
    }

    if (filters.loyaltyRange && filters.loyaltyRange !== "all") {
      const range = filters.loyaltyRange;
      console.log("⭐ Processing loyalty range:", range);

      if (range === "0-50") {
        params.loyalty_points_min = 0;
        params.loyalty_points_max = 50;
      } else if (range === "51-100") {
        params.loyalty_points_min = 51;
        params.loyalty_points_max = 100;
      } else if (range === "101-200") {
        params.loyalty_points_min = 101;
        params.loyalty_points_max = 200;
      } else if (range === "200+") {
        params.loyalty_points_min = 200;
        // Don't set max for 200+
      }

      console.log("✅ Loyalty filter applied:", {
        min: params.loyalty_points_min,
        max: params.loyalty_points_max,
      });
    }

    if (filters.spentRange && filters.spentRange !== "all") {
      const range = filters.spentRange;
      console.log("💰 Processing spending range:", range);

      if (range === "0-5000000") {
        params.total_spent_min = 0;
        params.total_spent_max = 5000000;
      } else if (range === "5000000-10000000") {
        params.total_spent_min = 5000000;
        params.total_spent_max = 10000000;
      } else if (range === "10000000-20000000") {
        params.total_spent_min = 10000000;
        params.total_spent_max = 20000000;
      } else if (range === "20000000+") {
        params.total_spent_min = 20000000;
        // Don't set max for 20M+
      }

      console.log("✅ Spending filter applied:", {
        min: params.total_spent_min,
        max: params.total_spent_max,
      });
    }

    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === "asc" ? "" : "-";
      params.ordering = `${sortOrder}${filters.sortBy}`;
      console.log("📊 Sort applied:", params.ordering);
    }

    if (filters.joinDateFrom) {
      params.created_at_after = filters.joinDateFrom;
      console.log("📅 Date from filter:", params.created_at_after);
    }
    if (filters.joinDateTo) {
      params.created_at_before = filters.joinDateTo;
      console.log("📅 Date to filter:", params.created_at_before);
    }

    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        cleanParams[key] = value;
      }
    });

    const url = `${API_BASE_URL}/api/customers/`;
    console.log("🌐 Final API request:", {
      url,
      params: cleanParams,
      paramCount: Object.keys(cleanParams).length,
      cacheBypass: !!cleanParams._t,
    });

    const fullURL = new URL(url);
    Object.keys(cleanParams).forEach((key) => {
      fullURL.searchParams.append(key, cleanParams[key]);
    });
    console.log("🔗 Complete API URL:", fullURL.toString());

    const startTime = performance.now();

    const response = await axios.get(url, {
      params: cleanParams,
      headers: {
        ...getAuthHeader(),
        // XÓA HOÀN TOÀN: Custom headers gây CORS issues
        // "Cache-Control": forceRefresh ? "no-cache, no-store, must-revalidate" : "public",
        // Pragma: forceRefresh ? "no-cache" : "cache",
      },
    });

    const endTime = performance.now();
    const requestTime = Math.round(endTime - startTime);

    console.log("✅ [FIXED] Success:", {
      status: response.status,
      count: response.data?.count || 0,
      results: response.data?.results?.length || 0,
      requestTime: `${requestTime}ms`,
      hasNext: !!response.data?.next,
      hasPrevious: !!response.data?.previous,
      fromCache: !cleanParams._t,
    });

    if (response.data?.results?.length > 0) {
      const loyaltyPoints = response.data.results
        .map((c) => c.loyalty_points)
        .sort((a, b) => a - b);
      console.log("📋 Customer loyalty points in response:", loyaltyPoints);
      console.log("📋 Expected range:", filters.loyaltyRange);
      console.log("📋 Sample customer data:", {
        first: {
          name: response.data.results[0]?.name,
          loyaltyPoints: response.data.results[0]?.loyalty_points,
          totalSpent: response.data.results[0]?.total_spent,
        },
        totalFields: Object.keys(response.data.results[0]).length,
      });

      if (filters.loyaltyRange && filters.loyaltyRange !== "all") {
        const range = filters.loyaltyRange;
        let expectedMin = 0,
          expectedMax = Infinity;

        if (range === "0-50") {
          expectedMin = 0;
          expectedMax = 50;
        } else if (range === "51-100") {
          expectedMin = 51;
          expectedMax = 100;
        } else if (range === "101-200") {
          expectedMin = 101;
          expectedMax = 200;
        } else if (range === "200+") {
          expectedMin = 200;
          expectedMax = Infinity;
        }

        const invalidResults = response.data.results.filter(
          (c) => c.loyalty_points < expectedMin || c.loyalty_points > expectedMax
        );

        if (invalidResults.length > 0) {
          console.warn(
            "⚠️ FILTER NOT WORKING! Found customers outside range:",
            invalidResults.map((c) => ({ name: c.name, points: c.loyalty_points }))
          );
        } else {
          console.log("✅ Filter working correctly!");
        }
      }
    }

    return response.data;
  } catch (error) {
    console.error("❌ [FIXED] Error:", error.message);

    if (error.response) {
      console.error("📡 Response details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });

      if (error.response.status === 401) {
        console.error("🔐 Authentication failed - token may be expired");
      } else if (error.response.status === 403) {
        console.error("⛔ Access forbidden - insufficient permissions");
      } else if (error.response.status === 404) {
        console.error("🔍 API endpoint not found");
      } else if (error.response.status >= 500) {
        console.error("🔥 Server error - backend issue");
      }
    } else if (error.request) {
      console.error("🌐 Network error - no response received:", error.request);
    } else {
      console.error("⚙️ Request setup error:", error.message);
    }

    throw error;
  }
};

// THÊM: Force refresh function
export const refreshCustomers = async (page = 1, filters = {}) => {
  console.log("🔄 Force refreshing customers...");
  return getCustomers(page, filters, true);
};

// THÊM: Set flag for data refresh needed
export const markCustomerDataForRefresh = () => {
  console.log("🏁 Marking customer data for refresh");
  window.customerDataNeedRefresh = true;

  // Dispatch event để components biết cần refresh
  window.dispatchEvent(
    new CustomEvent("customerDataUpdated", {
      detail: { timestamp: new Date().getTime() },
    })
  );
};

export const getCustomersLegacy = async (page = 1, search = "") => {
  console.log(`🔄 Legacy API call: page=${page}, search="${search}"`);
  const filters = {};
  if (search && search.trim()) {
    filters.search = search.trim();
  }
  console.log("🔄 Converting to new filter format:", filters);
  return getCustomers(page, filters);
};

export const getCustomerDetail = async (id, forceRefresh = false) => {
  try {
    const url = `${API_BASE_URL}/api/customers/${id}/`;
    console.log("👤 [FIXED] Fetching customer detail:", { id, forceRefresh });

    const params = {};
    if (forceRefresh) {
      params._t = new Date().getTime();
      console.log("🔄 Added cache busting for customer detail:", params._t);
    }

    const startTime = performance.now();
    const response = await axios.get(url, {
      params: forceRefresh ? params : {},
      headers: {
        ...getAuthHeader(),
        // XÓA: Custom cache headers
      },
    });
    const endTime = performance.now();

    console.log("✅ [FIXED] Customer detail success:", {
      id,
      name: response.data?.name,
      phone: response.data?.phone,
      loyalty_points: response.data?.loyalty_points,
      total_spent: response.data?.total_spent,
      requestTime: `${Math.round(endTime - startTime)}ms`,
      fromCache: !forceRefresh,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ [FIXED] Customer detail error:`, error.message);
    if (error.response?.status === 404) {
      console.error("👤 Customer not found - ID may be invalid");
    }
    throw error;
  }
};

export const getCustomerLoyaltyHistory = async (id, forceRefresh = false) => {
  try {
    const url = `${API_BASE_URL}/api/customers/${id}/loyalty_history/`;
    console.log("⭐ [FIXED] Fetching loyalty history:", { id, forceRefresh });

    const params = {};
    if (forceRefresh) {
      params._t = new Date().getTime();
      console.log("🔄 Added cache busting for loyalty history:", params._t);
    }

    const response = await axios.get(url, {
      params: forceRefresh ? params : {},
      headers: {
        ...getAuthHeader(),
        // XÓA: Custom cache headers
      },
    });

    console.log("✅ [FIXED] Loyalty history success:", {
      id,
      historyCount: response.data?.history?.length || 0,
      totalPoints: response.data?.total_points || 0,
      fromCache: !forceRefresh,
    });

    return response.data;
  } catch (error) {
    console.error(`❌ [FIXED] Loyalty history error:`, error.message);
    if (error.response?.status === 404) {
      console.log("⭐ Loyalty history API not found, returning empty data");
      return {
        history: [],
        total_points: 0,
        message: "Lịch sử tích điểm chưa được cấu hình",
      };
    }
    throw error;
  }
};

export const getCustomerAnalytics = async (filters = {}) => {
  try {
    const url = `${API_BASE_URL}/api/customers/analytics/`;
    console.log("📊 Fetching customer analytics:", filters);

    const response = await axios.get(url, {
      params: filters,
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching customer analytics:", error);
    if (error.response?.status === 404) {
      console.log("📊 Analytics API not found, returning mock data");
      return {
        segments: {
          "VIP (200+ điểm)": { count: 15, percentage: "12%" },
          "Gold (100-199 điểm)": { count: 45, percentage: "36%" },
          "Silver (50-99 điểm)": { count: 38, percentage: "30%" },
          "Bronze (0-49 điểm)": { count: 27, percentage: "22%" },
        },
        top_customers: [],
        total_revenue: 0,
        avg_order_value: 0,
      };
    }
    throw error;
  }
};

export const sendCustomerNotification = async (customerId, notificationData) => {
  try {
    const url = `${API_BASE_URL}/api/customers/${customerId}/notifications/`;
    console.log("📢 Sending notification:", { customerId, notificationData });

    const response = await axios.post(url, notificationData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Notification sent successfully");
    return response.data;
  } catch (error) {
    console.error(`❌ Error sending notification to customer ${customerId}:`, error);
    throw error;
  }
};

export const updateCustomerLoyaltyPoints = async (customerId, pointsData) => {
  try {
    const url = `${API_BASE_URL}/api/customers/${customerId}/loyalty_points/`;
    console.log("🎯 Updating loyalty points:", { customerId, pointsData });

    const response = await axios.post(url, pointsData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Loyalty points updated successfully");

    // THÊM: Mark for refresh sau khi update
    markCustomerDataForRefresh();

    return response.data;
  } catch (error) {
    console.error(`❌ Error updating loyalty points for customer ${customerId}:`, error);
    throw error;
  }
};

export const exportCustomers = async (filters = {}, format = "excel") => {
  try {
    const url = `${API_BASE_URL}/api/customers/export/`;
    console.log("📥 Exporting customers:", { filters, format });

    const response = await axios.get(url, {
      params: { ...filters, format },
      headers: getAuthHeader(),
      responseType: "blob",
    });

    console.log("✅ Export successful");
    return response.data;
  } catch (error) {
    console.error("❌ Error exporting customers:", error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const url = `${API_BASE_URL}/api/customers/`;
    console.log("➕ Creating customer:", customerData);

    const response = await axios.post(url, customerData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Customer created:", response.data);

    // THÊM: Mark for refresh sau khi tạo
    markCustomerDataForRefresh();

    return response.data;
  } catch (error) {
    console.error("❌ Error creating customer:", error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const url = `${API_BASE_URL}/api/customers/${id}/`;
    console.log(`✏️ Updating customer ID=${id}:`, customerData);

    const response = await axios.put(url, customerData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Customer updated:", response.data);

    // THÊM: Mark for refresh sau khi update
    markCustomerDataForRefresh();

    return response.data;
  } catch (error) {
    console.error(`❌ Error updating customer ID=${id}:`, error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const url = `${API_BASE_URL}/api/customers/${id}/`;
    console.log(`🗑️ Deleting customer ID=${id}`);

    await axios.delete(url, {
      headers: getAuthHeader(),
    });

    console.log(`✅ Customer ID=${id} deleted successfully`);

    // THÊM: Mark for refresh sau khi xóa
    markCustomerDataForRefresh();

    return true;
  } catch (error) {
    console.error(`❌ Error deleting customer ID=${id}:`, error);
    throw error;
  }
};

export const buildFilterParams = (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all" && value !== "") {
      params.append(key, value);
    }
  });

  const result = params.toString();
  console.log("🔧 Built filter params:", result);
  return result;
};

export const validateCustomerData = (customerData) => {
  console.log("🔍 Validating customer data:", customerData);

  const errors = {};

  if (!customerData.name || customerData.name.trim().length < 2) {
    errors.name = "Tên khách hàng phải có ít nhất 2 ký tự";
  }

  if (!customerData.phone || !/^[0-9]{10,11}$/.test(customerData.phone.replace(/\s/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ (10-11 số)";
  }

  if (customerData.loyalty_points && customerData.loyalty_points < 0) {
    errors.loyalty_points = "Điểm tích lũy không thể âm";
  }

  if (customerData.total_spent && customerData.total_spent < 0) {
    errors.total_spent = "Tổng chi tiêu không thể âm";
  }

  const result = {
    isValid: Object.keys(errors).length === 0,
    errors,
  };

  console.log("✅ Validation result:", result);
  return result;
};

export default {
  getCustomers,
  refreshCustomers,
  markCustomerDataForRefresh,
  getCustomersLegacy,
  getCustomerDetail,
  getCustomerLoyaltyHistory,
  getCustomerAnalytics,
  sendCustomerNotification,
  updateCustomerLoyaltyPoints,
  exportCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  buildFilterParams,
  validateCustomerData,
};

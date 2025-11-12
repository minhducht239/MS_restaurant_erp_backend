import { useState, useCallback, useEffect } from "react";
import { getMenuItems } from "services/MenuService";
import { addOrderToTable } from "services/TableService";

function useMenuItems(onError) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMenuItems();
      const items = response.data?.results || response.results || [];
      setMenuItems(items);

      // Tạo danh sách categories từ menu items
      const uniqueCategories = [...new Set(items.map((item) => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      if (onError) onError("Không thể tải danh sách món ăn");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const addItemToSelection = useCallback((item) => {
    if (!item || !item.id) {
      console.error("❌ addItemToSelection: Invalid item:", item);
      return;
    }

    console.log("➕ Adding item to selection:", item);

    setSelectedItems((prevItems) => {
      // Tìm món có tên trùng (không chỉ ID)
      const existingItemIndex = prevItems.findIndex(
        (selectedItem) =>
          selectedItem.id === item.id ||
          selectedItem.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );

      if (existingItemIndex !== -1) {
        console.log(`📦 Stacking item: ${item.name} (quantity +1)`);

        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: (updatedItems[existingItemIndex].quantity || 1) + 1,
        };
        return updatedItems;
      } else {
        console.log(`➕ Adding new item: ${item.name}`);
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const removeItemFromSelection = useCallback((itemId) => {
    setSelectedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const changeItemQuantity = useCallback(
    (itemId, quantity) => {
      if (quantity <= 0) {
        removeItemFromSelection(itemId);
        return;
      }

      setSelectedItems((prevItems) =>
        prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    },
    [removeItemFromSelection]
  );

  // Sửa hàm addItemsToTable
  const addItemsToTable = useCallback(
    async (tableId) => {
      const validTableId = typeof tableId === "object" ? tableId.id : tableId;
      const numericTableId = Number(validTableId);

      console.log("📊 addItemsToTable validation:");
      console.log("- Original tableId:", tableId, typeof tableId);
      console.log("- Valid tableId:", validTableId, typeof validTableId);
      console.log("- Numeric tableId:", numericTableId, typeof numericTableId);

      if (!numericTableId || isNaN(numericTableId)) {
        console.error("❌ addItemsToTable: Invalid table ID");
        if (onError) onError("Không thể thêm món: ID bàn không hợp lệ");
        return false;
      }

      if (selectedItems.length === 0) {
        console.warn("⚠️ addItemsToTable: No items selected");
        if (onError) onError("Vui lòng chọn ít nhất một món");
        return false;
      }

      try {
        setLoading(true);
        console.log(`🍽️ Adding ${selectedItems.length} items to table ${numericTableId}`);

        const mergedItems = mergeItemsByName(selectedItems);
        console.log("📦 Original items:", selectedItems);
        console.log("📦 Merged items:", mergedItems);

        // Format data cho API
        const itemsToAdd = mergedItems.map((item) => ({
          menu_item_id: item.id,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price,
        }));

        console.log("📤 Sending to API:", itemsToAdd);

        const response = await addOrderToTable(numericTableId, itemsToAdd);
        console.log("✅ API response:", response);

        setSelectedItems([]);

        console.log("✅ Items added successfully to table", numericTableId);
        return true;
      } catch (error) {
        console.error("❌ Error adding items to table:", error);
        if (onError) onError("Không thể thêm món. Vui lòng thử lại sau.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedItems, onError]
  );

  //  THÊM hàm merge món cùng tên
  const mergeItemsByName = (items) => {
    const merged = {};

    items.forEach((item) => {
      const key = item.name.toLowerCase().trim(); // Dùng tên làm key

      if (merged[key]) {
        // Món đã tồn tại -> cộng quantity
        merged[key].quantity += item.quantity || 1;
      } else {
        // Món mới -> tạo entry
        merged[key] = {
          ...item,
          quantity: item.quantity || 1,
        };
      }
    });

    return Object.values(merged);
  };

  // Lọc danh sách món ăn theo tìm kiếm và danh mục
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return {
    menuItems,
    categories,
    loading,
    selectedItems,
    searchTerm,
    selectedCategory,
    filteredMenuItems,
    setSearchTerm,
    setSelectedCategory,
    addItemToSelection,
    removeItemFromSelection,
    changeItemQuantity,
    addItemsToTable,
    clearSelectedItems: () => setSelectedItems([]),
    fetchMenuItems,
  };
}

export default useMenuItems;

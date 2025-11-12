from flask import Blueprint, jsonify
import requests
import os

bp = Blueprint('dashboard', __name__)

# Địa chỉ các service con (sửa lại cho đúng với môi trường của bạn)
BILLING_URL = os.getenv("BILLING_URL", "http://billing_service:8000")
CUSTOMER_URL = os.getenv("CUSTOMER_URL", "http://customer_service:8000")
MENU_URL = os.getenv("MENU_URL", "http://menu_service:8000")
STAFF_URL = os.getenv("STAFF_URL", "http://staff_service:8000")

@bp.route('/dashboard/statistics', methods=['GET'])
def dashboard_statistics():
    # Gọi API từ các service con
    try:
        billing_stats = requests.get(f"{BILLING_URL}/bills/statistics").json()
        customer_count = requests.get(f"{CUSTOMER_URL}/customers/count").json()
        menu_count = requests.get(f"{MENU_URL}/menu-items/count").json()
        staff_count = requests.get(f"{STAFF_URL}/staff/count").json()

        # Tổng hợp dữ liệu
        result = {
            "totalOrders": billing_stats.get("totalOrders"),
            "totalRevenue": billing_stats.get("totalRevenue"),
            "averageOrderValue": billing_stats.get("averageOrderValue"),
            "totalSalaries": staff_count.get("totalSalaries"),
            "customerCount": customer_count.get("count"),
            "menuCount": menu_count.get("count"),
            "staffCount": staff_count.get("count"),
            "monthlyData": billing_stats.get("monthlyData"),
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Có thể bổ sung các route khác như /dashboard/weekly-revenue, /dashboard/top-selling-items ...
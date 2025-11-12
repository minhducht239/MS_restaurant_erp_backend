from bson import ObjectId

def bill_helper(bill) -> dict:
    return {
        "id": str(bill["_id"]),
        "customer_id": bill["customer_id"],
        "total": bill["total"],
        "created_at": bill.get("created_at"),
        "items": bill.get("items", []),
    }
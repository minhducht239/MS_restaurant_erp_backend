from marshmallow import Schema, fields

class BillSchema(Schema):
    id = fields.Str(dump_only=True)
    customer_id = fields.Str(required=True)
    total = fields.Float(required=True)
    created_at = fields.DateTime()
    items = fields.List(fields.Dict())
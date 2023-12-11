# Copyright (c) 2023, faatlab and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Student(Document):

    def validate(self):
        self.validate_payments()

    def validate_payments(self):
        # Validate the payments as needed
        pass

    def on_update(self):
        # Additional logic on update, if necessary
        pass

    @staticmethod
    def get_query(doctype, txt, searchfield, start, page_len, filters):
    # Customize the query to filter payments based on the selected student
        return f"""
          SELECT name1, amount
          FROM `Payment`
          WHERE Student = '{filters.get('Student')}'
        """

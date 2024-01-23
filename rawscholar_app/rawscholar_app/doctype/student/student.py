# Copyright (c) 2023, faatlab and contributors
# For license information, please see license.txt

import frappe
from frappe.desk.notifications import notify_mentions
from frappe.model.document import Document
from frappe.utils import cstr, now
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

    @frappe.whitelist()
    def add_note(self, title):
        self.append(
            "notes", {"title": title, "added_by": frappe.session.user, "created_on": now()})
        self.save()
        notify_mentions(self.doctype, self.name, title)

    @frappe.whitelist()
    def edit_note(self, note, row_id):
        for d in self.notes:
            if cstr(d.name) == row_id:
                d.title = note
                d.db_update()

    @frappe.whitelist()
    def delete_note(self, row_id):
        for d in self.notes:
            if cstr(d.name) == row_id:
                self.remove(d)
                break
        self.save()

    @staticmethod
    def get_query(doctype, txt, searchfield, start, page_len, filters):
        # Customize the query to filter payments based on the selected student
        return f"""
          SELECT name1, amount
          FROM `Payment`
          WHERE Student = '{filters.get('Student')}'
        """

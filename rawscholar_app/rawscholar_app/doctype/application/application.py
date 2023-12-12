# Copyright (c) 2023, faatlab and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from frappe.utils import formatdate


class Application(Document):
	pass
	def before_save(self):
		self.intake = formatdate(self.intake_date,"MM-YYYY")


// Copyright (c) 2023, faatlab and contributors
// For license information, please see license.txt

frappe.ui.form.on("Task", "validate", function(frm) {
	 cur_frm.set_value("creator", frm.doc.owner);
});





// frappe.ui.form.on("Shift Type", "validate", function(frm) {
//     cur_frm.set_value("creator", frm.doc.owner);
// });
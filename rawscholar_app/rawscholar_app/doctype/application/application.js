// Copyright (c) 2023, faatlab and contributors
// For license information, please see license.txt

frappe.ui.form.on("Application", {
	after_save : function(frm) {
		frm.toggle_display("intake_date", false);
        frm.toggle_display("intake", true);
	}

    
});

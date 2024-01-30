// Copyright (c) 2023, faatlab and contributors
// For license information, please see license.txt

frappe.ui.form.on("Student", {
  refresh: function (frm) {
    let notes = frm.doc.notes || [];
    notes.sort(function (a, b) {
      return new Date(b.created_on) - new Date(a.created_on);
    });

    let notes_html = frappe.render_template("student_notes", {
      notes: notes,
    });
    $(".notes-section").remove();

    $(notes_html).appendTo(frm.fields_dict["notes_html"].wrapper);

    // add note
    $(".new-note-btn").click(() => {
      frm.trigger("add_note");
    });

    $(".notes-section")
      .find(".edit-note-btn")
      .on("click", function () {
        frm.edit_btn = this;
        frm.trigger("edit_note");
      });

    $(".notes-section")
      .find(".delete-note-btn")
      .on("click", function () {
        frm.delete_btn = this;
        frm.trigger("delete_note");
      });
  },

  add_note: function (frm) {
    var d = new frappe.ui.Dialog({
      title: __("Add a Note"),
      fields: [
        {
          label: "Note",
          fieldname: "title",
          fieldtype: "Text Editor",
          reqd: 1,
          enable_mentions: true,
        },
      ],
      primary_action: function () {
        var data = d.get_values();
        frappe.call({
          method: "add_note",
          doc: frm.doc,
          args: {
            title: data.title,
          },
          freeze: true,
          callback: function (r) {
            if (!r.exc) {
              frm.refresh_field("notes");
              frm.refresh();
            }
            d.hide();
          },
        });
      },
      primary_action_label: __("Add"),
    });
    d.show();
  },

  edit_note(frm) {
    const edit_btn = frm.edit_btn;
    let row = $(edit_btn).closest(".comment-content");
    let row_id = row.attr("name");
    let row_content = $(row).find(".content").html();
    if (row_content) {
      var d = new frappe.ui.Dialog({
        title: __("Edit Note"),
        fields: [
          {
            label: "Note",
            fieldname: "title",
            fieldtype: "Text Editor",
            default: row_content,
          },
        ],
        primary_action: function () {
          var data = d.get_values();
          frappe.call({
            method: "edit_note",
            doc: frm.doc,
            args: {
              note: data.title,
              row_id: row_id,
            },
            freeze: true,
            callback: function (r) {
              if (!r.exc) {
                frm.refresh_field("notes");
                frm.refresh();
                d.hide();
              }
            },
          });
        },
        primary_action_label: __("Done"),
      });
      d.show();
    }
  },

  delete_note(frm) {
    var delete_btn = frm.delete_btn;
    let row_id = $(delete_btn).closest(".comment-content").attr("name");
    frappe.call({
      method: "delete_note",
      doc: frm.doc,
      args: {
        row_id: row_id,
      },
      freeze: true,
      callback: function (r) {
        if (!r.exc) {
          frm.refresh_field("notes");
          frm.refresh();
        }
      },
    });
  },




  // activities
  // refresh: function (frm) {
	// 	var me = this;
	// 	// $(this.open_activities_wrapper).empty();
	// 	// let cur_form_footer = this.form_wrapper.find('.form-footer');

	// 	// all activities
	// 	if (!$(this.all_activities_wrapper).find('.form-footer').length) {
	// 		this.all_activities_wrapper.empty();
	// 		$(cur_form_footer).appendTo(this.all_activities_wrapper);

	// 		// remove frappe-control class to avoid absolute position for action-btn
	// 		$(this.all_activities_wrapper).removeClass('frappe-control');
	// 		// hide new event button
	// 		$('.timeline-actions').find('.btn-default').hide();
	// 		// hide new comment box
	// 		$(".comment-box").hide();
	// 		// show only communications by default
	// 		$($('.timeline-content').find('.nav-link')[0]).tab('show');
	// 	}

	// 	// open activities
	// 	frappe.call({
	// 		method: "get_open_activities",
	// 		args: {
	// 			ref_doctype: this.frm.doc.doctype,
	// 			ref_docname: this.frm.doc.name
	// 		},
	// 		callback: (r) => {
	// 			if (!r.exc) {
	// 				var activities_html = frappe.render_template('activities', {
	// 					tasks: r.message.tasks,
	// 					events: r.message.events
	// 				});

	// 				$(activities_html).appendTo(me.open_activities_wrapper);

	// 				$(".open-tasks").find(".completion-checkbox").on("click", function() {
	// 					me.update_status(this, "ToDo");
	// 				});

	// 				$(".open-events").find(".completion-checkbox").on("click", function() {
	// 					me.update_status(this, "Event");
	// 				});

	// 				me.create_task();
	// 				me.create_event();
	// 			}
	// 		}
	// 	});
	// },

	// create_task (frm) {
	// 	// let me = this;
	// 	let _create_task = () => {
	// 		const args = {
	// 			doc: me.frm.doc,
	// 			frm: me.frm,
	// 			title: __("New Task")
	// 		};
	// 		let composer = new frappe.views.InteractionComposer(args);
	// 		composer.dialog.get_field('interaction_type').set_value("ToDo");
	// 		// hide column having interaction type field
	// 		$(composer.dialog.get_field('interaction_type').wrapper).closest('.form-column').hide();
	// 		// hide summary field
	// 		$(composer.dialog.get_field('summary').wrapper).closest('.form-section').hide();
	// 	};
	// 	$(".new-task-btn").click(_create_task);
	// },

	// create_event (frm) {
	// 	// let me = this;
  //   const edit_btn = frm.edit_btn;
	// 	let _create_event = () => {
	// 		const args = {
	// 			doc: me.frm.doc,
	// 			frm: me.frm,
	// 			title: __("New Event")
	// 		};
	// 		let composer = new frappe.views.InteractionComposer(args);
	// 		composer.dialog.get_field('interaction_type').set_value("Event");
	// 		$(composer.dialog.get_field('interaction_type').wrapper).hide();
	// 	};
	// 	$(".new-event-btn").click(_create_event);
	// },

	// async update_status (input_field, doctype) {
	// 	let completed = $(input_field).prop("checked") ? 1 : 0;
	// 	let docname = $(input_field).attr("name");
	// 	if (completed) {
	// 		await frappe.db.set_value(doctype, docname, "status", "Closed");
	// 		this.refresh();
	// 	}
	// },  


  refresh: function (frm) {
    let qualifications = frm.doc.qualifications || [];
    console.log(qualifications)
    // qualifications.sort(function (a, b) {
    //   return new Date(b.created_on) - new Date(a.created_on);
    // });

    let Qualification_html = frappe.render_template("Qualification", {
      qualifications: qualifications,
    });
    $(".qualification-section").remove();

    $(Qualification_html).appendTo(frm.fields_dict["custom_qualification_html"].wrapper);

    // add note
    $(".new-qualification-btn").click(() => {
      console.log("hello")
      frm.trigger("add_qualification");
    });

    $(".qualification-section")
      .find(".edit-qualification-btn")
      .on("click", function () {
        frm.edit_btn = this;
        frm.trigger("edit_qualification");
      });

    $(".qualification-section")
      .find(".delete-qualification-btn")
      .on("click", function () {
        frm.delete_btn = this;
        frm.trigger("delete_qualification");
      });
  },


  add_qualification: function (frm) { 
    var d = new frappe.ui.Dialog({
      title: __("Add a Qualification"),
      fields: [
        {
          label: "Qualification",
          fieldname: "qualification",
          fieldtype: "Link",
          options: "Qualification Type",
          reqd: 1,
        },
        {
          label: "CGPA",
          fieldname: "cgpa",
          fieldtype: "Float",
        },
        {
          label: "%",
          fieldname: "percentage",
          fieldtype: "Float",
        },
        {
          label: "Completion Year",
          fieldname: "completion_year",
          fieldtype: "Data",
        },
        {
          label: "Specifics",
          fieldname: "specifics",
          fieldtype: "Data",
        },
      ],
      primary_action: function () {
        var data = d.get_values();
        frappe.call({
          method: "add_qualification",
          doc: frm.doc,
          args: {
            qualification: data.qualification,
            cgpa: data.cgpa,
            percentage: data.percentage,
            completion_year: data.completion_year,
            specifics: data.specifics,
          },
          freeze: true,
          callback: function (r) {
            if (!r.exc) {
              frm.refresh();

            }
            d.hide();
          },
        });
      },
      primary_action_label: __("Add"),
    });
    d.show();
  },

  edit_qualification(frm) {
    const edit_btn = frm.edit_btn;
    let row = $(edit_btn).closest(".comment-content");
    let row_id = row.attr("name");
    let row_content = $(row).find(".content").html();
    let cgpa= $(row).find(".cgpa").html();
    let percentage= $(row).find(".percentage").html();
    let completion_year= $(row).find(".completion_year").html();
    let specifics= $(row).find(".specifics").html();

    if (row_content) {
      var d = new frappe.ui.Dialog({
        title: __("Edit Qualification"),
        fields: [
          {
            label: "Qualification",
            fieldname: "qualification",
            fieldtype: "Link",
            options: "Qualification Type",
            reqd: 1,
            default: row_content,
          },
          {
            label: "CGPA",
            fieldname: "cgpa",
            fieldtype: "Float",
            default: +cgpa,
          },
          {
            label: "%",
            fieldname: "percentage",
            fieldtype: "Float",
            default: +percentage,
          },
          {
            label: "Completion Year",
            fieldname: "completion_year",
            fieldtype: "Data",
            default: completion_year,
          },
          {
            label: "Specifics",
            fieldname: "specifics",
            fieldtype: "Data",
            default: specifics,
          },
        ],
        primary_action: function () {
          var data = d.get_values();
          frappe.call({
            method: "edit_qualifications",
            doc: frm.doc,
            args: {
              qualification: data.qualification,
              cgpa: data.cgpa,
              percentage: data.percentage,
              completion_year: data.completion_year,
              specifics: data.specifics,
              row_id: row_id,
            },
            freeze: true,
            callback: function (r) {
              if (!r.exc) {
                frm.refresh();
                d.hide();
              }
            },
          });
        },
        primary_action_label: __("Done"),
      });
      d.show();
    }
  },



  delete_qualification(frm) {
    console.log('delete')
    var delete_btn = frm.delete_btn;
    let row_id = $(delete_btn).closest(".comment-content").attr("name");
    frappe.call({
      method: "delete_qualifications",
      doc: frm.doc,
      args: {
        row_id: row_id,
      },
      freeze: true,
      callback: function (r) {
        if (!r.exc) {
          frm.refresh();
        }
      },
    });
  }
});

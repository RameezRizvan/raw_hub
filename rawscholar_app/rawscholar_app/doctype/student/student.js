// Copyright (c) 2023, faatlab and contributors
// For license information, please see license.txt

frappe.ui.form.on("Student", {
  refresh: function (frm) {
    $(".notes-section").remove();
    $(".open-activities").remove();

    let notes = frm.doc.notes || [];
    notes.sort(function (a, b) {
      return new Date(b.created_on) - new Date(a.created_on);
    });

    let notes_html = frappe.render_template("student_notes", {
      notes: notes,
    });

    $(notes_html).appendTo(frm.fields_dict["notes_html"].wrapper);

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

    //<<<<< END OF NOTES SECTION >>>>>>

    // open activities
    frappe.call({
      method: "get_open_activities",
      doc: frm.doc,
      args: {
        ref_doctype: frm.doc.doctype,
        ref_docname: frm.doc.name,
      },
      callback: (r) => {
        if (!r.exc) {
          var activities_html = frappe.render_template("activities", {
            tasks: r.message.tasks,
            events: r.message.events,
          });

          $(activities_html).appendTo(
            frm.fields_dict["open_activities_html"].wrapper
          );

          $(".open-tasks")
            .find(".completion-checkbox")
            .on("click", function () {
              frm.status_box = this;
              frm.trigger("update_todo_status");
            });

          $(".open-events")
            .find(".completion-checkbox")
            .on("click", function () {
              frm.status_box = this;
              frm.trigger("update_event_status");
            });
          ``;
          frm.trigger("create_task");
          frm.trigger("create_event");
        }
      },
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

  create_task(frm) {
    let _create_task = () => {
      const args = {
        doc: frm.doc,
        frm: frm,
        title: __("New Task"),
      };
      let composer = new frappe.views.InteractionComposer(args);
      composer.dialog.get_field("interaction_type").set_value("ToDo");
      // hide column having interaction type field
      $(composer.dialog.get_field("interaction_type").wrapper)
        .closest(".form-column")
        .hide();
      // hide summary field
      $(composer.dialog.get_field("summary").wrapper)
        .closest(".form-section")
        .hide();
    };
    $(".new-task-btn").click(_create_task);
  },

  create_event(frm) {
    let _create_event = () => {
      const args = {
        doc: frm.doc,
        frm: frm,
        title: __("New Event"),
      };
      let composer = new frappe.views.InteractionComposer(args);
      composer.dialog.get_field("interaction_type").set_value("Event");
      $(composer.dialog.get_field("interaction_type").wrapper).hide();
    };
    $(".new-event-btn").click(_create_event);
  },

  async update_todo_status(frm) {
    var input_field = frm.status_box;
    let completed = $(input_field).prop("checked") ? 1 : 0;
    let docname = $(input_field).attr("name");
    if (completed) {
      await frappe.db.set_value("ToDo", docname, "status", "Closed");
      frm.refresh();
    }
  },
  async update_event_status(frm) {
    var input_field = frm.status_box;
    let completed = $(input_field).prop("checked") ? 1 : 0;
    let docname = $(input_field).attr("name");
    if (completed) {
      await frappe.db.set_value("Event", docname, "status", "Closed");
      frm.refresh();
    }
  },
});

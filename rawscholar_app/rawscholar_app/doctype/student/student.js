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
});

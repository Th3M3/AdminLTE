var table;
var groups = [];
const token = $("#token").html();
var info = null;

function showAlert(type, icon, title, message) {
  let opts = {};
  title = "&nbsp;<strong>" + title + "</strong><br>";
  switch (type) {
    case "info":
      opts = {
        type: "info",
        icon: "glyphicon glyphicon-time",
        title: title,
        message: message
      };
      info = $.notify(opts);
      break;
    case "success":
      opts = {
        type: "success",
        icon: icon,
        title: title,
        message: message
      };
      if (info) {
        info.update(opts);
      } else {
        $.notify(opts);
      }

      break;
    case "warning":
      opts = {
        type: "warning",
        icon: "glyphicon glyphicon-warning-sign",
        title: title,
        message: message
      };
      if (info) {
        info.update(opts);
      } else {
        $.notify(opts);
      }

      break;
    case "error":
      opts = {
        type: "danger",
        icon: "glyphicon glyphicon-remove",
        title: "&nbsp;<strong>Error, something went wrong!</strong><br>",
        message: message
      };
      if (info) {
        info.update(opts);
      } else {
        $.notify(opts);
      }

      break;
    default:
  }
}

function reload_client_suggestions() {
  $.post(
    "scripts/pi-hole/php/groups.php",
    { action: "get_unconfigured_clients", token: token },
    function(data) {
      var sel = $("#select");
      sel.empty();
      for (var key in data) {
        if (!data.hasOwnProperty(key)) {
          continue;
        }

        var text = key;
        if (data[key].length > 0) {
          text += " (" + data[key] + ")";
        }

        sel.append(
          $("<option />")
            .val(key)
            .text(text)
        );
      }

      sel.append(
        $("<option />")
          .val("custom")
          .text("Custom, specified on the right")
      );
    },
    "json"
  );
}

function get_groups() {
  $.post(
    "scripts/pi-hole/php/groups.php",
    { action: "get_groups", token: token },
    function(data) {
      groups = data.data;
      initTable();
    },
    "json"
  );
}

$(document).ready(function() {
  $("#btnAdd").on("click", addClient);

  reload_client_suggestions();
  get_groups();

  $("#select").on("change", function() {
    $("#ip-custom").val("");
    $("#ip-custom").prop("disabled", $("#select option:selected").val() !== "custom");
  });
});

function initTable() {
  table = $("#clientsTable").DataTable({
    ajax: {
      url: "scripts/pi-hole/php/groups.php",
      data: { action: "get_clients", token: token },
      type: "POST"
    },
    order: [[0, "asc"]],
    columns: [
      { data: "id", visible: false },
      { data: "ip" },
      { data: "groups", searchable: false },
      { data: "name", width: "80px", orderable: false }
    ],
    drawCallback: function(settings) {
      $(".deleteClient").on("click", deleteClient);
    },
    rowCallback: function(row, data) {
      const tooltip = "Database ID: " + data.id;
      var ip_name =
        '<code id="ip" title="' +
        tooltip +
        '">' +
        data.ip +
        '</code><input id="id" type="hidden" value="' +
        data.id +
        '">';
      if (data.name !== null && data.name.length > 0)
        ip_name += '<br><code id="name" title="' + tooltip + '">' + data.name + "</code>";
      $("td:eq(0)", row).html(ip_name);

      $("td:eq(1)", row).empty();
      $("td:eq(1)", row).append('<select id="multiselect" multiple="multiple"></select>');
      var sel = $("#multiselect", row);
      // Add all known groups
      for (var i = 0; i < groups.length; i++) {
        var extra = "";
        if (!groups[i].enabled) {
          extra = " (disabled)";
        }

        sel.append(
          $("<option />")
            .val(groups[i].id)
            .text(groups[i].name + extra)
        );
      }

      // Select assigned groups
      sel.val(data.groups);
      // Initialize multiselect
      sel.multiselect({ includeSelectAllOption: true });
      sel.on("change", editClient);

      let button =
        '<button class="btn btn-danger btn-xs deleteClient" type="button" data-id="' +
        data.id +
        '">' +
        '<span class="glyphicon glyphicon-trash"></span>' +
        "</button>";
      $("td:eq(2)", row).html(button);
    },
    lengthMenu: [
      [10, 25, 50, 100, -1],
      [10, 25, 50, 100, "All"]
    ],
    stateSave: true,
    stateSaveCallback: function(settings, data) {
      // Store current state in client's local storage area
      localStorage.setItem("groups-clients-table", JSON.stringify(data));
    },
    stateLoadCallback: function(settings) {
      // Receive previous state from client's local storage area
      var data = localStorage.getItem("groups-clients-table");
      // Return if not available
      if (data === null) {
        return null;
      }

      data = JSON.parse(data);
      // Always start on the first page to show most recent queries
      data.start = 0;
      // Always start with empty search field
      data.search.search = "";
      // Reset visibility of ID column
      data.columns[0].visible = false;
      // Apply loaded state to table
      return data;
    }
  });

  table.on("order.dt", function() {
    var order = table.order();
    if (order[0][0] !== 0 || order[0][1] !== "asc") {
      $("#resetButton").show();
    } else {
      $("#resetButton").hide();
    }
  });
  $("#resetButton").on("click", function() {
    table.order([[0, "asc"]]).draw();
    $("#resetButton").hide();
  });
}

function addClient() {
  var ip = $("#select").val();
  if (ip === "custom") {
    ip = $("#ip-custom").val();
  }

  showAlert("info", "", "Adding client...", ip);

  if (ip.length === 0) {
    showAlert("warning", "", "Warning", "Please specify a client IP address");
    return;
  }

  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: { action: "add_client", ip: ip, token: token },
    success: function(response) {
      if (response.success) {
        showAlert("success", "glyphicon glyphicon-plus", "Successfully added client", ip);
        reload_client_suggestions();
        table.ajax.reload();
      } else {
        showAlert("error", "", "Error while adding new client", response.message);
      }
    },
    error: function(jqXHR, exception) {
      showAlert("error", "", "Error while adding new client", jqXHR.responseText);
      console.log(exception);
    }
  });
}

function editClient() {
  var elem = $(this).attr("id");
  var tr = $(this).closest("tr");
  var id = tr.find("#id").val();
  var groups = tr.find("#multiselect").val();
  var ip = tr.find("#ip").text();
  var name = tr.find("#name").text();

  var done = "edited";
  var not_done = "editing";
  if (elem === "multiselect") {
    done = "edited groups of";
    not_done = "editing groups of";
  }

  var ip_name = ip;
  if (name.length > 0) {
    ip_name += " (" + name + ")";
  }

  showAlert("info", "", "Editing client...", ip_name);
  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: { action: "edit_client", id: id, groups: groups, token: token },
    success: function(response) {
      if (response.success) {
        showAlert(
          "success",
          "glyphicon glyphicon-plus",
          "Successfully " + done + " client",
          ip_name
        );
      } else {
        showAlert("error", "Error while " + not_done + " client with ID " + id, response.message);
      }
    },
    error: function(jqXHR, exception) {
      showAlert(
        "error",
        "",
        "Error while " + not_done + " client with ID " + id,
        jqXHR.responseText
      );
      console.log(exception);
    }
  });
}

function deleteClient() {
  var id = $(this).attr("data-id");
  var tr = $(this).closest("tr");
  var ip = tr.find("#ip").text();
  var name = tr.find("#name").text();

  var ip_name = ip;
  if (name.length > 0) {
    ip_name += " (" + name + ")";
  }

  showAlert("info", "", "Deleting client...", ip_name);
  $.ajax({
    url: "scripts/pi-hole/php/groups.php",
    method: "post",
    dataType: "json",
    data: { action: "delete_client", id: id, token: token },
    success: function(response) {
      if (response.success) {
        showAlert("success", "glyphicon glyphicon-trash", "Successfully deleted client ", ip_name);
        table
          .row(tr)
          .remove()
          .draw(false);
        reload_client_suggestions();
      } else {
        showAlert("error", "", "Error while deleting client with ID " + id, response.message);
      }
    },
    error: function(jqXHR, exception) {
      showAlert("error", "", "Error while deleting client with ID " + id, jqXHR.responseText);
      console.log(exception);
    }
  });
}

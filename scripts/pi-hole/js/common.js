/* Pi-hole: A black hole for Internet advertisements
 *  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
 *  Network-wide ad blocking via your own hardware.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

var info = null;

function quietfilter(ta, data) {
  var lines = data.split("\n");
  for (var i = 0; i < lines.length; i++) {
    if (
      lines[i].indexOf("results") !== -1 &&
      lines[i].indexOf("0 results") === -1
    ) {
      var shortstring = lines[i].replace("::: /etc/pihole/", "");
      // Remove "(x results)"
      shortstring = shortstring.replace(/\(.*/, "");
      ta.append(shortstring + "\n");
    }
  }
}

// Credit: https://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript/4835406#4835406
window.escapeHtml = function(text) {
  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };

  return text.replace(/[&<>"']/g, function(m) {
    return map[m];
  });
};

// Credit: https://stackoverflow.com/a/10642418/2087442
window.httpGet = function(ta, theUrl, quiet) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      ta.show();
      ta.empty();
      if (!quiet) {
        ta.append(xmlhttp.responseText);
      } else {
        quietfilter(ta, xmlhttp.responseText);
      }
    }
  };

  xmlhttp.open("GET", theUrl, false);
  xmlhttp.send();
};

window.padNumber = function(num) {
  return ("00" + num).substr(-2, 2);
};

// Helper function needed for converting the Objects to Arrays
window.objectToArray = function(p) {
  var keys = Object.keys(p);
  keys.sort(function(a, b) {
    return a - b;
  });

  var arr = [],
    idx = [];
  for (var i = 0; i < keys.length; i++) {
    arr.push(p[keys[i]]);
    idx.push(keys[i]);
  }

  return [idx, arr];
};

window.showAlert = function(type, icon, title, message) {
  var opts = {};
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
};

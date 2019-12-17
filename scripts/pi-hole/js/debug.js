/* Pi-hole: A black hole for Internet advertisements
 *  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
 *  Network-wide ad blocking via your own hardware.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global httpGet:false */

function eventsource() {
  var ta = $("#output");
  var upload = $("#upload");
  var checked = "";
  var token = encodeURIComponent($("#token").text());

  if (upload.prop("checked")) {
    checked = "upload";
  }

  // IE does not support EventSource - load whole content at once
  if (typeof EventSource !== "function") {
    httpGet(
      ta,
      "scripts/pi-hole/php/debug.php?IE&token=" + token + "&" + checked
    );
    return;
  }

  var source = new EventSource(
    "scripts/pi-hole/php/debug.php?&token=" + token + "&" + checked
  );

  // Reset and show field
  ta.empty();
  ta.show();

  source.addEventListener(
    "message",
    function(e) {
      ta.append(e.data);
    },
    false
  );

  // Will be called when script has finished
  source.addEventListener(
    "error",
    function() {
      source.close();
    },
    false
  );
}

$("#debugBtn").on("click", function() {
  $("#debugBtn").attr("disabled", true);
  $("#upload").attr("disabled", true);
  eventsource();
});

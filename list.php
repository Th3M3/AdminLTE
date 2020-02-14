<?php /*
*    Pi-hole: A black hole for Internet advertisements
*    (c) 2017 Pi-hole, LLC (https://pi-hole.net)
*    Network-wide ad blocking via your own hardware.
*
*    This file is copyright under the latest version of the EUPL.
*    Please see LICENSE file for your rights under this license. */

require "scripts/pi-hole/php/header.php";

$list = $_GET['l'] ?? '';

if ($list == "white")
{
    $listtitle = "Whitelist";
    $heading = "whitelisting";
}
elseif ($list == "black")
{
    $listtitle = "Blacklist";
    $heading = "blocking";
}
else
{
    echo "Invalid list parameter ".$list;
    require "scripts/pi-hole/php/footer.php";
    die();
}
?>
<!-- Send list type to JS -->
<div id="list-type" hidden><?php echo $list ?></div>

<!-- Title -->
<div class="page-header">
    <h1><?php echo $listtitle; ?></h1>
</div>
<div class="row">
  <div class="form-group col-md-6">
    <label for="ex1">Domain:</label>
    <input id="domain" type="text" class="form-control" placeholder="Add a domain (example.com)">
  </div>
  <div class="form-group col-md-6">
    <label for="ex2">Comment:</label>
    <input id="comment" type="text" class="form-control" placeholder="Include a comment (optional)">
  </div>
  <div class="form-group col-xs-12 text-center">
    <span class="input-group-btn">
        <button id="btnAdd" class="btn btn-default" type="button">Add (exact)</button>
        <button id="btnAddWildcard" class="btn btn-default" type="button">Add (wildcard)</button>
        <button id="btnAddRegex" class="btn btn-default" type="button">Add (regex)</button>
        <button id="btnRefresh" class="btn btn-default" type="button"><i class="fa fa-sync"></i></button>
    </span>
  </div>
</div>
<!-- Alerts -->
<div id="alInfo" class="alert alert-info alert-dismissible fade in" role="alert" hidden="true">
    <button type="button" class="close" data-hide="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    Adding to the <?php echo $listtitle; ?>...
</div>
<div id="alSuccess" class="alert alert-success alert-dismissible fade in" role="alert" hidden="true">
    <button type="button" class="close" data-hide="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <span id="success-message"></span>
</div>
<div id="alFailure" class="alert alert-danger alert-dismissible fade in" role="alert" hidden="true">
    <button type="button" class="close" data-hide="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    Failure! Something went wrong, see output below:<br/><br/><pre><span id="err"></span></pre>
</div>
<div id="alWarning" class="alert alert-warning alert-dismissible fade in" role="alert" hidden="true">
    <button type="button" class="close" data-hide="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    At least one domain was already present, see output below:<br/><br/><pre><span id="warn"></span></pre>
</div>


<!-- Domain List -->
<h3 id="h3-exact" hidden="true">Exact <?php echo $heading; ?></h3>
<ul class="list-group" id="list"></ul>
<h3 id="h3-regex" hidden="true"><a href="https://docs.pi-hole.net/ftldns/regex/overview/" rel="noopener" target="_blank" title="Click for Pi-hole Regex documentation">Regex</a> &amp; Wildcard <?php echo $heading; ?></h3>
<ul class="list-group" id="list-regex"></ul>

<script src="scripts/pi-hole/js/list.js"></script>

<?php
require "scripts/pi-hole/php/footer.php";
?>

var $ = require('jquery')
  , jqVersion = $().jquery;
require('jquery-ui');

$('#jq-version').text(jqVersion);
$( "#slider" ).slider();

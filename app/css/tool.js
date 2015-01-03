$(document).ready(function () {
    $( "#tabs" ).tabs();

    var div = d3.select("#svg");
    init(div, oddysee);

    initAssign();
    initMemberList2(mems);
});

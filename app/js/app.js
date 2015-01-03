$(document).ready(function () {
    $( "#tabs" ).tabs();
    initOrgStruc();
    initOrg(d3.select("#svg"), orgstruc);
    initWidgets();

    initAssign();
    initMemberList(mems);
});

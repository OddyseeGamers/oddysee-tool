$(document).ready(function () {
    $('#myTab a:first').tab('show');

    initOrgStruc();
    initOrg(orgstruc);
    initWidgets();
    initAssign();
    initMemberList(mems);
});

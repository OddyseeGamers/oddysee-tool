$(document).ready(function () {
    $('#myTab a:first').tab('show');
//     $('#myTab a[href="#mem_mgmt"]').tab('show');
    $('#myModal').modal({show: false, backdrop: "static"});

//     $('#myDropdown').on('hide.bs.dropdown', function () {
//         console.debug("OKOK", $('#myDropdown').dropdown());
//     });


    initOrgStruc();
    initPath();
    initWidgets();

//     initAssign();
    initMemberList(mems);
});

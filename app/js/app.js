$(document).ready(function () {
    $('#myTab a:first').tab('show');
    $('#myModal').modal({show: false, backdrop: "static"});

//     $('#myDropdown').on('hide.bs.dropdown', function () {
//         console.debug("OKOK", $('#myDropdown').dropdown());
//     });

//                                                 <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Action</a></li>
//                                                 <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Another action</a></li>
//                                                 <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Something else here</a></li>
//                                                 <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Separated link</a></li>

    initOrgStruc();
    initPath();
    initWidgets();

    initAssign();
    initMemberList(mems);
});

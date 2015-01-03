$(document).ready(function () {

    
    console.debug("start");
    $('#myTab a:first').tab('show');

    initOrgStruc();
    initOrg(d3.select("#svg"), orgstruc);
    initWidgets();
    initAssign();
    initMemberList(mems);


//     $('#myTab a').click(function (e) {
//         e.preventDefault();
//         console.debug("clicked");
//         $(this).tab('hide');
//     });
//     $('#myTab a:first').tab('show');

    /*
    $( "#tabs" ).tabs();
    initOrgStruc();
    initOrg(d3.select("#svg"), orgstruc);
    initWidgets();

    initAssign();
    initMemberList(mems);
    */
});

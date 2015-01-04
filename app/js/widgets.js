/****************************************************************************/
/* dialogs */

function addUnit() {
    $(".modal-title").html('Add Unit to "' + currPath[0].name + '"');

    $("#i_name").val('');
    $("#i_desc").val('');

    $("#dropname").val(org_hierarchy[1]);
    $("#dropdownData").empty();
    for (var i = 0; i < org_hierarchy.length; i++) {
        $("#dropdownData").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + org_hierarchy[i] + '</a></li>');
    }
    $(".dropdown-menu").on('click', 'li a', function(){
        $("#dropname").val($(this).text());
    });

    $("#saveBtn").unbind();
    $("#saveBtn").html("Add");
    $("#saveBtn").on("click", function () {
        appendUnit(true);
        $('#myModal').modal('hide');
    });

    $('#myModal').modal({show: true});
}

function modifyUnit() {
    $(".modal-title").html('Edit "' + currPath[0].name + '"');

    $("#i_name").val(currPath[0].name);
    $("#i_desc").val(currPath[0].desc);

    $("#saveBtn").unbind();
    $("#saveBtn").html("Modify");
    $("#saveBtn").on("click", function () {
        appendUnit(false);
        $('#myModal').modal('hide');
    });

    $("#dropname").val(org_hierarchy[0]);
    $("#dropdownData").empty();
    for (var i = 0; i < org_hierarchy.length; i++) {
        if (org_hierarchy[i] === currPath[0].type) {
            $("#dropname").val(currPath[0].type);
            $("#dropdownData").append('<li role="presentation"><a role="menuitem" tabindex="-1" class="activeItem" href="#">' + org_hierarchy[i] + '</a></li>');
        } else {
            $("#dropdownData").append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#">' + org_hierarchy[i] + '</a></li>');
        }
    }
    $(".dropdown-menu").on('click', 'li a', function(){
        $("#dropname").val($(this).text());
    });

    $('#myModal').modal({show: true});
}

function appendUnit(add) {
    var i_name = $( "#i_name" );
    var i_desc = $( "#i_desc" );
    var i_type = $( "#dropname" );


    if (i_name.val().length > 0 && i_type.val()) {
        
        if (add) {
            var unit = new Unit(i_name.val(), i_type.val(), i_desc.val(), "#555555");
            currPath[0].addUnit(unit);
            currPath.unshift(unit);
        } else {
            currPath[0].name = i_name.val();
            currPath[0].desc = i_desc.val();
            currPath[0].type = i_type.val();
        }

        initOrg();
        setInfo(currPath[0]);

        return true;
    }

    return false;
}

/****************************************************************************/
/* widgets */

function setInfo(d) {
    $("#breadPath").empty();

    for (var i = currPath.length - 1; i >= 0; i--) {
        initSel('#breadPath', currPath[i]);
    }
    
    $("#name").html((d.type ? d.name  + " [" + d.type + "]" : d.name) + " [" + d.id + "]");
    $("#desc").html(d.desc ? d.desc : "&nbsp;");
    $("#rank").empty();

    var temp = '';

    $("#leader").empty();
    if (d.leader && d.leader.length) {
        temp = "";
        for (var i = 0; i < d.leader.length; i++) { 
            var m = getMember(d.leader[i]);
            if (m) {
                temp += '<tr' + (i ? '' : ' class="leader"') + '><td>' + m.name + '</td><td>' + m.rank + '</td></tr>';
            }
        }

        $("#leader").html(temp);
    }


    $("#pilots").empty();
    var res = getAssignMembers(d.id);

    $(".pilotinfo").empty();
    $(".pilotinfo").append('' + res.length);
    if (res && res.length) {
        temp = "";
        for (var i = 0; i < res.length; i++) { 
            var m = getMember(res[i]);
            if (m) {
                temp += '<tr><td>' + m.name + '</td><td>' + m.rank + '</td></tr>';
            }
        }
        $("#pilots").html(temp);
    }

    if (!d.children) {
        $("#assBtn").attr('class', 'btn btn-default');
    } else {
        $("#assBtn").attr('class', 'btn btn-default hidden');
    }

    initDropList();
}


function initDropList() {
    if (currPath[0].children) {
        setDrops(currPath[0]);
    } else {
        if (currPath.length > 1 && currPath[1]) {
            setDrops(currPath[1]);
        } else {
            $("#dropList").empty();
        }
    }
}

function initSel(tag, obj) {
    var temp = "";
    if (obj.children) {
        obj.children.forEach(function(c) {
            temp += '<li role="presentation"><a onClick="jumpTo(' + c.id + ')" role="menuitem" tabindex="-1" href="#" id="' + c.id + '">' + c.name + '</a></li>';
        });
    }



    if (temp !== "") {
        $(tag).append('<li role="presentation" class="dropdown">' +
                      '<a id="drop' + obj.id + '" href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false">' +
                        obj.name + '&nbsp;&nbsp;&nbsp;<span class="caret"></span>' +
                    '</a>' +
                    '<ul class="dropdown-menu" role="menu"  aria-labelledby="drop' + obj.id + '">' +
                      temp +
                      '</ul></li>');
    } else {
        $(tag).append('<li role="presentation">' +
                        '<a class="last">' +
                        obj.name +
                    '</a></li>');
    }
}

function setDrops(drop) {
    $("#dropList").empty();

    var c = parseInt(12 / drop.children.length);
    var t = '' + c;
    
    var temp = "";
    drop.children.forEach(function(c) {
        temp += '<div class="col-md-' + t + '">' + 
                   '<div class="panel">' +
                      '<div class="panel-body drop-panel">' +
                         '<div id="' + c.id + '" class="droppilot"><div class="panel-title text-center">' + c.name + '</div><div class="pilotlist"><table class="table"><thead><tr><th>Name</th><th>M</th></tr></thead><tbody>';
        var pilots = getAssignMembers(c.id);
        pilots.forEach(function(p) {
            var mem = getMember(p);
            if (mem) {
                temp += '<tr><td><div handle="' + mem.handle + '" class="ui-draggable member">' + mem.name + '</div></td><td></td></tr>';
            }
        });
        temp += '</tbody></table>' + '</div></div></div></div></div>';
    });
    $("#dropList").append(temp).find('.member').draggable(createDraggable());



    $('.droppilot').droppable( {
//           accept: '.member div',
          hoverClass: 'hovered',
          drop: handleDropEvent
    } );
}


function handleDropEvent( event, ui ) {
    var draggable = ui.draggable;

    var unitid = parseInt($(this).attr('id'));
    // TODO: find reverse selector
    var srcid = parseInt(ui.draggable.parent().parent().parent().parent().parent().attr('id'));

    if (unitid === srcid) {
        return;
    }

    assignMember(draggable.attr('handle'), unitid);
    removeMember(draggable.attr('handle'), srcid);

    ui.draggable.draggable( 'option', 'revert', false );
    ui.draggable.draggable( 'option', 'cursor', 'pointer' );
    ui.draggable.draggable( 'disable');
    ui.draggable.parent().parent().hide();
    var m = getMember(draggable.attr('handle'));
    $(this).find("tbody").append('<tr>' +
                                '<td><div handle="' + m.handle + '" class="ui-draggable member">' + m.name + '</div></td>' +
                                '<td>' + m.callsign + '</td>' +
                                '</tr>')
                            .find(".member").draggable(createDraggable());
    setInfo(currPath[0]);
}

function createDraggable() {
    return {
    //         containment: '.droppilot',
//             containment: 'body',
    //         stack: '.assign',
    //         stack: '.member div',
            cursor: 'move',
            helper: 'clone',
            zIndex: 10,
    //         revert: true,
            cursorAt: { left: 0, top: 0 }, 
            revertDuration: 100,
            revert: function(is_valid_drop){
    //             console.log("is_valid_drop = " + is_valid_drop);
                return true;
            }
        };
}

function initMemberList(mems) {
    $("#memberlistbody").empty();
    for (var i = 0; i < mems.length; i++) {
        var m = mems[i];
        if (getAssignmentForMember(m.handle) === null) {
            $("#memberlistbody").append('<tr>' +
                                        '<td>' + (i + 1) + '</td>' +
                                        '<td><div handle="' + m.handle + '" class="ui-draggable member">' + m.name + '</div></td>' +
                                        '<td>' + m.callsign + '</td>' +
                                        '<td>' + m.rank + '</td>' +
                                        '<td>' + m.role + '</td>' +
                                        '<td>' + m.ships.join() + '</td>' +
                                        '<td>' + m.timezone + '</td>' +
                                        '<td>' + m.notes + '</td>' +
                                        '</tr>');
        }
    }

    $("#memberlistbody").find(".member").draggable(createDraggable());
}


function initWidgets() {
}

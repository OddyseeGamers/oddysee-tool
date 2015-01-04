
function addUnit() {
    $(".modal-title").html("Add Unit");

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
    $(".modal-title").html("Edit " + currPath[0].name);

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

function jumpTo(id) {
    if (id) {
        click(cache[id]);
    }
    return false;
}

function setInfo(d) {
    $("#nav").empty();

    var temp = '';
//     if (currPath.length > 1) {
//         for (var i = 0; i < currPath.length; i++) {
//              if (i > 0) {
//                 temp = '<li><a href="#" onClick=\'jumpTo("' + currPath[i].id + '")\'>' + currPath[i].name + '</a></li> | ' + temp;
//              } else {
//                 temp = '<li><a>' + currPath[i].name + '</a></li>' + temp;
//              }
//         }

//         $("#nav").append('<ul>' + temp + '</ul>');
//     }

    if (currPath.length > 1) {
        for (var i = 0; i < currPath.length; i++) {
//              if (i > 0) {
//                 temp = '<li><a href="#" onClick=\'jumpTo("' + currPath[i].id + '")\'>' + currPath[i].name + '</a></li> | ' + temp;
//              } else {
                temp = '<li><a>' + currPath[i].name + '</a></li>' + temp;
//              }
        }

        $("#nav").append('<ol class="breadcrumb">' + temp + '</ol>');
    }

    
    $("#name").html((d.type ? d.name  + " [" + d.type + "]" : d.name) + " [" + d.id + "]");
    $("#desc").html(d.desc ? d.desc : "");
    $("#rank").empty();

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
    console.debug("RMEM", assignMap);
    console.debug("RES", res);
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
}


function initAssign() {
    initSel("#divisionSel", orgstruc);
    initSel("#unitSel", orgstruc.children[0]);
    if(orgstruc.children[0].children) {
        setDrops(orgstruc.children[0].children[0]);
    }
}

function initSel(tag, obj) {
    $(tag).empty();

    var temp = "";
    if (obj.children) {
        obj.children.forEach(function(c) {
            temp += '<option value="' + c.id + '">' + c.name + '</option>';
        });
    }
    
    $(tag).append('<select>' + temp  + '</select>');
}

function setDrops(drop) {
    $("#dropList").empty();

    var temp = "";
    drop.children.forEach(function(c) {
//         var div = 
        temp += '<div id="' + c.id + '" class="droppilot">' + c.name + '<table><thead><tr><th>pilot</th><th>M</th></tr></thead><tbody>';
        var pilots = getAssignMembers(c.id);
        pilots.forEach(function(p) {
            var mem = getMember(p);
            if (mem) {
                temp += '<tr class="myhover"><td><div handle="' + mem.handle + '" class="ui-draggable member">' + mem.name + '</div></td><td></td></tr>';
            }
        });
        temp += '</tbody></table></div>';
    });
    $("#dropList").append(temp).find('.member').draggable({
//         containment: '.droppilot',
//         stack: '.member div',
        cursor: 'move',
        helper: 'clone',
//         revert: true,
        cursorAt: { left: 0, top: 0 }, 
        revertDuration: 100,
        revert: function(is_valid_drop){
            console.log("is_valid_drop = " + is_valid_drop);
            return true;
        }
    });



/*
    console.debug("find", $(this).find('.droppilot > table > tbody > tr > td > div.member'));
//     $(this).find(".tbody").append('<tr>' +
    $(this).find('.droppilot > table > tbody > tr > td > div.member').draggable({
//         containment: '.droppilot',
//         stack: '.member div',
        cursor: 'move',
        helper: 'clone',
//         revert: true,
        cursorAt: { left: 0, top: 0 }, 
        revertDuration: 100,
        revert: function(is_valid_drop){
            console.log("is_valid_drop = " + is_valid_drop);
            return true;
        }
    });

*/

    $('.droppilot').droppable( {
//           accept: '.member div',
          hoverClass: 'hovered',
          drop: handleDropEvent
    } );
}


function handleDropEvent( event, ui ) {
    var draggable = ui.draggable;

//     var isAss = isAssined();
//     assignMap.push({handle: draggable.attr('handle'), unit: parseInt($(this).attr('id'))});
    removeMember(draggable.attr('handle'), parseInt(ui.draggable.parent().parent().parent().parent().parent().attr('id')));
    assignMember(draggable.attr('handle'), parseInt($(this).attr('id')));
    // TODO: find reverse selector

//     console.debug("ID REMOVE",  ui.draggable.parent().parent().parent().parent().parent().attr('id'));

    ui.draggable.draggable( 'option', 'revert', false );
    ui.draggable.draggable( 'option', 'cursor', 'pointer' );
    ui.draggable.draggable( 'disable');
    ui.draggable.parent().parent().hide();
    var m = getMember(draggable.attr('handle'));
    $(this).find("tbody").append('<tr>' +
                                '<td><div handle="' + m.handle + '" class="ui-draggable member">' + m.name + '</div></td>' +
                                '<td>' + m.callsign + '</td>' +
                                '</tr>')
                            .find(".member").draggable({
//         containment: '.droppilot',
//         stack: '.member div',
        cursor: 'move',
        helper: 'clone',
//         revert: true,
        cursorAt: { left: 0, top: 0 }, 
        revertDuration: 100,
        revert: function(is_valid_drop){
            console.log("is_valid_drop = " + is_valid_drop);
            return true;
        }
    });
    setInfo(currPath[0]);

}

function initMemberList(mems) {
    $("#memberlistbody").empty();
    for (var i = 0; i < mems.length; i++) {
        var m = mems[i];
        if (getAssignmentForMember(m.handle) === null) {
            $("#memberlistbody").append('<tr class="myhover">' +
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

    $("#memberlistbody").find(".member").draggable({
//         containment: '.droppilot',
//         stack: '.member div',
        cursor: 'move',
        helper: 'clone',
//         revert: true,
        cursorAt: { left: 0, top: 0 }, 
        revertDuration: 100,
        revert: function(is_valid_drop){
            console.log("is_valid_drop = " + is_valid_drop);
            return true;
        }
    });

}


function initWidgets() {
}

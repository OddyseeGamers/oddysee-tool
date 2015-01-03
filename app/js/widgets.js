var dialog = null;

function appendUnit() {
    var i_name = $( "#i_name" );
    var i_desc = $( "#i_desc" );
    var i_type = $( "#i_type" );


    if (i_name.val().length > 0 && i_type.val()) {
//         console.debug("append upit now!", i_name.val(), i_desc.val(), i_type.val(), 'to', currPath[0]);

        var unit = new Unit(i_name.val(), i_type.val(), i_desc.val(), "#555555");
        console.debug("append upit now!", unit, 'to', currPath[0]);
        currPath[0].addUnit(unit);

        dialog.dialog( "close" );

        var div = d3.select("#svg");
        initOrg(div, orgstruc);

        return true;
    }

    return false;
}

function add() {
    console.debug("add");
    $("#i_type").empty();
    
    for (var i = 1; i < org_hierarchy.length; i++) {
        $("#i_type").append('<option value="' + org_hierarchy[i] + '">' + org_hierarchy[i] + '</option>');
    }

    dialog.dialog( "open" );
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
    if (currPath.length > 1) {
        for (var i = 0; i < currPath.length; i++) {
             if (i > 0) {
                temp = '<li><a href="#" onClick=\'jumpTo("' + currPath[i].id + '")\'>' + currPath[i].name + '</a></li> | ' + temp;
             } else {
                temp = '<li><a>' + currPath[i].name + '</a></li>' + temp;
             }
        }

        $("#nav").append('<ul>' + temp + '</ul>');
    }


    $("#name").html(d.name);
    $("#desc").html(d.desc ? d.desc : "");
    $("#type").html(d.type);
    $("#rank").empty();

    $("#leader").empty();
    if (d.leader && d.leader.length) {
        var m = getMember(d.leader[0]);
        if (m) {
            $("#rank").html(m.rank);
            $("#leader").html(m.name);
        }
    }

    $("#pilotcount").empty();
    if (d.pilots && d.pilots.length) {
        $("#pilotcount").html(d.pilots.length);
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
        temp += '<div id="' + c.id + '"class="droppilot">' + c.name + '<table><thead><tr><th>pilot</th><th>M</th></tr></thead><tbody>';
        c.pilots.forEach(function(p) {
            temp += '<tr><td>' + p + '</td><td></td></tr>';
        });
        temp += '</tbody></table></div>';
    });
    $("#dropList").append(temp);

    $('.droppilot').droppable( {
//           accept: '.member div',
          hoverClass: 'hovered',
          drop: handleDropEvent
    } );
}


function handleDropEvent( event, ui ) {
    var draggable = ui.draggable;
    assignMap.push({handle: draggable.attr('handle'), fleet: $(this).attr('id')});

    ui.draggable.draggable( 'option', 'revert', false );
    ui.draggable.draggable( 'option', 'cursor', 'pointer' );
    ui.draggable.draggable( 'disable');
    ui.draggable.parent().parent().hide();
    var m = getMember(draggable.attr('handle'));
    console.debug("add>>>", $(this).find("tbody"));
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

//     console.debug( 'Member', draggable.attr('handle'), 'was dropped onto', $(this).attr('id'), 'map', assignMap);
//     initMemberList2(mems);
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
    form = $( "#dialog-form" ).find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        appendUnit();
    });

    dialog = $( "#dialog-form" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Add Unit": appendUnit,
            Cancel: function() {
                dialog.dialog( "close" );
            }
        },
        close: function() {
            form[ 0 ].reset();
//             allFields.removeClass( "ui-state-error" );
        }
    });
}

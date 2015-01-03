var dialog = null;

var width = 600,
    height = width,
    radius = (width - 8) / 2,
    x = d3.scale.linear().range([0, 2 * Math.PI]),
    y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
    padding = 5,
    duration = 500;

var path = null;
var text = null;
var currPath = null;

var partition = d3.layout.partition()
    .sort(null)
    .value(function(d) { return 15.8 - d.depth; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });


function isParentOf(p, c) {
  if (p === c) {
//       if (p.id !== c.id) {
//           console.debug("found NOT parent:", p.id === c.id);
//       }
      return true;
  }
  if (p.children) {
    return p.children.some(function(d) {
      return isParentOf(d, c);
    });
  }
  return false;
}

function color(d) {
    if (d && d.depth === 0) {
        return "url(#img1)";
    }

      if (d.children) {
        var idx = d.children.length > 1 ? 1 : 0;
        var colors = d.children.map(color),
                a = d3.hsl(colors[0]),
                b = d3.hsl(colors[idx]);

        // L*a*b* might be better here...
        return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
      }

      return d.color || "#fff";
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        init(div, oddysee);

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



////////////////////////////////////////////////////////////////////////////////////////////////////////

// Interpolate the scales!
function arcTween(d) {
  var my = maxY(d),
      xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, my]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
//     console.debug("arc", xd, '|', yd, '-', yr, '  -   ', my);
//     console.debug("arc", my);
  return function(d) {
    return function(t) { 
        x.domain(xd(t));
        y.domain(yd(t)).range(yr(t));
        var ret = arc(d);
//         return arc(d);

//         console.debug("RET", d, '-', t);
        return ret;
    };
  };
}

function maxY(d) {
    ret = d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
    return ret;
}

// http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
function brightness(rgb) {
  return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
}


function click(d) {
    currPath = [ d ];

    var temp = d;
    while (temp.parent) {
        currPath.push(temp.parent);
        temp = temp.parent;
    }


//     console.debug("PATH", currPath);
//     if (currPath === d.name) {
        //         return;
//     } else {
//     }
    setInfo(d);
//     console.debug("---------------------------------------- click");

    return;

//     console.debug("click", d, this);
//     window.location.href.substr(0, window.location.href.indexOf('#'));
    path.transition()
    .duration(duration)
    .attrTween("d", arcTween(d));

//     console.debug("clicked", d);

    // Somewhat of a hack as we rely on arcTween updating the scales.
    text.style("visibility", function(e) {
//         console.debug("check parent:", e, isParentOf(d, e));
        return isParentOf(d, e) ? null : d3.select(this).style("visibility");
    })
    .transition()
    .duration(duration)
    .attrTween("text-anchor", function(d) {
        return function() {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
        };
    })
    .attrTween("transform", function(d) {
        var multiline = (d.name || "").split(" ").length > 1;
        return function() {
            var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
            rotate = angle + (multiline ? - 0.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
        };
    })
    .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
    .each("end", function(e) {
        if (currPath === d.name) {
            return;
        }

        d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
    });
}


function init(svg, struc) {
    var nodes = partition.nodes(struc);
    console.debug("svg", svg, struc.name);

//    console.debug("FOUND???", $(gr).length);
//    if (gr) {
//        console.debug("REMOVE", gr[0]);
//    }

    $("#org_group").remove();

    var vis = svg.append("g")
            .attr("id", "org_group")
            .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

    path = vis.selectAll("path").data(nodes);
    path.enter().append("path")
            .attr("id", function(d, i) { return "path-" + d.id; })
            .attr("d", arc)
            .attr("fill-rule", "evenodd")
            .style("fill", color)
//             .style("x", function(d, i) { console.debug("get width for", d, '-',  i); return (i === 0) ? d.dx : 0; })
            .on("click", click);
//             .append("image")
//             .attr("xlink:href", function(d, i) { return (i === 0) ? "default/files/sitelogo_0.png" : ""; })
//             .attr("width", function(d, i) { console.debug("get width for", d, '-',  i); return (i === 0) ? "50px" : "0px"; })
//             .attr("height", function(d, i) { console.debug("get width for", d, '-',  i); return (i === 0) ? "50px" : "0px"; })
//             .attr("x", function(d, i) { console.debug("get width for", d, '-',  i); return (i === 0) ? d.dx : 0; })
//             .attr("y", function(d, i) { console.debug("get width for", d, '-',  i); return (i === 0) ? d.dy : 0; });
//     console.debug("path agin", path);
//      xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">
//     <image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>

    currPath = [struc];
    setInfo(struc);
    
    var iw = 90;
    var ih = 90;
    var xoffset = 59.5;
    var yoffset = xoffset;
//     var xoffset = -4.7;
//     var yoffset = -4.5;
//     var pos = $("#path-0").position();
//     console.debug("path pos", pos);
//     var p = $("#path-0").clone();
//     console.debug("clone", p);
//     path.prepend(p);

    $("#img1")
        .attr('x', radius + padding - iw / 2 + xoffset)
        .attr('y', radius + padding - ih / 2 + yoffset)
//         .attr('x', 0 )
//         .attr('y', 0)
        .attr('width', iw)
        .attr('height', ih);
//         .attr('fill', "#f00");

//     var p = $("#logo").clone();
//     console.debug("clone", p);
//     $("path-0").append(p);

    text = vis.selectAll("text").data(nodes);
    var textEnter = text.enter().append("text")
            .style("fill-opacity", 1)
            .style("fill", function(d) {
                return brightness(d3.rgb(color(d))) < 125 ? "#eee" : "#000";
            })
            .attr("text-anchor", function(d) {
                return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
            })
            .attr("dy", ".2em")
            .attr("transform", function(d) {
//                 console.debug("WTF", d);
                var multiline = (d.name || "").split(" ").length > 1,
                angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle + (multiline ? - 0.5 : 0);
                return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
            })
            .on("click", click);

    textEnter.append("tspan")
        .attr("x", 0)
        .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });

    textEnter.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });

    path.on('mouseover',function(d,i){
//         console.debug("path in", d, '-', i);
        DragDropManager.droppable = d; 
    });

// Clear the target from the DragDropManager on mouseOut.
    path.on('mouseout',function(e){
//         console.debug("path out", e);
        DragDropManager.droppable = null;
    });

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

var DragDropManager = {
	dragged: null,
	droppable: null,
	draggedMatchesTarget: function() {
//         console.debug(">>> DRAG", (this.droppable) ? this.droppable : "nothin");
		if (!this.droppable) return false;
        return this.droppable.type === "flight";
//         return (dwarfSet[this.droppable].indexOf(this.dragged) >= 0);
//         console.debug(">>> DRAG", this.droppable, '-', this.dragged);
//         return true;
	},
	draggedMatchesTarget2: function() {
//         console.debug(">>> DRAG", (this.droppable) ? this.droppable : "nothin");
        console.debug(">>> DRAG", this);
        return false;
//         if (!this.droppable) return false;
//         return this.droppable.type === "flight";
//         return (dwarfSet[this.droppable].indexOf(this.dragged) >= 0);
//         console.debug(">>> DRAG", this.droppable, '-', this.dragged);
//         return true;
	}


    /*
	draggedMatchesTarget: function() {
//         console.debug(">>> DRAG", (this.droppable) ? this.droppable : "nothin");
		if (!this.droppable) return false;
        return this.droppable.type === "flight";
//         return (dwarfSet[this.droppable].indexOf(this.dragged) >= 0);
//         console.debug(">>> DRAG", this.droppable, '-', this.dragged);
//         return true;
	}
    */
};

function initAssign() {
    initSel("#divisionSel", oddysee);
    initSel("#unitSel", oddysee.children[0]);
    setDrops(oddysee.children[0].children[0]);
}

function initSel(tag, obj) {
    $(tag).empty();

    var temp = "";
    obj.children.forEach(function(c) {
        temp += '<option value="' + c.id + '">' + c.name + '</option>';
    });
    
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

function initMemberList2(mems) {
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

/*
    var body = d3.select("body");
    $(".member").draggable({
//         appendTo: 'body',
        helper: 'clone',
//         scroll: true,
        revert: true,
        revertDuration: 100
    });
    */
        /*

//         cursorAt: { left: -2, top: -2 }
        // Register what we're dragging with the drop manager
        start: function (e) {
            // Getting the datum from the standard event target requires more work.
//             console.debug("HIDE THIS", $(this).parent());
//             $(this).hide();

            console.debug("start", e.target, '|', d3.select(e.target).datum());
            DragDropManager.dragged = e.target;
        },
        // Set cursors based on matches, prepare for a drop
        drag: function (e) {
            matches = DragDropManager.draggedMatchesTarget2();
            body.style("cursor",function() {
                if (matches) {
                    return "copy";
                } else {
                    return "move";
                }
            });
            // Eliminate the animation on revert for matches.
            // We have to set the revert duration here instead of "stop"
            // in order to have the change take effect.
            $(e.target).draggable("option","revertDuration",(matches) ? 0 : 100);
        },
        // Handle the end state. For this example, disable correct drops
        // then reset the standard cursor.
        stop: function (e,ui) {
            // Dropped on a non-matching target.
            if (!DragDropManager.draggedMatchesTarget2()) {
//                 $(this).parent().show();
                return;
            }
//             var t = $(e.srcElement).attr("id").split("-")[1];
//             cache[t].pilots.push(e.target.id);
//             if (cache[t] === currPath[0]) {
//                 setInfo(cache[t]);
//             }
            $("body").css("cursor", "");
        }
    });
*/


}


function initMemberList(mems) {
//     var tab = $(".memberlist").append("<div class=\"memberlisttab\">");
    for (var i = 0; i < mems.length; i++) {
        $(".memberlist").append("<div id=\"" + i + "\" class=\"ui-draggable member\">" + mems[i].name + "</div>");
//         tab.append("<li id=\"" + i + "\" class=\"ui-draggable\">" + mems[i].name + "</li>");
//                             .on("click", function() { console.debug("clicked", this); } );

    }
//     $(".memberlist").append("</ul>");

/*
    var tab = $(".memberlist").append("<ul class=\"memberlisttab\">");
    for (var i = 0; i < mems.length; i++) {
        $(".memberlisttab").append("<li id=\"" + i + "\" class=\"ui-draggable\">" + mems[i].name + "</li>");
//         tab.append("<li id=\"" + i + "\" class=\"ui-draggable\">" + mems[i].name + "</li>");
//                             .on("click", function() { console.debug("clicked", this); } );

    }
    $(".memberlist").append("</ul>");
*/
//     $('.memberlist tr').click(function() {
//         var id = $(this)[0].id;
//         if (id) {
//             console.debug(">>>> HREF", id);
//             setMemberInfo(mems[id]);
//         }
//     });

    var body = d3.select("body");
    $(".member").draggable({
//         appendTo: 'body',
        helper: 'clone',
//         scroll: true,
        revert: true,
        revertDuration: 100,
        cursorAt: { left: -2, top: -2 }, 

        // Register what we're dragging with the drop manager
        start: function (e) {
            // Getting the datum from the standard event target requires more work.
            $(this).hide();
            DragDropManager.dragged = d3.select(e.target).datum();
        },
        // Set cursors based on matches, prepare for a drop
        drag: function (e) {
            matches = DragDropManager.draggedMatchesTarget();
            body.style("cursor",function() {
                if (matches) {
//                     console.debug("set glow class", this, e.target);
//                     var item = d3.select(e.target);
//                     console.debug("    item? ", $(e));
                    $(e.srcElement).attr("class", "glow");
//                     console.debug("    item? ", $(e.srcElement).attr('class'));
                    return "copy";
                } else {
//                     $(e.srcElement).removeClass("glow");
//                     if ($(e.srcElement).attr("class") === "";

//                     $(e.srcElement).removeAttr("class");
                    return "move";
                }
                
//                 return (matches) ? "copy" : "move";
            });
            // Eliminate the animation on revert for matches.
            // We have to set the revert duration here instead of "stop"
            // in order to have the change take effect.
            $(e.target).draggable("option","revertDuration",(matches) ? 0 : 100);
        },
        // Handle the end state. For this example, disable correct drops
        // then reset the standard cursor.
        stop: function (e,ui) {
            // Dropped on a non-matching target.
//             console.debug("stop");
            if (!DragDropManager.draggedMatchesTarget()) {
                $(this).show();
                return;
            }
            var t = $(e.srcElement).attr("id").split("-")[1];
//             var t1 = $($(e.srcElement).data());
            cache[t].pilots.push(e.target.id);
            if (cache[t] === currPath[0]) {
                setInfo(cache[t]);
            }
//             console.debug("update info", cache[t], '-', currPath[0], '==', (cache[t] === currPath[0]));
//             console.debug("set", e.target.id, '-', cache[t]); // , Object.keys(t1), t1, e); //, $(e.srcElement).data(), '-', $(e.srcElement).attr("id"));
//             $(e.target).draggable("disable");
            $("body").css("cursor","");
        }
    });

//     $('.memberlist').mousedown(function(e){
//         console.debug("drag this", this, e);
//         var shape = this.id;
//         this.setAttribute("cx", e.pageX);
//         this.setAttribute("cy", e.pageY);
//     });
}

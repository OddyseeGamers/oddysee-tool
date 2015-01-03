
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


function initOrg(struc) {
    var svg = d3.select("#svg");
    var nodes = partition.nodes(struc);
    console.debug("loading svg", svg, struc.name);
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

/*
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
    */
}


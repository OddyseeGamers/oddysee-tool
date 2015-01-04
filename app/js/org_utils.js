var width = 630,
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

function jumpTo(id) {
    if (id) {
        click(cache[id]);
    }
    return false;
}

function click(d) {
    currPath = [ d ];

    var temp = d;
    while (temp.parent) {
        currPath.push(temp.parent);
        temp = temp.parent;
    }


    setInfo(d);

/***** ANIMATION *******/
/*  
    path.transition()
    .duration(duration)
    .attrTween("d", arcTween(d));

    // Somewhat of a hack as we rely on arcTween updating the scales.
    text.style("visibility", function(e) {
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
*/
}

function initPath() {
    currPath = [orgstruc];
    setInfo(orgstruc);
    initOrg();
}

function initOrg() {
    var svg = d3.select("#svg");
    var nodes = partition.nodes(orgstruc);


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
            .on("click", click);


    
    var iw = 90;
    var ih = 90;
    var xoffset = 43.5;
    var yoffset = xoffset;


    $("#img1")
        .attr('x', radius + padding - iw / 2 + xoffset)
        .attr('y', radius + padding - ih / 2 + yoffset)
        .attr('width', iw)
        .attr('height', ih);



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
}


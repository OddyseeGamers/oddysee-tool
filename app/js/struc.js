var org_hierarchy = [ "org", "division", "branch", "fleet", "unit", "squadron" ];
var assignMap = [ ];

var cache = [];
function Node(name, type, desc, color, id) {
  this.name = name;
  this.type = type;
  if (typeof(id) === 'undefined') {
      this.id = null;
  } else {
      this.id = id;
  }

  this.desc = desc;
  this.color = color;

  this.leader = [];
  this.children = [];
  this.pilots = [];
}

Node.prototype.addUnit = function (unit) {
    if (!this.children) {
        this.children = [];
    }
    this.children.push(unit);
};

function Unit (name, type, desc, color) {
  Node.call(this, name, type, desc, color, cache.length);
  cache.push(this);
}

Unit.prototype = Object.create(Node.prototype);
Unit.prototype.constructor = Unit;

function getMember(handle) {
    for (var i = 0; i < mems.length; i++) {
        if (mems[i].handle === handle) {
            return mems[i];
        }
    }
    return null;
}

function getAssignmentForMember(handle) {
    for (var i = 0; i < assignMap.length; i++) {
        if (assignMap[i].handle === handle) {
            return assignMap[i].fleet;
        }
    }
    return null;
}

function findMember(handle, unitid) {
    for (var i = 0; i < assignMap.length; i++) {
        if (assignMap[i].handle === handle && assignMap[i].unit === unitid) {
            return i;
        }
    }
    return -1;
}


function assignMember(handle, unitid) {
    if (findMember(handle, unitid) < 0) {
        assignMap.push({handle: handle, unit: unitid});
    }
}

function removeMember(handle, unitid) {
    var idx = findMember(handle, unitid);

    var idxs = [];
    if (idx < 0) {
        idxs = getAssignMemberObjects(unitid);
    } else {
        idxs.push(idx);
    }

    var wtf = [];
    for (var i = 0; i < assignMap.length; i++) {
        for (var j = 0; j < idxs.length; j++) {
            if (i !== idxs[j]) {
                wtf.push(assignMap[i]);
            }
        }
    }

    assignMap = wtf;
    // TODO: WTF
//     var r = assignMap.slice(0, 1);
}

function getAssignMemberObjects(id) {
    var res = [];
    var unit = cache[id];
    
    if (unit) {
        for (var i = 0; i < assignMap.length; i++) {
            mem = assignMap[i];
            if (id === mem.unit) {
                res.push(i);
            }
        }
    
        if (unit.children) {
            unit.children.forEach(function(child) {
                var temp = getAssignMemberObjects(child.id);
                res = res.concat(temp);
            });
        }
        
    }

    return res;
}


function getAssignMembers(id) {
    var res = [];
    var unit = cache[id];
    
    if (unit) {
        assignMap.forEach(function(mem) {
            if (id === mem.unit) {
                res.push(mem.handle);
            }
        });
    
        if (unit.children) {
            unit.children.forEach(function(child) {
                var temp = getAssignMembers(child.id);
                res = res.concat(temp);
            });
        }
        
    }

    return res;
}

var orgstruc = new Unit("ODDYSEE", "org");
function initOrgStruc() {
    var lid = new Unit("LID", "division", "Logistics And Intelligence Division");
    var oper = new Unit("Operations", "branch", "", "#bb0000");
    var trade = new Unit("Trade Logistics", "branch");
    var pf = new Unit("Pathfinder", "branch");
    var tech = new Unit("Tech Salvage", "branch");

    var tr = new Unit("Trading", "unit", "", "#cc0000");
    var mi = new Unit("Mining", "unit", "", "#cc0000");
    var lo = new Unit("Logistics", "unit", "", "#cc0000");
    var bo = new Unit("Base Operations", "unit", "", "#cc0000");
    trade.addUnit(tr);
    trade.addUnit(mi);
    trade.addUnit(lo);
    trade.addUnit(bo);


    var ca = new Unit("Cartography", "unit", "", "#990000");
    var na = new Unit("Navigation", "unit", "", "#990000");
    var ph = new Unit("Pathfinder", "unit", "", "#990000");
    var op = new Unit("Operations", "unit", "", "#990000");
    pf.addUnit(ca);
    pf.addUnit(na);
    pf.addUnit(ph);
    pf.addUnit(op);


    var sa = new Unit("Salvage", "unit", "", "#660000");
    var bb = new Unit("Boarding", "unit", "", "#660000");
    var te = new Unit("Technology", "unit", "", "#660000");
    var or = new Unit("Ordinance", "unit", "", "#660000");
    var oe = new Unit("Operations", "unit", "", "#660000");
    tech.addUnit(sa);
    tech.addUnit(bb);
    tech.addUnit(te);
    tech.addUnit(or);
    tech.addUnit(oe);


    lid.addUnit(oper);
    lid.addUnit(trade);
    lid.addUnit(pf);
    lid.addUnit(tech);


    var rec = new Unit("REC", "division", "", "#ffd700");


    var prcom = new Unit("PRCOM", "division");
    var p1 = new Unit("Contracts", "branch", "", "#00ffff");
    var p2 = new Unit("Racing", "branch", "", "#00ffff");
    var p3 = new Unit("Public Relations", "branch", "", "#00ffff");
    prcom.addUnit(p1);
    prcom.addUnit(p2);
    prcom.addUnit(p3);

    var stratcom = new Unit("STRATCOM", "division", "Strategy Command");

    var fleet1 = new Unit("1st Fleet", "fleet");

    var sqd1 = new Unit("Light Fighters", "squadron", "", "#0000ff");
    var sqd2 = new Unit("Heavy Fighters", "squadron", "", "#0000ff");
    var sqd3 = new Unit("Assault/Bombers", "squadron", "", "#0000ff");
    var sqd4 = new Unit("Recon", "squadron", "", "#0000ff");
    var sqd5 = new Unit("Gunships/ Transports", "squadron", "", "#0000ff");
    var sqd6 = new Unit("Capital Ships Command", "squadron", "", "#0000ff");

    fleet1.addUnit(sqd1);
    fleet1.addUnit(sqd2);
    fleet1.addUnit(sqd3);
    fleet1.addUnit(sqd4);
    fleet1.addUnit(sqd5);
    fleet1.addUnit(sqd6);

    stratcom.addUnit(fleet1);


    var fleet2 = new Unit("2nd Fleet", "fleet");

    sqd1 = new Unit("Light Fighters", "squadron", "", "#0000cc");
    sqd2 = new Unit("Heavy Fighters", "squadron", "", "#0000cc");
    sqd3 = new Unit("Assault/ Bombers", "squadron", "", "#0000cc");
    sqd4 = new Unit("Recon", "squadron", "", "#0000cc");
    sqd5 = new Unit("Gunships/ Transports", "squadron", "", "#0000cc");
    sqd6 = new Unit("Capital Ships Command", "squadron", "", "#0000cc");

    fleet2.addUnit(sqd1);
    fleet2.addUnit(sqd2);
    fleet2.addUnit(sqd3);
    fleet2.addUnit(sqd4);
    fleet2.addUnit(sqd5);
    fleet2.addUnit(sqd6);

    stratcom.addUnit(fleet2);

    var marine = new Unit("Marine Command", "fleet");
    var mc1 = new Unit("Marine Squads", "squadron", "", "#000099");

    marine.addUnit(mc1);

    stratcom.addUnit(marine);

    orgstruc.leader.push("mem001");
    orgstruc.leader.push("mem003");


    orgstruc.addUnit(stratcom);
    orgstruc.addUnit(lid);
    orgstruc.addUnit(rec);
    orgstruc.addUnit(prcom);

//     assignMap.push({handle: "mem001", unit: 5});
    assignMap.push({handle: "mem002", unit: 5});
//     assignMap.push({handle: "mem004", unit: 7});

//     assignMap.push({handle: "mem005", unit: 26});
//     assignMap.push({handle: "mem006", unit: 26});
//     assignMap.push({handle: "mem007", unit: 34});
//     assignMap.push({handle: "mem008", unit: 34});
//     assignMap.push({handle: "mem009", unit: 34});
//     assignMap.push({handle: "mem010", unit: 40});
}

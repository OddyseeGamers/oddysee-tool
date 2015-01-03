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

function getAssignMembers(fleetid) {
}

var orgstruc = new Unit("ORGNAME", "org");
function initTree() {

    var no1 = new Unit("no1", "division", "");

    var sub1 = new Unit("sub 1", "fleet", "");
    var sub2 = new Unit("sub 2", "fleet", "", "#ff0000");
    var sub3 = new Unit("sub 3", "fleet", "", "#ff0000");

    var s1 = new Unit("squad 1", "squadron", "", "#ff3333");
    var s2 = new Unit("squad 2", "squadron", "", "#ff3333");
    var s3 = new Unit("squad 3", "squadron", "", "#ff3333");

    sub1.addUnit(s1);
    sub1.addUnit(s2);
    sub1.addUnit(s3);

    no1.addUnit(sub1);
    no1.addUnit(sub2);
    no1.addUnit(sub3);

    var no2 = new Unit("no2", "division", "", "#00ff00");
    var no3 = new Unit("no3", "division", "", "#0000ff");
    var no4 = new Unit("no4", "division", "", "#ffff00");

    orgstruc.leader.push("name1");
    orgstruc.leader.push("name2");

    orgstruc.addUnit(no1);
    orgstruc.addUnit(no2);
    orgstruc.addUnit(no3);
    orgstruc.addUnit(no4);
}

initTree();

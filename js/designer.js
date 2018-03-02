// JavaScript Document
//@ firefox无法直接获取event事件所以有Bug
var paper;
var moveX,moveY;
$(function () {
    paper = new Raphael(document.getElementById("flow"), 1800, 600);
    $(".tool_part").each(function () {
        $(this).draggable({helper: "clone", cursor: 'move'})
    });

    $("#flow").droppable({
        accept: ".tool_part",
        drop: function (event, ui) {
            drawSvg(ui.helper.attr("type"), event.clientX, event.clientY);
        }
    });
})


var lineType = false;//默认的
var deleteType = false;
var tempData = ["no", "no", "no"];//存储需要连线的元素信息，可扩展
function getLineType() {
    if (lineType == false) {
        lineType = true;
        $("#next").css('background', 'gray');

    }
    else {
        lineType = false;
        $("#next").css('background', '')

    }
}

function Delete() {
    if (deleteType == false) {
        deleteType = true;
        $("#del").css('background', 'gray');


    }
    else {
        deleteType = false;
        deleteType = true;
        $("#del").css('background', '');


    }
}

function getLine(element1, element2) {
    var fromDotX = element1.attr("x") + element1.attr("width") / 2;
    var fromDotY = element1.attr("y") + element1.attr("height") / 2;
    var toDotX = element2.attr("x") + element2.attr("width") / 2;
    var toDotY = element2.attr("y") + element2.attr("height") / 2;
    return "M " + fromDotX + " " + fromDotY + " L " + toDotX + " " + toDotY + "";
}

function getElementLine(elementId) {
    var element = paper.getById(elementId);

    var p1 = element.attr("x");
    var p2 = element.attr("y");
    var p3 = element.attr("x") + element.attr("width");
    var p4 = element.attr("y");
    var p5 = element.attr("x") + element.attr("width");
    var p6 = element.attr("y") + element.attr("height");
    var p7 = element.attr("x");
    var p8 = element.attr("y") + element.attr("height");
    //console.log("M "+p1+" "+p2+" L "+p3+" "+p4+" L "+p5+" "+p6+" L "+p7+"  "+p8+" L "+p1+"  "+p2+"");
    return "M " + p1 + " " + p2 + " L " + p3 + " " + p4 + " L " + p5 + " " + p6 + " L " + p7 + "  " + p8 + " L " + p1 + "  " + p2 + "";
}


function drawSvg(tool_type, x, y) {

    if ("begin&end" == tool_type) {
        console.log(tool_type)
        var start = paper.image("js/images/48/begin&end.png", x - 184, y - 75, 50, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

        var startId = start.id;
        showId(startId);
        var myStart = function () {
            start.ox = start.attr("x");//自定义该对象坐标存储变量
            start.oy = start.attr("y");
            showId(startId);
        }
        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            start.attr({x: moveX});
            start.attr({y: moveY});

            //判断是否有关联线
            if (start.dotArray) {

                for (var i = 0; i < start.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == start.dotArray[i].state) {
                        var connLine = getLine(paper.getById(start.dotArray[i].id), start);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(start.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(start.id));

                        var path = paper.getById(start.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == start.dotArray[i].state) {

                        var connLine = getLine(paper.getById(start.dotArray[i].id), start);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(start.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(start.dotArray[i].id));
                        var path = paper.getById(start.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                }
            }
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            start.attr({x: moveX});
            start.attr({y: moveY});
        }

        start.click(function () {
            if (lineType) {
                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;
                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素
                    var connLine = getLine(element, start);//交点连线
                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(start.id));//终点
                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线
                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: start.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: start.id});
                    }
                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(start.id);
                    }
                    $("#next").css('background', '');
                }
                else {
                    tempData[0] = start.id;
                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {
                    console.log(start.id)
                    var id = start.id;
                    if (document.getElementById(id + "begin&end")) {
                        $("#" + id + "begin&end").css('display', 'none');
                        $("#" + id + "begin&end").remove();
                    }
                    this.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }

    if ("rectangle" == tool_type) {
        console.log(tool_type)
        var rectangle = paper.image("js/images/48/rectangle.png", x - 184, y - 75, 50, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });
        var realText = paper.text(x - 140, y - 50, 'Task1').attr({
            'font-size': 14,
            cursor: 'pointer',
            'font-family': '微软雅黑'
        }).click(function () {
            showMessage(recId, realTextId);
        });

        var recId = rectangle.id;
        var realTextId = realText.id;
        showMessage(recId, realTextId);

        var myStart = function () {

            showId(recId);
        }
        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            realText.attr({x: (moveX + rectangle.attr("width") / 2)});
            realText.attr({y: (moveY + rectangle.attr("height") / 2)});
            rectangle.attr({x: moveX});
            rectangle.attr({y: moveY});

            //判断是否有关联线
            if (rectangle.dotArray) {
                for (var i = 0; i < rectangle.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == rectangle.dotArray[i].state) {
                        var connLine = getLine(paper.getById(rectangle.dotArray[i].id), rectangle);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(rectangle.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(rectangle.id));

                        var path = paper.getById(rectangle.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == rectangle.dotArray[i].state) {

                        var connLine = getLine(paper.getById(rectangle.dotArray[i].id), rectangle);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(rectangle.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(rectangle.dotArray[i].id));
                        var path = paper.getById(rectangle.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            rectangle.attr({x: moveX});
            rectangle.attr({y: moveY});
        }

        rectangle.click(function () {
            if (lineType) {
                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, rectangle);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(rectangle.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: rectangle.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: rectangle.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(rectangle.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = rectangle.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(rectangle.id)
                    var id = rectangle.id;
                    var textid = realText.id;
                    if (document.getElementById(id + "rectangle")) {
                        $("#" + id + "rectangle").css('display', 'none');
                        $("#" + id + "rectangle").remove();
                    }
                    if (document.getElementById(textid + "realText")) {
                        $("#" + textid + "realText").css('display', 'none');
                        $("#" + textid + "realText").remove();
                    }
                    this.remove();
                    realText.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }
    /*
	**绘制task1
	*/
    if ("datasave" == tool_type) {
        var datasave = paper.image("js/images/48/datasave.png", x - 184, y - 75, 100, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

        var realText = paper.text(x - 140, y - 50, 'Task1').attr({
            'font-size': 14,
            cursor: 'pointer',
            'font-family': '微软雅黑'
        }).click(function () {
            showMessage(datasaveId, realTextId);
        });

        var datasaveId = datasave.id;
        var realTextId = realText.id;
        showMessage(datasaveId, realTextId);

        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            datasave.attr({x: moveX});
            datasave.attr({y: moveY});
            realText.attr({x: (moveX + datasave.attr("width") / 2)});
            realText.attr({y: (moveY + datasave.attr("height") / 2)});

            if (datasave.dotArray) {

                for (var i = 0; i < datasave.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == datasave.dotArray[i].state) {
                        var connLine = getLine(paper.getById(datasave.dotArray[i].id), datasave);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(datasave.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(datasave.id));

                        var path = paper.getById(datasave.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == datasave.dotArray[i].state) {

                        var connLine = getLine(paper.getById(datasave.dotArray[i].id), datasave);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(datasave.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(datasave.dotArray[i].id));
                        var path = paper.getById(datasave.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }
        }
        var myStart = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            showMessage(datasaveId, realTextId);
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            datasave.attr({x: moveX});
            datasave.attr({y: moveY});
        }

        datasave.click(function () {
            if (lineType) {

                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, datasave);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(datasave.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: datasave.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: datasave.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(datasave.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = datasave.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(datasave.id)
                    var id = datasave.id;
                    var textid = realText.id;
                    if (document.getElementById(id + "datasave")) {
                        $("#" + id + "datasave").css('display', 'none');
                        $("#" + id + "datasave").remove();
                    }
                    if (document.getElementById(textid + "realText")) {
                        $("#" + textid + "realText").css('display', 'none');
                        $("#" + textid + "realText").remove();
                    }
                    this.remove();
                    realText.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }
    /*
	**绘制task2
	*/
    if ("lingxing" == tool_type) {
        var lingxing = paper.image("js/images/48/lingxing.png", x - 184, y - 75, 100, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

        var realText = paper.text(x - 140, y - 50, 'Task2').attr({
            'font-size': 14,
            cursor: 'pointer',
            'font-family': '微软雅黑'
        }).click(function () {
            showMessage(lingxingId, realTextId);
        });

        var lingxingId = lingxing.id;
        var realTextId = realText.id;
        showMessage(lingxingId, realTextId);

        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            lingxing.attr({x: moveX});
            lingxing.attr({y: moveY});
            realText.attr({x: (moveX + lingxing.attr("width") / 2)});
            realText.attr({y: (moveY + lingxing.attr("height") / 2)});

            if (lingxing.dotArray) {

                for (var i = 0; i < lingxing.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == lingxing.dotArray[i].state) {
                        var connLine = getLine(paper.getById(lingxing.dotArray[i].id), lingxing);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(lingxing.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(lingxing.id));

                        var path = paper.getById(lingxing.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == lingxing.dotArray[i].state) {

                        var connLine = getLine(paper.getById(lingxing.dotArray[i].id), lingxing);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(lingxing.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(lingxing.dotArray[i].id));
                        var path = paper.getById(lingxing.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }
        }
        var myStart = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            showMessage(lingxingId, realTextId);
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            lingxing.attr({x: moveX});
            lingxing.attr({y: moveY});
        }

        lingxing.click(function () {
            if (lineType) {

                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, lingxing);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(lingxing.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: lingxing.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: lingxing.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(lingxing.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = lingxing.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(lingxing.id)
                    var id = lingxing.id;
                    var textid = realText.id;
                    if (document.getElementById(id + "lingxing")) {
                        $("#" + id + "lingxing").css('display', 'none');
                        $("#" + id + "lingxing").remove();
                    }
                    if (document.getElementById(textid + "realText")) {
                        $("#" + textid + "realText").css('display', 'none');
                        $("#" + textid + "realText").remove();
                    }
                    this.remove();
                    realText.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }
    /*
	 *绘制task3
	 */
    if ("round" == tool_type) {
        var round = paper.image("js/images/48/round.png", x - 184, y - 75, 50, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

        var realText = paper.text(x - 140, y - 50, 'Task3').attr({
            'font-size': 14,
            cursor: 'pointer',
            'font-family': '微软雅黑'
        }).click(function () {
            showMessage(roundId, realTextId);
        });


        var roundId = round.id;
        var realTextId = realText.id;
        showMessage(roundId, realTextId);

        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            round.attr({x: moveX});
            round.attr({y: moveY});
            realText.attr({x: (moveX + round.attr("width") / 2)});
            realText.attr({y: (moveY + round.attr("height") / 2)});

            if (round.dotArray) {

                for (var i = 0; i < round.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == round.dotArray[i].state) {
                        var connLine = getLine(paper.getById(round.dotArray[i].id), round);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(round.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(round.id));

                        var path = paper.getById(round.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == round.dotArray[i].state) {

                        var connLine = getLine(paper.getById(round.dotArray[i].id), round);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(round.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(round.dotArray[i].id));
                        var path = paper.getById(round.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }

        }
        var myStart = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            showMessage(roundId, realTextId);
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            round.attr({x: moveX});
            round.attr({y: moveY});
        }
        round.click(function () {
            if (lineType) {

                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, round);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(round.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: round.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: round.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(round.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = round.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(round.id)
                    var id = round.id;
                    var textid = realText.id;
                    if (document.getElementById(id + "round")) {
                        $("#" + id + "round").css('display', 'none');
                        $("#" + id + "round").remove();
                    }
                    if (document.getElementById(textid + "realText")) {
                        $("#" + textid + "realText").css('display', 'none');
                        $("#" + textid + "realText").remove();
                    }
                    this.remove();
                    realText.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }
    /*
	*绘制judge
	*/

    if ("srect" == tool_type) {
        console.log(tool_type)
        var srect = paper.image("js/images/48/srect.png", x - 184, y - 75, 50, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

        var realText = paper.text(x - 140, y - 50, 'Task1').attr({
            'font-size': 14,
            cursor: 'pointer',
            'font-family': '微软雅黑'
        }).click(function () {
            showMessage(srectId, realTextId);
        });


        var srectId = srect.id;
        var realTextId = realText.id;
        showMessage(recId, realTextId);
        var myStart = function () {
            showId(srectId);
        }
        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            srect.attr({x: moveX});
            srect.attr({y: moveY});
            realText.attr({x: (moveX + srect.attr("width") / 2)});
            realText.attr({y: (moveY + srect.attr("height") / 2)});
            if (srect.dotArray) {

                for (var i = 0; i < srect.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == srect.dotArray[i].state) {
                        var connLine = getLine(paper.getById(srect.dotArray[i].id), srect);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(srect.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(srect.id));

                        var path = paper.getById(srect.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == srect.dotArray[i].state) {

                        var connLine = getLine(paper.getById(srect.dotArray[i].id), srect);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(srect.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(srect.dotArray[i].id));
                        var path = paper.getById(srect.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }

        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            srect.attr({x: moveX});
            srect.attr({y: moveY});
        }


        srect.click(function () {
            if (lineType) {

                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, srect);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(srect.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: srect.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: srect.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(srect.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = srect.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(srect.id)
                    var id = srect.id;
                    var textid = realText.id;
                    if (document.getElementById(id + "srect")) {
                        $("#" + id + "srect").css('display', 'none');
                        $("#" + id + "srect").remove();
                    }
                    if (document.getElementById(textid + "realText")) {
                        $("#" + textid + "realText").css('display', 'none');
                        $("#" + textid + "realText").remove();
                    }
                    this.remove();
                    srect.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });


    }

    if ("input" == tool_type) {
        console.log(tool_type)
        var input = paper.image("js/images/48/input.png", x - 184, y - 75, 50, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

        var inputId = input.id;
        showId(inputId);
        var myStart = function () {
            showId(inputId);
        }
        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            input.attr({x: moveX});
            input.attr({y: moveY});

            if (input.dotArray) {

                for (var i = 0; i < input.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == input.dotArray[i].state) {
                        var connLine = getLine(paper.getById(input.dotArray[i].id), input);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(input.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(input.id));

                        var path = paper.getById(input.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == input.dotArray[i].state) {

                        var connLine = getLine(paper.getById(input.dotArray[i].id), input);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(input.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(input.dotArray[i].id));
                        var path = paper.getById(input.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }

        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            input.attr({x: moveX});
            input.attr({y: moveY});
        }


        input.click(function () {
            if (lineType) {

                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, input);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(input.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: input.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: input.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(input.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = input.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(input.id)
                    var id = input.id;

                    if (document.getElementById(id + "input")) {
                        $("#" + id + "input").css('display', 'none');
                        $("#" + id + "input").remove();
                    }
                    this.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }

    //用例图
    if ("yongli" == tool_type) {
        console.log(tool_type)
        var yongli = paper.image("js/images/48/yongliyonghu.png", x - 184, y - 75, 60, 60)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

       // var moveX, moveY;
        var yongliId = yongli.id;
        showId(yongliId);
        var myStart = function () {
            showId(yongliId);
        }
        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 30;
            yongli.attr({x: moveX});
            yongli.attr({y: moveY});
            if (yongli.dotArray) {

                for (var i = 0; i < yongli.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == yongli.dotArray[i].state) {
                        var connLine = getLine(paper.getById(yongli.dotArray[i].id), yongli);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(yongli.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(yongli.id));

                        var path = paper.getById(yongli.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == yongli.dotArray[i].state) {

                        var connLine = getLine(paper.getById(yongli.dotArray[i].id), yongli);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(yongli.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(yongli.dotArray[i].id));
                        var path = paper.getById(yongli.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 30;
            yongli.attr({x: moveX});
            yongli.attr({y: moveY});
        }

        yongli.click(function () {
            if (lineType) {

                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, yongli);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(yongli.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: yongli.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: yongli.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(yongli.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = yongli.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(yongli.id)
                    var id = yongli.id;

                    if (document.getElementById(id + "yongli")) {
                        $("#" + id + "yongli").css('display', 'none');
                        $("#" + id + "yongli").remove();
                    }
                    this.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }

    if ("yuanjiao" == tool_type) {
        console.log(tool_type)
        var yuanjiao = paper.image("js/images/48/yuanjiaoRe.png", x - 184, y - 75, 100, 200)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });

        var myStart = function () {

        }
        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            yuanjiao.attr({x: moveX});
            yuanjiao.attr({y: moveY});


            if (yuanjiao.dotArray) {

                for (var i = 0; i < yuanjiao.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == yuanjiao.dotArray[i].state) {
                        var connLine = getLine(paper.getById(yuanjiao.dotArray[i].id), yuanjiao);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(yuanjiao.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(yuanjiao.id));

                        var path = paper.getById(yuanjiao.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == yuanjiao.dotArray[i].state) {

                        var connLine = getLine(paper.getById(yuanjiao.dotArray[i].id), yuanjiao);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(yuanjiao.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(yuanjiao.dotArray[i].id));
                        var path = paper.getById(yuanjiao.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }

            }
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            yuanjiao.attr({x: moveX});
            yuanjiao.attr({y: moveY});
        }

        yuanjiao.click(function () {
            if (lineType) {

                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, yuanjiao);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(yuanjiao.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: yuanjiao.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: yuanjiao.id});
                    }


                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(yuanjiao.id);
                    }

                    $("#next").css('background', '');
                }
                else {

                    tempData[0] = yuanjiao.id;

                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(yuanjiao.id)
                    var id = yuanjiao.id;

                    if (document.getElementById(id + "yuanjiao")) {
                        $("#" + id + "yuanjiao").css('display', 'none');
                        $("#" + id + "yuanjiao").remove();
                    }
                    this.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
            }
        });
    }
    if ("circle" == tool_type) {
        console.log(tool_type)
        var circle = paper.image("js/images/48/circle.png", x - 184, y - 75, 50, 50)
            .attr({cursor: 'pointer'})
            .drag(function () {
                myMove()
            }, function () {
                myStart()
            }, function () {
                myEnd()
            });
        var realText = paper.text(x - 140, y - 50, 'Task1').attr({
            'font-size': 14,
            cursor: 'pointer',
            'font-family': '微软雅黑'
        }).click(function () {
            showMessage(circleId, realTextId);
        });
        var realTextId = realText.id;
        showMessage(circleId, realTextId);
        var circleId = circle.id;

        var myStart = function () {
            showMessage(circleId, realTextId);
        }
        var myMove = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            circle.attr({x: moveX});
            circle.attr({y: moveY});
            realText.attr({x: (moveX + circle.attr("width") / 2)});
            realText.attr({y: (moveY + circle.attr("height") / 2)});
            if (circle.dotArray) {

                for (var i = 0; i < circle.dotArray.length; i++) {
                    //判断是起点还是终点
                    if ("from" == circle.dotArray[i].state) {
                        var connLine = getLine(paper.getById(circle.dotArray[i].id), circle);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(circle.dotArray[i].id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(circle.id));

                        var path = paper.getById(circle.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                    }
                    if ("to" == circle.dotArray[i].state) {

                        var connLine = getLine(paper.getById(circle.dotArray[i].id), circle);//交点连线

                        var fromDot = Raphael.pathIntersection(connLine, getElementLine(circle.id));
                        var toDot = Raphael.pathIntersection(connLine, getElementLine(circle.dotArray[i].id));
                        var path = paper.getById(circle.dotArray[i].path_id);

                        path.attr({path: "M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + ""});
                        console.log(path.attr("path"));
                    }
                }
            }
        }
        var myEnd = function () {
            moveX = event.clientX - 184;
            moveY = event.clientY - 75;
            circle.attr({x: moveX});
            circle.attr({y: moveY});
        }

        circle.click(function () {
            if (lineType) {
                if ("no" != tempData[0] && tempData[0] != null) {
                    lineType = false;

                    var element = paper.getById(tempData[0]);//API方法，每一个画布上的元素都有一个唯一的id；根据id取到这个元素

                    var connLine = getLine(element, circle);//交点连线

                    var fromDot = Raphael.pathIntersection(connLine, getElementLine(tempData[0]));//起点
                    var toDot = Raphael.pathIntersection(connLine, getElementLine(circle.id));//终点

                    var path = paper.path("M  " + fromDot[0].x + " " + fromDot[0].y + " L " + toDot[0].x + " " + toDot[0].y + "").attr({
                        stroke: "black",
                        fill: "red",
                        "stroke-width": 2,
                        "arrow-end": 'classic-wide-long'
                    });//开始画线

                    if (this.dotArray) {
                        this.dotArray.push({path_id: path.id, state: "from", id: element.id});
                    }
                    else {
                        this.dotArray = new Array();//生成存放连线的各种信息
                        this.dotArray[0] = ({path_id: path.id, state: "from", id: element.id});
                    }
                    if (element.dotArray) {
                        element.dotArray.push({path_id: path.id, state: "to", id: circle.id});
                    }
                    else {
                        element.dotArray = new Array();
                        element.dotArray[0] = ({path_id: path.id, state: "to", id: circle.id});
                    }
                    for (var i = 0; i < tempData.length; i++) {
                        tempData[i] = "no";
                        console.log(circle.id);
                    }
                    $("#next").css('background', '');
                }
                else {
                    tempData[0] = circle.id;
                }
            }
            if (deleteType) {
                if (confirm("确定删除此元素？")) {

                    console.log(circle.id)
                    var id = circle.id;
                    var textid = realText.id;
                    if (document.getElementById(id + "circle")) {
                        $("#" + id + "circle").css('display', 'none');
                        $("#" + id + "circle").remove();
                    }
                    if (document.getElementById(textid + "realText")) {
                        $("#" + textid + "realText").css('display', 'none');
                        $("#" + textid + "realText").remove();
                    }
                    this.remove();
                    realText.remove();
                    deleteType = false;
                    $("#del").css('background', '');
                }
                else {
                }
            }


        });

    }
}


/**
 *显示下方表单
 **/
var newTime = (new Date).getTime();

//显示信息
function showMessage(taskId, textId) {
    $("#info div").each(function () {
        $(this).css('display', 'none');
    });

    if (document.getElementById(taskId + "task")) {
        $("#" + taskId + "task").css('display', "block");

    }
    else {
        var htmlStr = "<div id=" + taskId + "task><table style=text-align:center>" +
            "<tr><td >&nbsp;属性：&nbsp;</td><td>文本设置</td></tr>" +
            "<tr><td>编号：<input type=text value=" + taskId + " readOnly /></td><td>显示名称：<input type=text value='' onblur=changeText('" + textId + "') id=" + textId + "text /></td></tr>" +
            "</table></div>";
        $("#info").append(htmlStr);
        $("#" + taskId + "task").css('display', 'block');
    }
}


function showId(id) {

    $("#info div").each(function () {
        $(this).css('display', 'none');
    });

    if (document.getElementById(id + "point")) {
        $("#" + id + "point").css('display', "block");
    }
    else {
        var htmlStr = "<div id=" + id + "point ><table style=text-align:center>" +
            "<tr><td >&nbsp;属性：&nbsp;</td><td>内容设置</td></tr>" +
            "<tr><td>编号：<input type=text value=" + id + " readOnly /></td><td>显示：<input type=text value='' onblur=javascript:changeText('" + id + "') id=" + id + "text //></td></tr>" +
            "</table></div>";
        $("#info").append(htmlStr);
        $("#" + id + "point").css('display', 'block');
    }
}


function redo() {
    paper.clear();
}


function showText() {
    var realText = paper.text(140, 200, 'Text1').attr({'font-size': 14, cursor: 'pointer', 'font-family': '微软雅黑'})
        .click(function () {
            showId(realTextId);
        })
        .attr({cursor: 'pointer'})
        .drag(function () {
            myMove()
        }, function () {
            myStart()
        }, function () {
            myEnd()
        });
    realTextId = realText.id;
    //var moveX, moveY;
    var realTextId = realText.id;
    showId(realTextId);
    var myStart = function () {

        showId(realTextId);
    }
    var myMove = function () {
        moveX = event.clientX - 184;
        moveY = event.clientY - 50;
        realText.attr({x: moveX});
        realText.attr({y: moveY});

    }
    var myEnd = function () {
        moveX = event.clientX - 184;
        moveY = event.clientY - 50;
        realText.attr({x: moveX});
        realText.attr({y: moveY});
    }

    realText.dblclick(function () {
        if (confirm("确定删除此元素？")) {

            console.log(realText.id)
            var id = realText.id;
            if (document.getElementById(id + "realText")) {
                $("#" + id + "realText").css('display', 'none');
                $("#" + id + "realText").remove();
            }
            this.remove();
        }
        else {
        }
    });
}

/*
*修改文本域内容
*/
function changeText(text_id) {
    var text_value = document.getElementById(text_id + "text").value;
    var txt = text_value;
    var element = paper.getById(text_id);
    element.attr({text: txt});
}


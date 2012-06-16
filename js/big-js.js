(function() {
  var form = {
    textarea:     document.getElementById("function"),
    button:       document.getElementById("desenhar"),
    zoomInput:    document.getElementById('zoom'),
    densityInput: document.getElementById('density'),
    axes60Radio:  document.getElementById('60-120'),
    axes120Radio:  document.getElementById('120-240')
  }
  form.textarea.value= "function(x,y){\n  return Math.sin(y);\n}";

  var f;
  var perPixel;
  var zoom;
  var axeYAngle;
  var axeXAngle;
  var axes;
  var graphConf;

  form.button.onclick = function(event){
    event.preventDefault();
    eval("f = " + form.textarea.value);
    zoom = parseInt(form.zoomInput.value);
    perPixel = parseInt(form.densityInput.value);
    if(form.axes120Radio.checked){
      axeYAngle = inRadians(120);
      axeXAngle = inRadians(240);
    } else {
      axeYAngle = inRadians(60);
      axeXAngle = inRadians(120);
    }

    axes = {
      z: {x:0,y:1},
      y: girar(0,1,axeYAngle),
      x: girar(0,1,axeXAngle)
    };
    
    graphConf = {
      z: {x:0,y:zoom},
      y: girar(0,zoom,axeYAngle),
      x: girar(0,zoom,axeXAngle)
    };

    draw();
    return false;
  };

  var canvas = document.getElementById("graph");
  var ctx = canvas.getContext("2d");

  function draw(){
    ctx.clearRect(0,0,640,480);
    drawAxes(axes,300,300,150);

    drawGraphFor(f, 300,300,30,graphConf);

    //draw2DGraphIn(f, 300,300,15,graphConf,{x:1});

    //drawPlane(1,300,300,15,graphConf);
  }

  function drawGraphFor(f,x,y,max,conf){
    for(var ix=-max; ix<=max;ix+=1/perPixel){
      for(var iy=-max; iy<=max;iy+=1/perPixel){
        var z = f(ix,iy);
        var rz = (y-z*zoom);
        var red = Math.floor(255/2+Math.sin(Math.PI*rz/480-Math.PI/2)*255/2)
        var green = red;
        var blue =  red;
        var color = [red,green,blue];
        var point = pointTo2D(ix,iy,z,conf);
        point.x += x;
        point.y += y;
        drawPointIn(point,color);
      }
    }
  }

  function draw2DGraphIn(f,x,y,max,conf,cons){
    for(var dom=-max; dom<=max;dom+=1){
      var img = f(dom);

      var iPoint3D;
      var fPoint3D;
      if(cons.y){
        iPoint3D = {
          x: dom,
          z: img,
          y: cons.y
        };
        fPoint3D = {
          x: dom+1,
          z: f(dom+1),
          y: cons.y
        }
      } else if(cons.x){
        iPoint3D = {
          y: dom,
          z: img,
          x: cons.x
        };
        fPoint3D = {
          y: dom+1,
          z: f(dom+1),
          x: cons.x
        };
      } else if(cons.z){
        iPoint3D = {
          x: dom,
          y: img,
          z: cons.z
        };
        fPoint3D = {
          x: dom+1,
          y: f(dom+1),
          z: cons.z
        };
      }

      var iPoint = pointTo2D(iPoint3D.x,iPoint3D.y,iPoint3D.z,conf);
      iPoint.x += x;
      iPoint.y += y;
      var fPoint = pointTo2D(fPoint3D.x,fPoint3D.y,fPoint3D.z,conf);
      fPoint.x += x;
      fPoint.y += y;

      ctx.strokeStyle = "#00f";
      ctx.beginPath();
      ctx.moveTo(iPoint.x,iPoint.y);
      ctx.lineTo(fPoint.x,fPoint.y);
      ctx.stroke();
    }
  }

  function drawPlane(y,xc,yc,size,conf) {
    var p1 = pointTo2D(-size,y,-size,conf);
    var p2 = pointTo2D(-size,y,size,conf);
    var p3 = pointTo2D(size,y,size,conf);
    var p4 = pointTo2D(size,y,-size,conf);
    p1.x += xc;
    p1.y += yc;
    p2.x += xc;
    p2.y += yc;
    p3.x += xc;
    p3.y += yc;
    p4.x += xc;
    p4.y += yc;
    ctx.strokeStyle = "#00f";
    ctx.fillStyle = "rgba(0,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.lineTo(p3.x,p3.y);
    ctx.lineTo(p4.x,p4.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function pointTo2D(x,y,z,conf){
    var p = {x:0,y:0};

    var v = conf.z;
    var ax = v.x * z;
    var ay = v.y * z;
    p.x -= ax;
    p.y -= ay;

    v = conf.y;
    ax = v.x * y;
    ay = v.y * y;
    p.x -= ax;
    p.y -= ay;

    v = conf.x;
    ax = v.x * x;
    ay = v.y * x;
    p.x -= ax;
    p.y -= ay;

    return p;
  }

  function drawPointIn(p,color){
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "rgb("+color.join(",")+")";
    ctx.beginPath();
    ctx.arc(p.x,p.y,1,0,Math.PI*2,false);
    ctx.closePath();
    ctx.fill();
  }

  function drawAxes(axes,x,y,size){
    ctx.strokeStyle = "#000";

    var v = axes.z;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+v.x*size,y-v.y*size);
    ctx.closePath();
    ctx.stroke();

    v = axes.y;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x-v.x*size,y-v.y*size);
    ctx.closePath();
    ctx.stroke();

    v = axes.x;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x-v.x*size,y-v.y*size);
    ctx.closePath();
    ctx.stroke();
  }

  function inRadians(degree){
    return degree*Math.PI/180;
  }

  function girar(x,y,theta){
      var x2 = Math.cos(theta)*x - Math.sin(theta)*y ;
      var y2 = Math.sin(theta)*x + Math.cos(theta)*y ;
      return {
        x:x2,
        y:y2
      }
  }
}());

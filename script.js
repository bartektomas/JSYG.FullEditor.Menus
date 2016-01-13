$(function() {
    
    var mainContainer = 'svg#content';
    
    window.svgEditor = new JSYG.FullEditor(mainContainer);
            
    var contextMenu = new JSYG.ContextMenu(svgEditor.shapeEditor.container);
    var globalContextMenu = new JSYG.ContextMenu(mainContainer);
                    
    var fileMenu = svgEditor.createMenu("newDoc","openDoc","print","exportSVG","exportPNG").set({title:"File"});
    
    var editMenu = svgEditor.createMenu("undo","redo","divider","copy","cut","paste","duplicate","remove","divider","selectAll","deselectAll","group","ungroup").set({title:"Edit"});
    
    var viewMenu = svgEditor.createMenu("zoomIn","zoomOut","fitToCanvas","realSize","marqueeZoom","mousePan","fullScreen","magnifyingGlass").set({title:"View"});
            
    var positionMenu = svgEditor.createMenu("moveBack","moveBackwards","moveForwards","moveFront","divider","alignVerti","alignHoriz","divider","centerVerti","centerHoriz").set({title:"Position"});
        
    var optionsMenu = svgEditor.createMenu("editPosition","editSize","editRotation","editPathMainPoints","editPathCtrlPoints","autoSmoothPaths","useTransformAttr","keepShapesRatio","canvasResizable").set({title:"Options"});
    
    
    
    var toolsMenu = (function() {
        
        var menu = new JSYG.Menu({title:"Tools"});
        
        menu.addItem({
            text:"Selection tool",
            icon:"ledicon bnw cursor_black",
            action:function() { svgEditor.enableSelection(); }
        });
        
        menu.addItem({
            text:"Insert text",
            icon:"ledicon bnw text_lowercase",
            action:function() { svgEditor.enableInsertElement( new JSYG('<text>') ); }
        });
        
        menu.addItem({
            text:"Insert image",
            icon:"ledicon bnw image",
            action:function() {
                svgEditor.chooseFile().then(svgEditor.insertImageFile);
            }
        });
        
        
        
        var svg = new JSYG('<svg>').attr({width:"1em",height:"1em",viewBox:"0 0 16 16"});
        
        JSYG('<rect>').attr({fill:"none",stroke:"none",width:"16",height:"16"}).appendTo(svg);
        
        var shapes = {
            
            rect : svg.clone().append( new JSYG('<rect>').attr({height:10,width:14,x:1,y:3,fill:'none',stroke:'black'}) ),
            
            circle : svg.clone().append( new JSYG('<circle>').attr({r:7,cy:8,cx:8,fill:'none',stroke:'black'}) ),
            
            ellipse : svg.clone().append( new JSYG('<ellipse>').attr({rx:5,ry:7,cy:8,cx:8,fill:'none',stroke:'black'}) ),
            
            polyline : svg.clone().append( new JSYG('<polyline>').attr({points:"0,0 5,15 10,5 16,16",fill:'none',stroke:'black'}) ),
            
            polygon : svg.clone().append( new JSYG('<polygon>').attr({points:"0,0 5,15 10,5 16,16",fill:'none',stroke:'black'}) ),
            
            "freehand-path" : svg.clone().append( new JSYG('<path>').attr({d:"M0.47,7.93 C1.93,5.97 2.92,0.54 4.84,2.06 C8.34,4.82 5.12,12.71 9.09,14.74 C11.95,16.20 13.32,9.89 15.43,7.47",fill:'none',stroke:'black'}) ),
            
            path : svg.clone()
                .append( new JSYG('<path>').attr({d:"M1.05,10.54 C2.74,8.45 3.69,3.11 6.10,4.28 C9.25,5.80 5.78,12.98 9,14.37 C11.59,15.49 12.67,10.07 14.51,7.925",fill:'none',stroke:'black'}) )
                .append( new JSYG('<circle>').attr({r:1.2,cx:6.02,cy:4.2}) )
                .append( new JSYG('<circle>').attr({r:1.2,cx:14.48,cy:7.85}) )
                .append( new JSYG('<circle>').attr({r:1.2,cx:9,cy:14.06}) )
                .append( new JSYG('<circle>').attr({r:1.2,cx:1,cy:10.56}) )
        };
        
        function draw(type) {
            
            if (type.indexOf("path")!=-1) {
                svgEditor.drawingPathMethod = (type == "path") ? "point2point" : "freehand";
                type = "path";
            }
            
            var shape = new JSYG("<"+type+">").addClass("perso");
            
            if (type == "text") svgEditor.enableInsertElement(shape);
            else svgEditor.enableShapeDrawer(shape);
        }
        
        for (var type in shapes) {
            
            new JSYG.MenuItem({
                text:"Draw "+type,
                icon: shapes[type],
                action:draw.bind(null,type)
            }).addTo(menu);
            
        }
        
        return menu;
        
    }());
    
    
    new JSYG("#menuBar").menuBar([fileMenu,editMenu,toolsMenu,positionMenu,viewMenu,optionsMenu]);
    
    svgEditor.editableShapes = "> *";
    
    svgEditor.autoSmoothPaths = true;
    
    svgEditor.enable();
    
    svgEditor.newDocument(500,500);
    
    svgEditor.enableDropImages();
        
    contextMenu.enable();
    globalContextMenu.enable();
    
});
$(function() {
    
    var mainContainer = 'svg#content';
    
    window.svgEditor = new JSYG.FullEditor(mainContainer);
    
    //svgEditor.lang = "fr";
    
    var globalContextMenu = new JSYG.ContextMenu(mainContainer);
                    
    var fileMenu = svgEditor.createMenu({
        items:["newDoc","openDoc","print","exportSVG","exportPNG"],
        lang:"fr",
        colors:true
    })
    .set({title:"File"});
    
    var editMenu = svgEditor.createMenu("undo","redo","divider","copy","cut","paste","duplicate","remove","divider","selectAll","deselectAll","group","ungroup").set({title:"Edit"});
    
    var viewMenu = svgEditor.createMenu("zoomIn","zoomOut","fitToCanvas","realSize","marqueeZoom","mousePan","fullScreen","magnifyingGlass").set({title:"View"});
            
    var positionMenu = svgEditor.createMenu("moveBack","moveBackwards","moveForwards","moveFront","divider","alignTop","alignMiddle","alignBottom","divider","alignLeft","alignCenter","alignRight","divider","centerVerti","centerHoriz").set({title:"Position"});
        
    var optionsMenu = svgEditor.createMenu("editPosition","editSize","editRotation","editPathMainPoints","editPathCtrlPoints","autoSmoothPaths","useTransformAttr","keepShapesRatio","editText","canvasResizable").set({title:"Options"});
    
    var toolsMenu = svgEditor.createMenu("selectionTool","insertText","insertImageFile","drawRect","drawPath","drawFreeHandPath").set({"title":"Tools"});
    
    var contextMenu = svgEditor.createMenu({
        items:["moveBack","moveBackwards","moveForwards","moveFront"],
        type: "contextMenu"
    });
    contextMenu.setNode(svgEditor.shapeEditor.container);
    contextMenu.enable();
        
    new JSYG("#menuBar").menuBar([fileMenu,editMenu,toolsMenu,positionMenu,viewMenu,optionsMenu]);
    
    svgEditor.editableShapes = "> *";
    
    svgEditor.autoSmoothPaths = true;
    
    svgEditor.enable();
    
    svgEditor.newDocument(500,500);
    
    svgEditor.drawingShapeModel = new JSYG("<path>").addClass("perso");
    
    svgEditor.enableDropFiles();
        
    
    globalContextMenu.enable();
    
});
$(function() {
    
    var mainContainer = 'svg#content';
    
    window.svgEditor = new JSYG.FullEditor(mainContainer);
    
    (function initContextMenu() {
        
        var contextMenu = svgEditor.createMenu({
            items:["copy","cut","remove","duplicate","divider","editPathCtrlPoints"],
            type:"contextMenu"
        });
        
        contextMenu.addItem({
            text:"Position",
            icon:"ledicon bnw shape_move_backwards",
            submenu:svgEditor.createMenu("moveBack","moveBackwards","moveForwards","moveFront","divider","centerVerti","centerHoriz")
        });
        
        contextMenu.setNode(svgEditor.shapeEditor.container);
        contextMenu.enable();
        
        svgEditor.shapeEditor.on("changetarget",function(target) {
            contextMenu.getItem("editPathCtrlPoints").disabled = new JSYG(target).getTag() != "path";
        });
        
    }());
    
    (function initGlobalContextMenu() {
        
        var globalContextMenu = svgEditor.createMenu({
            items:["paste","undo","redo","divider","selectionTool"],
            type:"contextMenu"
        });
        
        globalContextMenu.addItem({
            text:"Draw",
            icon:"ledicon bnw pencil",
            submenu:svgEditor.createMenu("drawRect","drawCircle","drawEllipse","drawLine","drawPolyline","drawPolygon","drawPath","drawFreeHandPath")
        });
        
        globalContextMenu.setNode(svgEditor.zoomAndPan.outerFrame);
        globalContextMenu.enable();
        
    })();
    
    (function initMenuBar() {
        
        $('#confirmExample').on("click",function() {
            svgEditor.loadURL("examples/"+$('#examples').val()+".svg");
            $('#exampleChoice').modal("hide");
        });
        
        $('#confirmDim').on("click",function() {
            svgEditor.newDocument( $('#width').val(), $('#height').val() );
            $('#dimChoice').modal("hide");
        });
        
        var fileMenu = svgEditor.createMenu("openFile","print","downloadSVG","downloadPNG").set({title:"File"});
        
        fileMenu.addItem({
            text:"New Document",
            icon:"ledicon bnw page_white_add",
            action:function() { $('#dimChoice').modal(); }
        },0);
        
        fileMenu.addItem({
            text:"Open example",
            icon:"ledicon bnw image",
            action:function() { $('#exampleChoice').modal(); }
        },1);
        
        
        var editMenu = svgEditor.createMenu("undo","redo","divider","copy","cut","paste","duplicate","remove","divider","selectAll","deselectAll","group","ungroup").set({title:"Edit"});
        
        var viewMenu = svgEditor.createMenu("zoomIn","zoomOut","fitToCanvas","fitToDoc","realSize","marqueeZoom","mousePan","fullScreen").set({title:"View"});
        
        var positionMenu = svgEditor.createMenu("moveBack","moveBackwards","moveForwards","moveFront","divider","alignTop","alignMiddle","alignBottom","divider","alignLeft","alignCenter","alignRight","divider","centerVerti","centerHoriz").set({title:"Position"});
        
        var optionsMenu = svgEditor.createMenu("editPosition","editSize","editRotation","editPathMainPoints","editPathCtrlPoints","autoSmoothPaths","useTransformAttr","keepShapesRatio","editText","canvasResizable").set({title:"Options"});
        
        var toolsMenu = svgEditor.createMenu("selectionTool","insertText","insertImageFile","drawRect","drawLine","drawPolyline","drawPolygon","drawPath","drawFreeHandPath").set({"title":"Tools"});
        
        new JSYG("#menuBar").menuBar([fileMenu,editMenu,toolsMenu,positionMenu,viewMenu,optionsMenu]);
        
    }());
    
    
    
    svgEditor.editableShapes = "> *";
    
    svgEditor.autoSmoothPaths = true;
    
    svgEditor.enable();
    
    svgEditor.newDocument(500,500);
    
    svgEditor.shapeDrawerModel = new JSYG("<path>").addClass("perso");
    
    svgEditor.enableDropFiles();
    
    svgEditor.enableMouseWheelZoom();
});
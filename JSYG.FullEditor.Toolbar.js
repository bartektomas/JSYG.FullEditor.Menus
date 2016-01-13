/*jshint forin:false, eqnull:true*/
/* globals JSYG*/

(function(factory) {
    
    if (typeof define != "undefined" && define.amd) define("jsyg-fulleditor-toolbar",["jsyg","jsyg-fulleditor","jsyg-menu"],factory);
    else if (typeof JSYG != "undefined") {
        
        if (JSYG.FullEditor && JSYG.Menu) factory(JSYG,JSYG.FullEditor);
        else throw new Error("Dependendy is missing");
    }
    else throw new Error("JSYG is needed");
    
})(function(JSYG,FullEditor) {
    
    "use strict";
    
    
    FullEditor.prototype.createMenu = function() {
        
        var that = this;
        
        var menu = new JSYG.Menu();
        
        var liste = JSYG.makeArray(arguments);
        
        var config = liste.reduce(function(prec,current) { prec[current] = true; return prec; },{});
        
        var items = {
            
            newDoc : {
                text:"New document",
                icon:"ledicon bnw page_white_add",
                action:function() {
                    that.newDocument(500,800);
                }
            },
            openDoc : {
                text:"Open document",
                icon:"ledicon bnw page_white_edit",
                action:function() {
                    that.chooseFile().then(that.loadFile);
                }
            },
            exportSVG : {
                text:"Export SVG File",
                icon:"ledicon bnw page_code",
                action:function() {
                    that.toSVGDataURL().then(function(url) {
                        window.open(url);
                    });
                }
            },
            exportPNG : {
                
                text:"Export PNG file",
                icon:"ledicon bnw image",
                action:function() {
                    that.toPNGDataURL().then(function(url) {
                        window.open(url);
                    });
                }
            },
            print : {
                text:"Print",
                icon:"ledicon bnw printer",
                action:that.print
            },
            
            copy : {
                text:"Copy",
                icon:"ledicon bnw page_copy",
                globalShortcut:"Ctrl+C",
                disabled:true,
                action:that.copy
            },
            cut : {
                text:"Cut",
                icon:"ledicon bnw cut",
                globalShortcut:"Ctrl+X",
                disabled:true,
                action:that.cut
            },
            paste:{
                text:"Paste",
                icon:"ledicon bnw page_paste",
                globalShortcut:"Ctrl+V",
                disabled:true,
                action:that.paste
            },
            duplicate:{
                text:"Duplicate",
                icon:"ledicon bnw page_2_copy",
                disabled:true,
                action:that.duplicate
            },
            remove :{
                text:"Remove",
                icon:"ledicon bnw bin_closed",
                globalShortcut:"Del",
                disabled:true,
                action:that.remove
            },
            undo : {
                text:"Undo",
                icon:"ledicon bnw arrow_undo",
                globalShortcut:"Ctrl+Z",
                keepMenu:true,
                disabled:true,
                action:that.undo
            },
            redo : {
                text:"Redo",
                icon:"ledicon bnw arrow_redo",
                globalShortcut:"Ctrl+Y",
                keepMenu:true,
                disabled:true,
                action:that.redo
            },
            group : {
                
                text:"Group elements",
                icon:"ledicon bnw link",
                disabled:true,
                action:that.group
            },
            ungroup :{
                
                text:"Ungroup elements",
                icon:"ledicon bnw link_break",
                disabled:true,
                action:that.ungroup
            },
            selectAll:{
                text:"Select all" ,
                icon:"ledicon bnw selection_select",
                globalShortcut:"Ctrl+A",
                action:that.selectAll
            },
            deselectAll:{
                text:"Deselect" ,
                icon:"ledicon bnw selection",
                action:that.deselectAll
            },
            zoomIn : {
                text:"Zoom in",
                icon:"ledicon bnw zoom_in",
                keepMenu:true,
                action:function() {
                    that.zoom(+10);
                }
            },
            zoomOut : {
                text:"Zoom out",
                icon:"ledicon bnw zoom_out",
                keepMenu:true,
                action:function() {
                    that.zoom(-10);
                }
            },
            fitToCanvas : {
                text:"Fit to canvas",
                icon:"ledicon bnw doc_resize",
                action:function() {
                    that.zoomTo("canvas");
                }
            },
            realSize:{
                text:"Real size",
                icon:"ledicon bnw doc_resize_actual",
                action:function() {
                    that.zoomTo(100);
                }
            },
            marqueeZoom : {
                text:"Marquee zoom",
                icon: "ledicon bnw zone",
                action:that.enableMarqueeZoom
            },
            mousePan : {
                text:"Mouse pan",
                checkbox:true,
                action:function(e,val) {
                    that[ (val?"en":"dis")+"ableMousePan"]();
                    if (!val) that.enableSelection();
                }
            },
            magnifyingGlass : {
                ext:"Magnifying glass",
                checkbox:true,
                action:function(e,val) {
                    that[ (val?"en":"dis")+"ableMagnifyingGlass"]();
                    if (!val) that.enableSelection();
                }
            },
            fullScreen : {
                text:"Full screen",
                checkbox:true,
                action:function() {
                    var $doc = $(document);
                    if (!$doc.toggleFullScreen) throw new Error("You need jquery-fullscreen plugin");
                    $doc.toggleFullScreen();
                }
            },
            
            
            //Options
            
            editPosition : {
                text:"Edit position",
                checkbox:true,
                checked:true,
                action:function(e,val) {
                    that.editPosition = val;
                }
                
            },
            editSize : {
                text:"Edit size",
                checkbox:true,
                checked:true,
                action:function(e,val) {
                    that.editSize = val;
                }
            },
            editRotation : {
                text:"Edit rotation",
                checkbox:true,
                checked:true,
                action:function(e,val) {
                    that.editRotation = val;
                }
            },
            editPathMainPoints : {
                text:"Edit paths main points",
                checkbox:true,
                checked:true,
                action:function(e,val) {
                    that.editPathMainPoints = val;
                }
            },
            editPathCtrlPoints : {
                text:"Edit paths control points",
                checkbox:true,
                checked:false,
                action:function(e,val) {
                    that.editPathCtrlPoints = val;
                }
            },
            autoSmoothPaths : {
                text:"Auto-smooth paths",
                checkbox:true,
                checked:true,
                action:function(e,val) {
                    that.autoSmoothPaths = val;
                }
            },
            useTransformAttr : {
                text:"Use transform attribute",
                checkbox:true,
                checked:false,
                action:function(e,val) {
                    that.useTransformAttr = val;
                }
            },
            keepShapesRatio : {
                text:"Keep Shapes ratio",
                checkbox:true,
                checked:false,
                action:function(e,val) {
                    that.keepShapesRatio = val;
                }
            },
            canvasResizable : {
                text:"Canvas resizable",
                checkbox:true,
                checked:false,
                action:function(e,val) {
                    that.canvasResizable = val;
                }
            },
            
            
            //position
            
            
            moveBack : {
                icon : 'ledicon bnw shape_move_back',
                text : "Move back",
                disabled : true,
                action : function() {
                    that.target().moveBack();
                    that.triggerChange();
                }
            },
            moveBackwards : {
                icon : 'ledicon bnw shape_move_backwards',
                text : "Move backwards",
                keepMenu : true,
                disabled : true,
                action : function() {
                    that.target().moveBackwards();
                    that.triggerChange();
                }
            },
            moveForwards : {
                icon : 'ledicon bnw shape_move_forwards',
                text : "Move forwards",
                keepMenu : true,
                disabled : true,
                action : function() {
                    that.target().moveForwards();
                    that.triggerChange();
                }
            },
            
            moveFront : {
                icon : 'ledicon bnw shape_move_front',
                text : "Move front",
                disabled : true,
                action : function() {
                    that.target().moveFront();
                    that.triggerChange();
                }
            },
            
            centerVerti : {
            icon : "ledicon bnw application_split",
            text : "Center vertically",
            disabled : true,
            action : function() {
                that.centerVertically();
                menu.getItem("centerVerti").disabled = true;
                menu.update();
            }
        },
        
        centerHoriz : {
            icon : "ledicon bnw application_tile_horizontal",
            text : "Center horizontally",
            disabled : true,
            action : function() {
                that.centerHorizontally();
                menu.getItem("centerHoriz").disabled = true;
                menu.update();
            }
        },
        
        alignVerti : {
            icon : "ledicon bnw shape_aling_middle",
            text : "Align vertically",
            disabled : true,
            action : 'submenu',
            submenu : ["top","middle","bottom"].map(function(type) {
                return {
                    icon:"ledicon bnw shape_aling_"+type,
                    text:type,
                    action:function() {
                        that.align(type);
                    }
                };
            })
        },
        
        alignHoriz : {
            icon : "ledicon bnw shape_aling_center",
            text : "Align horizontally",
            disabled : true,
            action : 'submenu',
            submenu : ["left","center","right"].map(function(type) {
                return {
                    icon:"ledicon bnw shape_aling_"+type,
                    text:type,
                    action:function() {
                        that.align(type);
                    }
                };
            })
        }
            
        };
        
        
        function majUndoRedoItems() {
            
            var undo = menu.getItem("undo");
            var redo = menu.getItem("redo");
            
            if (undo) undo.disabled = !that.undoRedo.hasUndo();
            if (redo) redo.disabled = !that.undoRedo.hasRedo();
            menu.update();
        }
        
        function updateGroupItems() {
            
            var group = menu.getItem("group");
            var ungroup = menu.getItem("ungroup");
            
            if (group) group.disabled = !that.isMultiSelection();
            if (ungroup) ungroup.disabled = !that.isGroup();
            
            menu.update();
        }
        
        if ("undo" in config || "redo" in config) {
            
            that.undoRedo.on("change",majUndoRedoItems);
            that.on("change",majUndoRedoItems);
        }
        
        if ("group" in config || "ungroup" in config) {
            
            that.shapeEditor.on("changetarget",updateGroupItems);
        }
        
        if ("paste" in config) {
            
            that.shapeEditor.clipBoard.on("cut copy",function() {
                var paste = menu.getItem("paste");
                
                if (paste) {
                    paste.disabled = false;
                    menu.update();
                }
            });
        }
        
        if ("copy" in config || "cut" in config || "remove" in config || "duplicate" in config || "deselectAll" in config) {
            
            that.shapeEditor.on({
                
                show:function() {
                    
                    var copy = menu.getItem("copy");
                    var cut = menu.getItem("cut");
                    var remove = menu.getItem("remove");
                    var duplicate = menu.getItem("duplicate");
                    var deselectAll = menu.getItem("deselectAll");
                    
                    if (copy) copy.disabled = false;
                    if (cut) cut.disabled = false;
                    if (remove) remove.disabled = false;
                    if (duplicate) duplicate.disabled = false;
                    if (deselectAll) deselectAll.disabled = false;
                    
                    menu.update();
                },
                
                hide:function() {
                    
                    var copy = menu.getItem("copy");
                    var cut = menu.getItem("cut");
                    var remove = menu.getItem("remove");
                    var paste = menu.getItem("paste");
                    var duplicate = menu.getItem("duplicate");
                    var deselectAll = menu.getItem("deselectAll");
                    
                    if (copy) copy.disabled = true;
                    if (cut) cut.disabled = true;
                    if (remove) remove.disabled = true;
                    if (paste) paste.disabled = true;
                    if (duplicate) duplicate.disabled = true;
                    if (deselectAll) deselectAll.disabled = true;
                    
                    menu.update();
                }
            });
            
        }
        
        if ("fullscreen" in config) {
            
            $(document).on("fullscreenchange", function() {
                var item = menu.getItem("fullscreen");
                if (item) item.checked = $(document).fullScreen();
                menu.update();
            });
        }
        
        
        function majItemsPosition() {
            
            var moveBack = menu.getItem("moveBack");
            var moveBackwards = menu.getItem("moveBackwards");
            var moveFront = menu.getItem("moveFront");
            var moveForwards = menu.getItem("moveForwards");
            
            var canMoveBackwards = svgEditor.canMoveBackwards();
            var canMoveForwards = svgEditor.canMoveForwards();
            
            if (moveBack) moveBack.disabled = !canMoveBackwards;
            if (moveBackwards) moveBackwards.disabled = !canMoveBackwards;
            
            if (moveFront) moveFront.disabled = !canMoveForwards;
            if (moveForwards) moveForwards.disabled = !canMoveForwards;
            
            menu.update();
        }
        
        
        if ("moveBack" in config || "moveBackwards" in config || "moveFront" in config || "moveForwards" in config) {
            
            that.shapeEditor.on({
                hide:majItemsPosition,
                changetarget:majItemsPosition
            });
            
            that.on("change",majItemsPosition);
        }
        
        
        function majItemsAlignement() {
            
            var isMulti = that.isMultiSelection();
            var vertiItem = menu.getItem("alignVerti");
            var horizItem = menu.getItem("alignHoriz");
            
            if (vertiItem) vertiItem.disabled = !isMulti;
            if (horizItem) horizItem.disabled = !isMulti;
            
            menu.update();
        }
        
        if ("alignHoriz" in config || "alignVerti" in config) {
            
            svgEditor.shapeEditor.on({
                hide:majItemsAlignement,
                changetarget:majItemsAlignement
            });
        }
        
        
        function majItemsCenter(bool) {
            
            var centerVerti = menu.getItem("centerVerti");
            var centerHoriz = menu.getItem("centerHoriz");
            
            if (centerVerti) centerVerti.disabled = bool;
            if (centerHoriz) centerHoriz.disabled = bool;
            
            menu.update();
        }
        
        if ("centerVerti" in config || "centerHoriz" in config) {
            
            svgEditor.shapeEditor.on({
                hide:majItemsCenter.bind(null,true),
                changetarget:majItemsCenter.bind(null,false)
            });
        }
        
        
        liste.forEach(function(name) {
            
            if (name == "divider") return menu.addDivider();
            
            var item = items[name];
            
            if (!item) throw new Error("item "+name+" does not exist");
            
            item.name = name;
            
            menu.addItem(item);
        });
        
        return menu;
    };
    
});
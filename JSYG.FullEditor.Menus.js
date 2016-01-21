/*jshint forin:false, eqnull:true*/
/* globals JSYG*/

(function(factory) {
    
    if (typeof define != "undefined" && define.amd) define("jsyg-fulleditor-toolbar",["jsyg","jsyg-fulleditor","jsyg-menu","jsyg-contextmenu"],factory);
    else if (typeof JSYG != "undefined") {
        
        if (JSYG.FullEditor && JSYG.Menu && JSYG.ContextMenu) factory(JSYG,JSYG.FullEditor,JSYG.Menu,JSYG.ContextMenu);
        else throw new Error("Dependendy is missing");
    }
    else throw new Error("JSYG is needed");
    
})(function(JSYG,FullEditor,Menu,ContextMenu) {
    
    "use strict";
    
    var svg = new JSYG('<svg>').attr({width:"1em",height:"1em",viewBox:"0 0 16 16"});
    
    JSYG('<rect>').attr({fill:"none",stroke:"none",width:"16",height:"16"}).appendTo(svg);
    
    var globalShortcuts = [];
    
    var shapeIcons = {
        
        rect : svg.clone().append( new JSYG('<rect>').attr({height:10,width:14,x:1,y:3,fill:'none',stroke:'black'}) ),
        
        circle : svg.clone().append( new JSYG('<circle>').attr({r:7,cy:8,cx:8,fill:'none',stroke:'black'}) ),
        
        ellipse : svg.clone().append( new JSYG('<ellipse>').attr({rx:5,ry:7,cy:8,cx:8,fill:'none',stroke:'black'}) ),
        
        line : svg.clone().append( new JSYG('<line>').attr({x1:0,y1:0,x2:16,y2:16,fill:'none',stroke:'black'}) ),
        
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
    
    function createNewElement(newTag,oldElmt) {
        
        var exclude = ["d","points","x1","x2"];
        var newElmt = new JSYG('<'+newTag+'>');
        
        oldElmt = new JSYG(oldElmt);
        
        JSYG.each(oldElmt.prop("attributes"),function() {
           if (exclude.indexOf(this.name) == -1) newElmt.attr(this.name,this.value);
        });
                
        return newElmt;
    }
    
    function enableShapeDrawer(editor,tag) {
        
        if (new JSYG(editor.insertElementModel).getTag() != tag) {
            editor.shapeDrawerModel = createNewElement(tag,editor.shapeDrawerModel);
        }
        editor.enableShapeDrawer();
    }
        
    var items = {
        
        newDoc : {
            text: {en:"New document",fr:"Nouveau document"},
            icon:"ledicon bnw page_white_add",
            action:function() {
                var dim = JSYG(this.getDocument()).getDim();
                this.newDocument(dim.width || 500, dim.height || 800);
            }
        },
        openFile : {
            text:{en:"Open file",fr:"Ouvrir un fichier"},
            icon:"ledicon bnw page_white_edit",
            action:function() {
                this.chooseFile().then(this.loadFile);
            }
        },
        downloadSVG : {
            text:{en:"Download SVG",fr:"Télécharger le SVG"},
            icon:"ledicon bnw page_white_go",
            action:function() {
                this.download("svg");
            }
        },
        downloadPNG : {
            text:{en:"Download PNG",fr:"Télécharger le PNG"},
            icon:"ledicon bnw page_white_go",
            action:function() {
                this.download("png");
            }
        },
        exportSVG : {
            text:{en:"Export SVG File",fr:"Exporter en SVG"},
            icon:"ledicon bnw page_code",
            action:function() {
                this.toSVGDataURL().then(function(url) {
                    window.open(url);
                });
            }
        },
        exportPNG : {
            
            text:{en:"Export PNG file",fr:"Exporter en PNG"},
            icon:"ledicon bnw image",
            action:function() {
                this.toPNGDataURL().then(function(url) {
                    window.open(url);
                });
            }
        },
        print : {
            text:{en:"Print",fr:"Imprimer"},
            icon:"ledicon bnw printer",
            action:function() { this.print(); }
        },
        
        copy : {
            text:{en:"Copy",fr:"Copier"},
            icon:"ledicon bnw page_copy",
            globalShortcut:"Ctrl+C",
            disabled:true,
            action:function() { this.copy(); }
        },
        cut : {
            text:{en:"Cut",fr:"Copier"},
            icon:"ledicon bnw cut",
            globalShortcut:"Ctrl+X",
            disabled:true,
            action:function() { this.cut(); }
        },
        paste:{
            text:{en:"Paste",fr:"Coller"},
            icon:"ledicon bnw page_paste",
            globalShortcut:"Ctrl+V",
            disabled:true,
            action:function() { this.paste(); }
        },
        duplicate:{
            text:{en:"Duplicate",fr:"Dupliquer"},
            icon:"ledicon bnw page_2_copy",
            disabled:true,
            action:function() { this.duplicate(); }
        },
        remove :{
            text:{en:"Remove",fr:"Supprimer"},
            icon:"ledicon bnw bin_closed",
            globalShortcut:"Del",
            disabled:true,
            action:function() { this.remove(); }
        },
        undo : {
            text:{en:"Undo",fr:"Annuler"},
            icon:"ledicon bnw arrow_undo",
            globalShortcut:"Ctrl+Z",
            keepMenu:true,
            disabled:true,
            action:function() { this.undo(); }
        },
        redo : {
            text:{en:"Redo",fr:"Refaire"},
            icon:"ledicon bnw arrow_redo",
            globalShortcut:"Ctrl+Y",
            keepMenu:true,
            disabled:true,
            action:function() { this.redo(); }
        },
        group : {
            text:{en:"Group elements",fr:"Grouper les éléments"},
            icon:"ledicon bnw link",
            disabled:true,
            action:function() { this.group(); }
        },
        ungroup :{
            
            text:{en:"Ungroup elements",fr:"Dégrouper les éléments"},
            icon:"ledicon bnw link_break",
            disabled:true,
            action:function() { this.ungroup(); }
        },
        selectAll:{
            text:{en:"Select all",fr:"Tout séléctionner"},
            icon:"ledicon bnw selection_select",
            globalShortcut:"Ctrl+A",
            action:function() { this.selectAll(); }
        },
        deselectAll:{
            text:{en:"Deselect",fr:"Déselectionner"},
            icon:"ledicon bnw selection",
            action:function() { this.deselectAll(); }
        },
        zoomIn : {
            text:{en:"Zoom in",fr:"Zoom avant"},
            icon:"ledicon bnw zoom_in",
            keepMenu:true,
            action:function() {
                this.zoom(+10);
            }
        },
        zoomOut : {
            text:{en:"Zoom out",fr:"Zoom arrière"},
            icon:"ledicon bnw zoom_out",
            keepMenu:true,
            action:function() {
                this.zoom(-10);
            }
        },
        fitToCanvas : {
            text:{en:"Fit to canvas",fr:"Adapter au conteneur"},
            icon:"ledicon bnw doc_resize",
            action:function() {
                this.zoomTo("canvas");
            }
        },
        fitToDoc :{
            text:{en:"Fit to doc",fr:"Adapter au document"},
            icon:"ledicon bnw  doc_resize_actual",
            action : function() { this.fitToDoc(); }
        },
        realSize:{
            text:{en:"Real size",fr:"Taille réelle"},
            icon:"ledicon bnw arrow_out",
            action:function() {
                this.zoomTo(100);
            }
        },
        marqueeZoom : {
            text:{en:"Marquee zoom",fr:"Zoom dynamique"},
            icon: "ledicon bnw zone",
            action:function() { this.marqueeZoom(); }
        },
        mousePan : {
            text:{en:"Mouse pan",fr:"Panoramique"},
            checkbox:true,
            action:function(e,val) {
                this[ (val?"en":"dis")+"ableMousePan"]();
                if (!val) this.enableSelection();
            }
        },
        magnifyingGlass : {
            text:{en:"Magnifying glass",fr:"Loupe"},
            checkbox:true,
            action:function(e,val) {
                this[ (val?"en":"dis")+"ableMagnifyingGlass"]();
                if (!val) this.enableSelection();
            }
        },
        fullScreen : {
            text:{en:"Full screen",fr:"Plein écran"},
            checkbox:true,
            action:function() {
                var $doc = $(document);
                if (!$doc.toggleFullScreen) throw new Error("You need jquery-fullscreen plugin");
                $doc.toggleFullScreen();
            }
        },
        
        
        //Options
        
        editPosition : {
            text:{en:"Edit position",fr:"Editer la position des éléments"},
            checkbox:true,
            checked:true,
            action:function(e,val) {
                this.editPosition = val;
            }
            
        },
        editSize : {
            text:{en:"Edit size",fr:"Editer la taille des éléments"},
            checkbox:true,
            checked:true,
            action:function(e,val) {
                this.editSize = val;
            }
        },
        editRotation : {
            text:{en:"Edit rotation",fr:"Editer la rotation des éléments"},
            checkbox:true,
            checked:true,
            action:function(e,val) {
                this.editRotation = val;
            }
        },
        editText : {
            text:{en:"Edit text",fr:"Editer les textes"},
            checkbox:true,
            checked:true,
            action:function(e,val) {
                this.editText = val;
            }
        },
        editPathMainPoints : {
            text:{en:"Edit paths main points",fr:"Editer les points principaux des chemins"},
            checkbox:true,
            checked:true,
            action:function(e,val) {
                this.editPathMainPoints = val;
            }
        },
        editPathCtrlPoints : {
            text:{en:"Edit paths control points",fr:"Editer les points de contrôle des chemins"},
            checkbox:true,
            checked:false,
            action:function(e,val) {
                this.editPathCtrlPoints = val;
            }
        },
        autoSmoothPaths : {
            text:{en:"Auto-smooth paths",fr:"Lissage automatique des chemins"},
            checkbox:true,
            checked:true,
            action:function(e,val) {
                this.autoSmoothPaths = val;
            }
        },
        useTransformAttr : {
            text:{en:"Use transform attribute",fr:"Utiliser l'attribut transform"},
            checkbox:true,
            checked:false,
            action:function(e,val) {
                this.useTransformAttr = val;
            }
        },
        keepShapesRatio : {
            text:{en:"Keep Shapes ratio",fr:"garder les proportions"},
            checkbox:true,
            checked:false,
            action:function(e,val) {
                this.keepShapesRatio = val;
            }
        },
        canvasResizable : {
            text:{en:"Canvas resizable",fr:"conteneur redimensionnable"},
            checkbox:true,
            checked:false,
            action:function(e,val) {
                this.canvasResizable = val;
            }
        },
        
        
        //position
        
        
        moveBack : {
            icon : 'ledicon bnw shape_move_back',
            text : {en:"Move back",fr:"Mettre à l'arrière plan"},
            disabled : true,
            action : function() {
                this.target().moveBack();
                this.triggerChange();
            }
        },
        moveBackwards : {
            icon : 'ledicon bnw shape_move_backwards',
            text : {en:"Move backwards",fr:"Reculer d'un cran"},
            keepMenu : true,
            disabled : true,
            action : function() {
                this.target().moveBackwards();
                this.triggerChange();
            }
        },
        moveForwards : {
            icon : 'ledicon bnw shape_move_forwards',
            text : {en:"Move forwards",fr:"Avancer d'un cran"},
            keepMenu : true,
            disabled : true,
            action : function() {
                this.target().moveForwards();
                this.triggerChange();
            }
        },
        
        moveFront : {
            icon : 'ledicon bnw shape_move_front',
            text : {en:"Move front",fr:"Mettre au premier plan"},
            disabled : true,
            action : function() {
                this.target().moveFront();
                this.triggerChange();
            }
        },
        
        centerVerti : {
            icon : "ledicon bnw application_split",
            text : {en:"Center vertically",fr:"Centrer verticalement"},
            disabled : true,
            action : function() {
                this.centerVertically();
            }
        },
        
        centerHoriz : {
            icon : "ledicon bnw application_tile_horizontal",
            text : {en:"Center horizontally",fr:"Centrer horizontalement"},
            disabled : true,
            action : function() {
                this.centerHorizontally();
            }
        },
        
        alignTop : {
            icon:"ledicon bnw shape_align_top",
            text:{en:"Align top",fr:"Aligner en haut"},
            disabled:true,
            action:function() {
                this.align("top");
            }
        },
        
        alignMiddle : {
            icon:"ledicon bnw shape_align_middle",
            text:{en:"Align middle",fr:"Aligner au milieu"},
            disabled:true,
            action:function() {
                this.align("middle");
            }
        },
        
        alignBottom : {
            icon:"ledicon bnw shape_align_bottom",
            text:{en:"Align bottom",fr:"Aligner en bas"},
            disabled:true,
            action:function() {
                this.align("bottom");
            }
        },
        
        alignLeft : {
            icon:"ledicon bnw shape_align_left",
            text:{en:"Align left",fr:"Aligner à gauche"},
            disabled:true,
            action:function() {
                this.align("left");
            }
        },
        
        alignCenter : {
            icon:"ledicon bnw shape_align_center",
            text:{en:"Align center",fr:"Aligner au centre"},
            disabled:true,
            action:function() {
                this.align("center");
            }
        },
        
        alignRight : {
            icon:"ledicon bnw shape_align_right",
            text:{en:"Align right",fr:"Aligner à droite"},
            disabled:true,
            action:function() {
                this.align("right");
            }
        },
        
        
        //Tools
        
        
        selectionTool : {
            text:{en:"Selection tool",fr:"Outil de sélection"},
            icon:"ledicon bnw cursor_black",
            action:function() { this.enableSelection(); }
        },
        
        insertText : {
            text:{en:"Insert text",fr:"Insérer du texte"},
            icon:"ledicon bnw text_lowercase",
            action:function() {
                
                if (JSYG.svgTexts.indexOf(this.insertElementModel) == -1) {
                    this.insertElementModel = createNewElement("text",this.insertElementModel);
                }
                
                this.enableInsertElement();
            }
        },
        
        insertImageFile : {
            text:{en:"Insert image",fr:"Insérer une image"},
            icon:"ledicon bnw image",
            action:function() {
                this.chooseFile().then(this.insertImageFile);
            }   
        },
        
        insertElement : {
            text:{en:"Insert element",fr:"Insérer un élément graphique"},
            icon:"ledicon shape_handles",
            action:function() {
                this.enableInsertElement();
            }
        },
        
        draw : {
            text:{en:"Draw shapes",fr:"Dessiner des formes"},
            icon:"ledicon bnw pencil",
            action:function() {
                this.enableShapeDrawer();
            }
        },
        
        drawRect : {
            text:{en:"Draw rect",fr:"Dessiner des rectangles"},
            icon:shapeIcons.rect,
            action:function() {
                enableShapeDrawer(this,"rect");
            }
        },
        
        drawCircle : {
            text:{en:"Draw circle",fr:"Dessiner des cercles"},
            icon:shapeIcons.circle,
            action:function() {
                enableShapeDrawer(this,"circle");
            }
        },
        
        drawEllipse : {
            text:{en:"Draw ellipse",fr:"Dessiner des ellipses"},
            icon:shapeIcons.ellipse,
            action:function() {
                enableShapeDrawer(this,"ellipse");
            }
        },
        
        drawLine : {
            text:{en:"Draw line",fr:"Dessiner des lignes"},
            icon:shapeIcons.line,
            action:function() {
                enableShapeDrawer(this,"line");
            }
        },
        
        drawPolyline : {
            text:{en:"Draw polyline",fr:"Dessiner des polylignes"},
            icon:shapeIcons.polyline,
            action:function() {
                enableShapeDrawer(this,"polyline");
            }
        },
        
        drawPolygon : {
            text:{en:"Draw polygon",fr:"Dessiner des polygones"},
            icon:shapeIcons.polygon,
            action:function() {
                enableShapeDrawer(this,"polygon");
            }
        },
        
        drawPath : {
            text:{en:"Draw path",fr:"Dessiner des chemins"},
            icon:shapeIcons.path,
            action:function() {
                this.drawingPathMethod = "point2point";
                enableShapeDrawer(this,"path");
            }
        },
        
        drawFreeHandPath : {
            text:{en:"Draw freehand path",fr:"Dessiner à main levée"},
            icon:shapeIcons["freehand-path"],
            action:function() {
                this.drawingPathMethod = "freehand";
                enableShapeDrawer(this,"path");
            }
        },
        
    };
    
    function updateUndoRedoItems(menu) {
        
        var undo = menu.getItem("undo");
        var redo = menu.getItem("redo");
        
        if (undo) undo.disabled = !this.undoRedo.hasUndo();
        if (redo) redo.disabled = !this.undoRedo.hasRedo();
        
        menu.update();
    }
    
    function updatePasteItem(menu) {
        
        var paste = menu.getItem("paste");
        
        if (paste) {
            paste.disabled = false;
            menu.update();
        }
    }
    
    function updateClipboardItems(menu,bool) {
        
        var copy = menu.getItem("copy");
        var cut = menu.getItem("cut");
        var remove = menu.getItem("remove");
        var duplicate = menu.getItem("duplicate");
        var deselectAll = menu.getItem("deselectAll");
        
        if (copy) copy.disabled = bool;
        if (cut) cut.disabled = bool;
        if (remove) remove.disabled = bool;
        if (duplicate) duplicate.disabled = bool;
        if (deselectAll) deselectAll.disabled = bool;
        
        menu.update();
    }
    
    function updateGroupItems(menu) {
        
        var group = menu.getItem("group");
        var ungroup = menu.getItem("ungroup");
        
        if (group) group.disabled = !this.isMultiSelection();
        if (ungroup) ungroup.disabled = !this.isGroup();
        
        menu.update();
    }
    
    function updatePositionItems(menu) {
        
        var moveBack = menu.getItem("moveBack");
        var moveBackwards = menu.getItem("moveBackwards");
        var moveFront = menu.getItem("moveFront");
        var moveForwards = menu.getItem("moveForwards");
        
        var canMoveBackwards = this.canMoveBackwards();
        var canMoveForwards = this.canMoveForwards();
        
        if (moveBack) moveBack.disabled = !canMoveBackwards;
        if (moveBackwards) moveBackwards.disabled = !canMoveBackwards;
        
        if (moveFront) moveFront.disabled = !canMoveForwards;
        if (moveForwards) moveForwards.disabled = !canMoveForwards;
        
        menu.update();
    }
    
    function updateAlignmentItems(menu) {
        
        var isMulti = this.isMultiSelection();
        
        ["top","middle","bottom","left","center","right"].forEach(function(type) {
            
            var item = menu.getItem("align"+JSYG.ucfirst(type));
            
            if (item) item.disabled = !isMulti;
        });
        
        menu.update();
    }
    
    function updateFullscreenItem(menu) {
        
        var item = menu.getItem("fullscreen");
        
        if (item) {
            item.checked = $(document).fullScreen();
            menu.update();
        }
    }
    
    
    function updateCenterItems(menu,bool) {
        
        var centerVerti = menu.getItem("centerVerti");
        var centerHoriz = menu.getItem("centerHoriz");
        
        if (centerVerti) centerVerti.disabled = bool;
        if (centerHoriz) centerHoriz.disabled = bool;
        
        menu.update();
    }
    
    
    FullEditor.prototype.lang = "en";
    
    
    FullEditor.prototype.menuItems = items;
    
    
    FullEditor.prototype.createMenu = function(opt) {
        
        if (!JSYG.isPlainObject(opt) && !Array.isArray(opt)) opt = {};
        
        var that = this;
        
        var menu = (opt.type == "contextMenu") ? new ContextMenu : new Menu();
        
        var liste = Array.isArray(opt) ? opt : (opt.items || JSYG.makeArray(arguments));
        
        var config = liste.reduce(function(prec,current) { prec[current] = true; return prec; },{});
        
        var bindedFct;
        
        if ("undo" in config || "redo" in config) {
            
            bindedFct = updateUndoRedoItems.bind(this,menu);
            
            that.undoRedo.on("change",bindedFct);
            that.on("change",bindedFct);
        }
        
        if ("group" in config || "ungroup" in config) {
            
            bindedFct = updateGroupItems.bind(this,menu);
            
            that.shapeEditor.on("changetarget",bindedFct);
        }
        
        if ("paste" in config) {
            
            bindedFct = updatePasteItem.bind(this,menu);
            
            that.shapeEditor.clipBoard.on("cut copy",bindedFct);
        }
        
        if ("copy" in config || "cut" in config || "remove" in config || "duplicate" in config || "deselectAll" in config) {
            
            this.shapeEditor.on({
                show : updateClipboardItems.bind(this,menu,false),
                hide : updateClipboardItems.bind(this,menu,true)
            });   
        }
        
        if ("fullscreen" in config) {
            
            $(document).on("fullscreenchange", updateFullscreenItem.bind(this,menu) );
        }
        
        if ("moveBack" in config || "moveBackwards" in config || "moveFront" in config || "moveForwards" in config) {
            
            bindedFct = updatePositionItems.bind(this,menu);
            
            that.shapeEditor.on({
                hide:bindedFct,
                changetarget:bindedFct
            });
            
            that.on("change",bindedFct);
        }
        
        if ("alignTop" in config || "alignMiddle" in config || "alignBottom" in config || "alignLeft" in config || "alignCenter" in config || "alignRight" in config) {
            
            bindedFct = updateAlignmentItems.bind(this,menu);
            
            svgEditor.shapeEditor.on({
                hide:bindedFct,
                changetarget:bindedFct
            });
        }
        
        if ("centerVerti" in config || "centerHoriz" in config) {
            
            svgEditor.shapeEditor.on({
                hide:updateCenterItems.bind(this,menu,true),
                changetarget:updateCenterItems.bind(this,menu,false)
            });
        }
        
        
        liste.forEach(function(name) {
            
            if (name == "divider") return menu.addDivider();
            
            if (!items[name]) throw new Error("item "+name+" does not exist");
            
            var item = JSYG.extend({},items[name]);
            
            if (item.globalShortcut) {
                if (globalShortcuts.indexOf(item.globalShortcut) != -1) item.globalShortcut = null;
                else globalShortcuts.push(item.globalShortcut);
            }
            
            if (typeof item.icon == "object") item.icon = new JSYG(item.icon).clone();
            
            item.name = name;
            item.text = item.text[ opt.lang || that.lang ];
            item.action = item.action.bind(that);
            
            if (opt.colors) item.icon = item.icon.replace(/ bnw/,'');
            
            menu.addItem(item);
        });
        
        return menu;
    };
    
});
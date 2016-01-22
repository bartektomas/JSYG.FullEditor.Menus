/*jshint forin:false, eqnull:true*/
/* globals JSYG*/

(function(factory) {
    
    if (typeof define != "undefined" && define.amd) define("jsyg-fulleditor",["jsyg","jsyg-editor","jsyg-texteditor","jsyg-zoomandpan","jsyg-pathdrawer","jsyg-polylinedrawer","jsyg-shapedrawer","jsyg-undoredo","jquery-hotkeys","jsyg-fetch"],factory);
    else if (typeof JSYG != "undefined") {
        
        var deps = ["Editor","TextEditor","ZoomAndPan","PathDrawer","PolylineDrawer","ShapeDrawer","UndoRedo","fetch"];
        
        deps = deps.map(function(dep) {
            if (!JSYG[dep]) throw new Error("JSYG."+dep+" is missing");
            return JSYG[dep];
        });
        
        deps.unshift(JSYG);
        
        factory.apply(null,deps);
    }
    else throw new Error("JSYG is needed");
    
})(function(JSYG,Editor,TextEditor,ZoomAndPan,PathDrawer,PolylineDrawer,ShapeDrawer,UndoRedo) {
    
    "use strict";
    
    function FullEditor(node,opt) {
        
        this._bindFunctions();
        
        this._init();
        
        this._keyShortCuts = {};
        
        if (node) this.setNode(node);
        
        if (opt) this.enable(opt);
    }
    
    FullEditor.prototype = Object.create(JSYG.StdConstruct.prototype);
    
    FullEditor.prototype.constructor = FullEditor;
    
    //events
    [
        'onload',
        'ondrag',
        'ondraw',
        'oninsert',
        'onremove',
        'onchange',
        'onzoom',
        'onchangetarget'
        
    ].forEach(function(event) { FullEditor.prototype[event] = null; });
    
    FullEditor.prototype.idContainer = "containerDoc";
    
    FullEditor.prototype._init = function() {
        
        this._initUndoRedo();
        
        this._initShapeEditor();
        
        this._initZoomAndPan();
        
        this._initTextEditor();
        
        this._initShapeDrawer();
        
        this._initMagnifyingGlass();
        
        return this;
    };
    
    FullEditor.prototype._bindFunctions = function() {
        
        for (var n in this) {
            
            if (typeof(this[n]) == "function" && n.charAt(0) != '_') this[n] = this[n].bind(this);
        }
        
        return this;
    };
    
    FullEditor.prototype.registerKeyShortCut = function(key,fct) {
        
        if (JSYG.isPlainObject(key)) {
            for (var n in key) this.registerKeyShortCut(n,key[n]);
            return this;
        }
        
        if (this._keyShortCuts[key]) this._disableKeyShortCut(key);
        
        this._keyShortCuts[key] = fct;
        
        if (this.enabled) this._enableKeyShortCut(key,fct);
        
        return this;
    };
    
    FullEditor.prototype.unregisterKeyShortCut = function(key) {
        
        var that = this;
        
        if (Array.isArray(key) || arguments.length > 1 && (key = [].slice.call(arguments))) {
            key.forEach(that.unregisterKeyShortCut);
            return this;
        }
        
        this._disableKeyShortCut(key,this._keyShortCuts[key]);
        
        delete this._keyShortCuts[key];
        
        return this;
    };
    
    FullEditor.prototype.selectAll = function() {
        
        this.disableEdition();
        this.enableSelection();
        this.shapeEditor.selection.selectAll();
        
        return this;
    };
    
    FullEditor.prototype.deselectAll = function() {
        
        var isEnabled = this.shapeEditor.enabled;
        
        if (!isEnabled) this.shapeEditor.enable();
        
        this.shapeEditor.selection.deselectAll();
        
        if (!isEnabled) this.shapeEditor.disable();
        
        return this;
    };
    
    FullEditor.prototype._enableKeyShortCut = function(key,fct) {
        
        if (typeof fct != 'function') throw new Error(typeof fct + " instead of function expected");
        
        new JSYG(document).on('keydown',null,key,fct);
        
        return this;
    };
    
    FullEditor.prototype._disableKeyShortCut = function(key,fct) {
        
        if (typeof fct != 'function') throw new Error(typeof fct + " instead of function expected");
        
        new JSYG(document).off('keydown',fct);
        
        return this;
    };
    
    FullEditor.prototype.enableKeyShortCuts = function() {
        
        var keys = this._keyShortCuts;
        
        for (var n in keys) this._enableKeyShortCut(n,keys[n]);
        
        return this;
    };
    
    FullEditor.prototype.disableKeyShortCuts = function() {
        
        var keys = this._keyShortCuts;
        
        for (var n in keys) this._disableKeyShortCut(n,keys[n]);
        
        return this;
    };
    
    FullEditor.prototype._editText = true;
    
    Object.defineProperty(FullEditor.prototype,'editText',{
        get : function() {
            return this._editText;
        },
        set:function(value) {
            this._editText = !!value;
            if (!value) this.textEditor.hide();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'editPosition',{
        get : function() {
            return this.shapeEditor.ctrlsDrag.enabled;
        },
        set:function(value) {
            this.shapeEditor.ctrlsDrag[ (value ? 'en' : 'dis') + 'able']();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'editSize',{
        get : function() {
            return this.shapeEditor.ctrlsResize.enabled;
        },
        set:function(value) {
            this.shapeEditor.ctrlsResize[ (value ? 'en' : 'dis') + 'able']();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'editRotation',{
        get : function() {
            return this.shapeEditor.ctrlsRotate.enabled;
        },
        set:function(value) {
            this.shapeEditor.ctrlsRotate[ (value ? 'en' : 'dis') + 'able']();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'editPathMainPoints',{
        get : function() {
            return this.shapeEditor.ctrlsMainPoints.enabled;
        },
        set:function(value) {
            this.shapeEditor.ctrlsMainPoints[ (value ? 'en' : 'dis') + 'able']();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'editPathCtrlPoints',{
        get : function() {
            return this.shapeEditor.ctrlsCtrlPoints.enabled;
        },
        set:function(value) {
            this.shapeEditor.ctrlsCtrlPoints[ (value ? 'en' : 'dis') + 'able']();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'canvasResizable',{
        get:function() {
            return this.zoomAndPan.resizable.enabled;  
        },
        set:function(value) {
            this.zoomAndPan.resizable[ (value ? 'en' : 'dis') + 'able']();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'keepShapesRatio',{
        get:function() {
            return this.shapeEditor.ctrlsResize.keepRatio;  
        },
        set:function(value) {
            value = !!value;
            this.shapeEditor.ctrlsResize.keepRatio = value;
            this._keepShapesRatio = value;
            if (this.shapeEditor.display) this.shapeEditor.update();
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'drawingPathMethod',{
        get:function() {
            return this.pathDrawer.type;  
        },
        set:function(value) {
            
            if (value != 'freehand' && value != 'point2point')
                throw new Error("Only 'freehand' and 'point2point' are allowed");
            
            this.pathDrawer.type = value;
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'autoSmoothPaths',{
        get:function() {
            return this.shapeEditor.ctrlsMainPoints.autoSmooth;
        },
        set:function(value) {
            
            this.shapeEditor.ctrlsMainPoints.autoSmooth = value;
        }
    });
    
    Object.defineProperty(FullEditor.prototype,'useTransformAttr',{
        
        get:function() {
            
            var dragType = this.shapeEditor.ctrlsDrag.type;
            var resizeType = this.shapeEditor.ctrlsResize.type;
            
            if (dragType!=resizeType) throw new Error("dragType and resizeType are not the same");
            
            return dragType;
        },
        
        set:function(value) {
            
            var oldValue = this.useTransformAttr;
            
            if (value != oldValue) {
                
                this.shapeEditor.ctrlsDrag.type = value ? 'transform' : 'attributes';
                if (this.shapeEditor.ctrlsDrag.enabled) this.shapeEditor.ctrlsDrag.disable().enable();
                
                this.shapeEditor.ctrlsResize.type = value ? 'transform' : 'attributes';
                if (this.shapeEditor.ctrlsResize.enabled) this.shapeEditor.ctrlsResize.disable().enable();
            }
        }
    });
    
    FullEditor.prototype._currentLayer = null;
    
    Object.defineProperty(FullEditor.prototype,'currentLayer',{
        get : function() {
            return this._currentLayer || this.getDocument();
        },
        set : function(value) {
            var $node = new JSYG(value);
            if (!$node.length) throw new Error("Invalid value for currentLayer. No node found.");
            this._currentLayer = $node[0];
        }
    });
    
    FullEditor.prototype.addLayer = function() {
        
        var g = new JSYG('<g>').appendTo(this.getDocument());
        
        this._currentLayer = g[0];
    };
    
    FullEditor.prototype.getDocument = function() {
        
        return document.querySelector( this._getDocumentSelector() );
    };
    
    FullEditor.prototype._initUndoRedo = function() {
        
        var that = this;
        
        this.undoRedo = new UndoRedo();
        
        this.undoRedo.on("change",function() {
            //that.hideEditors();
            that.trigger("change", that, that.getDocument() );
        });
    };
    
    FullEditor.prototype.hideEditors = function() {
        
        this.shapeEditor.hide();
        this.textEditor.hide();
        
        return this;
    };
    
    FullEditor.prototype.enableSelection = function() {
        
        this.disableEdition();
        this.shapeEditor.enable();
        return this;
    };
    
    FullEditor.prototype.disableSelection = function() {
        
        this.hideEditors();
        
        if (this.shapeEditor.enabled) this.shapeEditor.disable();
        
        return this;
    };
    
    FullEditor.prototype.disableInsertion = function() {
        
        this.disableInsertElement();
        
        this.disableShapeDrawer();
        
        return this;
    };
    
    FullEditor.prototype.disableEdition = function() {
        
        this.disableInsertion();
        
        this.disableMousePan();
        
        this.disableMagnifyingGlass();
        
        this.disableSelection();
        
        return this;
    };
    
    ["copy","cut","paste"].forEach(function(action) {
        
        FullEditor.prototype[action] = function() {
            
            if (action!=="paste" && !this.shapeEditor.display) return;
            
            this.shapeEditor.clipBoard[action]();
            
            return this;
        };
    });
    
    FullEditor.prototype.duplicate = function() {
        
        var cb = this.shapeEditor.clipBoard,
        buffer = cb.buffer;
        
        cb.copy();
        cb.paste();
        cb.buffer = buffer;
        
        return this;
    };
    
    
    ["undo","redo"].forEach(function(action) {
        
        FullEditor.prototype[action] = function() {
            
            this.hideEditors();
            
            this.undoRedo[action]();
            
            return this;
        };
        
    });
    
    ["Front","Backwards","Forwards","Back"].forEach(function(type) {
        
        var methode = "move"+type;
        
        FullEditor.prototype[methode] = function() {
            
            var target = this.shapeEditor._target;
            
            if (target) {
                new JSYG(target)[methode]();
                this.triggerChange();
            }
            
            return this;
        };
    });
    
    ["Horiz","Verti"].forEach(function(type) {
        
        var methode = "move"+type;
        
        FullEditor.prototype[methode] = function(value) {
            
            var target = this.shapeEditor.target();
            var dim;
            
            if (target && target.length) {
                
                dim = target.getDim();
                
                target.setDim( type == "Horiz" ? {x:dim.x+value} : {y:dim.y+value} );
                this.shapeEditor.update();
                
                this.triggerChange();
            }
            
            return this;
        };
    });
    
    var regOperator = /^\s*(\+|-|\*|\/)=(\d+)\s*$/;
    
    function parseValue(newValue,oldValue) {
        
        var matches = regOperator.exec(newValue);
        
        if (!matches) return newValue;
        
        switch (matches[1]) {
            case '+' : return oldValue + Number(matches[2]);
            case '-' : return oldValue - Number(matches[2]);
            case '*' : return oldValue * Number(matches[2]);
            case '/' : return oldValue / Number(matches[2]);
        }
    }
    
    FullEditor.prototype.setDim = function(prop,value) {
        
        var target = this.shapeEditor.target();
        var change = false;
        var doc = this.getDocument();
        var n,newDim,oldDim;
        
        if (!target || !target.length) return this;
        
        if (JSYG.isPlainObject(prop)) newDim = JSYG.extend({},prop);
        else {
            newDim = {};
            newDim[prop] = value;
        }
        
        oldDim = target.getDim(doc);
            
        for (n in newDim) {
                        
            newDim[n] = parseValue(newDim[n],oldDim[n]);
            
            if (newDim[n] != oldDim[n]) change = true;
        }
        
        if (change) {
            
            newDim.from = doc;
            
            target.setDim(newDim);
            this.shapeEditor.update();
            this.triggerChange();
        }
        
        return this;
    };
    
    FullEditor.prototype.rotate = function(value) {
        
        var target = this.target(),
        oldValue = target && target.rotate();
        
        if (!target) return (value == null) ? null : this;
        
        if (value == null) return oldValue;
        
        value = parseValue(value,oldValue) - oldValue;
        
        if (oldValue != value) {
            
            target.rotate(value);
            this.shapeEditor.update();
            this.triggerChange();
        }
        
        return this;
    };
    
    
    FullEditor.prototype.css = function(prop,value) {
        
        if (JSYG.isPlainObject(prop)) {
            for (var n in prop) this.css(n,prop[n]);
            return this;
        }
        
        var target = this.target(),
        oldValue = target && target.css(prop);
        
        if (!target) return (value == null) ? null : this;
        
        if (value == null) return oldValue;
        
        value = parseValue(value,oldValue);
        
        if (oldValue != value) {
            
            target.css(prop,value);
            this.shapeEditor.update();
            this.triggerChange();
        }
        
        return this;
    };
    
    
    FullEditor.prototype.triggerChange = function() {
        
        this.undoRedo.saveState();
        
        this.trigger("change", this, this.getDocument() );
        
        return this;
    };
    
    FullEditor.prototype._insertFrame = function() {
        
        var mainFrame = this.zoomAndPan.innerFrame,
        content = new JSYG(mainFrame).children().detach();
        
        this._frameShadow = new JSYG("<rect>")
            .attr({x:2,y:2})
            .attr("id","frameShadowDoc")
            .appendTo(mainFrame)[0];
        
        this._frame = new JSYG("<rect>")
            .attr({x:0,y:0})
            .attr("id","frameDoc")
            .appendTo(mainFrame)[0];
        
        this.containerDoc = new JSYG("<g>")
            .attr("id",this.idContainer)
            .append(content)
            .appendTo(mainFrame)
        [0];
        
        this._adjustSize();
        
        return this;
    };
    
    FullEditor.prototype.cursorDrawing = "copy";
    
    FullEditor.prototype._removeFrame = function() {
        
        var container = new JSYG(this.containerDoc),
        content = container.children();
        
        new JSYG(this._frame).remove();
        new JSYG(this._frameShadow).remove();
        container.remove();
        
        content.appendTo(this.zoomAndPan.innerFrame);
        
        return this;
    };
    
    FullEditor.prototype._initShapeDrawer = function() {
        
        this.pathDrawer = this._initDrawer(new PathDrawer);
        this.polylineDrawer = this._initDrawer(new PolylineDrawer);
        this.shapeDrawer = this._initDrawer(new ShapeDrawer);
        
        return this;
    };
    
    FullEditor.prototype._initDrawer = function(drawer) {
        
        var that = this;
        
        drawer.on({
            
            draw : function(e) { that.trigger("draw",that,e,this); },
            
            end : function(e) {
                
                if (!this.parentNode) return;
                
                that.trigger("insert",that,e,this);
                
                that.triggerChange();
                
                if (that.autoEnableSelection) that.shapeEditor.target(this).show();
            }
        });
        
        return drawer;
    };
    
    FullEditor.prototype._setCursorDrawing = function() {
        
        if (this.cursorDrawing) this.zoomAndPan.node.style.cursor = this.cursorDrawing;
    };
    
    FullEditor.prototype._removeCursorDrawing = function() {
        
        if (this.cursorDrawing) this.zoomAndPan.node.style.cursor = null;
    };
    
    
    Object.defineProperty(FullEditor.prototype,"shapeDrawerModel",{
        
        get:function() {
            return this._shapeDrawerModel;
        },
        
        set:function(value) {
            
            var jNode = new JSYG(value);     
            
            if (jNode.length != 1) throw new Error("Shape model incorrect");
            
            if (JSYG.svgShapes.indexOf(jNode.getTag()) == -1)
                throw new Error(jNode.getTag()+" is not a svg shape");
            
            this._shapeDrawerModel = jNode[0];
        }
    });
    
    FullEditor.prototype.drawShape = function(modele) {
        
        var that = this;
        
        return new Promise(function(resolve,reject) {
            
            that.enableShapeDrawer(modele,function() {
                
                var target = that.target();
                
                that.disableShapeDrawer();
                
                if (target) resolve(target[0]);
                else reject(new Error("No shape was drawn"));
            });
        });
    }
    
    
    FullEditor.prototype.enableShapeDrawer = function(modele,_callback) {
        
        var frame = new JSYG(this.zoomAndPan.innerFrame),
        that = this;
        
        this.disableEdition();
        
        if (modele) this.shapeDrawerModel = modele;
        
        function onmousedown(e) {
            
            if (that.pathDrawer.inProgress || that.polylineDrawer.inProgress || that.shapeDrawer.inProgress || e.which != 1) return;
            
            e.preventDefault();
            
            var modele = that.shapeDrawerModel;
            if (!modele) throw new Error("You must define a model");
            
            var shape = new JSYG(modele).clone().appendTo( that.currentLayer );
            var tag = shape.getTag();
            var drawer;
            
            switch(tag) {
                
                case "polyline": case "polygon" : drawer = that.polylineDrawer; break;
                
                case "path" : drawer = that.pathDrawer; break;
                
                default : drawer = that.shapeDrawer; break;
            }
            
            drawer.area = frame;
            drawer.draw(shape,e);
            
            if (_callback) drawer.one("end",_callback);
        }
        
        frame.on("mousedown",onmousedown).data("enableDrawingShape",onmousedown);
        
        this._setCursorDrawing();
        
        return this;
    };
    
    FullEditor.prototype.disableShapeDrawer = function() {
        
        var frame = new JSYG(this.zoomAndPan.innerFrame),
        fct = frame.data("enableDrawingShape");
        
        if (!fct) return this;
        
        frame.off("mousedown",fct);
        
        this._removeCursorDrawing();
        
        return this;
    };
    
    FullEditor.prototype.autoEnableSelection = true;
    
    function isTextShape(elmt) {
        return JSYG.svgTexts.indexOf( new JSYG(elmt).getTag() ) != -1;
    }
    
    Object.defineProperty(FullEditor.prototype,"insertElementModel",{
        
        get:function() {
            return this._insertElementModel;
        },
        
        set:function(value) {
            
            var jNode = new JSYG(value);     
            
            if (jNode.length != 1) throw new Error("element model incorrect");
            
            if (JSYG.svgGraphics.indexOf(jNode.getTag()) == -1)
                throw new Error(jNode.getTag()+" is not a svg graphic element");
            
            this._insertElementModel = jNode[0];
        }
    });
    
    FullEditor.prototype.mouseInsertElement = function(modele) {
        
        var that = this;
        
        return new Promise(function(resolve) {
            
            that.enableInsertElement(modele,function() {
                
                var target = that.target();
                
                that.disableInsertElement();
                
                if (target) resolve(target[0]);
                else reject(new Error("No element inserted"));
            });
        });
    }
    
    FullEditor.prototype.enableInsertElement = function(modele,_callback) {
        
        var frame = new JSYG(this.zoomAndPan.innerFrame),
        that = this;
        
        this.disableEdition();
        
        if (modele) this.insertElementModel = modele;
        
        function onmousedown(e) {
            
            if (e.which != 1) return;
            
            e.preventDefault();
            
            var modele = that.insertElementModel;
            if (!modele) throw new Error("You must define a model");
            
            var shape = new JSYG(modele).clone(),
            isText = isTextShape(shape);
            
            that.insertElement(shape,e,isText);
            
            if (that.autoEnableSelection) {
                
                new JSYG(that.node).one('mouseup',function() {
                    
                    that.shapeEditor.target(shape);
                    
                    if (that.editText && isText) {
                        that.textEditor.target(shape).show();
                        that.textEditor.one("validate",_callback);
                    }
                    else {
                        that.shapeEditor.show();
                        if (_callback) _callback();
                    }
                    
                });
            }
        }
        
        frame.on("mousedown",onmousedown).data("enableInsertElement",onmousedown);
        
        this._setCursorDrawing();
        
        return this;
    };
    
    FullEditor.prototype.disableInsertElement = function() {
        
        var frame = new JSYG(this.zoomAndPan.innerFrame),
        fct = frame.data("enableInsertElement");
        
        if (!fct) return this;
        
        frame.off("mousedown",fct);
        
        this._removeCursorDrawing();
        
        return this;
    };
    
    FullEditor.prototype.marqueeZoom = function(opt) {
        
        var that = this;
        
        return new Promise(function(resolve) {
            
            that.enableMarqueeZoom(opt,function() {
                that.disableMarqueeZoom();
                resolve();
            });
        });
    };
    
    FullEditor.prototype.disableMarqueeZoom = function() {
        
        this.zoomAndPan.marqueeZoom.disable();
        
        return this;
    };
    
    FullEditor.prototype.enableMarqueeZoom = function(opt,_callback) {
        
        if (this.zoomAndPan.marqueeZoom.enabled && !opt) return this;
        
        this.disableEdition();
        
        this.zoomAndPan.marqueeZoom.enable(opt);
        
        if (_callback) this.zoomAndPan.marqueeZoom.one("end",_callback);
        
        return this;
    };
    
    FullEditor.prototype.zoom = function(percent) {
        
        this.zoomAndPan.scale( 1 + (percent/100) );
        
        this.trigger("zoom",this,this.getDocument());
        
        return this;
    };
    
    FullEditor.prototype.zoomTo = function(percentage) {
        
        if (percentage == "canvas") this.zoomAndPan.fitToCanvas().scale(0.95);
        else if (JSYG.isNumeric(percentage)) this.zoomAndPan.scaleTo( percentage/100 );
        else throw new Error("argument must be numeric or 'canvas' string");
        
        this.trigger("zoom",this,this.getDocument());
        
        return this;
    };
    
    FullEditor.prototype.fitToDoc = function() {
        
        var dim = new JSYG(this.getDocument()).getDim("screen"),
        overflow = this.zoomAndPan.overflow;
        
        this.zoomAndPan.size({
            width : dim.width + (overflow!="hidden" ? 10 : 0),
            height : dim.height + (overflow!="hidden" ? 10 : 0)
        });
        
        return this;
    };
    
    
    FullEditor.prototype._initZoomAndPan = function() {
        
        var that = this;
        
        this.zoomAndPan = new ZoomAndPan();
        this.zoomAndPan.overflow = "auto";
        this.zoomAndPan.scaleMin = 0;
        
        this.zoomAndPan.resizable.keepViewBox = false;
        this.zoomAndPan.resizable.keepRatio = false;
        
        this.zoomAndPan.mouseWheelZoom.key = "ctrl";
        
        this.zoomAndPan.on("change",function() {
            that._updateBoundingBoxes();
            that.shapeEditor.update();
            that.textEditor.update();
        });
        
        return this;
    };
    
    
    FullEditor.prototype._initShapeEditor = function() {
        
        var editor = new Editor();
        var that = this;
        
        editor.selection.multiple = true;
        
        new JSYG(editor.container).on("dblclick",function(e) {
            
            var target = editor.target();
            
            if (!that.editText || JSYG.svgTexts.indexOf( target.getTag() ) == -1) return;
            
            that.textEditor.target(target).show();
            that.textEditor.cursor.setFromPos(e);
        });
        
        editor.selection.on("beforedeselect beforedrag",function(e) {
            
            if (e.target == that.textEditor.container || new JSYG(e.target).isChildOf(that.textEditor.container)) return false;
        });
        
        editor.on({
            
            show : function() {
                that.textEditor.hide();
            },
            
            change : this.triggerChange,
            
            drag : function(e) {
                that.trigger("drag", that, e, editor._target);
            },
            
            changetarget : function() {
                that.trigger("changetarget",that,editor._target);
            }
        });
        
        //editor.ctrlsDrag.bounds = 0;
        //editor.ctrlsResize.bounds = 0;
        
        this.shapeEditor = editor;
        
        return this;
    };
    
    FullEditor.prototype._initTextEditor = function() {
        
        var that = this;
        
        this.textEditor = new TextEditor();
        
        this.textEditor.on({
            show : function() {
                that.shapeEditor.disable();
            },
            hide : function() {
                var target = that.textEditor.target();
                if (!target.text()) target.remove();
                else that.shapeEditor.enable().target(target).show();
            },
            validate : function() {
                that.triggerChange();
            }
        });
        
        return this;
    };
    
    FullEditor.prototype.setNode = function() {
        
        JSYG.StdConstruct.prototype.setNode.apply(this,arguments);
        
        this.zoomAndPan.setNode(this.node);
        
        this.shapeEditor.setNode(this.node);
        
        this.textEditor.setNode(this.node);
        
        this.magnifyingGlass.setNode(this.node);
        
        return this;
    };
    
    FullEditor.prototype._getDocumentSelector = function() {
        
        return "#" + this.idContainer + " > svg ";
    };
    
    Object.defineProperty(FullEditor.prototype,'editableShapes',{
        get:function() { return this.shapeEditor.list && this.shapeEditor.list.replace(this._getDocumentSelector(),''); },
        set:function(value) { this.shapeEditor.list = this._getDocumentSelector() + value; }
    });
    
    
    FullEditor.prototype.enableMousePan = function(opt) {
        
        if (!this.zoomAndPan.mousePan.enabled) {
            
            this.disableEdition();
            
            this.zoomAndPan.mousePan.enable(opt);
        }
        
        return this;
    };
    
    FullEditor.prototype.disableMousePan = function() {
        
        if (this.zoomAndPan.mousePan.enabled) {
            
            this.zoomAndPan.mousePan.disable();
        }
        
        return this;
    };
    
    FullEditor.prototype.enableMouseWheelZoom = function(opt) {
        
        if (!this.zoomAndPan.mouseWheelZoom.enabled) {
            
            this.zoomAndPan.mouseWheelZoom.enable(opt);
        }
        
        return this;
    };
    
    FullEditor.prototype.disableMouseWheelZoom = function() {
        
        if (this.zoomAndPan.mouseWheelZoom.enabled) {
            
            this.zoomAndPan.mouseWheelZoom.disable();
        }
        
        return this;
    };
    
    FullEditor.prototype._initMagnifyingGlass = function() {
        
        this.magnifyingGlass = new JSYG.MagnifyingGlass();
    };
    
    FullEditor.prototype.enableMagnifyingGlass = function() {
        
        if (!this.magnifyingGlass.enabled) {
            
            this.disableEdition();
            
            this.magnifyingGlass.enable();
        }
        
        return this;
    };
    
    FullEditor.prototype.disableMagnifyingGlass = function() {
        
        if (this.magnifyingGlass.enabled) {
            
            this.magnifyingGlass.disable();
        }
        
        return this;
    };
    
    FullEditor.prototype.canMoveBackwards = function() {
        
        var shapes = new JSYG(this.shapeEditor.list),
        target = this.shapeEditor.target();
        
        return shapes.index(target) > 0 && shapes.length > 1;
    };
    
    FullEditor.prototype.canMoveForwards = function() {
        
        var shapes = new JSYG(this.shapeEditor.list),
        target = this.shapeEditor.target();
        
        return shapes.index(target) < shapes.length-1 && shapes.length > 1;
    };
    
    FullEditor.prototype.isGroup = function() {
        
        return this.shapeEditor.isGroup();
    };
    
    Object.defineProperty(FullEditor.prototype,'overflow',{
        
        get : function() { return this.zoomAndPan.overflow; },
        
        set : function(value) {
            
            var displayShapeEditor = this.shapeEditor.display,
            displaytextEditor = this.textEditor.display;
            
            if (displayShapeEditor) this.shapeEditor.hide();
            if (displaytextEditor) this.textEditor.hide();
            
            this.zoomAndPan.overflow = value;
            
            if (displayShapeEditor) this.shapeEditor.show();
            if (displaytextEditor) this.textEditor.show();
        }
    });
    
    FullEditor.prototype.enable = function(opt) {
        
        this.disable();
        
        if (opt) this.set(opt);
        
        if (!this.node) throw new Error("node is not defined");
        
        this.zoomAndPan.enable();
        
        this._insertFrame();
        
        //on force les valeurs pour exécuter les fonctions définies dans Object.defineProperty
        if (this._editPathCtrlPoints) this._editPathCtrlPoints = true;
        if (this._resizable) this._resizable = true;
        
        this.shapeEditor.enableCtrls('drag','resize','rotate','mainPoints');
        
        this.shapeEditor.enable();
        
        this.enableKeyShortCuts();
        
        this.enabled = true;
        
        return this;
    };
    
    FullEditor.prototype.disable = function() {
        
        this._removeFrame();
        
        this.zoomAndPan.disable();
        
        this.shapeEditor.disable();
        
        this.textEditor.disable();
        
        this.undoRedo.disable();
        
        this.disableKeyShortCuts();
        
        this.enabled = false;
        
        return this;
    };
    
    /**
     * Aligne les éléments sélectionnés
     * @param {String} type (top,middle,bottom,left,center,right)
     * @returns {undefined}
     */
    FullEditor.prototype.align = function(type) {
        
        this.shapeEditor.align(type);
        
        return this;
    };
    
    FullEditor.prototype.target = function(value) {
        
        if (value == null) {
            
            if (this.shapeEditor.display) return this.shapeEditor.target();
            else if (this.textEditor.display) return this.textEditor.target();
            
            return null;
        }
        else {
            
            this.shapeEditor.target( new JSYG(this.getDocument()).find(value) ).show();
        }
        
        return this;
    };
    
    FullEditor.prototype.editTextElmt = function(elmt) {
        
        if (elmt == null) elmt = this.target();
        
        this.textEditor.target(elmt).show();
        
        return this;
    };
    
    FullEditor.prototype.setDimDocument = function(dim) {
        
        new JSYG( this.getDocument() ).setDim(dim);
        
        this.triggerChange();
        
        this._adjustSize();
        
        return this;
    };
    
    FullEditor.prototype.getDimDocument = function() {
        
        return new JSYG( this.getDocument() ).getDim();
    };
    
    FullEditor.prototype.isMultiSelection = function() {
        
        return this.shapeEditor.isMultiSelection();
    };
    
    FullEditor.prototype._adjustSize = function() {
        
        var contenu = new JSYG( this.getDocument() ),
        dim = contenu.length && contenu.getDim() || {width:0, height:0};
        
        new JSYG(this._frameShadow).add(this._frame).attr({
            width:dim.width,
            height:dim.height
        });
        
        if (dim.width && dim.height) this.zoomTo('canvas');
        
        if (!this.shapeEditor.ctrlsDrag.options) this.shapeEditor.ctrlsDrag.options = {};
        if (!this.shapeEditor.ctrlsResize.options) this.shapeEditor.ctrlsResize.options = {};
        
        this.shapeEditor.ctrlsDrag.options.guides = {
            list : [{x:0},{x:dim.width},{y:0},{y:dim.height}]
        };
        
        this.shapeEditor.ctrlsResize.options.stepsX = {
            list : [0,dim.width]
        };
        
        this.shapeEditor.ctrlsResize.options.stepsY = {
            list : [0,dim.height]
        };
        
        return this;
    };
    
    FullEditor.prototype.createImage = function(src) {
        
        var image = new JSYG('<image>').attr('href',src),
        that = this;
        
        return new Promise(function(resolve,reject) {
            
            var img = new Image();
            
            img.onload = function() {
                
                var dimDoc = new JSYG(that.getDocument()).getDim(),
                height = this.height,
                width = this.width;
                
                if (width > dimDoc.width) {
                    height = height * dimDoc.width / width;
                    width = dimDoc.width;
                }
                
                if (height > dimDoc.height) {
                    width = width * dimDoc.height / height;
                    height = dimDoc.height;                    
                }
                
                image.attr({width:width,height:height});
                
                resolve(image[0]);
            };
            
            img.onerror = reject;
            
            img.src = src;
        });
    };
    
    FullEditor.prototype.insertElement = function(elmt,pos,_preventEvent) {
        
        var textNode;
        
        elmt = new JSYG(elmt);
        
        elmt.appendTo(this.currentLayer);
        
        if (JSYG.svgTexts.indexOf(elmt.getTag())!=-1 && !elmt.text()) {
            textNode = document.createTextNode("I");
            elmt.append(textNode);
        }
        
        if (pos instanceof JSYG.Event) elmt.setCenter( elmt.getCursorPos(pos) );
        else {
            
            elmt.setDim({
                x : pos && pos.x || 0,
                y : pos && pos.y || 0
            });
        }
        
        if (textNode) new JSYG(textNode).remove();
        
        if (!_preventEvent) {
            
            this.trigger("insert", this, this.getDocument(), elmt );
            this.triggerChange();
        }
        
        return this;
    };
    
    function stopEvents(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    
    FullEditor.prototype.importSVGAs = "image";
    
    FullEditor.prototype.enableDropFiles = function() {
        
        var that = this;
        
        var fcts = {
            
            dragenter : stopEvents,
            dragover : stopEvents,
            
            drop : function(e) {
                
                stopEvents(e);
                
                var dt = e.originalEvent.dataTransfer;
                
                if (!dt || !dt.files || !dt.files.length) return;
                
                var file = dt.files[0];
                
                if (/svg/i.test(file.type) && that.importSVGAs.toLowerCase() == "svg") that.insertSVGFile(file,e);
                else that.insertImageFile(file,e);
            }
        }
        
        JSYG(this.zoomAndPan.innerFrame).on(fcts);
        
        this.disableDropImages = function() {
            
            JSYG(this.zoomAndPan.innerFrame).off(fcts);
        };
        
        return this;
    };
    
    FullEditor.prototype.disableDropFiles = function() { return this; };
    
    FullEditor.prototype.insertImageFile = function(file,e) {
        
        var that = this;
        
        return this.importImage(file)
            .then(function(img) {
                that.insertElement(img,e);
            that.shapeEditor.target(img).show();
        });
    };
    
    FullEditor.prototype.insertSVGFile = function(file,e) {
        
        var that = this;
        
        return this.readFile(file,"text")
            .then(JSYG.parseSVG)
            .then(function(svg) {
                that.insertElement(svg,e);
            that.shapeEditor.target(svg).show();
        });
    };
    
    FullEditor.prototype.importImage = function(arg) {
        
        var promise;
        
        if (arg instanceof File) {
            
            if (!arg.type.match(/image/)) return Promise.reject(new TypeError(arg.name + " is not an image file"));
            
            promise = this.readFile(arg,'dataURL');
        }
        else {
            
            if (arg.src) arg = arg.src; //DOMElement
            else if (arg instanceof jQuery) {
                
                arg = JSYG(arg);
                arg = arg.attr( arg.isSVG() ? 'href' : 'src' );
                
                if (!arg) throw new TypeError("no src/href attribute found");
            } 
            else if (typeof arg != "string") throw new TypeError("argument incorrect"); //URL or dataURL
            
            promise = Promise.resolve(arg);
        }
        
        return promise.then(this.createImage);
    };
    
    FullEditor.prototype.chooseFile = function() {
        
        var that = this;
        
        return new Promise(function(resolve,reject) {
            
            JSYG("<input>").attr("type","file").on("change",function() {
                
                resolve(this.files[0]);
            })
                .trigger("click");
        });
    };
    
    FullEditor.prototype.load = function(arg) {
        
        if (arg instanceof File) return this.loadFile(arg);
        else if (typeof arg == "string") {
            if (arg.indexOf("<?xml") == 0 || arg.indexOf("<svg") == 0)
                return this.loadString(arg);
            else return this.loadURL(arg);
        }
        else return this.loadXML();
    };
    
    FullEditor.prototype.loadString = function(str) {
        
        return this.loadXML( JSYG.parseSVG(str) );
    };
    
    FullEditor.prototype.readFile = function(file,readAs) {
        
        return new Promise(function(resolve,reject) {
            
            if (!window.FileReader) throw new Error("your navigator doesn't implement FileReader");
            
            if (!(file instanceof File)) throw new Error("file argument incorrect");
            
            var reader = new FileReader();
            
            readAs = JSYG.ucfirst(readAs || 'text');
            
            if (['DataURL','Text'].indexOf(readAs) == -1) throw new Error("format incorrect");
            
            reader.onload = function(e) {
		resolve(e.target.result);
            };
            
            reader.onerror = function(e) {
		reject(new Error("Impossible de charger le fichier"));
            };
            
            reader['readAs'+readAs](file);
        });
    };
    
    FullEditor.prototype.loadFile = function(file) {
        
        if (!file.type || !file.type.match(/svg/)) throw new Error("file format incorrect. SVG file is required.");
        
        return this.readFile(file).then(this.loadString.bind(this));
    };
    
    FullEditor.prototype.loadURL = function(url) {
        
        return JSYG.fetch(url).then(function(response) {
            return response.text();
        })
            .then(this.loadString.bind(this));
    };
    
    FullEditor.prototype.loadXML = function(svg) {
        
        this.shapeEditor.hide();
        this.textEditor.hide();
        this._clearBoundingBoxes();
        
        var container = new JSYG('#'+this.idContainer);
        
        container.empty().append(svg);
        
        this._adjustSize();
        
        this.undoRedo.disable().setNode(svg).enable();
        
        this.trigger("load",this,svg);
        
        return this;
    };
    
    FullEditor.prototype.newDocument = function(width,height) {
        
        var svg = new JSYG('<svg>').setDim( {width:width,height:height} );
        return this.loadXML(svg);
    };
    
    FullEditor.prototype._updateBoundingBoxes = function() {
        
        new JSYG(this.shapeEditor.list).each(function() {
            var $this = new JSYG(this);
            if ($this.boundingBox("get","display")) $this.boundingBox("update");
        });
    };
    
    FullEditor.prototype._clearBoundingBoxes = function() {
        
        new JSYG(this.shapeEditor.list).boundingBox("hide");
    };
    
    FullEditor.prototype.toCanvas = function() {
        
        return new JSYG(this.getDocument()).toCanvas();
    };
    
    FullEditor.prototype.toSVGString = function() {
        
        return new JSYG(this.getDocument()).toSVGString(true);
    };
    
    FullEditor.prototype.toSVGDataURL = function() {
        
        return new JSYG(this.getDocument()).toDataURL(true);
    };
    
    FullEditor.prototype.toPNGDataURL = function(format) {
        
        return this.toCanvas().then(function(canvas) {
            
            return canvas.toDataURL();
        });
    };
    
    FullEditor.prototype._checkExportFormat = function(format) {
        
        var exportFormats = ['svg','png'];
        
        if (exportFormats.indexOf(format) == -1) throw new Error(format+" : incorrect format ("+exportFormats.join(' or ')+" required)");
    };
    
    FullEditor.prototype.toDataURL = function(format) {
        
        if (!format) format = 'svg';
        
        this._checkExportFormat(format);
        
        var method = "to"+format.toUpperCase()+"DataURL";
        
        return this[method]();
    };
    
    FullEditor.prototype.print = function() {
        
        return this.toSVGDataURL().then(function(url) {
            var win = window.open(url);
            win.onload = function() { win.print(); };
        });
    };
    
    FullEditor.prototype.downloadPNG = function() {
        
        return this.download("png");
    };
    
    FullEditor.prototype.downloadSVG = function() {
        
        return this.download("svg");
    };
    
    FullEditor.prototype.download = function(format) {
        
        if (!format) format = 'svg';
        
        return this.toDataURL(format).then(function(url) {
            
            var a = new JSYG('<a>').attr({
                href:url,
                download:"file."+format
            }).appendTo('body');
            
            a[0].click();
            a.remove();
        });
    };
    
    FullEditor.prototype.remove = function() {
        
        if (!this.shapeEditor.display) return;
        
        var target = this.shapeEditor.target();
        
        this.shapeEditor.hide();
        
        this._clearBoundingBoxes();
        
        target.remove();
        
        this.trigger("remove", this, this.getDocument(), target);
        
        this.triggerChange();
        
        return this;
    };
    
    FullEditor.prototype.group = function() {
        
        this.shapeEditor.group();
        
        this.triggerChange();
        
        return this;
    };
    
    FullEditor.prototype.ungroup = function() {
        
        this.shapeEditor.ungroup();
        
        this.triggerChange();
        
        return this;
    };
    
    FullEditor.prototype.center = function(orientation) {
        
        var doc = this.getDocument(),
        dimDoc = new JSYG(doc).getDim(),
        target = this.target(),
        dim = target.getDim(doc),
        isVerti = orientation.toLowerCase().indexOf("verti") == 0,
        newX = (dimDoc.width - dim.width) / 2,
        newY = (dimDoc.height - dim.height) /2;
        
        if (isVerti && dim.x != newX) target.setDim({x:newX});
        else if (!isVerti && dim.y != newY) target.setDim({y:newY});
        else return this;
        
        if (this.shapeEditor.display) this.shapeEditor.update();
        else if (this.textEditor.display) this.textEditor.update();
        
        this.triggerChange();
        
        return this;
    };
    
    FullEditor.prototype.centerVertically = function() {
        
        return this.center("vertically");
    };
    
    FullEditor.prototype.centerHorizontally = function() {
        
	return this.center("horizontally");
    };
    
    
    JSYG.FullEditor = FullEditor;
    
    return FullEditor;
    
});
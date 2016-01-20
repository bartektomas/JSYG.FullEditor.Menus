# JSYG.FullEditor.Menus
Menus plugin for JSYG.FullEditor

##### Demo
[http://yannickbochatay.github.io/JSYG.FullEditor.Menus](http://yannickbochatay.github.io/JSYG.FullEditor.Menus/)

##### Installation
```shell
bower install jsyg-fulleditor-menus
```


##### Example

HTML
```html
<div id="menuBar"></div>
<svg width="500" height="500" id="editor"></svg>
```

Javascript
```javascript
var svgEditor = new JSYG.FullEditor("#editor");

svgEditor.enable();

var fileMenu = svgEditor.createMenu("openFile","print","downloadSVG","downloadPNG").set({title:"File"});

var toolsMenu = svgEditor.createMenu("selectionTool","insertText","insertImageFile","drawRect","drawPolyline","drawPath","drawFreeHandPath").set({"title":"Tools"});

toolsMenu.addItem({
    text:"personal item",
    icon:"ledicon user",
    action : function() {
        //do something great
    }
});
        
new JSYG("#menuBar").menuBar([fileMenu,toolsMenu]);
```


#### Full example script
[https://github.com/YannickBochatay/JSYG.FullEditor.Menus/blob/master/script.js](https://github.com/YannickBochatay/JSYG.FullEditor.Menus/blob/master/script.js)


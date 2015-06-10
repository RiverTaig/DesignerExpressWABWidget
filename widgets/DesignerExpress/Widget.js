///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

//,
  //,
  //'jimu/loaderplugins/jquery-loader!https://code.jquery.com/jquery-git1.min.js'

define(['dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/i18n!esri/nls/jsapi',
    'dojo/keys',
    'dojo/on',
    'dojo/query',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidget',
    'esri/dijit/editing/Editor',
    'esri/layers/FeatureLayer',
    'dojo/domReady'
  ],
  function(declare, lang, html, esriBundle, keys, on, query, _WidgetsInTemplateMixin,
    BaseWidget, Editor, FeatureLayer) {
	   return declare([BaseWidget, _WidgetsInTemplateMixin], {
      name: 'DesignerExpress',
      baseClass: 'jimu-widget-designerExpress',
      editor: null,
      layers: null,
      _defaultStartStr: "",
      _defaultAddPointStr: "",
      
      onOpen: function() {

        this.layers = [];
        this.disableWebMapPopup();
        this.getLayers();
        this.initEditor();
      },
      
      disableWebMapPopup: function() {
        if (this.map && this.map.webMapResponse) {
          var handler = this.map.webMapResponse.clickEventHandle;
          if (handler) {
            handler.remove();
            this.map.webMapResponse.clickEventHandle = null;
          }
        }
      },
	  
	  
      enableWebMapPopup: function() {
        if ( this.map && this.map.webMapResponse) {
          var handler = this.map.webMapResponse.clickEventHandle;
          var listener = this.map.webMapResponse.clickEventListener;
          if (listener && !handler) {
            this.map.webMapResponse.clickEventHandle = on(this.map,
              'click',
              lang.hitch(this.map, listener));
          }
        }
      },

      getLayerFromMap: function(url) {
        var ids = this.map.graphicsLayerIds;
        var len = ids.length;
        for (var i = 0; i < len; i++) {
          var layer = this.map.getLayer(ids[i]);
          if (layer.url === url) {
            return layer;
          }
        }
        return null;
      },

      getLayers: function() {
        var layerInfos = this.config.editor.layerInfos;
        for (var i = 0; i < layerInfos.length; i++) {
          var featureLayer = layerInfos[i].featureLayer;
          var layer = this.getLayerFromMap(featureLayer.url);
          if (!layer) {
            if (!layerInfos[i].featureLayer.options) {
              layerInfos[i].featureLayer.options = {};
            }
            if (!layerInfos[i].featureLayer.options.outFields) {
              if (layerInfos[i].fieldInfos) {
                layerInfos[i].featureLayer.options.outFields = [];
                for (var j = 0; j < layerInfos[i].fieldInfos.length; j++) {
                  layerInfos[i].featureLayer.options
                    .outFields.push(layerInfos[i].fieldInfos[j].fieldName);
                }
              } else {
                layerInfos[i].featureLayer.options.outFields = ["*"];
              }
            }
            layer = new FeatureLayer(featureLayer.url, featureLayer.options);
            this.map.addLayer(layer);
          }
          if (layer.visible) {
            layerInfos[i].featureLayer = layer;
            this.layers.push(layerInfos[i]);
          }
        }
      },
      initEditor: function() {
 /* 
  var fileref=document.createElement('script');
  fileref.setAttribute("type","text/javascript");  
  fileref.setAttribute("src", "widgets/DesignerExpress/DesignerExpress.js");
  document.getElementsByTagName("head")[0].appendChild(fileref)  ;
  */
//prompt("Welcome to Designer Express.  Please enter your user name: ", "Neil");
//alert("pause 1");
//var designerExpressIsAvailable=false;
    //var check = function(){
    //  while(designerExpressIsAvailable == false){
    //    try{
      //IsDesignerExpressAlive();
      //alert("after IsDesignerExpressAlive");
        //  loadjscssfile("http://code.jquery.com/jquery-latest.min.js","js");
          //loadjscssfile("http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js","js");
          //loadjscssfile("http://code.jquery.com/ui/1.10.3/jquery-ui.js","js");
          //designerExpressIsAvailable = true;
          //alert("waiting for other libraries to load");
    //    }
    //    catch(error){
    //        setTimeout(check, 100); // check again in a tenth of a second
    //    }
    //  }
   // }

    //check();


/*
        setTimeout( function(){
          alert("the wait is over");
          loadjscssfile("http://code.jquery.com/jquery-latest.min.js","js");
          loadjscssfile("http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js","js");
          loadjscssfile("http://code.jquery.com/ui/1.10.3/jquery-ui.js","js");
        }, 3000);     
        alert("about to init designer");
        InitDesignerExpress(this.map,$);
*/
//prompt("Welcome to Designer Express.  Please enter your user name: ", "Kate");
        var json = this.config.editor;
        var settings = {};
        for (var attr in json) {
          settings[attr] = json[attr];
          if(attr=="userName"){
            SetUserName(json[attr]);
          }
          if(attr=="serviceURL"){
            SetServiceURL(json[attr]);
          }
          if(attr=="showJson"){
            SetShowJson(json[attr]);
          }
          if(attr=="popupHeight"){
            SetPopupHeight(json[attr]);
          }  
          if(attr=="popupWidth"){
            SetPopupWidth(json[attr]);
          }                        
        }

        try{
          InitDesignerExpress(this.map,$);
          ReInitTable();
          //alert("Init design worked");
        }
        catch(error){
          //alert("Init design failed");
        }
        this._defaultStartStr = esriBundle.toolbars.draw.start;
        esriBundle.toolbars.draw.start = esriBundle.toolbars.draw.start +
          "<br/>" + "(" + this.nls.pressStr + "<b>" +
          this.nls.ctrlStr + "</b> " + this.nls.snapStr + ")";
        this._defaultAddPointStr = esriBundle.toolbars.draw.addPoint;
        esriBundle.toolbars.draw.addPoint = esriBundle.toolbars.draw.addPoint +
          "<br/>" + "(" + this.nls.pressStr + "<b>" +
          this.nls.ctrlStr + "</b> " + this.nls.snapStr + ")";
//Here originally
        settings.layerInfos = this.layers;
        settings.map = this.map;

        var params = {
          settings: settings
        };
        if (!this.editDiv) {
          this.editDiv = html.create("div", {
            style: {
              width: "100%",
              height: "100%"
            }
          });
          html.place(this.editDiv, this.domNode);
        }
        // var styleNode =
        // html.toDom("<style>.jimu-widget-edit .grid{height: " + (height - 60) + "px;}</style>");
        // html.place(styleNode, document.head);

        this.editor = new Editor(params, this.editDiv);
        this.editor.startup();

        this.resize();
        /*alert("Editor has been set");
        var attInspector = this.editor.attributeInspector;
        alert("attInspector = " + attInspector);
        attInspector.on("attribute-change", function(evt) {
           alert("Attribute changed");
           feature = evt.feature;
           //feature.attributes["date1"] = Date.now();
           //feature.getLayer().applyEdits(null, [feature], null);
        });          
        attInspector.on("create", function(evt) {
           alert("Attribute changed");
           feature = evt.feature;
           //feature.attributes["date1"] = Date.now();
           //feature.getLayer().applyEdits(null, [feature], null);
        });      */     
                
      },

      onClose: function() {
        this.enableWebMapPopup();
        if (this.editor) {
          this.editor.destroy();
        }
        this.layers = [];
        this.editor = null;
        this.editDiv = html.create("div", {
          style: {
            width: "100%",
            height: "100%"
          }
        });
        html.place(this.editDiv, this.domNode);
        esriBundle.toolbars.draw.start = this._defaultStartStr;
        esriBundle.toolbars.draw.addPoint = this._defaultAddPointStr;
      },
    showCostItems : function(){
      ShowCostItemsInternal(this.map,$);
    },
    cboPaletteItemChooser_Change : function(){
      chkPaletteItem.checked = true;
      cboPaletteItemChooser_ChangeInternal(this.map,$);
      $('#txtDescriptionFilter').val('');
      ExecuteFilterInternal(this.map,$);
    },
    cboPaletteChooser_Change: function(){
      chkPaletteChooser.checked = true;
      cboPaletteChooser_ChangeInternal(this.map,$);
      $('#txtDescriptionFilter').val('');
      ExecuteFilterInternal(this.map,$);
    },
    txtDescriptionFilter_Change : function(){
      chkDescriptionFilter.checked = true;
      cboPaletteItemChooser_ChangeInternal(this.map,$);
      ExecuteFilterInternal(this.map,$);
    },    
    cboPaletteChooser_Click : function(){
      //cboPaletteChooser_ClickInternal(this.map,$);
    },  
    OnHover: function(){
      //alert("hover");
    },
    executeTest: function() {
    ExecuteTestInternal(this.map,$);
      },    
	  executeFilter: function() {
		ExecuteFilterInternal(this.map,$);
      },
	  retrievePaletteItems: function() {
		RetrievePaletteItemsInternal(this.map,$);
      },
    retrievePalettes: function() {
    RetrievePalettesInternal(this.map,$);
      },      
      resize: function(){
        var height = html.getMarginBox(this.domNode).h;
        //query(".esriEditor", this.domNode).style('height', height + 'px');
        query(".templatePicker", this.domNode).style('height', height - 50 + 'px');
        query(".grid", this.domNode).style('height', height - 60 + 'px');
        query(".dojoxGridView", this.domNode).style('height', height - 60 + 'px');
        query(".dojoxGridScrollbox", this.domNode).style('height', height - 60 + 'px');
      }
    });

  });
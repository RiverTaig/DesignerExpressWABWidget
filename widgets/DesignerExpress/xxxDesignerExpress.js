var mlayerNames = "";
var mtemplatesFound = 0;
var mSortedPalettes = false;
var mSortedPaletteItems = false;
var mTemplates = [];
var mDoneLoadingLayers = false;
var mLayersLoaded = 0;
var mFeatureLayerCount = 0;
var hash = {};
var massocArray = new Array();
var _map ;
var costItemLibrary = [];
var _featuresThatWereAdded = [];

function ExecuteTestInternal(map,$){


}
function ExecuteFilterInternal(map,$){
    try{
        var itemsToLookFor = GetItemsToLookFor();
        var textToLookFor = itemsToLookFor[0];
        if(textToLookFor==""){
            textToLookFor="ALL";
        }
        //Reset all TD nodes to either white (ALL) or gray
        var allTpickNodes =  $('div[id*="tpick-surface"]');
        allTpickNodes.each(function(){
            var containingTDNode = $(this).parent();
            if( (textToLookFor == "ALL") || (textToLookFor == "") ){
                containingTDNode.attr('style', 'background-color: #FFFFFF'); //Set to white
            }
            else{
                containingTDNode.attr('style', 'background-color: #9FA0A4'); //Set to Gray
            }
        });
        if( textToLookFor == "ALL" ){
            $('#txtShowAllPaletteItems').attr('style', 'background-color: #FFFFFF');
            $('#txtShowAllPaletteItems').text("Showing all palette items");
            return;
        }

        //Loop through each element to look for and when found, highlight them in yellow
        var yellowCounter = 0;
        var minOffsetTop = 99999;
        var topNode; 
        var firstTDFound; 
        for(var i = 0 ; i < itemsToLookFor.length; i++){
            textToLookFor = itemsToLookFor[i];
            //Now find all JQuery elements matching textToLookFor
            var piName = $("div:contains(" +  textToLookFor + ")");
            piName.each(function(index){
                var jqNode = $(this);
                idValue=-1;
                try{
                    //Get the ID for the dom element (it might be the tpick-surface containing the txtDescriptionFilter)
                    var id  = jqNode[0].attributes["id"];
                    if(id !== undefined){
                        idValue = id.value;
                        //If it is, then show it
                        if(idValue.indexOf("tpick-surface") > -1){
                            var parentTDNode = jqNode.parent();
                            try{
                                parentTDNode.attr('style', 'background-color: #FFDD00'); //YELLOW HIGHLIGHT
                                yellowCounter++;
                                if(firstTDFound === undefined){
                                    firstTDFound = parentTDNode;
                                    topNode = firstTDFound;
                                }
                                var yValue = parentTDNode[0].getBoundingClientRect().y;
                                if(yValue < minOffsetTop){
                                    minOffsetTop = yValue;
                                    topNode = parentTDNode;
                                }
                            } 
                            catch(error){}
                        }
                    }
                }
                catch(error){}
            });
        }
        topNode[0].scrollIntoView();
        $('#txtShowAllPaletteItems').attr('style', 'background-color: #FFDD00');
        var itemOrItems = "items";
        if(yellowCounter==1){
            itemOrItems= "item";
        }
        $('#txtShowAllPaletteItems').text(yellowCounter + " palette " + itemOrItems + " found." );
        //http://stackoverflow.com/questions/635706/how-to-scroll-to-an-element-inside-a-div


    }
    catch(error){
        itemOrItems = "items";
        if(yellowCounter==1){
            itemOrItems= "item";
        }        
        $('#txtShowAllPaletteItems').text(yellowCounter + " palette " + itemOrItems + " found." );
    }
}
function GetItemsToLookFor(){
    var itemsToLookFor = [];
    var isText = $("#chkDescriptionFilter").prop("checked");
    var isPalette = $("#chkPaletteChooser").prop("checked");
    var isPaletteItem = $("#chkPaletteItem").prop("checked");
    var chosenText = "";
    if(isText){
        chosenText = $("#txtDescriptionFilter").val();
    }
    if(isPalette){
        chosenText = $("#cboPaletteChooser option:selected").text();
    }
    if(isPaletteItem){
        chosenText = $("#cboPaletteItemChooser option:selected").text();
    }

    //Use the search text
    if(isText){
        itemsToLookFor.push(chosenText);
    }

    //Use the literal paletteItem name
    if(isPaletteItem && chosenText != "ALL" ){
        itemsToLookFor.push($("#cboPaletteItemChooser option:selected").text());
    }

    //Get all the paletteItems in the drop-down if using Palette or the "ALL" option if using palette item
    if( (isPalette && chosenText != "ALL") || (isPaletteItem && chosenText=="ALL") ){
        var totalInPaletteItemCombo = $("#cboPaletteItemChooser option").length;
        if(totalInPaletteItemCombo > 1){
            for(i = 1 ; i < totalInPaletteItemCombo; i++) {//Skipping index zero which reads ("ALL")
                var palItem = ($("#cboPaletteItemChooser option")[i]).value;
                itemsToLookFor.push(palItem);
            }
        }
    }

    //User wants all palette's and all paletteItems
    if( isPalette && chosenText=="ALL") {
        itemsToLookFor.push("ALL");
    }
    
    if(itemsToLookFor.length == 0){
        itemsToLookFor.push("ALL");
    }
    return itemsToLookFor;

}
function ShowCostItemsInternal(map,$){
    _map = map;
    alert("ShowCostItemsInternal");
}
function cboPaletteItemChooser_ChangeInternal(map,$){
    //$("#txtDescriptionFilter").val($("#cboPaletteItemChooser").val());
}
function cboPaletteChooser_ChangeInternal(map,$){
    $('#cboPaletteItemChooser').empty();    
    var selectedPalette = $("#cboPaletteChooser option:selected").text();
    //alert("About to add Paletteitems based on " + selectedPalette);
    for(var i = 0 ; i < mTemplates.length; i++){
         
        var templateElements = mTemplates[i].split(":");
        var layerName = templateElements[0];
        var paletteName = "";
        var paletteItemName=  "";
        if(templateElements.length == 3){
            paletteItemName = templateElements[1];
            description = templateElements[2];
            paletteName = description.split("|")[0];
        }
        if(paletteName == ""){
            paletteName = "Unknown";
        }
        if(paletteName == selectedPalette){
            $('#cboPaletteItemChooser').append($('<option/>', { 
                value: paletteItemName,
                text : paletteItemName 
            }));            
        }
                          
    }
    //Sort the palette Items
    $("#cboPaletteItemChooser").html($('#cboPaletteItemChooser option').sort(function(x, y) {
     return $(x).val() < $(y).val() ? -1 : 1;
    }))
    $('#cboPaletteItemChooser').prepend($('<option/>', { 
            value: "ALL",
            text : "ALL" 
        }));      
    $("#cboPaletteItemChooser").get(0).selectedIndex = 0;

}
function InitDesignerExpress(map,$){//cboPaletteChooser_ClickInternal
    console.log("top of InitDesignerExpress");
    _map = map;
    //var btnCostItem = $('#btnCostItem');
    var popupdiv =$("#popupdiv");
    //alert("btn ID =  " + btn.id);
    //btnCostItem.click(function() {
    //    window.open("http://lake:3344/webappbuilder/apps/7/datatable.html","_blank", "height=580,width=500,scrollbars=yes");

    //}); 
    //alert("associated");

    //$("#txtDescriptionFilter").val("Concrete");
    if (mTemplates.length > 0)
    {
        return;
    }
    $('#cboPaletteItemChooser').empty();
    RetrievePaletteItemsInternal(map,$);
    mSortedPalettes = false;
    $('#cboPaletteChooser').empty();
    AwaitLoadingOfTemplates(map,$);    
    console.log("bottom of InitDesignerExpress");
}
function AwaitLoadingOfTemplates(map,$){
    //alert("pre");
    var check = function(){
        //if(mTemplates.length > 120){
        if(mDoneLoadingLayers == true){
            LoadPalettesIntoDropdown(map,$);
        }
        else {
            setTimeout(check, 100); // check again in a second
        }
    }

    check();
}
function LoadPalettesIntoDropdown(map,$){
    massocArray = new Array();
    var addedItem = false
    for(var i = 0 ; i < mTemplates.length; i++){
        var templateElements = mTemplates[i].split(":");
        var layerName = templateElements[0];
        var paletteName = "";
        if(templateElements.length == 3){
            description = templateElements[2];
            paletteName = description.split("|")[0];
        }
        //var itemToAdd = paletteName + "-" + layerName;
        if(paletteName.length == 0){
            paletteName = "Unknown";
        }
        if(massocArray[paletteName] === undefined){
            massocArray[paletteName] = description;
            $('#cboPaletteChooser').append($('<option/>', { 
                value: paletteName,
                text : paletteName 
            }));
        }
    }
    //Sort the palettes
    $("#cboPaletteChooser").html($('#cboPaletteChooser option').sort(function(x, y) {
     return $(x).val() < $(y).val() ? -1 : 1;
    }))

    
    //e.preventDefault();
    mSortedPalettes = true;
        $('#cboPaletteChooser').prepend($('<option/>', { 
            value: "ALL",
            text : "ALL" 
        }));  
    $("#cboPaletteChooser").get(0).selectedIndex = 0;        
    cboPaletteChooser_ChangeInternal(map,$);
}
/*function ShowTextFilter(){
    var b = $("#chkDescriptionFilter").prop("checked");
    if(b){
        $( "#txtDescriptionFilter" ).show();
    }
    else{
        $( "#txtDescriptionFilter" ).hide();
    }
}*/
function RetrievePalettesInternal(map,$){
    alert("RetrievePalettesInternal");
}
function RetrievePaletteItemsInternal(map,$){
  
  mDoneLoadingLayers = false;
  mLayersLoaded = 0;
  mTemplates = [];
  mFeatureLayerCount = map.graphicsLayerIds.length;
  for(i = 0; i < mFeatureLayerCount; i++){
        try{
            var layerID = map.graphicsLayerIds[i];
            var fLayer = map.getLayer(layerID);
            if(fLayer !== undefined)  {
                fLayer.on("edits-complete", OnEditsCompleteHandler);
            }
        }
        catch(error){
            alert(error);
        }
        //Chain .don, .fail, and .always
        var jqxhr = jQuery.getJSON($("#ExpressURL").val() + "/FeatureServer/" + i + "?f=json", 
        function(data) {
          //retValue = JSON.stringify(data);
          var isError = data.error;
          if(isError === undefined){
            //retValue = JSON.stringify(data);
            //alert( retValue );
            FeatureLayerRetrieved(data)  ;
          }
          else{
            //alert("Is Error TRUE: " + retValue);
          }
        })
        .done(function() {
            mLayersLoaded++;
        })
        .fail(function() {
        alert( "An Error occured attempting to retrieve feature layer #" + i );
        })
        .always(function() {
            
        });
  }
}

function OnEditsCompleteHandler(evt){
    if(evt.adds.length > 0){
        feature = '{"Layer":"LAYERNAME","PaletteItem":"PALETTEITEM","OID":"OBJECTID","IsPolyLine":"ISPOLYLINE", "Length":"LENGTH", "CostItems":[]}'; 

        var oid = evt.adds[0].objectId;
        var layerName = evt.target.name;
        var graphics = evt.target.graphics;
        var pi = graphics[graphics.length - 1].attributes.PALETTEITEM;
        var geom = graphics[graphics.length - 1].geometry;
        var isPolyLine = "False";
        var lengthOfPolyline = "0";
        if(geom.type=="polyline"){
            lengthOfPolyline = GetShapeLengthFromPolylineGeometry(geom);
            isPolyLine = "True";
        }
        feature = feature.replace("LAYERNAME", layerName);
        feature = feature.replace("PALETTEITEM", pi);
        feature = feature.replace("OBJECTID", oid);
        feature = feature.replace("ISPOLYLINE", isPolyLine);
        feature = feature.replace("LENGTH", lengthOfPolyline);
        featureObj = JSON.parse(feature);
        _featuresThatWereAdded.push(featureObj);


        url = $("#ExpressURL").val() + "/MapServer/exts/Link2015SOEs/GetDefaultCostItemsForPaletteItem?palleteItemName=" + pi + "&f=pjson";
        $.ajax({
            url: url,
            dataType: 'json', //json data type
            data: "",
            success: function(result){

                var unitPrice = result.CostItems[0].MATERIAL_COST;
                for(var i = 0; i < _featuresThatWereAdded.length; i++)
                {
                    var featureThatWasAdded = _featuresThatWereAdded[i];
                    if( (featureThatWasAdded.Layer == layerName) && (featureThatWasAdded.OID == oid) ){
                        for(var j = 0 ; j < result.CostItems.length; j++){
                            var code = result.CostItems[j].CODE;
                            var desc = result.CostItems[j].DESCRIPTION;
                            var cost = result.CostItems[j].MATERIAL_COST;
                            var units = result.CostItems[j].UNITS;
                            var costItemJson = '{"UniqueID":"","Units":"", "Code":"","Description":"","Quantity":"","Buffer":"","UnitPrice":""}';
                            var costItem = JSON.parse(costItemJson);
                            var randomCode =  Math.random().toString();
                            randomCode = randomCode.substring(2,7);     
                            costItem.UniqueID = randomCode;                       
                            costItem.Code = code;
                            costItem.Description = desc;
                            costItem.UnitPrice = cost;
                            costItem.Units = units;
                            costItem.Buffer = 1;
                            costItem.Quantity = 0;
                            if(isPolyLine == "True")
                            {
                                costItem.Quantity = lengthOfPolyline; 
                            }  
                            featureThatWasAdded.CostItems.push(costItem);
                        }
                    }

                }
                //alert("get default cost item success");
            },
            error: function(error){
                //alert("get default cost item error");
            }
        });
        //alert("Getting default costitems for palettItem: " + pi);
        // '{"Layer":"LAYERNAME","PaletteItem":"PALETTEITEM","OID":123,
        //"CostItems":[{"Code":"CODE","Description":"DESCRIPTION","Quantity":1,"Buffer":2,"UnitPrice":3.5},
        //{"Code":"CODE2","Description":"DESCRIPTION2","Quantity":12,"Buffer":22,"UnitPrice":3.52}]}'; 


        //alert("There are now " + _featuresThatWereAdded.length + " features");
    }
}
function GetShapeLengthFromPolylineGeometry(polylineGeometry){
    //Assumes that polylineGeometry has a single path
    var firstPath = polylineGeometry.paths[0];
    var totalLength = 0;
    for(var i = 0; i < firstPath.length - 1; i++){
        pointI = firstPath[i];
        pointIPlusOne = firstPath[i+1];
        sideA = pointI[0] - pointIPlusOne[0]; //delta X
        sideB = pointI[1] - pointIPlusOne[1]; //delta y
        aSquared = sideA * sideA;
        bSquared = sideB * sideB;
        c = Math.sqrt(aSquared + bSquared);
        totalLength +=  c;
    }
    var answer = totalLength * 3.28084;
    return parseFloat(answer).toFixed(1);
}
function FeatureLayerRetrieved(fLayer){
    
    try{
    //fLayer = $.parseJSON(fLayerJson);
    //Some Templates are at the Layer level
    var templateCount = fLayer.templates.length;
    if(templateCount > 0){
    for(i = 0; i < fLayer.templates.length; i++){
        var template = fLayer.templates[i];
        var templateName = template.name;
        var templateDescription = template.description;
        mTemplates.push(fLayer.name + ":" + templateName + ":" + templateDescription);
        mtemplatesFound++;
    }
    }
    //Some Templates are associated at the subtype level
    var subtypeCount = fLayer.types.length;
    if(subtypeCount > 0){
      for(j = 0; j < subtypeCount; j++){
          var typeTemplateCount = fLayer.types[j].templates.length;
          if(typeTemplateCount > 0){
              for(k = 0; k < typeTemplateCount; k++){
                var typeTemplate = fLayer.types[j].templates[k];
                var typeTemplateName = typeTemplate.name;
                var typeTemplateDescription = typeTemplate.description;
                mTemplates.push(fLayer.name + ":" + typeTemplateName + ":" + typeTemplateDescription);
                mtemplatesFound++;    
                /*$('#cboPaletteItemChooser').append($('<option/>', { 
                        value: typeTemplateName,
                        text : typeTemplateName 
                    }));*/
              }
          }
      }
    }
    //mLayersLoaded++;
    if(mLayersLoaded == mFeatureLayerCount-1){
        mDoneLoadingLayers = true;
    }
    }
    catch(err){
    a = err;
    //alert("error");
    }  
}

<!-- ----------------- THIS SECTION  IS FOR SHOWING THE COSTITEM / FEATURE ASSOCATION --------------------------------- -->

function ShowMeAPopup(){
    var y = 1;
    var map = this.map;
    AddFeaturesToFeaturesList();
    onChangeCostItems();
    $("#popupdiv1").dialog({
        open: function(event, ui){
            //$("#popupQuantity").val(6); //TODO change to actual values for cost item
            //$("#popupBuffer").val(7);//TODO change to actual values for cost item
            //$("#popupUnitPrice").val(8);//TODO change to actual values for cost item
            activateTree(document.getElementById("FeatureList"));
            //onChangeCostItems();
        },
        title: "Cost Item Library / Designer Express Feature Association",
        width: 1000,
        height: 700,
        modal: false,
        buttons: {
        Close: function() {
        $(this).dialog('close');
        }
        }
    });
}
function HighlightFeature(layer,oid){
    //alert("Highlight");
    for(var i = 0  ; i < _map.graphicsLayerIds.length; i++)
    {
        var lyrID = _map.graphicsLayerIds[i];
        var fLayer = _map.getLayer(lyrID);
        if(fLayer !== undefined)  {
            if(fLayer.name === layer){
                for(var j = 0 ; j < fLayer.graphics.length; j ++){
                    var graphic = fLayer.graphics[j];
                    if(graphic.attributes["OBJECTID"] == oid){
                        var geom = fLayer.graphics[j].geometry;
                        if(geom.type == "point"){
                            var pnt = new esri.geometry.Point(geom.x,geom.y, _map.spatialReference);
                            //_map.extent.centerAt(pnt);
                            var newExtentX = new esri.geometry.Extent(geom.x - 100, geom.y - 100, geom.x + 100, geom.y + 100, _map.spatialReference);
                            _map.setExtent(newExtentX);

                        }
                    }
                }
            }
        }
    }
}
function AddFeaturesToFeaturesList(){
    try{
        var featureList = $("#FeatureList");
        featureList.empty();
        
        for(i = 0 ; i < _featuresThatWereAdded.length; i++){
            var appendString = "";
            featureThatWasAdded = _featuresThatWereAdded[i];
            var oid = featureThatWasAdded.OID;
            var layer = featureThatWasAdded.Layer;
            var randomID =  Math.random().toString();
            var randomIDS = randomID.substring(2,7);
            
            var liString = "<li id='feature" + randomIDS + "' ondrop='drop(event)' style='font-weight:bold;cursor:pointer' ondragover='allowDrop(event)' layer='LAYERNAME' oid='OID' >"; 
            liString = liString.replace("OID", oid);
            liString = liString.replace("LAYERNAME", layer);
            var pi = featureThatWasAdded.PaletteItem;
            var liText = "<span class='PaletteItemListItem'> " + pi + "</span>"  ;//" (" + layer + " ObjectID = " + oid + ") </span>";
            var costText = "<span style='color:#C4014B' class='DxFeaturePrice'>$Unknown</span>";
            var imgString = "<img src='images/highlight.png' onclick='HighlightFeature(&quot;" + layer + "&quot;," + oid + ")' />" ;
            var closeLiText = "</li>";
            var combinedString = liString + imgString +  liText + costText  + closeLiText;
            appendString += combinedString;
            featureList.append(appendString);
            //Now read through the currently assigned cost items and create links for them

            var li = $("#feature" + randomIDS)[0];
            for(var j = 0 ; j < featureThatWasAdded.CostItems.length; j++){
                var costItem = featureThatWasAdded.CostItems[j];
                var description = " (" + costItem.Description + ")";
                AddCostItemUnderDxFeature(li,costItem.Code, description,costItem.UniqueID);
            }
        }
        
    }
    catch(error){

    }

}

// This function traverses the list and add links 
// to nested list items
function activateTree(oList) {

  // Collapse the tree
  for (var i=0; i < oList.getElementsByTagName("ul").length; i++) {
    oList.getElementsByTagName("ul")[i].style.display="block";            
  }                                                                  
  // Add the click-event handler to the list items
  if (oList.addEventListener) {
    oList.addEventListener("click", toggleBranch, false);
  } else if (oList.attachEvent) { // For IE
    oList.attachEvent("onclick", toggleBranch);
  }
  // Make the nested items look like links
  //addLinksToBranches(oList); 

}

// This is the click-event handler
function toggleBranch(event) {
    var oBranch, cSubBranches;
    if (event.target) {
        oBranch = event.target.parentNode;
    } else if (event.srcElement) { // For IE
        oBranch = event.srcElement;
    }
    //Only toggle if this is an outer bolded list item
    if(event.target.outerHTML.contains("span")){
        cSubBranches = document.getElementById(oBranch.id).getElementsByTagName("ul");

        if (cSubBranches.length > 0) {
            var changeToNone = false;
            if(cSubBranches[0].style.display == "block"){
                changeToNone = true;
            }
            for(var i = 0  ; i < cSubBranches.length ; i++){
                if (changeToNone ) {
                  cSubBranches[i].style.display = "none";
                } else {
                  cSubBranches[i].style.display = "block";
                }
            }
        }
    }
}


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("innerHTML", ev.target.id);
}


function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("innerHTML");
    var refer = document.getElementById(data);
    var li = ev.target.parentNode;
    var matchedFeature ="";
    var layerName = li.getAttribute("layer");
    var oid = li.getAttribute("oid");
    for(var i = 0; i < _featuresThatWereAdded.length; i++){
        featureThatWasAdded = _featuresThatWereAdded[i];
        if( (featureThatWasAdded.Layer == layerName) && (featureThatWasAdded.OID == oid) ){
            matchedFeature = featureThatWasAdded;
        }
    }

    var costItemName=  refer.innerHTML  ;
    var description = "";
    var price = 0;
    var units = ""

    var costItemJson = '{"UniqueID":"","Units":"", "Code":"","Description":"","Quantity":"","Buffer":"","UnitPrice":""}';
    var costItem = JSON.parse(costItemJson);
    var randomCode =  Math.random().toString();
    randomCode = randomCode.substring(2,7);     
    costItem.UniqueID = randomCode;                       
    costItem.Code = costItemName;

    for(var j=0; j < costItemLibrary.length; j++){
        var ciArray = costItemLibrary[j];
        if(ciArray[0] == costItemName){
            description = ciArray[1] ;
            price = ciArray[2];
            units = ciArray[3];
        }
    } 



    costItem.Description = description;
    costItem.UnitPrice = price;
    costItem.Units = units;
    costItem.Buffer = 1;
    if(matchedFeature.IsPolyLine == "True" && units=="ft"){
        costItem.Quantity = matchedFeature.Length;
    }
    else{
        costItem.Quantity = 1;
    }
    matchedFeature.CostItems.push(costItem);


    AddCostItemUnderDxFeature(li,costItemName,"",costItem.UniqueID);
 

//idToIgnore = randomIDS;
  
} //End of drop function
function DeleteCostItem(idOfCostItem){
    var ci = $("#" + idOfCostItem);
    if(ci === undefined){
        ci=  $("#0" + idOfCostItem);
    }
    if(ci === undefined){
        ci=  $("#00" + idOfCostItem);
    }
    var uniqueID = ci.attr("uniqueid");

    for(var j = 0 ; j < _featuresThatWereAdded.length; j++){
        var featureThatWasAdded = _featuresThatWereAdded[j];
        for(k = 0; k < featureThatWasAdded.CostItems.length; k++){
            var costItem = featureThatWasAdded.CostItems[k];
            if(costItem.UniqueID == uniqueID){
                featureThatWasAdded.CostItems.splice(k,1);//remove the cost-item association
            }
        }
    }
    var parent = ci.parent();
    ci.remove();//remove from the dom
    SetPriceOnDxFeatureListItem(parent[0]);

}



function AddCostItemUnderDxFeature( ListItem,costItemName,description, uniqueID){  //lala
    if(uniqueID === undefined){
        uniqueID = Math.random().toString();
        uniqueID = uniqueID.substring(2,7);
    }
    if(description == ""){
        for(var j=0; j < costItemLibrary.length; j++){
            var ciArray = costItemLibrary[j];
            if(ciArray[0] == costItemName){
                description = " (" + ciArray[1] + ")";
            }
        }        
    }


    var randomID =  Math.random().toString();
    var randomIDS = randomID.substring(2,7);
    var imageString =  "<img src='images/delete-icon.png' onclick='DeleteCostItem(&quot;" + randomIDS + "&quot;)'  />" ;
    var appendString = "<ul uniqueID='" + uniqueID + "' style='display:block;cursor:pointer;font-weight: normal' id=" + randomIDS + ">" + imageString + "<span> " + costItemName + description +  "</span><span style='color:#C4014B' class='CostItemPrice'>$Unknown</span></ul>";
    //ul = $('#' + li.id);
    var liJQNode = $('#' + ListItem.id);
    liJQNode.append( appendString); 

    var btn = $('#' + randomIDS); // This is the UL node representing the cost item
    SetPriceOnCostItemUnorderedListItem(btn[0]);
    //SetPriceOnDxFeatureListItem(ListItem);
    //alert("btn ID =  " + btn.id);

    btn.click(function(btn,uniqueID) {  
        if(btn.target.tagName.toUpperCase() == "IMG")
        {
            return;
        }        
        $("#popupdiv2").dialog({
            open: function(event, ui){
                var uniqueID2 = btn.currentTarget.getAttribute("uniqueid");
                var costItemToDisplay = GetCostItemInDesignByUniqueID(uniqueID2);
                $("#popupCode").text(costItemToDisplay.Code);
                $("#popupDescription").text(costItemToDisplay.Description);
                $("#popupUnits").text(costItemToDisplay.Units);
                $("#popupQuantity").val(costItemToDisplay.Quantity);
                $("#popupBuffer").val(costItemToDisplay.Buffer);
                $("#popupUnitPrice").val(costItemToDisplay.UnitPrice);
                onChangeCostItems();
            },
            title: "Cost Items for DX Feature",
            width: 350,
            height: 350,
            modal: true,
            buttons: {

                "Apply": function() {
                    //alert("Apply");
                    var q = $("#popupQuantity").val();
                    var b = $("#popupBuffer").val();
                    var up = $("#popupUnitPrice").val();
                    var total = q*b*up;
                    var ul = btn.currentTarget;
                    //var costItemPriceSpan = ul.getElementsByClassName("CostItemPrice")[0];
                    var uniqueID = btn.currentTarget.getAttribute("uniqueid");
                    //'{"UniqueID":"", Code":"","Description":"","Quantity":"","Buffer":"","UnitPrice":""}';
                    var costItemInDesign = GetCostItemInDesignByUniqueID(uniqueID);
                    costItemInDesign.Quantity = q;
                    costItemInDesign.Buffer = b;
                    costItemInDesign.UnitPrice = up;
                    SetPriceOnCostItemUnorderedListItem(ul);            
                    //SetPriceOnDxFeatureListItem(ul.parentNode);
                    $(this).dialog('close');
                },
                "Cancel": function() {
                    $(this).dialog('close');
                }          
            }
        });
    });     
}

function GetCostItemInDesignByUniqueID(uniqueID){
    for(var j = 0 ; j < _featuresThatWereAdded.length; j++){
        var featureThatWasAdded = _featuresThatWereAdded[j];
        for(k = 0; k < featureThatWasAdded.CostItems.length; k++){
            var costItem = featureThatWasAdded.CostItems[k];
            if(costItem.UniqueID == uniqueID){
                return costItem;
            }
        }
    }
    return null;    
}

function SetPriceOnCostItemUnorderedListItem(unorderListItem){
    var costItemInDesign = GetCostItemInDesignByUniqueID(unorderListItem.getAttribute("uniqueid"));
    var q = costItemInDesign.Quantity ;
    var b = costItemInDesign.Buffer ;
    var up = costItemInDesign.UnitPrice ;    
    var total = q*b*up;
    unorderListItem.getElementsByClassName("CostItemPrice")[0].innerHTML =  "...$" + parseFloat(total).toFixed(2);
    SetPriceOnDxFeatureListItem(unorderListItem.parentNode);
}
function SetPriceOnDxFeatureListItem(li){
    var costItemPrices = li.getElementsByClassName("CostItemPrice");
    var sum = 0;
    for(var i = 0; i < costItemPrices.length; i++){
        sum +=parseFloat(costItemPrices[i].innerHTML.substring(4)); //parseFloat(costItemPrices[i].innerHTML.substring(4))
    }
    li.getElementsByClassName("DxFeaturePrice")[0].innerHTML = "...$" + parseFloat(sum).toFixed(2);
    SetTotalPrice();
}

function SetTotalPrice()
{
    var sum = 0;
    $(".DxFeaturePrice").each(function(){
        sum +=parseFloat(parseFloat(this.innerHTML.substring(4)));
    });
    $("#TotalPrice").text("Total Price: $" + numberWithCommas(parseFloat(sum).toFixed(2)));

}

// This function makes nested list items look like links
function addLinksToBranches(oList) {
    var cBranches = oList.getElementsByTagName("li");
    var i, n, cSubBranches;
    if (cBranches.length > 0) {
      for (i=0, n = cBranches.length; i < n; i++) {
        cSubBranches = cBranches[i].getElementsByTagName("ul");
        if (cSubBranches.length > 0) {
          addLinksToBranches(cSubBranches[0]);
          cBranches[i].className = "HandCursorStyle";
          cBranches[i].style.color = "blue";
          cSubBranches[0].style.color = "black";
          cSubBranches[0].style.cursor = "auto";
        }
      }
    }
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function SendWebDesignToEnterprise(){
    var x = JSON.stringify(_featuresThatWereAdded);
    $("#DesignJson").text(x);

}
function ReInitTable() {
    
    var ok = false;
    
    //This URL works

    //This URL doesn't
    url = $("#ExpressURL").val() + "/MapServer/exts/Link2015SOEs/GetAllCostItems?parm1=&f=pjson";
    $.ajax({
      url: url,
      dataType: 'json', //json data type
      data: "",
      success: function(result){
          //alert("It worked! " + result);
          data = result.CostItems;
          for(var i = 0 ; i < data.length; i++){
            var costItem= data[i];
            //CODE, DESCRIPTION, MATERIAL_COST, UNITS
            var costItemArray = [];
            costItemArray.push(costItem.CODE);
            costItemArray.push(costItem.DESCRIPTION);
            costItemArray.push(costItem.MATERIAL_COST);
            costItemArray.push(costItem.UNITS);
            costItemLibrary.push(costItemArray);
          }
          //alert(costItemArray.length + " items found");
          $("#example").dataTable({
            "aaData": costItemLibrary,
            "aLengthMenu": [[5,10,25, 50, 75, -1], [5,10,25, 50, 75, "All"]],
            "iDisplayLength": 5,
            "aoColumnDefs":[{
                "aTargets": [0],
                "bSortable": true,
                "mRender": function (code,type,full) {
                              var randomID =  Math.random().toString();
                              var randomIDS = randomID.substring(2,7);        
                              var st = "id=" + randomIDS + " draggable=true ondragstart=drag(event) >";
                              var ret = '<span '  + st + code + '</span>';
                              //alert (ret);
                              return ret;
                        }
                },{
                    "aTargets": [ 1 ],
                    "bSortable": true,
                    "mRender": function ( desc, type, full )  {
                      //var webURL = "http://www.w8ji.com/images/Power%20line/Typical%20hardware%20transformer.jpg";
                      var src="images/transformer.jpg"
                      //return  '<a class="fancybox" href="'+ webURL +'" >' + desc + '</a>';
                      return  '<a class="fancybox" rel="group" href="'+ src +'" >' + desc + '</a>';
                  }
              },{
                    "aTargets":[ 3 ],
                    "sType": "double"

              }]
            });
      },
      error: function(result){
        alert("error! " + result);
      }
    });
    
}

/*
$(function(){
    alert("dollar ready");
    ReInitTable();
});
*/

function onChangeCostItems()
{
  //alert("a")
  q = $("#popupQuantity").val();
  b = $("#popupBuffer").val();
  p = $("#popupUnitPrice").val();
  tp = q * b * p;
  $("#popupPrice").html("<b>$" + parseFloat(tp).toFixed(2) + "</b>");
  //var b = $('#popupBuffer');
  //var up = $('#popupUnitPrice');
}
function IsDesignerExpressAlive()
{
    //alert("Designer express is alive");
}

function loadjscssfile(filename, filetype){
 //alert("designerjs where it should be!");
 if (filetype=="js"){ //if filename is a external JavaScript file
  var fileref=document.createElement('script');
  fileref.setAttribute("type","text/javascript");
  fileref.setAttribute("src", filename);
 }
 else if (filetype=="css"){ //if filename is an external CSS file
  var fileref=document.createElement("link");
  fileref.setAttribute("rel", "stylesheet");
  fileref.setAttribute("type", "text/css");
  fileref.setAttribute("href", filename);
 }
 if (typeof fileref!="undefined")
  document.getElementsByTagName("head")[0].appendChild(fileref);
}

jQuery(document).ready(function($) {
    alert("ready or not 2");
    $(".fancybox").fancybox();    
}
);

(function() {
    document.getElementById("document")
        .addEventListener("change", handleFileSelect, false);
        
    function handleFileSelect(event) {
        window.extractedFields = [];
        
        readFileInputEventAsArrayBuffer(event, function(arrayBuffer) {
            mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                .then(displayResult)
                .done();
        });
    }
    
    function displayResult(result) {
        // Isolate Zotero fields
        var zoteroFields = [];
        
        for (var i = 0; i < extractedFields.length; i++) {
          var field = extractedFields[i].trim();
          
          // test if field starts with "ADDIN ZOTERO_ITEM CSL_CITATION"
          var zoteroFieldPrefix = "ADDIN ZOTERO_ITEM CSL_CITATION";
          if (field.startsWith(zoteroFieldPrefix)) {
            field = field.replace(zoteroFieldPrefix,"").trim();
            
            // parse rest of field content as JSON
            try {
              var fieldObject = {};
              fieldObject = JSON.parse(field);
              if (fieldObject.hasOwnProperty("citationItems")) {
                //console.log(fieldObject);
                for (var j = 0; j < fieldObject.citationItems.length; j++) {
                  var zoteroItem = fieldObject.citationItems[j];
                  if (zoteroItem.hasOwnProperty("itemData")) {
                    zoteroFields.push(zoteroItem.itemData);
                  }
                }
              }
            }
            catch (e) {}
            
          }
          
          //console.log(zoteroFields);
          //console.log(JSON.stringify(zoteroFields));
        }
      
        document.getElementById("output").innerHTML = JSON.stringify(zoteroFields);
        
        var messageHtml = result.messages.map(function(message) {
            return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
        }).join("");
        
        document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";
    }
    
    function readFileInputEventAsArrayBuffer(event, callback) {
        var file = event.target.files[0];

        var reader = new FileReader();
        
        reader.onload = function(loadEvent) {
            var arrayBuffer = loadEvent.target.result;
            callback(arrayBuffer);
        };
        
        reader.readAsArrayBuffer(file);
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
})();

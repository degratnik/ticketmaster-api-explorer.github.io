Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
};

/*
* API method = <resource></resource>
* API base URL = <resources base="***"/>
* API method URL =  <resource path="***"/>
* API method parameters = <param/>
* API method id = <resource><method id="***"/></resource>
* API method name = <resource><method apigee:displayName="***"/></resource> or id if not found
* API method AJAX method (GET/POST) = <resource><method name="***"/></resource>
* API method description = <resource><method><doc>***</doc></method></resource>
* API method category = <resource><method><? primary="true">***</?></method></resource>
* */

(function(){

    var base = {}, //base object with parsed API data
        defaultMethod, //the very first method found (rendered by default)
        selectedMethod, //currently selected method
        apiKey = "7elxdku9GGG5k8j0Xm8KWdANDgecHMV0", //API Key
        slider, // slider with response columns
        spinner; // spinner

    /* INITIALIZATION PHASE */

    $(document).ready(function() {
        readFromWADL(); //parse WADL file when document is ready
        setPrimaryButtonListener(); //click event for GET/POST button
        spinner = $('#spinner');
        slider = $('#columns');
        slider.slick({ // initialize slide
            infinite: false,
            speed: 500,
            swipeToSlide: true,
            waitForAnimate: true,
            adaptiveHeight: true,
            responsive: [{ // show 2 columns on tablet
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2
                }
            }, {
                breakpoint: 768, // show 1 column on mobile
                settings: {
                    slidesToShow: 1
                }
            }]
        });
    });

    // builds page according to base data
    var buildPageLayout = function(){
        var first = true;
        //render droppowns within navigation bar
        for (apiName in base) {
            addApiDropdown(apiName, first);
            first = false;
        }
        //set dropdown event listeners
        setDropdownListeners();
        //render primary column using the default method (the very first method found in WADL file)
        renderPrimaryColumn(defaultMethod);
    };

    // handles click event on GET/POST button
    var setPrimaryButtonListener = function(){
        $('#primary-btn').on('click', function(e){
            e.preventDefault();
            sendPrimaryRequest();
        });
    };

    // sets listeners for api dropdowns
    var setDropdownListeners = function(){
        $('.nav').on('click', function(e){
            var target = $(e.target).parent();
            if (target.hasClass('select-default-method')){
                e.preventDefault();
                $('.dropdown-toggle').removeClass('selected-group');
                target.closest('.api-dropdown').find('.dropdown-toggle').addClass('selected-group');
                renderPrimaryColumn(base[target.attr('api-name')][target.attr('method-name')]);
                selectedMethod = base[target.attr('api-name')][target.attr('method-name')];
            }
        });
    };

    // renders first column with query parameters
    var renderPrimaryColumn = function(method){
        var primaryColumn = $('#primary-column .list-group').fadeOut(200); //hide primary column
        setTimeout(function(){
            $('#selected-method-name').text(method.name);
            primaryColumn.find('.parameter-item').remove(); //remove all existing parameter fields
            $('#primary-btn').text(method.method); //change text in 'run query button' (GET or POST)
            for (param in method.parameters){ //render new paramater fields
                var a = $('<a class="list-group-item parameter-item"></a>'),
                    code = $('<code>' + method.parameters[param].name + '</code>'),
                    input = $('<input type="text" class="form-control event-param" placeholder="' 
                            + method.parameters[param].default + '" id="' + method.parameters[param].name + '" url-style="'
                            + method.parameters[param].style + '">');

                a.append(code).append(input);
                primaryColumn.append(a);
            }
            primaryColumn.slideDown(1000);
        },200);
    };

    // adds API dropdpwn to navigation bar
    var addApiDropdown = function(apiName, selected){
        var dropDown = $('<li class="dropdown api-dropdown"></li>'),
            button = $('<button class="dropdown-toggle' + (selected ? ' selected-group' : '') + '" type="button" id="'
                    + apiName + '-dropdown' + '" data-toggle="dropdown"><h4>' + apiName + '</h4></button>'),
            caret = $('<span class="caret"></span>'),
            ul = $('<ul class="dropdown-menu" role="menu" aria-labelledby="' + apiName + '-dropdown' +  '">');

        for (method in base[apiName]) {
            var li = $('<li role="presentation"><a class="select-default-method" api-name="'
                    + apiName + '" method-name="' + method + '" role="menuitem" tabindex="-1" href="#"><h3>' + base[apiName][method].name +  '</h3></a></li>');
            ul.append(li);
        }

        button.append(caret);
        dropDown.append(button).append(ul);
        $('.nav').append(dropDown);
    };

    //gets important elements from WADL document and writes them into global variables
    var parseXMLDoc = function(xml){
        //get all APIs
        var APIs = $(xml).find("resources"),
            isFirstMethod = true; //variable to store the very first method found

        APIs.each(function(){
            //get all methods in the API
            var methods = $(this).find('resource');

            methods.each(function(){
                var me = $(this), //method
                    method = $(me.find('method')[0]), //get method details object
                    category = method.find('[primary="true"]').text(), //get API name
                    params = me.find('param'), //method params
                    parameters = {}; //temporary object to store param data

                params.each(function(){ //fill param object with required data
                    var that = $(this);
                    parameters[that.attr('name')] = {
                        'name': that.attr('name'),
                        'required': that.attr('required'),
                        'type': that.attr('type'),
                        'style': that.attr('style'),
                        'default': that.attr('default'),
                        'doc': that.first('doc').text().trim()
                    }
                });

                if (!base[category])
                    base[category] = {}; // create new API in base object if there is none

                base[category][method.attr("id")] = {
                    'id' : method.attr("id"), // method id
                    'name' : method.attr("apigee:displayName") ? method.attr("apigee:displayName") : method.attr("id"), // method name
                    'method' : method.attr('name'), // GET or POST
                    'category' : category, // API name
                    'path': me.attr('path'), // method URL
                    'parameters': parameters, // method parameters
                    'base' : me.parent().attr('base'), // method base link
                    'description' : $(method.find('doc')[0]).text().trim() //method description
                };

                if (isFirstMethod){
                    defaultMethod = base[category][method.attr("id")];
                    selectedMethod = defaultMethod;
                    isFirstMethod = false;
                }
            });
        });

        buildPageLayout();

    };

    //gets document from WADL configuration file
    var readFromWADL = function(){
        var xml;
        $.ajax({
            url: '../apidescription.xml',
            async : false,
            dataType: ($.browser.msie) ? "text" : "xml",
            success : function(response){
                if (typeof response == "string"){
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = false;
                    xml.loadXML(response);
                }
                else
                    xml = response;
                parseXMLDoc(xml);
            },

            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert('Data Could Not Be Loaded - '+ textStatus);
            }
        });
    };

    /* END OF INITIALIZATION PHASE FUNCTIONS */

    // column constructor
    var Column = function(configObject, responseObject, index){
        var self = this;
        self.responseObject = responseObject;
        self.destinationObject = {};
        self.init = function(){
            self.column = $('<div class="api-column"></div>').hide();

            for (var i = 0; i < configObject.length; i++){ // iterate through method main subcolumns
                var subcolumn = configObject[i], // subcolumn
                    listGroup = $('<div class="list-group"></div>'), //subcolumn future element
                    title = $('<a class="list-group-item active">' + subcolumn["title"] + '</a>'); // subcolumn title

                var destinationObject = subcolumn["path"] ? Object.byString(self.responseObject, subcolumn["path"]) : self.responseObject; // object inside the response to iterate through
                destinationObject = index ? destinationObject[index]: destinationObject;
                self.destinationObject = destinationObject;

                listGroup.append(title);

                if (subcolumn["expandsTo"]){
                    title.append($('<a href="#" class="pull-right expand-new-method" '
                        + 'method="' + subcolumn["expandsTo"] + '" '
                        + 'data-id="' + destinationObject.id + '"></a>'));
                }

                if (subcolumn["collection"]){
                    var field = subcolumn["fields"][0], // field to be iterated in subcolumn
                        expandsTo = field["expandsTo"],
                        isExpandable = expandsTo ? true : false, // if field is expandable
                        expandsToObject = isExpandable ? (typeof expandsTo == "object" ? true : false) : false, // is expandable to object (not to another method)
                        destinationDeep = subcolumn["fields"][0]["path"] ? Object.byString(destinationObject,  subcolumn["fields"][0]["path"]) : destinationObject; // if field has its additional path

                    for (item in destinationDeep){ // iterate through response items collection
                        var listItem = $('<a class="list-group-item' + (isExpandable ? ' expandable' : '') + '" ' // if field is expandable add class .expandable
                        + (isExpandable ? ('expand-path="' + (expandsToObject ? (i /*subcolumn*/ + '.fields.' + '0.expandsTo' ) : expandsTo) + '" ') : ' ') // path to object to be expanded
                        + (subcolumn["path"] ? ('subcolumn-path="' + subcolumn["path"] + '" ') : ' ') // path to object to be expanded
                        + 'index="' + item + '"' // index in array in case it expands to secondary
                        + '>' + subcolumn["fields"][0]["id"] + ': ' + destinationDeep[item][subcolumn["fields"][0]["id"]] + '</a>'); // get specified in config field value from response item
                        listGroup.append(listItem);
                    }
                }
                else {
                    for (field in subcolumn["fields"]){
                        var destinationDeep = subcolumn["fields"][field]["path"] ? Object.byString(destinationObject,  subcolumn["fields"][field]["path"]) : destinationObject; // if field has its additional path
                        if (destinationDeep){
                            var listItem = $('<a class="list-group-item">' + subcolumn["fields"][field]["id"] + ': ' + destinationDeep[subcolumn["fields"][field]["id"]] + '</a>');
                            listGroup.append(listItem);
                        }
                    }
                }
                self.column.append(listGroup);
            }
        };
        self.render = function(){
            slider.slick('slickAdd', self.column);
            slider.slick('slickNext');
            setTimeout(function(){
                self.column.slideDown(700);
                spinner.hide();
            }, 500);
        };
        self.setEventListeners = function(){
            self.column.on('click', function(e){
                var selfIndex = self.getIndex();
                if ($(e.target).hasClass('expandable')){ // if it is a field and it expands to new column
                    self.makeColumnLast();
                    self.column.find('.list-group-item').removeClass('selected');
                    $(e.target).addClass("selected");
                    spinner.show();
                    setTimeout(function(){
                        self.removeAllColumnsToRight(selfIndex);
                        var response = ($(e.target).attr("subcolumn-path") && index) ? (Object.byString(responseObject, $(e.target).attr("subcolumn-path") + '.' + index)): responseObject;
                        new Column(Object.byString(configObject, $(e.target).attr("expand-path")), response, $(e.target).attr("index"));
                    }, 800);
                }
                else {
                    if ($(e.target).hasClass('expand-new-method')){ // handles click event on More button
                        e.preventDefault();
                        var method = findMethodInBase($(e.target).attr("method"));
                        var url = formURLWithId(method, $(e.target).attr("data-id"));
                        spinner.show();
                        sendRequest(url, method.method, function(response){
                            self.makeColumnLast();
                            setTimeout(function(){
                                self.removeAllColumnsToRight(selfIndex);
                                new Column(CONFIG[method.id], response);
                            }, 800);
                        });
                    }
                }
            });
        };
        self.makeColumnLast = function(){ // slides to make current column last within current view
            var selfIndex = self.getIndex(),
                requiredDelta = (getColumnCount() - 1) - selfIndex;

            if (requiredDelta){
                console.log("delta applied");
                slider.slick("slickGoTo", selfIndex - requiredDelta);
                slider.slick('setPosition', selfIndex);
            }
        };
        self.removeAllColumnsToRight = function(index){ // removes all right to columns[index] columns from slider
            while (getColumnCount() > index + 1 ){
                slider.slick("slickRemove", index + 1);
            }
        };
        self.getIndex = function(){ // get column index in slider
            var child = self.column[0];
            var parent = child.parentNode;
            // The equivalent of parent.children.indexOf(child)
            var i = Array.prototype.indexOf.call(parent.children, child);
            return i;
        };
        self.init();
        self.render();
        self.setEventListeners();
    };

    // gets current column count in slider
    var getColumnCount = function(){
        return $('.slick-track > div').length;
    };

    // sends request to get the second column
    var sendPrimaryRequest = function(){
        var url = formPrimaryURL(selectedMethod);
        spinner.show();
        sendRequest(url, selectedMethod.method, function(response){
            slider.slick('slickGoTo', 0);
            setTimeout(function(){
                while (getColumnCount() > 1 ){
                    slider.slick("slickRemove", 1);
                }
                new Column(CONFIG[selectedMethod.id], response);
            }, 500);
        });
    };

    // forms method URL with all default parameters but custom ID
    var formURLWithId = function(method, id){
        var url = method.path; // selected method's url

        for (param in method.parameters){
            if (method.parameters[param].style === "template"){
                if (method.parameters[param].name === "id"){
                    url = url.replace('{id}', id);
                }
                else {
                    url = url.replace('{' + method.parameters[param].name + '}', method.parameters[param].default);
                }
            }
        }

        url = method.base + '/' + url + '?apikey' + '=' + apiKey;
        return url;
    };

    // temporary function. returns method object by its id (no API name available)
    var findMethodInBase = function(id){
        for (api in base){
            for (method in base[api]){
                if (method === id){
                    return base[api][method];
                }
            }
        }
    };

    // forms URL for 1st column, based on base URL, template, template parameters and additional query parameters
    var formPrimaryURL = function(method){
        var params = getAllParameteres(), // parameter values from 1st column
            url = method.path, // selected method's url
            query = ""; // string with non required parameters

        $(params).each(function(){
            var each = this;
            if (method.parameters[each.id].style === "template"){
                // embed parameter into base url if it has template style
                url = url.replace('{' + each.id + '}', each.value ? each.value : method.parameters[each.id].default)
            }
            else {
                // form string with additional parameters
                query = each.value ? (query + '&' + each.id + '=' + each.value) : query;
            }
        });

        url = method.base + '/' + url + '?apikey' + '=' + apiKey + query;
        return url;
    };

    // gets all parameter values from the 1st column
    var getAllParameteres = function(){
        var params = $('#primary-column .parameter-item input'),
            paramArray = [];
        params.each(function(){
            var each = $(this);
            paramArray.push({
                "id" : each.attr("id"),
                'value' : each.val()
            });
        });
        return paramArray;
    };

    //universal ajax request sender
    var sendRequest = function(url, method, callback){
        //spinner.show();
        $.ajax({
            type: method,
            url: url,
            async: true,
            success: function(response, textStatus, jqXHR) {
                //generate unique id for each accordion item
                var guid = guId(),
                    reqResItem = $("<div class='panel panel-default req-resp-temp'>" +
                    "<div class='panel-heading'><h4 class='panel-title'>" +
                    "<a data-toggle='collapse' data-parent='#req-res-container' href='#" +
                    guid + "'>" + url +
                    "</a></h4></div><div id='" + guid +
                    "' class='panel-collapse collapse'><div class='panel-body'><pre>" + jqXHR.responseText + "</pre></div></div></div>").hide().fadeIn(1000);

                $('#req-res-container').prepend(reqResItem);
                $('#clear-req-resp').fadeIn(1000);

                callback(response);
            },
            error: function(xhr, status, err) {
                spinner.hide();
            }
        });
    };

    //generates unique id for each request response element
    var guId = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

})();
(function(){
    $(document).ready(function () {

        function showHiddenParagraphs() {
            $("p.hidden").fadeIn(500);
        }
        setTimeout(showHiddenParagraphs, 1000);

        var selectedEventId, //currently selected in column 2 event
            apiKey = "7elxdku9GGG5k8j0Xm8KWdANDgecHMV0", //hardcoded api key for demo purposes
            spinner = $('#spinner'), //spinner
            column3 = $('#event-details'), //column 3
            column4 = $("#event-parts"), //column 4
            imgPopUp = $('#pop-up'), //pop up window used to display selected image
            imagesBlock = $('#event-images'), //images list block
            getImagesBtn = $('#get-event-images'), //get current event images button
            eventVenues = $("#event-venues"), //column 3 venues section
            venueContainer = $('#venue-details'), //column 4 venue container
            eventCategories = $("#categories"), //column 3 categories section
            categoryDetails = $("#category-details"), //column 4 category details
            eventAttractions = $("#event-attractions"), //column 3 attractions section
            attractionDetails = $("#attraction-details"), //column 4 attraction details
            reqResContainer = $('#req-res-container'), //container with request-response code
            reqResClearBtn = $('#clear-req-resp'); //request-response clear button

        //get events
        $('#getevents').on('click', function (e) {
            e.preventDefault();
            var manualParams = ($('#keyword').val() ? "&keyword=" + $('#keyword').val() : "") +
                                ($('#attraction-id').val() ? "&attractionId=" + $('#attraction-id').val() : "") +
                                ($('#venue-id').val() ? "&venueId=" + $('#venue-id').val() : "") +
                                ($('#promoter-id').val() ? "&promoterId=" + $('#promoter-id').val() : "");
            sendRequest("events.json?apikey=" + apiKey + manualParams, showEvents);
        });

        //clear paramater inputs
        $('#clear-params').click(function(){
            $('.event-param').val('');
        });

        //select event
        $('#events').on('click', function (e) {
            e.preventDefault();
            if (e.target.tagName === "A" && $(e.target).attr('event-id')){
                var eventId = $(e.target).attr('event-id');
                selectedEventId = eventId;
                sendRequest("events/" + eventId + ".json?apikey=" + apiKey, showEventDetails);
            }

        });

        //get event images
        getImagesBtn.click(function(e){
            e.preventDefault();
            sendRequest("events/" + selectedEventId + "/images.json?apikey=" + apiKey, showImgList);
        });

        //show selected image
        imagesBlock.click(function(e){
            if (e.target.tagName === "A" && $(e.target).hasClass('event-detail-temp') && $(e.target).attr('url')){
                spinner.show();
                var img = imgPopUp.find('img');
                img.attr('src', $(e.target).attr('url')).load(function(){
                    spinner.hide();
                    imgPopUp.find('#resolution').text(img[0].naturalWidth + " x " + img[0].naturalHeight);
                    imgPopUp.fadeIn(500).focus();
                });
            }
        });

        //show venue details
        eventVenues.click(function(e){
            if (e.target.tagName === "A" && $(e.target).attr('venue-id')){
                $('.address-temp').remove();
                sendRequest("venues/" + $(e.target).attr('venue-id') + ".json?apikey=" + apiKey, showVenueAddress);
            }
        });

        eventCategories.on("click", function(e){
            if (e.target.tagName === "A" && $(e.target).attr('category-id')) {
                $('.category-temp').remove();
                sendRequest("categories/" + $(e.target).attr('category-id') + ".json?apikey=" + apiKey, showCategoryDetails);
            }
        });

        eventAttractions.on("click", function(e){
            if (e.target.tagName === "A" && $(e.target).attr('attraction-id')) {
                $('.attraction-temp').remove();
                sendRequest("attractions/" + $(e.target).attr('attraction-id') + ".json?apikey=" + apiKey, showAttractionDetails);
            }
        });

        /* pop up close functionality */
        imgPopUp.on('blur', function(){
            imgPopUp.fadeOut(300);
        });

        $('.popup-close').click(function(e){
            e.preventDefault();
            imgPopUp.fadeOut(300);
        });
        /* end of pop up close functionality */

        //remove all request-response items on button click
        reqResClearBtn.click(function(){
            var reqRespItems = $('.req-resp-temp');
            reqRespItems.fadeOut(1000);
            setTimeout(function(){
                reqRespItems.remove();
            }, 1000);
            reqResClearBtn.fadeOut(1000);
        });

        //universal ajax request sender
        var sendRequest = function(urlParams, callback){
            spinner.show();
            $.ajax({
                type: "GET",
                url: "https://app.ticketmaster.com/discovery/v1/" + urlParams,
                async: true,
                dataType: "json",
                success: function(json, textStatus, jqXHR) {
                    //generate unique id for each accordion item
                    var guid = guId(),
                        reqResItem = $("<div class='panel panel-default req-resp-temp'>" +
                        "<div class='panel-heading'><h4 class='panel-title'>" +
                        "<a data-toggle='collapse' data-parent='#req-res-container' href='#" +
                        guid + "'>" +
                        "https://app.ticketmaster.com/discovery/v1/" + urlParams +
                        "</a></h4></div><div id='" + guid +
                        "' class='panel-collapse collapse'><div class='panel-body'><pre>" + jqXHR.responseText + "</pre></div></div></div>").hide().fadeIn(1000);

                    reqResContainer.prepend(reqResItem);
                    reqResClearBtn.fadeIn(1000);

                    spinner.hide();
                    callback(json);
                },
                error: function(xhr, status, err) {
                    spinner.hide();
                }
            });
        };

        //show column 2
        var showEvents = function(json){
            $('.event-temp').remove();
            $('.event-detail-temp').remove();
            column3.hide();
            column4.hide();
            if (json._embedded){
                var events = json._embedded.events;
                for(i = 0; i < events.length; i++) {
                    $("#events").append("<a class='list-group-item event-temp' event-id='" + events[i].id + "'>"+events[i].name +"</a>");
                }
                $('#events .badge').text(events.length);
            }
            else {
                $('#events .badge').text(0);
            }
            $("#response").slideDown(500);
        };

        //show column 3
        var showEventDetails = function(json){
            $("#event-name").text(json.name);
            $(".event-detail-temp").remove();
            column4.hide();
            categoryDetails.hide();
            venueContainer.hide();
            attractionDetails.hide();
            var venues = json._embedded.venue,
                categories = json._embedded.categories,
                attractions = json._embedded.attractions;
            if (venues){
                for (var i=0; i < venues.length; i++){
                    eventVenues.append("<a class='list-group-item event-detail-temp' venue-id='" + venues[i].id + "'>"+venues[i].name+"</a>");
                }
                eventVenues.find('.badge').text(venues.length);
            }
            else {
                eventVenues.find('.badge').text(0);
            }
            if (categories){
                for (i=0; i < categories.length; i++){
                    eventCategories.append("<a class='list-group-item event-detail-temp' category-id='" + categories[i].id + "'>"+categories[i].name+"</a>");
                }
                eventCategories.find('.badge').text(categories.length);
            }
            else {
                eventCategories.find('.badge').text(0);
            }
            if (attractions){
                for (i=0; i < attractions.length; i++){
                    eventAttractions.append("<a class='list-group-item event-detail-temp' attraction-id='" +attractions[i].id+ "'>"+attractions[i].name+"</a>");
                }
                eventAttractions.find('.badge').text(attractions.length);
            }
            else {
                eventAttractions.find('.badge').text(0);
            }
            column3.hide().slideDown(500);
            getImagesBtn.show();
        };

        //display list of available images
        var showImgList = function(json){
            var images = json.images;
            for (var i=0; i < images.length; i++){
                imagesBlock.append("<a class='list-group-item event-detail-temp' url='" + images[i].url + "'> Ratio: " + images[i].ratio + "</a>");
            }
            imagesBlock.find('.badge').text(images.length);
            getImagesBtn.hide();
        };

        //display column 4 with venue details
        var showVenueAddress = function(json){
            column4.show();
            venueContainer.append("<a class='list-group-item address-temp'>" + "id: " + json.id + "</a>")
                .append("<a class='list-group-item address-temp'>" + json.address.line1 + "</a>")
                .append("<a class='list-group-item address-temp'>" + json.address.line2 + "</a>")
                .append("<a class='list-group-item address-temp'>" + json.city.name + "</a>")
                .append("<a class='list-group-item address-temp'>" + json.country.countryCode + "</a>");
            venueContainer.hide().slideDown(500);
        };

        var showCategoryDetails = function(json){
            column4.show();
            categoryDetails.append("<a class='list-group-item category-temp'>" + "id: " + json.id + "</a>")
                .append("<a class='list-group-item category-temp'>" + "level: " + json.level + "</a>")
                .append("<a class='list-group-item category-temp'>" + "locale: " + json.locale + "</a>")
                .append("<a class='list-group-item category-temp'>" + "name: " + json.name + "</a>");
            categoryDetails.hide().slideDown(500);
        };

        var showAttractionDetails = function(json){
            column4.show();
            attractionDetails.append("<a class='list-group-item attraction-temp'>" + "id: " + json.id + "</a>")
                .append("<a class='list-group-item attraction-temp'>" + "locale: " + json.locale + "</a>")
                .append("<a class='list-group-item attraction-temp'>" + "name: " + json.name + "</a>");
            attractionDetails.hide().slideDown(500);
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

    });
})();

var venueDetails = [
    {
        "title": "Venue",
        "path": "_embedded.venue",
        "expandsTo": "discovery.venues.id.get",
        "fields": [
            {
                "id": "id"
            },
            {
                "id": "name"
            },
            {
                "id": "postalCode"
            },
            {
                "id": "timeZone"
            }
        ]
    },
    {
        "title": "Address",
        "path": "_embedded.venue",
        "fields": [
            {
                "id": "line1",
                "path": "address"
            },
            {
                "id": "line2",
                "path": "address"
            },
            {
                "id": "name",
                "path": "city"
            },
            {
                "id": "countryCode",
                "path": "country"
            },
            {
                "id": "latitude",
                "path": "location"
            },
            {
                "id": "longitude",
                "path": "location"
            }
        ]
    }
],

categoryDetails = [
    {
        "title": "Category",
        "path": "_embedded.categories",
        "expandsTo": "discovery.categories.id.get",
        "fields": [
            {
                "id": "id"
            },
            {
                "id": "level"
            },
            {
                "id": "name"
            },
            {
                "id": "locale"
            }
        ]
    }
],

attractionDetails = [
    {
        "title": "Attraction",
        "path": "_embedded.attractions",
        "expandsTo": "discovery.attractions.id.get",
        "fields": [
            {
                "id": "id"
            },
            {
                "id": "name"
            },
            {
                "id": "locale"
            }
        ]
    }
],

pageDetails = {
    "title": "Page",
    "path": "page",
    "fields": [
        {
            "id": "size"
        },
        {
            "id": "totalElements"
        },
        {
            "id": "totalPages"
        },
        {
            "id": "number"
        }
    ]
};

var CONFIG = {
    "discovery.events.get": [
        { // subcolumn
            "title": "Events", // subcolumn title (required)
            "path": "_embedded.events", // path to fields (required)
            "collection": true, // if array (not required)
            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                {
                    "id": "name",
                    "expandsTo": [
                        { // subcolumn
                            "title": "Event",
                            "path": "_embedded.events",
                            "expandsTo": "discovery.events.id.get",
                            "fields": [
                                {
                                    "id": "id"
                                },
                                {
                                    "id": "locale"
                                },
                                {
                                    "id": "name"
                                }
                            ]
                        },
                        {
                            "title": "Dates",
                            "path": "_embedded.events",
                            "fields": [
                                {
                                    "id": "localDate",
                                    "path": "dates.start"
                                },
                                {
                                    "id": "localDate",
                                    "path": "dates.end"
                                },
                                {
                                    "id": "dates.timeZone"
                                },
                                {
                                    "id": "code",
                                    "path": "dates.status"
                                }
                            ]
                        },
                        {
                            "title": "Venues",
                            "path": "_embedded.events",
                            "collection": true,
                            "fields": [
                                {
                                    "id": "name",
                                    "path": "_embedded.venue",
                                    "expandsTo": venueDetails
                                }
                            ]
                        },
                        {
                            "title": "Categories",
                            "path": "_embedded.events",
                            "collection": true,
                            "fields": [
                                {
                                    "id": "name",
                                    "path": "_embedded.categories",
                                    "expandsTo" : categoryDetails
                                }
                            ]
                        },
                        {
                            "title": "Attractions",
                            "path": "_embedded.events",
                            "collection": true,
                            "fields": [
                                {
                                    "id": "name",
                                    "path": "_embedded.attractions",
                                    "expandsTo": attractionDetails
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        pageDetails
    ],
    "discovery.events.id.get": [
        {
            "title": "Events details", // subcolumn title (required)
            "path": "", // path to fields (required)
            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                {
                    "id": "id"
                },
                {
                    "id": "locale"
                },
                {
                    "id": "name"
                },
                {
                    "id": "0",
                    "path" : "promoterId"
                }
            ]
        },
        {
            "title": "Dates",
            "path": "dates",
            "fields": [
                {
                    "id": "localDate",
                    "path": "start"
                },
                {
                    "id": "timezone"
                },
                {
                    "id": "code",
                    "path": "status"
                }
            ]
        },
        {
            "title": "Venues",
            "path": "_embedded.venue",
            "collection": true,
            "fields": [
                {
                    "id": "name",
                    "expandsTo": venueDetails
                }
            ]
        },
        {
            "title": "Categories",
            "path": "_embedded.categories",
            "collection": true,
            "fields": [
                {
                    "id": "name",
                    "expandsTo": categoryDetails
                }
            ]
        },
        {
            "title": "Attractions",
            "path": "_embedded.attractions",
            "collection": true,
            "fields": [
                {
                    "id": "name",
                    "expandsTo": attractionDetails
                }
            ]
        },
        {
            "title": "Get Images",
            "path": "",
            "expandsTo": "discovery.events.id.images.get"
        }
    ],
    "discovery.events.id.images.get": [
        {
            "title": "Event", // subcolumn title (required)
            "path": "", // path to fields (required)
            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                {
                    "id": "id"
                }
            ]
        },
        {
            "title": "Images", // subcolumn title (required)
            "path": "images", // path to fields (required)
            "collection": true,
            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                {
                    "id": "ratio",
                    "expandsTo": [
                        {
                            "title": "Image", // subcolumn title (required)
                            "path": "images", // path to fields (required)
                            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                                {
                                    "id": "url"
                                },
                                {
                                    "id": "height"
                                },
                                {
                                    "id": "width"
                                },
                                {
                                    "id": "ratio"
                                },
                                {
                                    "id": "fallback"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "discovery.attractions.get": [
        {
            "title": "Attractions", // subcolumn title (required)
            "path": "_embedded.attractions", // path to fields (required)
            "collection": true,
            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                {
                    "id": "name",
                    "expandsTo": attractionDetails
                }
            ]
        },
        pageDetails
    ],
    "discovery.attractions.id.get": [
        {
            "title": "Attraction Details", // subcolumn title (required)
            "path": "", // path to fields (required)
            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                {
                    "id": "locale"
                },
                {
                    "id": "name"
                },
                {
                    "id": "id"
                }
            ]
        }
    ],
    "discovery.categories.get": [
        {
            "title": "Categories", // subcolumn title (required)
            "path": "_embedded.categories", // path to fields (required)
            "collection": true,
            "fields": [ // if collection is true there should be only 1 field to iterate through (required)
                {
                    "id": "name",
                    "expandsTo": categoryDetails
                }
            ]
        },
        pageDetails
    ],
    "discovery.categories.id.get": [
        {
            "title": "Category",
            "path": "",
            "fields": [
                {
                    "id": "id"
                },
                {
                    "id": "level"
                },
                {
                    "id": "name"
                },
                {
                    "id": "locale"
                }
            ]
        }
    ],
    "discovery.venues.get": [
        {
            "title": "Venues", 
            "path": "_embedded.venues", // venueS (not venue)
            "collection": true,
            "fields": [
                {
                    "id": "name",
                    "expandsTo": [
                        {
                            "title": "Venue",
                            "path": "_embedded.venues",
                            "expandsTo": "discovery.venues.id.get",
                            "fields": [
                                {
                                    "id": "id"
                                },
                                {
                                    "id": "name"
                                },
                                {
                                    "id": "postalCode"
                                },
                                {
                                    "id": "timeZone"
                                }
                            ]
                        },
                        {
                            "title": "Address",
                            "path": "_embedded.venues",
                            "fields": [
                                {
                                    "id": "line1",
                                    "path": "address"
                                },
                                {
                                    "id": "line2",
                                    "path": "address"
                                },
                                {
                                    "id": "name",
                                    "path": "city"
                                },
                                {
                                    "id": "countryCode",
                                    "path": "country"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        pageDetails
    ],
    "discovery.venues.id.get": [
        {
            "title": "Venue",
            "path": "",
            "fields": [
                {
                    "id": "id"
                },
                {
                    "id": "name"
                },
                {
                    "id": "postalCode"
                },
                {
                    "id": "timeZone"
                },
                ,
                {
                    "id": "locale"
                }
            ]
        },
        {
            "title": "Address",
            "path": "",
            "fields": [
                {
                    "id": "line1",
                    "path": "address"
                },
                {
                    "id": "line2",
                    "path": "address"
                },
                {
                    "id": "name",
                    "path": "city"
                },
                {
                    "id": "countryCode",
                    "path": "country"
                }
            ]
        }
    ],
    "commerce.events.offers": {},
    "tap.events": {}
};
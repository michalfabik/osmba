var OSMBA_APP_VERSION = '0.27';

var osmba = osmba || {};
osmba.setMarkerFromParams = setMarkerFromParams;
osmba.userMarker = false; // for linking: osmap.ba/?mlat=50.79&mlon=15.16&zoom=17
osmba.defaultLayer = null; // Store default layer there
osmba.apiTagsMap = new Map(); // List of API supported tags

var map, baseLayers = {}, overlays = {}, controls = {};
var guideposts, gpcheck;
var sidebar, poiSidebar, mapLayers;


initmap();

function initmap() {
    map = new L.Map('map', {zoomControl: false, condensedAttributionControl: false});

    L.control.condensedAttribution({
        emblem: '<div class="emblem-wrap glyphicon glyphicon-info-sign"></div>',
        prefix: "<a href='https://github.com/osm-ba/osmba' title='Projekt na Githubu'><img src='https://github.com/favicon.ico' width='10' style='margin-right:1ex'>osmba-app</a> " + OSMBA_APP_VERSION
    }).addTo(map);

    // -------------------- Sidebars --------------------
    osmba.sidebar = sidebar = L.control.sidebar('sidebar', {
        position: 'left',
        autoPan: false
    }).addTo(map);

    osmba.poiSidebar = poiSidebar = L.control.sidebar('poi-sidebar', {
        position: 'left',
        autoPan: false
    }).addTo(map);

    osmba.layersSidebar = layersSidebar = L.control.sidebar('map-layers', {
        position: 'right',
        closeButton: true,
        autoPan: false
    }).addTo(map);


    // -------------------- map layers --------------------
    new osmba.layers(map, baseLayers, overlays, controls);

    // -------------------- map controls --------------------
    new osmba.controls(map, baseLayers, overlays, layersSidebar, controls);

    // Restore previous state or expand base group by default
    if (Cookies.get("_ls_expanded_groups")) {
        controls.layers.expandGroup();
    } else {
        controls.layers.expandGroup("Základní");
    }

    // Look for default layer
    L1:
    for (group in baseLayers) {
        for (layer in baseLayers[group]) {
            if (baseLayers[group][layer].options && baseLayers[group][layer].options.osmbaDefaultLayer) {
                osmba.defaultLayer = baseLayers[group][layer];
                break L1;
            }
        }
    }

    // -------------------- modules --------------------
    guideposts = new osmba.guideposts(map, baseLayers, overlays, controls, "Turizam");
    gpcheck = new osmba.gpcheck(map, baseLayers, overlays, controls, "Specijalizirani");
    popup = new osmba.poiPopup(map);

    // -------------------- map state --------------------

    // location is set from: npress-variable OR hash OR cookie OR default home
    OSM.home = {lat: 43.8, lon: 18.09, zoom: 9};
    var params = OSM.mapParams();
    if (window.__npress_page_osm_params__) Object.assign(params, window.__npress_page_osm_params__);

    setLayersFromParams(params);
    setMapLocationFromParams(params);
    setMarkerFromParams(params); // ?mlat, mlon, mmsg
    loadPoiFromParams(params); // ?node=123 or /node/123

    // update on hash change
    var lastHash;
    $(window).bind('hashchange', function (e) {
        if (location.hash && (location.hash != lastHash)) {
            var hash = OSM.parseHash(location.hash);
            if (hash.center)
                map.setView([hash.lat, hash.lon], hash.zoom);
            updateLayersFromCode(hash.layers);
            lastHash = location.hash;
        }
    });

    // remember last location in hash AND cookie
    map.on('moveend zoomend layeradd layerremove', function () {
        lastHash = OSM.formatHash(map);
        location.hash = lastHash;
        Cookies.set("_osm_location", OSM.locationCookie(map), {expires: 31});
    });


    // when baselayer out of max zoom - zoom it correctly
    map.on("baselayerchange", function (e) {
        if (map.getZoom() > e.layer.options.maxZoom) {
            map.setView(map.getCenter(), e.layer.options.maxZoom, {reset: true});
        }
    });

    // -------------------- home-splash-screen or text-content splash --------------------
    var container = $('#main .container');

    var addHandlersToRestorePage = function () {
        var activeMenu = $('nav .active').removeClass('active');
        var restorePage = function (event) {
            event.preventDefault();
            map.scrollWheelZoom.disable();
            container.slideDown();
            $('#page-restore-button').fadeOut('slow');
            activeMenu.addClass('active').off('click.fader');
        };

        activeMenu.on('click.fader', restorePage);
        $('#page-restore-button').fadeIn('slow').on('click', restorePage);
    };

    var closeSplash = function () {
        map.scrollWheelZoom.enable();
        container.slideUp();
        addHandlersToRestorePage();
        if (location.pathname === '/splash') history.pushState({}, "", "/");
    };

    // hide splash on map-click or map-move or layers-shown
    map.on('click movestart', closeSplash);
    osmba.layersSidebar.on('show', function () {
        container.toggleClass("layersSidebar-shown", true);
        closeSplash();
    });
    osmba.layersSidebar.on('hide', function () {
        container.toggleClass("layersSidebar-shown", false);
    });

    map.scrollWheelZoom.disable(); // text-content splash is opened by default = disable scroll-zoom

    if (container.hasClass('splash')) { //home-splash-screen is loaded with display:none
        $('.close-overlay').click(closeSplash);
        container.click(function (event) {
            if (event.target.parentNode === this) //<div.row> children in <.container>
                setTimeout(closeSplash, 200);
        });

        // skrytí overlay
        if (!Cookies.get('overlayShown') || location.pathname === '/splash') {
            container.show();
            Cookies.set('overlayShown', 'yes', {expires: 7}); // expires in 7 days
        }
        else {
            map.scrollWheelZoom.enable();
            addHandlersToRestorePage();
            $('nav .active').removeClass('active');
            $('#page-restore-button').show();
        }
    }

}

function setLayersFromParams(params) {
    var locationCookie = Cookies.get('_osm_location');

    // If layer parameter not set, use info from cookie
    if (!params.layers && locationCookie) {
        params.layers = (locationCookie).split('|')[3];
    }

    // If still no base layer used, try extract it from the cookie
    if (params.layers && !params.layers.match(/[a-z]/) && locationCookie) {
        params.layers += (locationCookie).split('|')[3].match(/[a-z]/);
    }

    updateLayersFromCode(params.layers);  //note: the default layer is without code
}

function setMapLocationFromParams(params) {
    if (params.bounds) {
        map.fitBounds(params.bounds);
    } else {
        map.setView([params.lat, params.lon], params.zoom);
    }
}

function setMarkerFromParams(params) {
    if (params.marker) {
        var popup = [];
        popup.push("<div class='locationMarkerPopup'>");
        if (params.mmsg)
            popup.push("<h1>" + params.mmsg + "</h1>");
        else
            popup.push("<h1>Odkaz na místo</h1>");
        // popup.push("<div class='text-right small'>upravit | odebrat</div>");
        popup.push("</div>");

        if (osmba.userMarker) {
            osmba.userMarker.removeFrom(map);
        }

        osmba.userMarker = L.marker([params.mlat, params.mlon], { title: "Odkaz na místo" });
        osmba.userMarker.bindPopup(popup.join('')).openPopup();

        osmba.userMarker.on("add", function (event) {
            event.target.openPopup();
        });
        osmba.userMarker.on("popupclose", function (event) {
            // event.target.removeFrom(map) .. ovo ne može, zatvaralo bi se sa svakim klikom na mapi
        });
        osmba.userMarker.addTo(map);
    }
}

function loadPoiFromParams(params) {
    if (params.object)
        osmba.poiPopup.load(params.object);

    var loadObject = /^\/(node|way|relation)\/(\d+)$/.exec(location.pathname);
    if (loadObject)
        osmba.poiPopup.load({ type: loadObject[1], id: loadObject[2] });
}

function updateLayersFromCode(codedString) {

     function setLayer (key, layer) {
        if (layer == null) {
            return false;
        }

        for (var pos in codedString) {
            if (layer.options && layer.options.code == codedString[pos]) {
                map.addLayer(layer);
                return true;
            }
        }

        return false;
    };

    var group, layer, baseLayerSelected = false;

    // blank code or having only UPPERCASE = overlays --> display default layer
    if (!codedString || !codedString.match(/[a-z]/)) {
        map.addLayer(osmba.defaultLayer);
    } else {
        for (group in baseLayers) {
            for (layer in baseLayers[group]) {
                if (setLayer(layer, baseLayers[group][layer]))
                    baseLayerSelected = true;
            }
        }
        if (!baseLayerSelected)
            map.addLayer(osmba.defaultLayer);
    }

    for (group in overlays) {
        for (layer in overlays[group]) {
            setLayer(layer, overlays[group][layer]);
        }
    }
}

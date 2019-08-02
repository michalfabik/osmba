// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmba = osmba || {};
osmba.controls = function (map, baseLayers, overlays, layersPanel, controls) {
    // -- constructor --

    controls.layers = osmba.layerSwitcher(baseLayers, overlays, layersPanel, {priorityGroups: ["Osnovni", 'Avionski', 'Informacije']}).addTo(map);

    controls.zoom = L.control.zoom({
        zoomInTitle: 'Približiti',
        zoomOutTitle: 'Udaljiti'
    }).addTo(map)

    // create a fullscreen button and add it to the map
    controls.fullScreen = new L.control.fullscreen({
        position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
        title: 'Preko cijelog ekrana', // change the title of the button, default Full Screen
        titleCancel: 'Izlazak iz režima cijelog ekrana', // change the title of the button when fullscreen is on, default Exit Full Screen
        content: "<span class='glyphicon glyphicon-fullscreen'></span>", // change the content of the button, can be HTML, default null
        forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
        forcePseudoFullscreen: false // force use of pseudo full screen even if full screen API is available, default false
        // fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
    });
    controls.fullScreen.addTo(map);

    // leaflet-search
    controls.search = new L.Control.Search({
        url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        propertyLoc: ['lat', 'lon'],
        circleLocation: false,
        markerLocation: true,
        autoType: false,
        autoCollapse: true,
        minLength: 2,
        zoom: 14,
        textPlaceholder: 'Hledat…'
    });
    controls.search.addTo(map);

    // leaflet-locate
    controls.locate = L.control.locate({
        follow: true,
        locateOptions: {maxZoom: 15},
        icon: 'glyphicon glyphicon-map-marker',
        strings: {
            title: "Prikazati moju trenutnu lokaciju"
        }
    }).addTo(map);

    // leaflet-filelayer - upload GPX, KML a GeoJSON
    var style = {color: 'red', opacity: .6, fillOpacity: .5, weight: 4, clickable: false};
    L.Control.FileLayerLoad.LABEL = '<span class="glyphicon glyphicon-folder-open"></span>';
    L.Control.FileLayerLoad.TITLE = 'Učitati lokalne fajlove (GPX, KML, GeoJSON)';

    // TODO:
    //  * show more details about file like distance, duration, elevation...
    controls.fileLayerLoad = L.Control.fileLayerLoad({
        fitBounds: true,
        fileSizeLimit: 10240,
        layerOptions: {
            style: style,
            pointToLayer: function (data, latlng) {
                return L.marker(latlng,
                    {
                        icon: L.divIcon({
                            className: 'glyphicon glyphicon-asterisk gpx-marker',
                            iconSize: [10, 10]
                        }),
                        title: data.properties.name
                    });
            }
        }
    }).addTo(map);

    controls.fileLayerLoad.loader.on('data:loaded', function (e) {
        // Add to map layer switcher
        var group = 'Lokalni fajlovi';
        if (!controls.layers.layerExists(e.filename)) {
            e.layer.options.basic = true;
            e.layer.options.removeBtn = true;
            controls.layers.addOverlay(e.layer, e.filename, group);
            toastr.success('Fajl ' + e.filename + ' je uspješno učitan.', '', {
                closeButton: true,
                positionClass: "toast-bottom-center"
            });

            // Expand layer switcher to show that file was loaded
            if (controls.layers.getMode() == 'groups') {
                controls.layers.expandGroup(group);
            }
            controls.layers._expand();
        } else {
            toastr.error('Fajl nije moguće učitati ponovo.', 'Greška', {
                closeButton: true,
                positionClass: "toast-bottom-center"
            });
            map.removeLayer(e.layer);
        }
    });

    controls.fileLayerLoad.loader.on('data:error', function (e) {
        toastr.error('Nije bilo moguće učitati fajl.<br>(<i>' + e.error.message + '</i>)', 'Greška', {
            closeButton: true,
            positionClass: "toast-bottom-center"
        });
    });

    // Leaflet Coordinates Control
    controls.coordinates = new L.Control.Coordinates(); // you can send options to the constructor if you want to, otherwise default values are used
    controls.coordinates.addTo(map);
    map.on('click', function (e) {
        controls.coordinates.setCoordinates(e);
    });

    // scale
    controls.scale = L.control.scale({
        imperial: false
    }).addTo(map);

};

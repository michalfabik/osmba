/*
 guideposts for osmba
 Javascript code for openstreetmap.ba website
 Copyright (C) 2015-2018 Michal Grézl and others (see https://github.com/osmcz/osmcz/ contributors)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

and

 (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

*/

var osmba = osmba || {};
osmba.guideposts = function (map, baseLayers, overlays, controls, group) {

    var layersControl = controls.layers;
    var photoDBbtn = null;
    var xhr;
    var markers = L.markerClusterGroup({
        code: 'G',
        chunkedLoading: true,
        chunkProgress: update_progress_bar
    });
    var moving_marker;
    var need_api_auth;
    var autoload_lock = false;
    var moving_flag = false;
    var gp_id;
    var gp_lat;
    var gp_lon;
    var popupMarker; // Last marker which popup was opened
    var gp_popupMarker; // Marker that is used in Move guidepost dialog
    var popupThumbnail;

    // Highlight selected guidepost and connect it to new position
    var gpCircle = new L.circle([0, 0], {radius: 20});
    var gpMarkerPolyline = L.polyline([[0, 0], [0, 0]], {
        color: 'purple',
        clickable: false,
        dashArray: '20,30',
        opacity: 0.8
    });


    var gp_foot_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/guidepost.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var gp_cycle_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/cycle.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var gp_cycle_foot_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/cycle_foot.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var gp_ski_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/ski.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var gp_ski_foot_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/ski_foot.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var infopane_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/infopane.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var map_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/map.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var blurred_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/blurred.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var emergency_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/emergency_point.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var unknown_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/unknown.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    var commons_icon = L.icon({
        iconUrl: osmba.basePath + "img/commons_logo.png",
        iconSize: [35, 48],
        iconAnchor: [17, 0]
    });

    //for Fody - prehledova
    var overview_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/overview_photo.png",
        iconSize: [48, 48],
        iconAnchor: [23, 45]
    });

    //for Fody - znaceni
    //-----------------------------------------------------------
    var mark_foot_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/marking_foot.png",
        iconSize: [35, 48],
        iconAnchor: [23, 45]
    });

    var mark_cycle_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/marking_cycle.png",
        iconSize: [35, 48],
        iconAnchor: [23, 45]
    });

    var mark_cycle_road_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/marking_cycle_road.png",
        iconSize: [35, 48],
        iconAnchor: [23, 45]
    });

    var mark_ski_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/marking_ski.png",
        iconSize: [35, 48],
        iconAnchor: [23, 45]
    });

    var mark_wheelchair_icon = L.icon({
        iconUrl: osmba.basePath + "img/gp/marking_wheelchair.png",
        iconSize: [35, 48],
        iconAnchor: [23, 45]
    });


    //-----------------------------------------------------------

    var layer_guidepost = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {

            layer.on('click', function (e) {
                autoload_lock = true;
            });

            // fill hashtags
            function parse_hashtags(pt) {
                if (pt != null) {
                    var tags = pt.split(';');
                    if (tags.length > 0) {

                        var i, tags_content = "";
                        for (i = 0; i < tags.length; i++) {
                            tags_content += '<a href="' + osmba.photoDbUrl + '?tag=' + tags[i] + '"><span id="hashtag" class="label label-info">' + tags[i].replace(/:$/, "") + '</span></a> ';
                        }
                        return (tags_content);
                    } else {
                        return ("");
                    }
                } else {
                    return ("");
                }
            }

            var b = feature.properties;
            var geometry = feature.geometry.coordinates;

            var ftype;

            if (b.tags) {
                if (b.tags.indexOf("necitelne") > -1) {
                    ftype = "necitelne";
                } else if (b.tags.indexOf("infotabule") > -1 && b.tags.indexOf("rozcestnik") == -1) {
                    ftype = "infopane";
                } else if (b.tags.indexOf("mapa") > -1 && b.tags.indexOf("rozcestnik") == -1) {
                    ftype = "map";
                } else if (b.tags.indexOf("emergency") > -1 && b.tags.indexOf("rozcestnik") == -1) {
                    ftype = "emergency";
                } else if (b.tags.indexOf("rozcestnik")  > -1 && b.tags.indexOf("pesi") > -1) {
                    ftype = "gp_foot";
		    //foot gp with other - cycle or ski together
		    if(b.tags.indexOf("cyklo") > -1 || b.tags.indexOf("silnicni") > -1) ftype = "gp_cycle_foot";
		    if(b.tags.indexOf("lyzarska") > -1) ftype = "gp_ski_foot";
                } else if (b.tags.indexOf("rozcestnik")  > -1 && (b.tags.indexOf("cyklo") > -1 || b.tags.indexOf("silnicni") > -1))  {
                    ftype = "gp_cycle";
                } else if (b.tags.indexOf("rozcestnik")  > -1 && b.tags.indexOf("lyzarska") > -1 ) {
                    ftype = "gp_ski";
                } else if (b.tags.indexOf("prehledova") > -1 ) {
                    ftype = "overview";
                } else if (b.tags.indexOf("znaceni") > -1 && b.tags.indexOf("pesi") > -1) {
                    ftype = "mark_foot";
                } else if (b.tags.indexOf("znaceni") > -1 && b.tags.indexOf("cyklo") > -1) {
                    ftype = "mark_cycle";
                } else if (b.tags.indexOf("znaceni") > -1 && b.tags.indexOf("silnicni") > -1) {
                    ftype = "mark_cycle_road";
                } else if (b.tags.indexOf("znaceni") > -1 && b.tags.indexOf("lyzarska") > -1) {
                    ftype = "mark_ski";
                } else if (b.tags.indexOf("znaceni") > -1 && b.tags.indexOf("vozickar") > -1) {
                    ftype = "mark_wheelchair";
		}
            }

            if (!ftype) {
                ftype = "gp_unknown";
            }

            if (!b.ref) {
                b.ref = "ne znamo";
            }

            var html_content = "";
            html_content += "Sliku je dodao/la: ";
            html_content += "<a href='" + osmba.photoDbUrl + "?author=" + b.author + "'>" + b.author + "</a>";
            html_content += "<br>";
            html_content += "Uslikano: " + b.created;
            html_content += "<br>";

            if (ftype == "gp_foot" || ftype == "gp_cycle" || ftype == "gp_ski" || ftype == "gp_wheelchair"|| ftype == "gp_cycle_foot" || ftype == "gp_ski_foot" || ftype == "emergency" ) {
                html_content += "Broj putokaza: ";
                html_content += "<a href='" + osmba.photoDbUrl + "?ref=" + (b.ref == "ne znamo" ? "none" : b.ref) + "'>" + b.ref + "</a>";
                html_content += "<br>";
            }
            html_content += "<div class='gp-thumbnail'>";
            html_content += "<a href='" + osmba.photoDbUrl + "files/" + b.id + ".jpg'>";
            html_content += "<div id='thumbnailLoadSpinner" + b.id + "' class='text-center'><br><span class='glyphicon glyphicon-refresh text-info gly-spin'></span></div>";
            html_content += "<img id='thumbnailImage" + b.id + "' src='' class='center-block' />";
            html_content += "</a>";
            html_content += "</div>";

            html_content += "<div id='hashtags'>" + parse_hashtags(b.tags) + "</div>";

            html_content += "<div class='buttons-bar'>";
            html_content += "<a href='" + osmba.photoDbUrl + "?id=" + b.id + "'><button type='button' class='btn btn-default btn-xs'>";
            html_content += '   <div class="glyphicon glyphicon-pencil"></div> Urediti';
            html_content += '</button></a>';

            html_content += "<span class='space-2em'/>";

            html_content += "<a href='#'>";
            html_content += '<button type="button" class="btn btn-default btn-xs"';
            html_content += "onclick='javascript:guideposts.move_point(" + b.id + "," + geometry[1] + "," + geometry[0] + ")'>";
            html_content += '<div class="glyphicon glyphicon-move"></div> Premjestiti';
            html_content += "</button>";
            html_content += "</a>";
            html_content += "</div>";

            switch (ftype) {
                case "gp_foot":
                    layer.setIcon(gp_foot_icon);
                    break;
                case "gp_cycle":
                    layer.setIcon(gp_cycle_icon);
                    break;
                case "gp_cycle_foot":
                    layer.setIcon(gp_cycle_foot_icon);
                    break;
                case "gp_ski":
                    layer.setIcon(gp_ski_icon);
                    break;
                case "gp_ski_foot":
                    layer.setIcon(gp_ski_foot_icon);
                    break;
                case "infopane":
                    layer.setIcon(infopane_icon);
                    break;
                case "map":
                    layer.setIcon(map_icon);
                    break;
                case "necitelne":
                    layer.setIcon(blurred_icon);
                    break;
                case "emergency":
                    layer.setIcon(emergency_icon);
                    break;
                case "overview":
                    layer.setIcon(overview_icon);
                    break;
                case "mark_foot":
                    layer.setIcon(mark_foot_icon);
                    break;
                case "mark_cycle":
                    layer.setIcon(mark_cycle_icon);
                    break;
                case "mark_cycle_road":
                    layer.setIcon(mark_cycle_road_icon);
                    break;
                case "mark_ski":
                    layer.setIcon(mark_ski_icon);
                    break;
                case "mark_wheelchair":
                    layer.setIcon(mark_wheelchair_icon);
                    break;
                default:
                    layer.setIcon(unknown_icon);
            }

            layer.bindPopup(html_content, {
                offset: new L.Point(1, -32),
                minWidth: 500,
                closeOnClick: false,
                autoPan: false,
                className: 'guideposts-popup'
            });
        }
    });

    var layer_commons = new L.GeoJSON(null, {
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                autoload_lock = true;
            });
            layer.setIcon(commons_icon);
            layer.bindPopup(feature.properties.desc, {
                closeOnClick: false,
                autoPan: false,
                className: 'guideposts-popup'
            });
        }
    });

    map.on('popupopen', function (e) {

        // return if incorrect popup
        if (!(e.popup && e.popup._source && e.popup._source.feature)) {
            return;
        }

        // get guidepost thumbnail from Fody
        popupMarker = e.popup._source;
        var id = e.popup._source.feature.properties.id;
        if (id) {
            var tb = new Image();
            tb.src = osmba.photoDbUrl + "files/250px/" + id + ".jpg";
            tb.onload = function () {
                popupThumbnail = tb.src;
                $('#thumbnailLoadSpinner' + id).hide();
                $('#thumbnailImage' + id).attr('src', tb.src);
            };
            tb.onerror = function () {
                $('#thumbnailLoadSpinner' + id).html('<br><span class="glyphicon glyphicon-picture bigger semigrey thumbnail crossed" title="Pretpregled nije dostupan."><span><br>');
                $('#thumbnailLoadSpinner' + id).attr('class', 'text-nowrap text-center');
            };
        }
    });

    map.on('popupclose', function (e) {
        autoload_lock = false;
    });

    // TODO
    map.on('zoomend', function (e) {
        if (map.hasLayer(gpCircle)) {
            if (map.getZoom() > 17) {
                gpCircle.setRadius(10);
            } else if (map.getZoom() > 15) {
                gpCircle.setRadius(20);
            } else if (map.getZoom() > 12) {
                gpCircle.setRadius(40);
            } else if (map.getZoom() > 10) {
                gpCircle.setRadius(80);
            } else if (map.getZoom() > 5) {
                gpCircle.setRadius(160);
            } else {
                gpCircle.setRadius(500);
            }
        }
    });

    map.on('layeradd', function (event) {
        if (event.layer == markers && !autoload_lock) {
//        load_data();
            // PhotoDB button (add an image)
            if (!photoDBbtn) {
                photoDBbtn = L.control.photoDbGui().addTo(map);
            }
        }
    });

    map.on('layerremove', function (event) {
        if (event.layer == markers) {
            // PhotoDB button (add an image)
            if (photoDBbtn) {
                photoDBbtn.remove(map);
                photoDBbtn = null;
            }
        }
    });

    map.on('moveend', function (event) {
        if (!autoload_lock) {
            load_data();
        }
    });

    map.on('drag', function (e) {
        if (!isLayerChosen())
            return;

//         console.log(map.hasLayer(markers));

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }
    });

    map.on('movestart', function (e) {
        if (!isLayerChosen())
            return;

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }
    });

    map.on('click', function (e) {
        if (moving_flag) {
            if (!moving_marker) {
                var position = L.latLng(e.latlng.lat, e.latlng.lng);
                create_moving_marker(e.latlng.lat, e.latlng.lng);
                gpMarkerPolyline.setLatLngs([[gp_lat, gp_lon], position]).addTo(map);
                update_sidebar(get_distance(moving_marker, position), position.lat, position.lng);
            } else {
                //move marker to clicked position (to prevent losing it)
                var new_position = L.latLng(e.latlng.lat, e.latlng.lng);
                update_sidebar(get_distance(moving_marker, new_position), new_position.lat, new_position.lng);
                moving_marker.setLatLng(new_position);
                gpMarkerPolyline.setLatLngs([[gp_lat, gp_lon], new_position]);
            }
        }
    });
    /* Add overlay to the map */
    layersControl.addOverlay(markers, "Slike putokaza", group);

    /* Add overlay to the overlays list as well
     * This allows restoration of overlay state on load */
    overlays[group]["Slike putokaza"] = markers;

    // -- methods --

    function get_distance(marker, new_pos) {
        var position = marker.getLatLng();
        var origposition = L.latLng(gp_lat, gp_lon);
        return position.distanceTo(origposition);
    }

    function create_moving_marker(lat, lon) {
        moving_marker = new L.marker(new L.LatLng(lat, lon), {
            draggable: true
        });

        moving_marker
            .on('drag', function (event) {
                var marker = event.target;
                var position = marker.getLatLng();
                var origposition = L.latLng(gp_lat, gp_lon);
                var distance = position.distanceTo(origposition);

                update_sidebar(distance, position.lat, position.lng);
                gpMarkerPolyline.setLatLngs([[gp_lat, gp_lon], position]);
            })
            .on('dragend', function (event) {
                var marker = event.target;
                var position = marker.getLatLng();
                var origposition = L.latLng(gp_lat, gp_lon);
                var distance = position.distanceTo(origposition);

                update_sidebar(distance, position.lat, position.lng);
                gpMarkerPolyline.setLatLngs([[gp_lat, gp_lon], position]);
            });

        moving_marker.bindPopup('Premjesti na željeno mjesto');
        moving_marker.addTo(map);
        //moving_flag = false; //user will now interact with placed marker until he is done
    }

    function destroy_moving_marker() {
        map.removeLayer(moving_marker);
//        moving_marker.clearLayers();
        moving_marker = null;
    }

    osmba.guideposts.prototype.cancel_moving = function () {
        moving_flag = false;
        if (moving_marker) {
            destroy_moving_marker();
        }
        hide_sidebar();
    }

    osmba.guideposts.prototype.finish_moving = function () {

        if (moving_marker) {
            final_lat = moving_marker.getLatLng().lat;
            final_lon = moving_marker.getLatLng().lng;
        } else {
            toastr.error('Prvo izaberite novu poziciju.',
                         'Greška!',
                        {
                            closeButton: true,
                            positionClass: "toast-bottom-center",
                            timeOut: 0
            });
            return; // Do not sent false move request
        }

        var dataStr = 'id=' + gp_id + '&lat=' + final_lat + '&lon=' + final_lon;

        //tkk - not used
        //if (osmba.user && osmba.user.username) {
        //    dataStr = dataStr + '&lname=' + osmba.user.username;
        //}

        var note = document.getElementById("gp_usr_message").value;
        if (note.length > 0) {
          dataStr = dataStr + '&note=' + note;
        }

        $.ajax({
            type: 'POST',
            url: osmba.photoDbUrl + 'api/move',
            data: dataStr,
            async: false,
            xhrFields: {
              withCredentials: true
            },
            timeout: 3000
        })
            .done(function (data) {
                toastr.success('Nova pozicija je spašena na serveru.', 'Hvala!', {
                       closeButton: true,
                       positionClass: "toast-bottom-center"
                });
                if (moving_marker) {
                    destroy_moving_marker();
                }
                moving_flag = false;
                hide_sidebar();
                return true;
            })
            .fail(function(jqXHR, textStatus, errorThrown ) {
              var status = jqXHR.status;
              var statusText = jqXHR.statusText;
              console.log('move failed ' + status);
              if (status == 401) {
                need_api_auth = true;
                toastr.error('Niste prijavljeni.',
                            'Greška!',
                            {
                                closeButton: true,
                                positionClass: "toast-bottom-center",
                                timeOut: 0
                });
              } else {
                toastr.error('Spašavanje nove pozicije nije uspjelo. ' + status + ': ' + statusText,
                            'Greška!',
                            {
                                closeButton: true,
                                positionClass: "toast-bottom-center",
                                timeOut: 0
                });
              }
              return false;
            })
            .always(function (data) {
            });

        if(need_api_auth) {
            toastr.error('Niste prijavljeni.',
                        'Greška!',
                        {
                            closeButton: true,
                            positionClass: "toast-bottom-center",
                            timeOut: 0
            });
        }
    }

    function update_sidebar(distance, lat, lon) {
        var info = document.getElementById("guidepost_move_info");

        info.innerHTML = "<label for='lln'>lat, lon:</label>";
        info.innerHTML += "<input type='text' class='form-control' id='lln' readonly value='" + lat.toFixed(6) + ", " + lon.toFixed(6) + "'>";
        info.innerHTML += "<label for='lld'>Udaljenost:</label>";
        info.innerHTML += "<input type='text' class='form-control' id='lld' readonly value='" + distance.toFixed(1) + "m" + "'>";
    }

    function hide_sidebar() {
        sidebar.hide();
        if (popupMarker) {
            popupMarker.setOpacity(1);
            popupMarker = null;
        }
        map.removeLayer(gpCircle);
        map.removeLayer(gpMarkerPolyline);
    }

    function show_sidebar() {
        sidebar.setContent(sidebar_init());
        sidebar.on('hidden', guideposts.cancel_moving);
        sidebar.show();

        var auth = false;
        xhr = $.ajax({
            url: osmba.photoDbUrl + 'api/logged',
            async: false,
            xhrFields: {
              withCredentials: true
            },
        })
          .done(function() {
            auth = true; return true;
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            var inner = [];
            var content = document.getElementById("sidebar-content");
            inner.push("<h4>Niste prijavljeni!</h4>");
            inner.push("<p class='text-center'><a href='" + osmba.photoDbUrl + "' target='_blank'>Prijavite se</a> u foto bazu podataka");
            content.innerHTML = inner.join('');

            return false;
          });

        if(!auth) return;

        var inner = [];
        var content = document.getElementById("sidebar-content");

        inner.push("<h4>Pomjeranje slike</h4>");
        inner.push("<p class='mark text-center'>Izaberite novu poziciju i pritisnite dugme [Pomjeriti ovamo]");
        inner.push("<h5>Trenutna pozicija</h5>");
        inner.push("<label for='llc'>lat, lon:</label>");
        inner.push("<input type='text' class='form-control' id='llc' readonly value='" + gp_lat.toFixed(6) + ", " + gp_lon.toFixed(6) + "'>");
        inner.push("<h5>Pomjeriti na</h5>");
        inner.push("<div id='guidepost_move_info'><p class='mark text-center'>Kliknite u mapu</p>");
        inner.push("</div>");
        inner.push("<h5>Dodati poruku</h5>");
        inner.push("<textarea class='form-control' rows='3' id='gp_usr_message' placeholder='moja poruka…'></textarea>");
        inner.push("<hr>");
        inner.push("<button class='btn btn-default btn-xs' onclick='javascript:guideposts.cancel_moving()'>Otkazati</button>");
        inner.push("<button class='btn btn-default btn-xs pull-right' onclick='javascript:guideposts.finish_moving()'>Pomjeriti ovamo</button>");
        inner.push("</div>");
        inner.push("<hr><img class='thumbnail center-block' src='" + popupThumbnail + "'/>");

        content.innerHTML = inner.join('');
    }

    osmba.guideposts.prototype.move_point = function (gid, glat, glon) {
        if (!moving_flag) {
            moving_flag = true;
            gp_id = gid;
            gp_lat = glat;
            gp_lon = glon;
            show_sidebar();
            popupMarker.setOpacity(0.5);
            popupMarker.closePopup();
            gpCircle.setLatLng([glat, glon]).addTo(map);
        }
    }

    function isLayerChosen() {
        return map.hasLayer(markers);
    }

    function request_from_url(url, success_callback, error_callback) {
        var defaultParameters = {
            outputFormat: 'application/json'
        };

        var customParams = {
            output: 'geojson',
            bbox: map.getBounds().toBBoxString(),
        };
        var parameters = L.Util.extend(defaultParameters, customParams);

        xhr = $.ajax({
            url: url + L.Util.getParamString(parameters),
            xhrFields: {
              withCredentials: true
            },
            success: success_callback,
            error: error_callback
        });

    }

    function load_data() {

        if (!isLayerChosen())
            return;

        if (typeof xhr !== 'undefined') {
            xhr.abort();
        }

        if (map.getZoom() > 1) {

            markers.clearLayers();

            var geo_json_url = osmba.photoDbUrl + 'api/show';
            request_from_url(geo_json_url, retrieve_geojson, error_gj)

            //geo_json_url = 'https://api.openstreetmap.ba/commons';
            //request_from_url(geo_json_url, retrieve_commons, error_gj)

        } else {
            layer_guidepost.clearLayers();
        }
    }

    function retrieve_geojson(data) {
        layer_guidepost.clearLayers();
        if (data != "") {
            layer_guidepost.addData(data); //we have text/json instead of api.osm.ba with text/plain
            markers.addLayer(layer_guidepost);
            map.addLayer(markers);
        }
    }

    function retrieve_commons(data) {
        layer_commons.clearLayers();
        layer_commons.addData(JSON.parse(data));
        markers.addLayer(layer_commons);
        map.addLayer(markers);
    }

    function error_gj(data) {
        console.log(data);
    }

    function sidebar_init() {
        var hc = "";

        hc += "<div class='sidebar-inner'>";
        hc += "<!--sidebar from guideposts--> ";
        hc += "  <div id='sidebar-content'>";
        hc += "  </div>";
        hc += "</div>";

        return hc;
    }

    function update_progress_bar(processed, total, elapsed, layers_array) {
        if (elapsed > 1000) {
            // if it takes more than a second to load, display the progress bar:
            // tbd see http://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.50000.html
        }

        if (processed === total) {
            // all markers processed - hide the progress bar:
        }
    }
};

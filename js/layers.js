// (c) 2016 osmcz-app, https://github.com/osmcz/osmcz

var osmba = osmba || {};
osmba.layers = function (map, baseLayers, overlays, controls) {
    // -- constructor --

    var devicePixelRatio = window.devicePixelRatio || 1,
        retinaSuffix = devicePixelRatio >= 2 ? '@2x' : '';
    var osmAttr = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'; //abbrevation not recommended on other websites

    var thunderforestAPIkey = '00291b657a5d4c91bbacb0ff096e2c25';
    var mapboxAPIkey = "pk.eyJ1IjoiemJ5Y3oiLCJhIjoiY2owa3hrYjF3MDAwejMzbGM4aDNybnhtdyJ9.8CIw6X6Jvmk2GwCE8Zx8SA"; // constrained to referer openstreetmap.cz + devosm.zby.cz
    var maptilerAPIkey = "aiziPqQPPZidvRMvcFaj";

    var mt_streets = L.tileLayer("https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}" + retinaSuffix + ".png?key=" + maptilerAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a>',
        code: 'g',
        basic: true
    });

    var mt_topo= L.tileLayer("https://api.maptiler.com/maps/outdoor/256/{z}/{x}/{y}" + retinaSuffix + ".png?key=" + maptilerAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a>',
        code: 'y',
    });

    var mapbox = L.tileLayer('https://{s}.tiles.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=' + mapboxAPIkey, {
        maxZoom: 24,
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        code: 'x',
        tileSize: 512,
        zoomOffset: -1,
    });

    var turisticka = L.tileLayer("https://tile.poloha.net/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        code: 'k'
    });

    var opentopomap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="https://opentopomap.org/">OpenTopoMap</a>',
        code: 'u'
    });

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: osmAttr + ', CC-BY-SA 2.0',
        code: 'd',
        basic: true,
        osmbaDefaultLayer: true,
    });

    var ocm = L.tileLayer("https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://opencyclemap.org">OpenCycleMap</a>',
        code: 'c',
        basic: true
    });

    var thunderoutdoor = L.tileLayer("https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/outdoors/">Thunderforest</a>',
        code: 'f'
    });


    var hikebike = L.tileLayer(osmba.fakeHttps + "{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.hikebikemap.org">Hike &amp; Bike Map</a>',
        code: 'h'
    });

    var mtb = L.tileLayer(osmba.fakeHttps + "tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.mtbmap.cz">mtbmap.cz</a>',
        code: 'm',
        basic: true
    });

    var akvarel = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
        attribution: '&copy; CC-BY-SA <a href="https://openstreetmap.org/copyright">OSM</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 's'
    });

    var toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        attribution: '&copy; CC-BY-SA <a href="https://openstreetmap.org/copyright">OSM</a>, imagery <a href="http://maps.stamen.com">Stamen Design</a>',
        maxZoom: 18,
        code: 'n'
    });

    var dopravni = L.tileLayer("https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/transport/">Thunderforest</a>',
        code: 't',
        basic: true
    });

    var opnv = L.tileLayer("https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="https://www.öpnvkarte.de/">öpnvkarte</a>',
        code: 'ö'
    });

    var menepopisku = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}" + retinaSuffix + ".png", {
        maxZoom: 24, //umi az 30 a mozna i vic
        attribution: osmAttr + ', <a href="https://carto.com/attributions">CARTO</a>',
        code: 'b'
    });

    var ortofoto = L.tileLayer.wms('https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/service.svc/get', {
        layers: 'GR_ORTFOTORGB',
        format: 'image/jpeg',
        transparent: false,
        crs: L.CRS.EPSG4326,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>',
        code: 'o',
        basic: true
    });

    var ipr_last = L.tileLayer("https://osm-{s}.zby.cz/tiles_ipr_last.php/{z}/{x}/{y}.png", {
        minZoom: 12,
        maxZoom: 22,
        bounds: [[50.255, 14.113], [49.88, 14.8144]],
        attribution: '&copy; <a href="http://www.iprpraha.cz/clanek/1305/ortofotomapy">IPR Praha</a>',
        code: 'i'
    });

    var ipr_vege = L.tileLayer("https://osm-{s}.zby.cz/tiles_ipr_vege.php/{z}/{x}/{y}.png", {
        minZoom: 12,
        maxZoom: 22,
        bounds: [[50.255, 14.113], [49.88, 14.8144]],
        attribution: '&copy; <a href="http://www.iprpraha.cz/clanek/1305/ortofotomapy">IPR Praha</a>',
        code: 'j'
    });

    var spinal = L.tileLayer("https://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/spinal-map/">Thunderforest</a>',
        code: 'a'
    });

    var pioneer = L.tileLayer("https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}" + retinaSuffix + ".png?apikey=" + thunderforestAPIkey, {
        maxZoom: 22,
        attribution: osmAttr + ', <a href="https://www.thunderforest.com/maps/pioneer/">Thunderforest</a>',
        code: 'p'
    });

    // automatically add/remove orotofotoOverlay
    map.on('baselayerchange', function (event) {
        if (event.layer == ortofoto || event.layer == akvarel) {
            setTimeout(function () {  // needs timeout or doesn't work
                if (!map.hasLayer(ortofotoOverlay)) {
                    map.addLayer(ortofotoOverlay);
                }

                if (event.layer == ortofoto) {
                    vrstevniceOverlay.setUrl(vrstevniceOverlayOrtoUrl);
                    katastralniMapaOverlay.setParams({layers: katastralniMapaOverlayLayersOrto}, true);
                } else {
                    vrstevniceOverlay.setUrl(vrstevniceOverlayUrl);
                    katastralniMapaOverlay.setParams({layers: katastralniMapaOverlayLayers}, true);
                }
                vrstevniceOverlay.redraw();
                katastralniMapaOverlay.redraw();
            }, 300);
        } else {
            setTimeout(function () {  // needs timeout or doesn't work
                if (map.hasLayer(ortofotoOverlay)) {
                    map.removeLayer(ortofotoOverlay);
                }
                vrstevniceOverlay.setUrl(vrstevniceOverlayUrl);
                vrstevniceOverlay.redraw();

                katastralniMapaOverlay.setParams({layers: katastralniMapaOverlayLayers}, true);
                katastralniMapaOverlay.redraw();
            }, 300);
        }
    });


    // --- overlays

    var stravaAllOverlay = L.tileLayer("https://osm.fit.vutbr.cz/strava/all/{z}/{x}/{y}.png", {
        maxZoom: 16,
        attribution: osmAttr + ', <a href="http://www.strava.com">strava.com</a>',
        code: 'S',
        opacity: 0.6,
        basic: true
    });

    var turistikaOverlay = L.tileLayer("https://tile.poloha.net/kct/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        opacity: 0.6,
        code: 'K',
        basic: true
    });

    var ortofotoOverlay = L.tileLayer('https://{s}.tiles.mapbox.com/styles/v1/zbycz/ckc50f05a17ww1iqgpsf15tqs/tiles/{z}/{x}/{y}?access_token=' + mapboxAPIkey, {
        maxZoom: 24,
        attribution: osmAttr + ", <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
        opacity: 1,
        code: 'O',
        tileSize: 512,
        zoomOffset: -1,
    });
    

    var vrstevniceOverlayUrl = "https://tile.poloha.net/contours/{z}/{x}/{y}.png";
    var vrstevniceOverlayOrtoUrl = "https://tile.poloha.net/contours_ortofoto/{z}/{x}/{y}.png";
    var vrstevniceOverlay = L.tileLayer(vrstevniceOverlayUrl, {
        maxZoom: 20,
        attribution: osmAttr + ', <a href="http://www.poloha.net">poloha.net</a>',
        opacity: 0.6,
        code: 'V'
    });

    var zimskiOverlay = L.tileLayer("https://www.opensnowmap.org/tiles-pistes/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: osmAttr + ', <a href="http://www.opensnowmap.org">opensnowmap.org</a>',
        code: 'Z',
        basic: true
    });

    var lonviaHikingOverlay = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://hiking.lonvia.de">Lonvias Hiking</a>',
        opacity: 0.6,
        code: 'H'
    });

    var lonviaCyclingOverlay = L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: osmAttr + ', <a href="http://cycling.lonvia.de">Lonvias Cycling</a>',
        opacity: 0.6,
        code: 'C',
        basic: true
    });

    var katastralniMapaOverlayLayers = 'parcelni_cisla,obrazy_parcel,RST_KMD,hranice_parcel,DEF_BUDOVY,RST_KN,dalsi_p_mapy,prehledka_kat_prac,prehledka_kat_uz,prehledka_kraju-linie',
        katastralniMapaOverlayLayersOrto = 'parcelni_cisla_i,obrazy_parcel_i,RST_KMD_I,hranice_parcel_i,DEF_BUDOVY,RST_KN_I,dalsi_p_mapy_i,prehledka_kat_prac,prehledka_kat_uz,prehledka_kraju-linie';
    var katastralniMapaOverlay = L.tileLayer.wms('https://services.cuzk.cz/wms/wms.asp', {
        layers: katastralniMapaOverlayLayers,
        format: 'image/png',
        transparent: true,
        crs: L.CRS.EPSG3857,
        minZoom: 7,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.cuzk.cz">ČÚZK</a>',
        code: 'X'
    });

    var lpisOverlay = L.tileLayer.wms('https://eagri.cz/public/app/wms/public_DPB_PB_OPV.fcgi', {
        layers: 'DPB_UCINNE,DPB_UCINNE_KOD',
        format: 'image/png',
        transparent: true,
        crs: L.CRS.EPSG4326,
        attribution: " <a href='https://www.eagri.cz'>eagri.cz</a>",
        code: 'L'
    });

    // Poloha.net - RUIAN layers
    var parcelyUrl = 'https://tile.poloha.net/parcely/{z}/{x}/{y}.png',
        uliceUrl = 'https://tile.poloha.net/ulice/{z}/{x}/{y}.png',
        budovyUrl = 'https://tile.poloha.net/budovy/{z}/{x}/{y}.png',
        todobudovyUrl = 'https://tile.poloha.net/budovy-todo/{z}/{x}/{y}.png',
        landuseUrl = 'https://tile.poloha.net/landuse/{z}/{x}/{y}.png',
        adresyUrl = 'https://tile.poloha.net/adresy/{z}/{x}/{y}.png';

    var ruianAttr = '&copy; <a href="http://www.cuzk.cz">ČÚZK</a> (<a href="https://www.poloha.net">poloha.net</a>)';

    var ruianParcelyOverlay = L.tileLayer(parcelyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '1'
        }),
        ruianUliceOverlay = L.tileLayer(uliceUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '2'
        }),
        ruianBudovyOverlay = L.tileLayer(budovyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '3'
        }),
        ruianBudovyTodoOverlay = L.tileLayer(todobudovyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '4'
        }),
        ruianLanduseOverlay = L.tileLayer(landuseUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '5'
        }),
        ruianAdresyOverlay = L.tileLayer(adresyUrl, {
            minZoom: 12,
            maxZoom: 20,
            attribution: ruianAttr,
            code: '6'
        });

    var powerOverlay = L.tileLayer('https://tiles-{s}.openinframap.org/power/{z}/{x}/{y}.png', {
        attribution: osmAttr + ', <a href="https://OpenInfraMap.org/about.html">OpenInfraMap.org</a>',
        code: 'W'
    });
    var commsOverlay = L.tileLayer('https://tiles-{s}.openinframap.org/telecoms/{z}/{x}/{y}.png', {
        attribution: osmAttr + ', <a href="https://OpenInfraMap.org/about.html">OpenInfraMap.org</a>',
        code: 'M'
    });


    // Base group
    baseLayers["Osnovno"] = {};
    baseLayers["Osnovno"]["Mapbox streets"] = mapbox;
    baseLayers["Osnovno"]["OpenStreetMap Mapnik"] = osm;
    baseLayers["Osnovno"]["OpenTopoMap"] = opentopomap;
    baseLayers["Osnovno"]["Manje teksta"] = menepopisku;

    // Information group
    baseLayers["Informacije"] = {};
    overlays["Informacije"] = {};
    overlays["Informacije"]["OSM napomene"] = new osmba.osmNotesLayer();

    // Hiking group
    baseLayers["Turizam"] = {};
    baseLayers["Turizam"]["Biciklizam+pješačenje (EU)"] = mtb;
    baseLayers["Turizam"]["Hikebikemap.org"] = hikebike;

    overlays["Turizam"] = {};

    // Sport group
    baseLayers["Sport"] = {};
    baseLayers["Sport"]["OpenCycleMap"] = ocm;

    overlays["Sport"] = {};
    overlays["Sport"]["Biciklističke trase EU"] = lonviaCyclingOverlay;
    overlays["Sport"]["Zimski sportovi"] = zimskiOverlay;

    // Transport group
    baseLayers["Saobraćaj"] = {};
    baseLayers["Saobraćaj"]["Saobraćaj"] = dopravni;
    baseLayers["Saobraćaj"]["Saobraćaj öpnv"] = opnv;

    // Efects group
    baseLayers["Efekti"] = {};
    baseLayers["Efekti"]["Akvarel"] = akvarel;
    baseLayers["Efekti"]["Toner"] = toner;
    baseLayers["Efekti"]["Spinal"] = spinal;
    baseLayers["Efekti"]["Pioneer"] = pioneer;

    // Special group
    overlays["Specijalizirani"] = {};
};

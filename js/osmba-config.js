// (c) 2016-2018 osmba-app, https://github.com/osmba/osmba

var osmba = osmba || {};
osmba.production = ['openstreetmap.ba' ].indexOf(location.hostname) !== -1;
osmba.basePath = osmba.production ? '/theme/' : '';
osmba.fakeHttps = osmba.production ? '/proxy.php/' : 'http://';
osmba.user = false; //user object of currently logged in user. Defined later in @layout.latte
osmba.photoDbUrl = osmba.production ? 'https://osm.fit.vutbr.cz/fody/' : 'https://osm.fit.vutbr.cz/fody-dev/';

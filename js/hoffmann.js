var hoffmannMap;
var layerControl;

function initMap(event) {
	hoffmannMap = L.map('HoffmannMap');
	hoffmannMap.setView([53.04229, 8.6335013], 14);

	// initialize leaflet controls
	initLeafletControls();
	
	addHoffmanMarker();	

	// add hoffmann deliveryAreas to map
	addHoffmannDeliveryAreas();

	// add hoffmann places to map
	addHoffmannPlaces();
}

function bindPlacesPopup(feature, layer) {
	if (feature.properties &&
		feature.properties.Filialname) {
		layer.bindPopup(feature.properties.Filialname);
	}
}

function placesAsCircleMarker(pointFeature, latlng) {
	return L.circleMarker(latlng);
}

function stylePlace(feature) {
	if (feature && feature.properties.Typ) {
		switch (feature.properties.Typ) {
			case 'Filiale': return { color: "#00ffff" };
			case 'Hauptsitz': return { color: "#ff0000" };
		}
	}
}

function addHoffmannPlaces() {
	// init places as GeoJSON layer
	var placesLayer = L.geoJSON(places, {
		onEachFeature: bindPlacesPopup,
		pointToLayer: placesAsCircleMarker,
		style: stylePlace
	});

	// add to layer control
	layerControl.addOverlay(placesLayer, "Filialen Hoffmann");

	// add to map
	placesLayer.addTo(hoffmannMap);
}

function bindDeliveryAreasPopup(feature, layer) {
	if (feature.properties &&
		feature.properties.Filiale && feature.properties.Lieferkost) {
		var popupHtml = "<b>Liefergebiet zu Filiale: </b><i>" + feature.properties.Filiale + "</i>";
		popupHtml += "<br/><br/>";
		popupHtml = popupHtml + "<b>Lieferkosten: </b>" + feature.properties.Lieferkost + " &euro;";


		layer.bindPopup(popupHtml);
	}
}

function styleDeliveryArea(feature) {
	if (feature && feature.properties && feature.properties.Lieferkost) {
		if (feature.properties.Lieferkost < 1) {
			return { color: "#00ff00" };
		}
		else if (feature.properties.Lieferkost >= 1 && feature.properties.Lieferkost < 2) {
			return { color: "#ffff00" };
		}
		else {
			return { color: "#ff0000" };
		}
	}
}

function addHoffmannDeliveryAreas() {
	// init deliveryAreas as GeoJSON layer
	var deliveryAreasLayer = L.geoJSON(deliveryAreas, {
		onEachFeature: bindDeliveryAreasPopup,
		style: styleDeliveryArea
	});

	// add to layer control
	layerControl.addOverlay(deliveryAreasLayer, "Liefergebiete Hoffmann");

	// add to map
	deliveryAreasLayer.addTo(hoffmannMap);

	// update map by calling fit bounds for bounding box from deliveryAreas layer
	hoffmannMap.fitBounds(deliveryAreasLayer.getBounds());
}

function addHoffmanMarker() {
	if (hoffmannMap && layerControl) {
		var hoffmannMarker = L.marker([53.0422836, 8.6356286]);
		hoffmannMarker.bindPopup("<b>Getränke Hoffmann</b>");

		layerControl.addOverlay(hoffmannMarker, "Hauptfiliale Hoffmann");

		hoffmannMarker.addTo(hoffmannMap);
	}
}

function initLeafletControls() {
	// make sure that hoffmannMap is not undefined
	if (hoffmannMap) {
		// add all necessary  leaflet controls

		var topPlusLayer = L.tileLayer.wms(
			"https://sgx.geodatenzentrum.de/wms_topplus_open?",
			{
				format: "image/png",
				layers: "web",
				attribution: '&copy; <a href="http://sgx.geodatenzentrum.de/web_geo_okapi/">GeoBasis-DE/BKG 2019</a>'
			});

		var osmLayer = L.tileLayer.wms(
			"http://maps.heigit.org/osm-wms/service?",
			{
				format: "image/png",
				layers: "osm_auto:all",
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			});

		var dtkLayer = L.tileLayer.wms(
			"https://www.wms.nrw.de/geobasis/wms_nw_dtk?",
			{
				format: "image/png",
				layers: "nw_dtk_col",
				attribution: "Map data &copy; <a href='https://www.bezreg-koeln.nrw.de/brk_internet/geobasis/'>Geobasis NRW</a>"
			});

		// add one layer to map
		topPlusLayer.addTo(hoffmannMap);

		// add static refrerence to AttributionControl
		var attrControl = hoffmannMap.attributionControl;
		attrControl.addAttribution("Hochschule Bochum");
		attrControl.setPosition('bottomright');


		// scale-Control
		scaleControl = L.control.scale(
			{
				maxWidth: 200, metric: true, imperial: false
			});
		scaleControl.addTo(hoffmannMap);
		scaleControl.setPosition('bottomleft');

		// LayerControl
		var baseLayers =
		{
			"Top Plus": topPlusLayer,
			"Open-Street-Map": osmLayer,
			"NRW DTK": dtkLayer
		};

		// initilialize overlays as empty set
		var overlayLayers = {};

		layerControl = L.control.layers(baseLayers, overlayLayers);
		layerControl.addTo(hoffmannMap);
		layerControl.setPosition('topright');


		// Zoom-Control
		var zoomControl = hoffmannMap.zoomControl;
		zoomControl.setPosition('topleft');
	}
}

document.addEventListener('DOMContentLoaded', initMap);

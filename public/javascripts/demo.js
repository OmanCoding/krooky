Dropzone.autoDiscover = false;
$(document).ready(function() {
	var myDropzone = new Dropzone("div#uploadArea", {
		//url: "http://localhost:3000/google/ocr/file",
		url: '/google/ocr/file',
		success: function(status, res) {
			//console.log(res)
			process(res);
		},
		acceptedFiles: ".jpeg,.jpg,.png"
	});
});

var northings;
var eastings;

function process(data) {
	console.log(data);
	/*var northings_regex = /\d{7,7}[.,]\d{2,2}/g;
	eastings_regex = /\d{6,6}[.,]\d{2,2}/g;
	northings = data.match(northings_regex).map(function(val){
		return Number(val.replace(',','.')) ;
	}) || [];
	data = data.replace(northings_regex, "");
	eastings = data.match(eastings_regex).map(function(val){
		return Number(val.replace(',','.')) ;
	}) || [];

	*/

	var en_regex = /\d{6,6}[., ]\d{1,2} \d{7,7}[., ]\d{2,2}/g;
	var ne_regex = /\d{7,7}[., ]\d{1,2} \d{6,6}[., ]\d{2,2}/g;

	eastings = [];
	northings = [];

	var en = data.match(en_regex);
	if (en) {
			en.map(function (val) {
			var split = val.split(' ');
			var e = Number(split[0].replace(',','.'));
			var n = Number(split[1].replace(',','.'));
			
			eastings.push(e);
			northings.push(n)
		});
	}

	if (!en) {
		var ne = data.match(ne_regex).map(function (val) {
			var split = val.split(' ');
			var e = Number(split[1].replace(',','.'));
			var n = Number(split[0].replace(',','.'));
			
			eastings.push(e);
			northings.push(n)
		});
	}

	console.log(northings, eastings);

	initMap();

}

function initMap() {

	var latlong = eastings.map(function(val, idx) {
		return proj4(utm,wgs84,[eastings[idx], northings[idx]])
	})

	console.log(latlong[0][1],latlong[0][0])


	var map = new google.maps.Map(document.getElementById("map"), {
		zoom: 19,
		center: { lat: latlong[0][1], lng: latlong[0][0] },
		mapTypeId: "satellite"
	});




	var LandCoordinates = latlong.map(function (val) {
		return { lat: val[1], lng: val[0]}
	})
	LandCoordinates.push({ lat: latlong[0][1], lng: latlong[0][0] })

	var LandArea = new google.maps.Polyline({
		path: LandCoordinates,
		geodesic: false,
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

	LandArea.setMap(map);
}

var utm = "+proj=utm +zone=40N";
var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
//console.log(proj4(utm,wgs84,[539884, 4942158]));


var directionsDisplay;
var directionsService;
var map;
var LocationCircle;
var markers = [];
var lastrequest;
var dt = new Date();
var geog = '0,0';
var centrelat = 53.9813814;
var centrelong = -1.0936039;
var initzoom = 0;
var filter1 = -1;
var filter2 = -1;
var pagenum = 0;
var pagecount = 20;
var packages = 0;
var IQisinfinite = 0;
var ref = document.URL;
var spinner;
var directory = 0;
var locationwarning = 'Locations must be selected from the list that appears when you enter a location.\nIf your location is not listed, choose somewhere close by. \nPlease complete the location information.';
var warningplayed = 0;
var IQusecheckbox = false;
var IQshowpackagetabs = false;
var IQpackagesfirst = false;
var IQonlypackages = false;
var IQfilterpackagesonly = false;
var IQsingleassetid = 0;
var IQclassfilter = false;
var IQassetgroup = 0;
var IQferrycount = 0;
var IQtollzone = false;
var avoidHighways = false;
var countrycode = 'GB';
var IQxy;
var donotpage = false;
var showtabs;
var serviceid = 0;
var serviceguests = 0;
var IQassettype = 0;


if (typeof iqcountrycode !== 'undefined') {

        countrycode = iqcountrycode;
    
}


jQuery('input[type="text"]').keydown(function () {
    // Check input of the address boxes
    // Clear the data tags on data entry
    // Locations must be set from the drop down lists 
    if (event.which > 8 && event.which < 46) {
        return;
    }
    if (event.which > 111 && event.which < 145) {
        return;
    }
    var thisctrlarray = jQuery(this);
    setwarning(thisctrlarray[0]);
});


jQuery('input[type="text"]').change(function () {
    var thisctrlarray = jQuery(this);
    setwarning(thisctrlarray[0]);
});

function setwarning(thisctrl) {
    if (thisctrl.id === 'pickup_clone' || thisctrl.id === 'address' || thisctrl.id === 'ceremony' || thisctrl.id === 'reception') {
        thisctrl.className = 'IQlongtextbox';
        thisctrl.setAttribute('data-place', '');
        thisctrl.setAttribute('data-address', '');
        if (thisctrl.value === '') {
            thisctrl.style.borderColor = '#bbb';
            thisctrl.style.borderWidth = 'thin';
        }
        else {
            thisctrl.style.borderColor = 'red';
            thisctrl.style.borderWidth = 'medium';

        }
    }
}

jQuery(window).on('resize scroll', function () {
    if (jQuery('#IQpage').length) {
        if (jQuery('#IQpage').isInViewport()) {
            // do something
            var nxtpage = parseInt(jQuery('#IQpage').attr('data-nextpage'));
            if (nxtpage > 0) {
                jQuery('#IQpage').attr('data-nextpage', -1);
                setpage(nxtpage, 1);
            }
        }
    }
});

jQuery.fn.isInViewport = function () {
    var elementTop = jQuery(this).offset().top;
    var elementBottom = elementTop + jQuery(this).outerHeight();

    var viewportTop = jQuery(window).scrollTop();
    var viewportBottom = viewportTop + jQuery(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

function IQtabchanged(evt, ispackagetab, groupid) {
    IQfilterpackagesonly = ispackagetab;
    IQassetgroup = groupid;
    var IQtabbuttons = document.getElementsByClassName('IQtabbutton');
    for (i = 0; i < IQtabbuttons.length; i++) {
        IQtabbuttons[i].className = IQtabbuttons[i].className.replace(' IQtabselected', '');
    }
    evt.currentTarget.className += ' IQtabselected';
    jQuery('div').remove('#IQpage');
    jQuery('div').remove('.IQasset');
    // loadcars(dt, ref, geog, 0);
    setpage(0, 1);
}

get_host();
setGeog();
setAssetType();

function setGeog() {
    var hf = document.getElementById('iqlatlong');
    if (hf) {
        hf = document.getElementById('iqlatlong');
        if (hf.value != '') {
            geog = hf.value;
        }
    }
}

function setAssetType() {
		var hf = document.getElementById('IQassettype');
		if (hf) {
			hf = document.getElementById('IQassettype');		
			if (hf.value != ''){
				IQassettype = hf.value;
			}
		}
	}
function overrideAssetType(ctrl) {
    IQassettype = ctrl.options[ctrl.selectedIndex].value;
    pagenum = 0;
    loadcars(dt, ref, geog, pagenum);
}
  
function gotofirstitem() {
    var t = document.getElementById('IQtransport');
    t.scrollIntoView();
    adjustscroll(50);
}

function adjustscroll(yvalue) {
    var y = jQuery(window).scrollTop();
    jQuery('html, body').animate({ scrollTop: y - yvalue }, 600);
}

function do_filter() {
    var f1 = document.getElementById('cmbfilter1');
    filter1 = f1.value;
    var f2 = document.getElementById('cmbfilter2');
    filter2 = f2.value;
    pagenum = 0;
    IQisinfinite = 0;
    loadcars(dt, ref, geog, pagenum);
}

function setpage(p, inf) {
    pagenum = p;
    IQisinfinite = inf;
    loadcars(dt, ref, geog, pagenum);
    if (inf === 0) { gotofirstitem(); }
}

function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

function playLocationWarning() {
    warningplayed = 1;
    var audio = new Audio('https://www.instant-quote.co/audio/aboutLocations.m4a');
    audio.play();
}

function initialize() {

    ref = get_host();

	continueloading();
	
    directionsDisplay = new google.maps.DirectionsRenderer();
    var loc = new google.maps.LatLng(centrelat, centrelong);   //location of business over writes this later
    var mapOptions = {
        center: loc,
        zoom: initzoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapId: "IQmap",
        streetViewControl: false
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);

    var input1 = /** @type {HTMLInputElement} */(document.getElementById('address'));
    var input2 = /** @type {HTMLInputElement} */(document.getElementById('ceremony'));
    var input3 = /** @type {HTMLInputElement} */(document.getElementById('reception'));
    var input4 = /** @type {HTMLInputElement} */(document.getElementById('pickup_clone'));

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map
    });
    var autocomplete4 = new google.maps.places.Autocomplete(input4, {
        fields: ["name", "geometry.location", "place_id", "formatted_address", "address_component"]
    });
    autocomplete4.setComponentRestrictions({ 'country': [countrycode] });
    google.maps.event.addListener(autocomplete4, 'place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        input4.className = '';
        var place = autocomplete4.getPlace();
        if (!place.geometry) {
            // Inform the user that the place was not found and return.
            input4.className = 'notfound';
            input4.setAttribute('data-place', '');
            input4.setAttribute('data-address', '');
            input4.style.borderColor = 'red';
            input4.style.borderWidth = 'medium';
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
            url: 'https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        markers.push(marker);
        var address = '';
        if (place.address_components) {
            for (i = 0; i < place.address_components.length; i++) {
                address = address + place.address_components[i].short_name + ' ';
            }
        } else {
            address = place.formatted_address;
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);

        ref = get_host();
        input4.setAttribute('data-place', place.name);
        input4.setAttribute('data-address', address);
        input4.style.borderColor = 'green';
        input4.style.borderWidth = 'thin';
        input4.className = 'IQlongtextbox';
        geog = place.geometry.location.lat() + ',' + place.geometry.location.lng();
        pagenum = 0;
        IQisinfinite = 0;
        loadcars(dt, ref, geog, pagenum);
    });


    var autocomplete1 = new google.maps.places.Autocomplete(input1, {
        fields: ["name", "geometry.location", "place_id", "formatted_address", "address_component"]
    });
    autocomplete1.setComponentRestrictions({ 'country': [countrycode] });

    google.maps.event.addListener(autocomplete1, 'place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        input1.className = '';
        var place = autocomplete1.getPlace();
        if (!place.geometry) {
            // Inform the user that the place was not found and return.
            input1.className = 'notfound';
            input1.setAttribute('data-place', '');
            input1.setAttribute('data-address', '');
            input1.style.borderColor = 'red';
            input1.style.borderWidth = 'medium';
            playLocationWarning();
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
            url: 'https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        markers.push(marker);
        var address = '';
        if (place.address_components) {
            for (i = 0; i < place.address_components.length; i++) {
                address = address + place.address_components[i].short_name + ' ';
            }
        } else {
            address = place.formatted_address;
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);

        ref = get_host();
        input1.setAttribute('data-place', place.name);
        input1.setAttribute('data-address', address);
        input1.style.borderColor = 'green';
        input1.style.borderWidth = 'thin';
        input1.className = 'IQlongtextbox';
        geog = place.geometry.location.lat() + ',' + place.geometry.location.lng();
        pagenum = 0;
        IQisinfinite = 0;
        loadcars(dt, ref, geog, pagenum);
    });
    if (!!input2) {
        var autocomplete2 = new google.maps.places.Autocomplete(input2, {
            fields: ["name", "geometry.location", "place_id", "formatted_address", "address_component"]
        });
        autocomplete2.setComponentRestrictions({ 'country': [countrycode] });

        google.maps.event.addListener(autocomplete2, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            input2.className = '';
            var place = autocomplete2.getPlace();
            if (!place.geometry) {
                // Inform the user that the place was not found and return.
                input2.className = 'notfound';
                input2.setAttribute('data-place', '');
                input2.setAttribute('data-address', '');
                input2.style.borderColor = 'red';
                input2.style.borderWidth = 'medium';
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setIcon(/** @type {google.maps.Icon} */({
                url: 'https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            markers.push(marker);
            var address = '';
            if (place.address_components) {
                for (i = 0; i < place.address_components.length; i++) {
                    address = address + place.address_components[i].short_name + ' ';
                }
            } else {
                address = place.formatted_address;
            }

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            infowindow.open(map, marker);
            input2.setAttribute('data-place', place.name);
            input2.setAttribute('data-address', address);
            input2.style.borderColor = 'green';
            input2.style.borderWidth = 'thin';
            input2.className = 'IQlongtextbox';
        });
    }
    if (!!input3) {
        var autocomplete3 = new google.maps.places.Autocomplete(input3, {
            fields: ["name", "geometry.location", "place_id", "formatted_address", "address_component"]
        });
        autocomplete3.setComponentRestrictions({ 'country': [countrycode] });

        google.maps.event.addListener(autocomplete3, 'place_changed', function () {
            infowindow.close();
            marker.setVisible(false);
            input3.className = '';
            var place = autocomplete3.getPlace();
            if (!place.geometry) {
                // Inform the user that the place was not found and return.
                input3.className = 'notfound';
                input3.setAttribute('data-place', '');
                input3.setAttribute('data-address', '');
                input3.style.borderColor = 'red';
                input3.style.borderWidth = 'medium';
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setIcon(/** @type {google.maps.Icon} */({
                url: 'https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png',
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            markers.push(marker);
            var address = '';
            if (place.address_components) {
                for (i = 0; i < place.address_components.length; i++) {
                    address = address + place.address_components[i].short_name + ' ';
                }
            } else {
                address = place.formatted_address;
            }

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            infowindow.open(map, marker);
            input3.setAttribute('data-place', place.name);
            input3.setAttribute('data-address', address);
            input3.style.borderColor = 'green';
            input3.style.borderWidth = 'thin';
            input3.className = 'IQlongtextbox';
        });
    }

    if (!!input1) {
        autocomplete1.bindTo('bounds', map);
    }
    if (!!input2) {
        autocomplete2.bindTo('bounds', map);
    }
    if (!!input3) {
        autocomplete3.bindTo('bounds', map);
    }
    if (!!input4) {
        autocomplete4.bindTo('bounds', map);
    }
}

// Sets the map on all markers in the array.
function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}
// Sets the map on all markers in the array.
function hidemarkers(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
}
// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function setquotehost() {
    // Used solely for directories
    var HFdirhost = document.getElementsByName('HFpostcode');
    for (var z = 0; z < HFdirhost.length; z++) {
        if (HFdirhost[z].type === 'hidden') {
            // Find the selected checkbox
            var prnt = HFdirhost[z].parentNode;
            var HFList = new Array([]);

            if (HFList = prnt.getElementsByTagName('input')) {
                for (var p = 0; p < HFList.length; p++) {
                    if (HFList[p].type === 'checkbox') {
                        var HFid = HFList[p].id;
                        if (document.getElementById(HFid).checked === true) {
                            if (!!prnt.getAttribute('data-host')) {
                                return prnt.getAttribute('data-host');
                            }
                            else {
                                return undefined;
                            }
                        }
                    }
                }
            }
        }
    }
}

function clearotherzips(zip, checkbox) {

    var HFzip = document.getElementsByName('HFpostcode');
    for (var z = 0; z < HFzip.length; z++) {
        if (HFzip[z].type === 'hidden') {
            // Returns the garage postcode
            if (zip !== HFzip[z].value) {
                // Find the checkbox and disable it if it is not
                // the selected box.
                var prnt = HFzip[z].parentNode;
                var HFList = new Array([]);
                if (HFList = prnt.getElementsByTagName('input')) {
                    for (var p = 0; p < HFList.length; p++) {
                        if (HFList[p].type === 'checkbox') {
                            // Returns the garage postcode
                            if (HFList[p] !== checkbox) {
                                HFList[p].checked === false;
                                var HFid = HFList[p].id;
                                document.getElementById(HFid).checked = false;
                            }
                            break;
                        }
                    }
                }
            }
        }
    }


    var HFlist = new Array([]);
    var prnt = checkbox.parentNode;
    if (HFList = prnt.getElementsByTagName('input')) {
        for (var p = 0; p < HFList.length; p++) {
            if (HFList[p].type === 'hidden') {
                // Returns the garage postcode
                thiszip = HFList[p].value;
                break;
            }
        }
    }

}
function drawrange(lat, lng, checkbox, x) {

    if (!!LocationCircle) {
        LocationCircle.setMap(null);
        LocationCircle = null;
    }

    if (checkbox.localName === 'img' || checkbox.localName === 'button') {

        var locationOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.4,
            strokeWeight: 1,
            fillColor: '#FF0000',
            fillOpacity: 0.05,
            map: map,
            center: new google.maps.LatLng(lat, lng), //''
            radius: x
        };
        // Add the circle for this city to the map.
        LocationCircle = new google.maps.Circle(locationOptions);
        // map.setCenter(new google.maps.LatLng(latlng));
        map.fitBounds(LocationCircle.getBounds());
    }
    else if (checkbox.checked === true) {
        var locationOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.4,
            strokeWeight: 1,
            fillColor: '#FF0000',
            fillOpacity: 0.05,
            map: map,
            center: new google.maps.LatLng(lat, lng), //''
            radius: x
        };
        // Add the circle for this city to the map.
        LocationCircle = new google.maps.Circle(locationOptions);
        // map.setCenter(new google.maps.LatLng(latlng));
        map.fitBounds(LocationCircle.getBounds());

        //uncheck other items that start at a differnt garage

        var rows = new Array();
        var thiszip;
        var HFlist = new Array();
        var prnt = checkbox.parentNode;
        if (HFList = prnt.getElementsByTagName('input')) {
            for (var p = 0; p < HFList.length; p++) {
                if (HFList[p].type === 'hidden') {
                    // Returns the garage postcode
                    thiszip = HFList[p].value;
                    break;
                }
            }
        }

        clearotherzips(thiszip, checkbox);

    }
}
function moveToLocation(lat, lng) {
    var center = new google.maps.LatLng(lat, lng);
    // using global variable:
    map.panTo(center);
}
function calcRoute(source, args) {

    jQuery('#processing').show();
    showspinner();
    if (document.getElementById('pickuplocation').style.display !== 'none') {

        document.getElementById('progressinfo').innerText = 'Calculating journeys.';

        var postcode = countCars();

        if (postcode === 0) {

            alert('Please check the items you would like a quote for.');
            document.getElementById('progressinfo').innerHTML = '';
            jQuery('#processing').hide();
            hidespinner();
            jQuery('#loader').hide();
            return;
            // e.preventDefault();
        }

        var ctrl1 = document.getElementById('address');
        var ctrl2 = document.getElementById('ceremony');
        var ctrl3 = document.getElementById('reception');

        //var startaddr = ctrl1.value;
        var startaddr;
        var wpa = '';
        var wpp = '';
        var sta = ctrl1.getAttributeNode('data-address').value;
        var stp = ctrl1.getAttributeNode('data-place').value;
        ctrl1.style.borderColor = '#bbb';
        ctrl1.style.borderWidth = 'thin';
        if (strStartsWith(sta, stp) === 0) {
            startaddr = stp + ', ' + sta;
        }
        else {
            startaddr = sta;
        }

        var endaddr;
        var waypointaddr;
        if (startaddr === '' || startaddr == null) {

            jQuery('#processing').hide();
            hidespinner();
            document.getElementById('progressinfo').innerHTML = '';
            ctrl1.parentElement.parentElement.scrollIntoView();
            adjustscroll(60);
            ctrl1.style.borderColor = 'red';
            ctrl1.style.borderWidth = 'medium';
            if (warningplayed === 0) {
                playLocationWarning();
            }
            else {
                alert(locationwarning);
            }

            return;
        }

        var celement = document.getElementById('ceremonylocation');

        if (!!celement) {
            if (celement.style.display !== 'none') {

                // if (ctrl2.value == '' || ctrl2.value == null) {
                ctrl2.style.borderColor = '#bbb';
                ctrl2.style.borderWidth = 'thin';
                if (ctrl2.getAttributeNode('data-address').value === '' || ctrl2.getAttributeNode('data-address').value === null) {
                    jQuery('#processing').hide();
                    hidespinner();
                    document.getElementById('progressinfo').innerHTML = '';
                    ctrl2.parentElement.parentElement.scrollIntoView();
                    adjustscroll(60);
                    ctrl2.style.borderColor = 'red';
                    ctrl2.style.borderWidth = 'medium';
                    if (warningplayed === 0) {
                        playLocationWarning();
                    }
                    else {
                        alert(locationwarning);
                    }


                    return;
                }
                else {
                    wpa = ctrl2.getAttributeNode('data-address').value;
                    wpp = ctrl2.getAttributeNode('data-place').value;
                    if (strStartsWith(wpa, wpp) === 0) {
                        waypointaddr = wpp + ', ' + wpa;
                    }
                    else {
                        waypointaddr = wpa;
                    }
                }
            }
            else {
                endaddr = startaddr;
            }
        }
        else {
            // if (ctrl2.value == '' || ctrl2.value == null) {
            if (!!ctrl2) {
                ctrl2.style.borderColor = '#bbb';
                ctrl2.style.borderWidth = 'thin';
                if (ctrl2.getAttributeNode('data-address').value === '' || ctrl2.getAttributeNode('data-address').value === null) {
                    jQuery('#processing').hide();
                    hidespinner();
                    document.getElementById('progressinfo').innerHTML = '';
                    ctrl2.parentElement.parentElement.scrollIntoView();
                    adjustscroll(60);
                    ctrl2.style.borderColor = 'red';
                    ctrl2.style.borderWidth = 'medium';
                    if (warningplayed === 0) {
                        playLocationWarning();
                    }
                    else {
                        alert(locationwarning);
                    }
                    return;
                }
            }

        }

        var relement = document.getElementById('receptionlocation');
        wpa = '';
        wpp = '';
        if (!!relement) {
            if (relement.style.display === 'none') {
                endaddr = null;
            }

            else if (ctrl3.getAttributeNode('data-address').value === '' || ctrl3.getAttributeNode('data-address').value === null) {

                if (ctrl3.value === '') {
                    endaddr = null;
                    ctrl3.style.borderColor = '#bbb';
                    ctrl3.style.borderWidth = 'thin';
                }
                else {
                    jQuery('#processing').hide();
                    hidespinner();
                    document.getElementById('progressinfo').innerHTML = '';
                    ctrl3.parentElement.parentElement.scrollIntoView();
                    adjustscroll(60);
                    ctrl3.style.borderColor = 'red';
                    ctrl3.style.borderWidth = 'medium';
                    if (warningplayed === 0) {
                        playLocationWarning();
                    }
                    else {
                        alert(locationwarning);
                    }
                    return;
                }
            }
            else {
                // waypointaddr = ctrl2.getAttributeNode('data-address').value;

                wpa = ctrl2.getAttributeNode('data-address').value;
                wpp = ctrl2.getAttributeNode('data-place').value;
                if (strStartsWith(wpa, wpp) === 0) {
                    waypointaddr = wpp + ', ' + wpa;
                }
                else {
                    waypointaddr = wpa;
                }

                // endaddr = ctrl3.getAttributeNode('data-address').value;
                var enda = ctrl3.getAttributeNode('data-address').value;
                var endp = ctrl3.getAttributeNode('data-place').value;
                if (strStartsWith(enda, endp) === 0) {
                    endaddr = endp + ', ' + enda;
                }
                else {
                    endaddr = enda;
                }

            }
        }
        else {
            endaddr = null;
        }
        var start = postcode; //startaddr;
        var end = postcode; //endaddr;
        var waypts = [];
        var ddl = document.getElementById('lstroundtrips');
        var trips = ddl.options[ddl.selectedIndex].value;

        if (!!endaddr) {
            if (!!relement) {
                if (relement.style.display !== 'none') {
                    if (trips >= 2) {
                        //Waypoint limit
                        trips = 1;
                    }
                    else {
                        if (trips > 2) {
                            //Waypoint limit
                            trips = 2;
                        }
                    }
                }
                else {
                    if (trips > 2) {
                        //Waypoint limit
                        trips = 2;
                    }
                }
            }
            else {
                if (trips > 2) {
                    //Waypoint limit
                    trips = 2;
                }
            }
        }

        if (trips > 2) {
            //Waypoint limit
            trips = 1;
        }

        if (!!startaddr) {
            //   
            waypts.push({
                location: startaddr,
                stopover: true
            });
        }


        if (!!waypointaddr) {

            waypts.push({
                location: waypointaddr,
                stopover: true
            });
            for (var i = 0; i < trips; i++) {
                waypts.push({
                    location: startaddr,
                    stopover: true
                });
                waypts.push({
                    location: waypointaddr,
                    stopover: true
                });
            }
        }

        // Add the round trips
        if (!!endaddr) {
            if (!!relement) {
                if (relement.style.display !== 'none') {
                    waypts.push({
                        location: endaddr,
                        stopover: true
                    });
                }
            }
        }

        if (waypts.length > 1) {
            if (waypts[0].location === waypts[1].location) {
                alert('Locations cannot be the same. Please provide more detailed location information such as a street or postcode. \nIf it is a single location and you just want our service to be present, add a nearby location as the second location.');
                document.getElementById('progressinfo').innerText = '';
                jQuery('#processing').hide();
                hidespinner();
                return false;
            }
        }

        var request = {
            unitSystem: google.maps.UnitSystem.METRIC,
            region: countrycode + ';',                             //set the region
            origin: start,
            waypoints: waypts,
            destination: end,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            avoidHighways: avoidHighways
        };
        var err_span = document.getElementById('map_error');
        err_span.innerHTML = '';
        if (JSON.stringify(request) === JSON.stringify(lastrequest)) {
            err_span = document.getElementById('map_error');
            // err_span.innerHTML = 'Repeat query';

            doquote();
        }

        else {

            lastrequest = request;

            hidemarkers(map);

            function get_ferries(route) {
                var f = [], section;
                for (var leg = 0; leg < route.legs.length; ++leg) {
                    for (var step = 0; step < route.legs[leg].steps.length; ++step) {
                        section = route.legs[leg].steps[step];
                        // find congestion zone:
                        // Search for "Entering toll zone" or "Leaving toll zone" in instructions:
                        // Set IQtollzone to true if found
                        if (IQtollzone === false) {
                            if (section.instructions.indexOf("Entering toll zone") >= 0) {
                                IQtollzone = true;
                            }
                            if (section.instructions.indexOf("Leaving toll zone") >= 0) {
                                IQtollzone = true;
                            }
                        }
                        if (
                            section.maneuver === 'ferry'
                            ||
                            (
                                section.transit
                                &&
                                section.transit.line
                                &&
                                section.transit.line.vehicle
                                &&
                                section.transit.line.vehicle.type === 'FERRY'
                            )
                        ) {
                            f.push(section);
                        }
                    }
                }
                return f;
            }

            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    // remove unnecessary information
                    var shortresponse = jQuery.extend(true, {}, response);

                    // var i = this.getRouteIndex();
                    IQtollzone = false;
                    IQferrycount = 0;
                    var ferries = get_ferries(shortresponse.routes[0]);
                    if (ferries.length) {
                        IQferrycount = ferries.length;
                    }

                    var legs = shortresponse.routes[0].legs;
                    for (var i = 0; i < legs.length; i++) {
                        var steps = legs[i].steps;
                        steps.splice(0, steps.length);
                    }
                    // Cache the journeys on the server
                    // Cache is deleted in accordance with Google Ts & Cs

                    var rq = JSON.stringify(request);
                    var rsp = JSON.stringify(shortresponse);
                    jQuery.ajaxPrefilter('json', function (options, orig, jqXHR) {
                        if (options.crossDomain && !jQuery.support.cors) {
                            return 'jsonp';
                        }
                    });

                    ///
                    jQuery.ajax({
                        type: 'POST',
                        url: 'https://www.instant-quote.co/postroute.ashx/postroute/ProcessRequest',
                        data: { 'request': encodeURIComponent(rq), 'response': encodeURIComponent(rsp) },
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        crossDomain: true,
                        beforeSend: function () {
                            jQuery('#processing').show();

                        },
                        success: cachesuccess,
                        error: cachefail
                    });

                    // remove the first and last leg of the journey to and from the garage

                    legs = response.routes[0].legs;
                    legs.splice(legs.length - 1, 1);
                    legs.splice(0, 1);

                    // render the direction information to the browser
                    directionsDisplay.setDirections(response);
                    var err_span = document.getElementById('map_error');
                    err_span.innerHTML = '';

                    var mailaddress = document.getElementById('emailaddress').value;
                    var hotmail = mailaddress.search(/hotmail/i);

                    if (hotmail > -1) {

                        alert('Hotmail tends to be a little slow and files quotes in the junk email folder. Be sure to check your junk email folder.');
                    }
                }

                else {
                    var err_span = document.getElementById('map_error');
                    alert('We are unable to calculate the journeys. Try adjusting your address fields. Error: ' + status);
                    err_span.innerHTML = 'Map error ' + status;
                    document.getElementById('progressinfo').innerText = '';
                    jQuery('#processing').hide();
                    hidespinner();
                }
            });
        }
    }

    else {
        var mailaddress = document.getElementById('emailaddress').value;
        var hotmail = mailaddress.search(/hotmail/i);

        if (hotmail > -1) {

            alert('Hotmail tends to be a little slow and files quotes in the junk email folder. Be sure to check your junk email folder.');
        }
        doquote();

    }
}


function cachesuccess(result) {

    var mailaddress = document.getElementById('emailaddress').value;
    if (!mailaddress) {
        alert('Please enter your email address');
        document.getElementById('progressinfo').innerHTML = '';
        return false;
    }
    else {

        doquote();
        return;
    }
}

function cachefail(result) {
    var mailaddress = document.getElementById('emailaddress').value;
    if (!mailaddress) {
        alert('Please enter your email address');
        document.getElementById('progressinfo').innerHTML = 'x';
        return false;
    }
    else {

        doquote();
        return;
    }
}

function doquote() {
    //showspinner();
    document.getElementById('progressinfo').innerText = 'Generating your quotation.';
    var assets = [];
    if (IQusecheckbox === true) {
        jQuery('#IQtransport input:checked').each(function () {
            assets.push(jQuery(this).attr('id'));
        });
    }
    else {
        assets.push(IQsingleassetid);
    }

    var startdate = document.getElementById('eventdate').value;
    var eventdate = new Date(startdate).setHours(0, 0, 0, 0);
    var d = new Date().setHours(0, 0, 0, 0);

    if (d === eventdate) {
        document.getElementById('progressinfo').innerText = '';
        jQuery('#processing').hide();
        hidespinner();
        alert('Prices and availability vary from day to day. Please select the event date and reselect the item(s) you would like a quotation for.');
        return false;
    }

    var duration = '3';
    if (!!document.getElementById('lstduration')) {
        duration = document.getElementById('lstduration').value;
    }

    var starttime = '10:00';

    if (!!document.getElementById('cmbpickup')) {
        starttime = document.getElementById('cmbpickup').value;
    }

    var email = document.getElementById('emailaddress').value;

    var pickupaddr = '';
    var pickupplace = '';
    if (!!document.getElementById('address')) {

        pickupaddr = document.getElementById('address').getAttributeNode('data-address').value;
        pickupplace = document.getElementById('address').getAttributeNode('data-place').value;
        setCookie('pickuptext', document.getElementById('address').value, 365);
        if (strStartsWith(pickupaddr, pickupplace) === 0) {
            pickupaddr = encodeURIComponent(pickupplace + ', ' + pickupaddr);
        }
        else {
            pickupaddr = encodeURIComponent(pickupaddr);

        }
        pickupplace = encodeURIComponent(pickupplace);
    }
    var ceremonyaddr = '';
    var ceremonyplace = '';
    if (!!document.getElementById('ceremony')) {

        ceremonyaddr = document.getElementById('ceremony').getAttributeNode('data-address').value;
        ceremonyplace = document.getElementById('ceremony').getAttributeNode('data-place').value;
        setCookie('ceremonytext', document.getElementById('ceremony').value, 365);
        if (strStartsWith(ceremonyaddr, ceremonyplace) === 0) {
            ceremonyaddr = encodeURIComponent(ceremonyplace + ', ' + ceremonyaddr);
        }
        else {
            ceremonyaddr = encodeURIComponent(ceremonyaddr);
        }
        ceremonyplace = encodeURIComponent(ceremonyplace);
    }
    var receptionaddr = '';
    var receptionplace = '';
    if (!!document.getElementById('receptionlocation')) {
        if ((document.getElementById('receptionlocation').style.display !== 'none')) {
            if (!!document.getElementById('reception')) {

                receptionaddr = document.getElementById('reception').getAttributeNode('data-address').value;
                receptionplace = document.getElementById('reception').getAttributeNode('data-place').value;
                setCookie('receptiontext', document.getElementById('reception').value, 365);
                if (strStartsWith(receptionaddr, receptionplace) === 0) {
                    receptionaddr = encodeURIComponent(receptionplace + ', ' + receptionaddr);
                }
                else {
                    receptionaddr = encodeURIComponent(receptionaddr);
                }
                receptionplace = encodeURIComponent(receptionplace);
            }
        }
    }
    var rtrips = 0;
    if (!!document.getElementById('lstroundtrips')) {
        rtrips = document.getElementById('lstroundtrips').value;
    }
    var telephone = 0;
    if (!!document.getElementById('telephone')) {
        telephone = encodeURIComponent(document.getElementById('telephone').value);
    }


    var pkg = '-1';
    var pkglist = document.getElementById('ddlpackages');
    if (!!pkglist) {
        pkg = pkglist.options[pkglist.selectedIndex].value;
    }
    var fbhost = '0';

    fbhost = get_host();

    // Used for directories
    var dirhost = setquotehost();
    if (dirhost !== undefined) {
        fbhost = dirhost;
    }

    var singlelocation = '0';
    var celement = document.getElementById('ceremonylocation');
    if (!!celement) {
        if (celement.style.display === 'none') {
            singlelocation = '1';
        }
    }
    var hostedby = 'Hosted Web Form';

    if (!!window.location.hostname) {
        hostedby = window.location.hostname;
    }

    var firstname = '';
    var familynamename = '';
    var companyname = '';
    var eventlocation = '';
    var eventtype = '';
    var eventvalue = '0';
    var notes = '';
    var referedby = '';
    var forwardlead = '0';
    var custom1 = '';
    var custom2 = '';
    var custom3 = '0';

    if (!!document.getElementById('first_name')) {
        firstname = encodeURIComponent(document.getElementById('first_name').value);
    }
    if (!!document.getElementById('family_name')) {
        familyname = encodeURIComponent(document.getElementById('family_name').value);
    }
    if (!!document.getElementById('org_name')) {
        companyname = encodeURIComponent(document.getElementById('org_name').value);
    }
    if (!!document.getElementById('cmblocation')) {
        eventlocation = encodeURIComponent(document.getElementById('cmblocation').options[document.getElementById('cmblocation').selectedIndex].text);
    }
    if (!!document.getElementById('cmbeventtype')) {
        eventtype = encodeURIComponent(document.getElementById('cmbeventtype').options[document.getElementById('cmbeventtype').selectedIndex].text);
        eventvalue = document.getElementById('cmbeventtype').value;
    }
    if (!!document.getElementById('txtnotes')) {
        notes = encodeURIComponent(document.getElementById('txtnotes').value);
    }
    if (!!document.getElementById('cmbmarketing')) {
        referedby = encodeURIComponent(document.getElementById('cmbmarketing').options[document.getElementById('cmbmarketing').selectedIndex].text);
    }

    if (typeof rbforwardyes === 'undefined') {

        forwardlead = 0;
    }
    else {
        forwardlead = rbforwardyes.checked;
    }

    if (!!document.getElementById('custom1')) {
        custom1 = encodeURIComponent(document.getElementById('custom1').value);
    }
    if (!!document.getElementById('custom2')) {
        custom2 = encodeURIComponent(document.getElementById('custom2').value);
    }
    if (!!document.getElementById('custom3')) {
        custom3 = document.getElementById('custom3').checked;
    }

    if (!!document.getElementById('IQselectedoptions')) {
        let iqselectedoption = encodeURIComponent(document.getElementById('IQselectedoptions').value);
        if (iqselectedoption != "") {
            serviceid = iqselectedoption;
            if (!!document.getElementById('guests')) {
                serviceguests = document.getElementById('guests').value;
            }
        }
    }

    // Set the cookies - some set in text above
    // setCookie('pickuptext', document.getElementById('address').value, 365);
    // setCookie('ceremonytext', document.getElementById('ceremony').value, 365);
    // setCookie('receptiontext', document.getElementById('reception').value, 365);
    // 

    setCookie('startdate', startdate, 365);
    setCookie('duration', duration, 365);
    setCookie('starttime', starttime, 365);
    setCookie('email', email, 365);
    setCookie('pickupaddr', pickupaddr, 365);
    setCookie('ceremonyaddr', ceremonyaddr, 365);
    setCookie('receptionaddr', receptionaddr, 365);
    setCookie('pickupplace', pickupplace, 365);
    setCookie('ceremonyplace', ceremonyplace, 365);
    setCookie('receptionplace', receptionplace, 365);
    setCookie('rtrips', rtrips, 365);
    setCookie('telephone', telephone, 365);
    setCookie('assets', assets, 365);
    setCookie('fbhost', fbhost, 365);
    setCookie('singlelocation', singlelocation, 365);
    setCookie('webpackage', pkg, 365);
    setCookie('hostedby', hostedby, 365);
    setCookie('firstname', firstname, 365);
    setCookie('familyname', familyname, 365);
    setCookie('companyname', companyname, 365);
    setCookie('eventlocation', eventlocation, 365);
    setCookie('eventtype', eventtype, 365);
    setCookie('eventvalue', eventvalue, 365);
    setCookie('notes', notes, 365);
    setCookie('referedby', referedby, 365);
    setCookie('forwardlead', forwardlead, 365);
    setCookie('custom1', custom1, 365);
    setCookie('custom2', custom2, 365);
    setCookie('custom3', custom3, 365);
    setCookie('geog', geog, 365);
    var jsondata = { 'startdate': startdate, 'duration': duration, 'starttime': starttime, 'email': email, 'pickupaddr': pickupaddr, 'ceremonyaddr': ceremonyaddr, 'receptionaddr': receptionaddr, 'pickupplace': pickupplace, 'ceremonyplace': ceremonyplace, 'receptionplace': receptionplace, 'rtrips': rtrips, 'telephone': telephone, 'assets': assets, 'fbhost': fbhost, 'singlelocation': singlelocation, 'webpackage': pkg, 'hostedby': hostedby, 'firstname': firstname, 'familyname': familyname, 'companyname': companyname, 'eventlocation': eventlocation, 'eventtype': eventtype, 'eventvalue': eventvalue, 'notes': notes, 'referedby': referedby, 'forwardlead': forwardlead, 'custom1': custom1, 'custom2': custom2, 'custom3': custom3, 'IQferrycount': IQferrycount, 'IQtollzone': IQtollzone, 'serviceid': serviceid, 'serviceguests': serviceguests };
    jsondata = JSON.stringify(jsondata);


    jQuery.ajaxPrefilter('json', function (options, orig, jqXHR) {
        if (options.crossDomain && !jQuery.support.cors) {
            return 'jsonp';
        }
    });
    // /
    jQuery.ajax({
        type: 'POST',
        url: 'https://www.instant-quote.co/quoterequest.ashx/quoterequest/ProcessRequest',
        data: jsondata,
        crossDomain: true,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        beforeSend: function () {
            //   jQuery('#processing').show();

        },
        complete: function () {


        },
        success: quotesuccess,
        error: quotefail
    });
}


function quotesuccess(status) {
    document.getElementById('progressinfo').innerHTML = status;
    jQuery('#processing').hide();
    hidespinner();
    var msg = document.getElementById('progressinfo').innerText;

    msg = msg.replace('<br>', '\n');
    if (jQuery("#quotespanel").length) {
        jQuery('#quotespanel').addClass("cd-panel--is-visible");
        jQuery('#IQhistory').prepend(status);
        jQuery("#IQquotes").css("display", "unset");
    }
    else {
        alert(msg);
    }
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'Quote Page', 'Quote Sent', 'Quotation', 4);
    }
}

function quotefail(status) {
    alert('Failed to process the quotation request: ' + status.statusText);
    document.getElementById('progressinfo').innerHTML = '';
    jQuery('#processing').hide();
    hidespinner();
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'Quote Page', 'Quote Fail', 'Quotation', 4);
    }
}

function countCars() {

    var cbselected = [];
    if (IQusecheckbox === true) {
        jQuery('#IQtransport input:checked').each(function () {
            cbselected.push(jQuery(this).attr('id'));
        });
    }
    else {
        cbselected.push('qbtn' + IQsingleassetid);
    }

    trcount = cbselected.length;

    if (trcount > 0) {
        var cb = document.getElementById(cbselected[0]); // HFpostcode

        if (hfList = cb.parentNode.getElementsByTagName('input')) {
            for (var p = 0; p < hfList.length; p++) {
                if (hfList[p].type === 'hidden') {
                    // Returns the garage postcode
                    avoidHighways = JSON.parse(hfList[p].getAttribute("data-avoidhighways"));
                    return hfList[p].value;
                }
            }
        }
    }

    return trcount;
}

function iqmapinitialise() {

    if (typeof google !== 'undefined') {
        directionsService = new google.maps.DirectionsService();
        initialize();
    }
}

//jQuery(document).ready(function () {
function continueloading() {
    var hfdonotpage = document.getElementById('hfdonotpage');
    if (!!hfdonotpage) {
        var shouldpage = hfdonotpage.value;
        shouldpage = shouldpage.toLowerCase();
        if (shouldpage == "true" || "false") {
            if (shouldpage == "true") { donotpage = new Boolean(true); }
            else { donotpage = new Boolean(false); }
        };
    }

    var hfshowtabs = document.getElementById('hfshowtabs');
    if (!!hfshowtabs) {
        var shouldhfshowtabs = hfshowtabs.value;
        shouldhfshowtabs = shouldhfshowtabs.toLowerCase();
        if (shouldhfshowtabs == "true" || "false") {
            if (shouldhfshowtabs == "true") { showtabs = new Boolean(true); }
            else if (shouldhfshowtabs == "false") { showtabs = new Boolean(false); }
        };
    }

    jQuery("#IQquotes").css("display", "none");
    var hfdir = document.getElementById('hfdir');
    if (!!hfdir) {
        directory = hfdir.value;
    }

    ref = get_host();

    var hfcount = document.getElementById('hfcount');
    if (!!hfcount) {
        pagecount = hfcount.value;
    }
    if (typeof directionsService !== 'undefined') {
        pageinitialise(ref);
    }
    else { return false; }



    jQuery('input.datepicker').Zebra_DatePicker({
        format: 'M d, Y',
        direction: 1,
        header_captions: {
            'days': 'Event Date:<br>F, Y',
            'months': 'Event Date:<br>Y',
            'years': 'Event Date:<br>Y1 - Y2'
        }
    });

    dt = new Date();
    var fmted = dt.toDateString();
    var fmtelements = fmted.split(' ');
    document.getElementById('eventdate').value = fmtelements[1] + ' ' + fmtelements[2] + ', ' + fmtelements[3];

    // jQuery('a[rel^="prettyPhoto"]').prettyPhoto();

    ref = get_host();

    pagenum = 0;
    IQisinfinite = 0;
    // If there are hidden fields on the page with the ids of IQfilter or IQfilter2
    // Set the filter values as appropriate
    if (!!document.getElementById('IQfilter1')) {
        filter1 = document.getElementById('IQfilter1').value;
    }
    if (!!document.getElementById('IQfilter2')) {
        filter2 = document.getElementById('IQfilter2').value;
    }

    IQxy = window.matchMedia("(max-height: 420px), (max-width: 420px)")
    setPrettyPhoto(IQxy) // Call listener function at run time
    IQxy.addListener(setPrettyPhoto) // Attach listener function on state changes
}


function setPrettyPhoto(IQxy) {
    if (IQxy.matches) { // If media query matches
        jQuery("a[rel^='prettyPhoto']").unbind('click');
        jQuery("a[rel^='prettyPhoto']").on("click", function () { return false; });
    } else {
        jQuery('a[rel^="prettyPhoto"]').prettyPhoto();
    }
}

function showspinner() {

    //IQspinerdiv
    if (typeof Spinner === 'undefined') {

        if (!!document.getElementById('IQspinerdiv')) {
            document.getElementById('IQspinerdiv').style.display = 'block';
        }
    }
    else {
        var opts = {
            lines: 13, // The number of lines to draw
            length: 20, // The length of each line
            width: 8, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'autospinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%', // Left position relative to parent
            position: 'fixed'  // element position
        };
        var target = document.getElementById('IQspinerdiv');
        spinner = new Spinner(opts).spin(target);
        jQuery('.autospinner').css({ left: '50%', top: '50%' });
        if (!!document.getElementById('bigspinner')) {
            document.getElementById('bigspinner').style.display = 'none';
        }

        document.getElementById('IQspinerdiv').style.display = 'block';
    }
}
function hidespinner() {

    if (typeof spinner === 'undefined') {

        if (!!document.getElementById('IQspinerdiv')) {
            document.getElementById('IQspinerdiv').style.display = 'none';
        }
    }
    else {
        spinner.stop('bigspinner');
        if (!!document.getElementById('IQspinerdiv')) {
            document.getElementById('IQspinerdiv').style.display = 'none';

        }
    }
}

function lookforarea(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\jQuery&") + "(?:\\=([^&]*))?)?.*jQuery", "i"), "jQuery1"));
}

function pageinitialise(ref) {

    var IQarea = lookforarea('county');
    if (IQarea === "") {
        IQarea = lookforarea('area');
    }

    var hfdir = document.getElementById('hfdir');
    if (!!hfdir) {
        directory = hfdir.value;
    }

    jQuery.ajaxPrefilter('json', function (options, orig, jqXHR) {
        if (options.crossDomain && !jQuery.support.cors) {
            return 'jsonp';
        }
    });

    var initdata;

    if (isNaN(showtabs) === true) {
        initdata = JSON.stringify({ 'referrer': ref, 'area': IQarea, 'geog': geog });
    }
    else {
        initdata = JSON.stringify({ 'referrer': ref, 'area': IQarea, 'geog': geog, 'showtabs': showtabs });
    }

    jQuery.ajax({
        type: 'POST',
        url: 'https://www.instant-quote.co/quoteinitialise.ashx/quoteinitialise/ProcessRequest',
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        dataType: 'json',
        data: initdata,
        beforeSend: function () {
            jQuery('#loader').show();
            jQuery('#processing').show();
            showspinner();

            document.getElementById('progressinfo').innerText = 'Initialising the page';
        },
        complete: function () {
            jQuery('#loader').hide();
            jQuery('#processing').hide();
            document.getElementById('progressinfo').innerText = '';
            if (!!document.getElementById('preselect')) {
                document.getElementById('preselect').style.display = 'none';
            }
        },
        success: InitComplete,
        error: InitFail
    });
    return false;
}

function InitComplete(result) {
    countrycode = result.countrycode;
    IQusecheckbox = result.usecheckbox;
    IQshowpackagetabs = result.showpackagetabs;
    IQpackagesfirst = result.packagesfirst;
    IQonlypackages = result.onlypackages;


    // Set required attributes

    // Set Header text

    if (!!document.getElementById('IQhelpline')) {
        document.getElementById('IQhelpline').innerHTML = 'Help line: ' + result.telephone;
    }
    if (!!document.getElementById('addr_title_1')) {
        document.getElementById('addr_title_1').innerHTML = result.pickuptext;
    }
    if (!!document.getElementById('addr_title_2')) {
        document.getElementById('addr_title_2').innerHTML = result.ceremonytext;
    }
    if (!!document.getElementById('addr_title_3')) {
        document.getElementById('addr_title_3').innerHTML = result.receptiontext;
    }
    if (!!document.getElementById('addr_title_4')) {
        document.getElementById('addr_title_4').innerHTML = result.pickuptext;
    }
    // Names
    if (!!document.getElementById('divfirstname')) {
        document.getElementById('divfirstname').innerHTML = result.forenametext;
    }
    if (!!document.getElementById('divfamilyname')) {
        document.getElementById('divfamilyname').innerHTML = result.familynametext;
    }
    if (!!document.getElementById('divorgname')) {
        document.getElementById('divorgname').innerHTML = result.companynametext;
    }
    if (!!document.getElementById('lblcustom1')) {
        document.getElementById('lblcustom1').innerHTML = result.custom1text;
    }
    if (!!document.getElementById('lblcustom2')) {
        document.getElementById('lblcustom2').innerHTML = result.custom2text;
    }
    if (!!document.getElementById('lblcustom3')) {
        document.getElementById('lblcustom3').innerHTML = result.custom3text;
    }
    if (!!document.getElementById('noaddress3')) {
        document.getElementById('noaddress3').innerHTML = result.autohidetext;
    }
    if (!!document.getElementById('lblforwardlead')) {
        document.getElementById('lblforwardlead').innerHTML = result.forwardleadtext;
    }

    if (!!document.getElementById('span_same_as_Ceremony')) {
        if (result.displayautohide === false) {
            document.getElementById('span_same_as_Ceremony').style.display = 'none';
        }
        else {
            document.getElementById('span_same_as_Ceremony').style.display = '';
        }
    }

    // Show or hide name fields 
    if (!!document.getElementById('divfirstnameCont')) {
        if (result.displayforename === false) {
            document.getElementById('divfirstnameCont').style.display = 'none';
            if (!!document.getElementById('first_name')) {
                document.getElementById('first_name').required = false;
            }
        }
        else {
            document.getElementById('divfirstnameCont').style.display = '';
            if (!!document.getElementById('first_name')) {
                document.getElementById('first_name').required = result.forenamerequired;
            }
        }
    }

    if (!!document.getElementById('divfamilynameCont')) {
        if (result.displayfamilyname === false) {
            document.getElementById('divfamilynameCont').style.display = 'none';
            if (!!document.getElementById('family_name')) {
                document.getElementById('family_name').required = false;
            }
        }
        else {
            document.getElementById('divfamilynameCont').style.display = '';
            if (!!document.getElementById('family_name')) {
                document.getElementById('family_name').required = result.familynamerequired;
            }
        }
    }

    if (!!document.getElementById('divorgnameCont')) {
        if (result.displaycompanyname === false) {
            document.getElementById('divorgnameCont').style.display = 'none';
            if (!!document.getElementById('org_name')) {
                document.getElementById('org_name').required = false;
            }
        }
        else {
            document.getElementById('divorgnameCont').style.display = '';
            if (!!document.getElementById('org_name')) {
                document.getElementById('org_name').required = result.companynamerequired;
            }
        }
    }

    // Show or Address fields 
    if (!!document.getElementById('receptionlocation')) {
        var rl = document.getElementById('reception');
        rl.setAttribute('data-place', '');
        rl.setAttribute('data-address', '');
        rl.setAttribute('onchange', 'clear_data(this);');
        if (result.display_addr3 === false) {
            document.getElementById('receptionlocation').style.display = 'none';
            if (!!document.getElementById('span_same_as_Ceremony')) {
                document.getElementById('span_same_as_Ceremony').style.display = 'none';
            }
            if (!!document.getElementById('chk_same_as_Ceremony')) {
                document.getElementById('chk_same_as_Ceremony').required = false;
            }
            if (!!document.getElementById('reception')) {
                document.getElementById('reception').required = false;
            }
            if (!!document.getElementById('rtripdiv')) {
                document.getElementById('rtripdiv').style.display = 'none';
            }
        }
        else {
            document.getElementById('receptionlocation').style.display = '';
            if (!!document.getElementById('reception')) {
                document.getElementById('reception').required = result.addr3required;
            }
        }
    }

    if (!!document.getElementById('pickup_clone')) {
        var rl = document.getElementById('pickup_clone');
        rl.setAttribute('data-place', '');
        rl.setAttribute('data-address', '');
        rl.setAttribute('onchange', 'clear_data(this);');
    }

    if (!!document.getElementById('ceremonylocation')) {
        var rl = document.getElementById('ceremony');
        rl.setAttribute('data-place', '');
        rl.setAttribute('data-address', '');
        rl.setAttribute('onchange', 'clear_data(this);');
        if (result.display_addr2 === false) {
            document.getElementById('ceremonylocation').style.display = 'none';
            if (!!document.getElementById('receptionlocation')) {
                document.getElementById('receptionlocation').style.display = 'none';
            }
            if (!!document.getElementById('span_same_as_Ceremony')) {
                document.getElementById('span_same_as_Ceremony').style.display = 'none';
            }
            if (!!document.getElementById('chk_same_as_Ceremony')) {
                document.getElementById('chk_same_as_Ceremony').required = false;
            }
            if (!!document.getElementById('rtripdiv')) {
                document.getElementById('rtripdiv').style.display = 'none';
            }
            if (!!document.getElementById('ceremony')) {
                document.getElementById('ceremony').required = false;
            }
            if (!!document.getElementById('reception')) {
                document.getElementById('reception').required = false;
            }
        }
        else {
            document.getElementById('ceremonylocation').style.display = '';
            if (!!document.getElementById('ceremony')) {
                document.getElementById('ceremony').required = result.addr2required;
            }
        }
    }


    if (!!document.getElementById('pickuplocation')) {
        var rl = document.getElementById('address');
        rl.setAttribute('data-place', '');
        rl.setAttribute('data-address', '');
        rl.setAttribute('onchange', 'clear_data(this);');
        if (result.display_addr1 === false) {
            document.getElementById('pickuplocation').style.display = 'none';
            if (!!document.getElementById('ceremonylocation')) {
                document.getElementById('ceremonylocation').style.display = 'none';
            }
            if (!!document.getElementById('receptionlocation')) {
                document.getElementById('receptionlocation').style.display = 'none';
            }
            if (!!document.getElementById('span_same_as_Ceremony')) {
                document.getElementById('span_same_as_Ceremony').style.display = 'none';
            }
            if (!!document.getElementById('addr4_div')) {
                document.getElementById('addr4_div').style.display = 'none';
            }
            if (!!document.getElementById('chk_same_as_Ceremony')) {
                document.getElementById('chk_same_as_Ceremony').required = false;
            }
            if (!!document.getElementById('reception')) {
                document.getElementById('reception').required = false;
            }
            if (!!document.getElementById('ceremony')) {
                document.getElementById('ceremony').required = false;
            }
            if (!!document.getElementById('address')) {
                document.getElementById('address').required = false;
            }
            if (!!document.getElementById('rtripdiv')) {
                document.getElementById('rtripdiv').style.display = 'none';
            }

        }
        else {
            document.getElementById('pickuplocation').style.display = '';
            if (!!document.getElementById('address')) {
                document.getElementById('address').required = result.addr1required;
            }
            if (!!document.getElementById('addr4_div')) {
                document.getElementById('addr4_div').style.display = '';
            }
        }
    }


    // Show or Custom fields 
    if (!!document.getElementById('custom1')) {
        if (result.displaycustom1 === false) {
            document.getElementById('divcustom1').style.display = 'none';
            if (!!document.getElementById('custom1')) {
                document.getElementById('custom1').required = false;
            }
        }
        else {
            document.getElementById('divcustom1').style.display = '';
            if (!!document.getElementById('custom1')) {
                document.getElementById('custom1').required = result.custom1required;
            }
        }
    }

    if (!!document.getElementById('custom2')) {
        if (result.displaycustom2 === false) {
            document.getElementById('divcustom2').style.display = 'none';
            if (!!document.getElementById('custom2')) {
                document.getElementById('custom2').required = false;
            }
        }
        else {
            document.getElementById('divcustom2').style.display = '';
            if (!!document.getElementById('custom2')) {
                document.getElementById('custom2').required = result.custom2required;
            }
        }
    }

    if (!!document.getElementById('custom3')) {
        if (result.displaycustom3 === false) {
            document.getElementById('divcustom3').style.display = 'none';
            if (!!document.getElementById('custom3')) {
                document.getElementById('custom3').required = false;
            }
        }
        else {
            document.getElementById('divcustom3').style.display = '';
            if (!!document.getElementById('custom3')) {
                document.getElementById('custom3').required = result.custom3required;
            }
        }
    }

    if (!!document.getElementById('divforwardlead')) {
        if (result.displayforwardlead === false) {
            document.getElementById('divforwardlead').style.display = 'none';
            if (!!document.getElementById('rbforwardyes')) {
                document.getElementById('rbforwardyes').required = false;
            }
            if (!!document.getElementById('rbforwardno')) {
                document.getElementById('rbforwardno').required = false;
            }
        }
        else {
            document.getElementById('divforwardlead').style.display = '';
            if (!!document.getElementById('rbforwardyes')) {
                document.getElementById('rbforwardyes').required = result.forwardleadrequired;
            }
            if (!!document.getElementById('rbforwardno')) {
                document.getElementById('rbforwardno').required = result.forwardleadrequired;
            }

        }
    }


    if (!!document.getElementById('lblroundtrips')) {
        document.getElementById('lblroundtrips').innerHTML = result.rtriptext;
    }

    if (!!document.getElementById('lbleventlocation')) {
        document.getElementById('lbleventlocation').innerHTML = result.eventlocationtext;
    }

    if (!!document.getElementById('lblnotes')) {
        document.getElementById('lblnotes').innerHTML = result.notes;
    }
    if (!!document.getElementById('divnotes')) {
        if (result.displaynotes === false) {
            document.getElementById('divnotes').style.display = 'none';
        }
        else {
            document.getElementById('divnotes').style.display = '';
        }
    }
    // Specific Event location

    if (!!document.getElementById('divlocationselect')) {
        document.getElementById('divlocationselect').innerHTML = result.eventlocationhtml;
    }

    if (!!document.getElementById('lbleventlocation')) {
        document.getElementById('lbleventlocation').innerHTML = result.eventlocationtext;
    }
    if (!!document.getElementById('diveventloc')) {
        if (result.displayeventlocation === false) {
            document.getElementById('diveventloc').style.display = 'none';
            if (!!document.getElementById('cmblocation')) {
                document.getElementById('cmblocation').required = false;
            }
        }
        else {
            document.getElementById('diveventloc').style.display = '';
            if (!!document.getElementById('cmblocation')) {
                document.getElementById('cmblocation').required = result.eventlocationrequired;
            }
        }
    }
    //Set dropdown labels and visibility for time and duration
    if (!!document.getElementById('lbltime')) {
        document.getElementById('lbltime').innerHTML = result.lbltime;
    }
    if (!!document.getElementById('lblduration')) {
        document.getElementById('lblduration').innerHTML = result.lblduration;
    }

    if (!!document.getElementById('divduration')) {
        if (result.displayduration === false) {
            document.getElementById('divduration').style.display = 'none';
        }
        else {
            document.getElementById('divduration').style.display = '';
        }
    }

    //Event type
    if (!!document.getElementById('lbleventtype')) {
        document.getElementById('lbleventtype').innerHTML = result.eventtypetext;
    }

    if (!!document.getElementById('diveventtypeselect')) {
        document.getElementById('diveventtypeselect').innerHTML = result.eventtypehtml;
    }

    if (!!document.getElementById('diveventtype')) {
        if (result.displayeventtype === false) {
            document.getElementById('diveventtype').style.display = 'none';
            if (!!document.getElementById('cmbeventtype')) {
                document.getElementById('cmbeventtype').required = false;
            }
        }
        else {
            document.getElementById('diveventtype').style.display = '';
            if (!!document.getElementById('cmbeventtype')) {
                document.getElementById('cmbeventtype').required = result.eventtyperequired;
            }
        }
    }

    // Marketing 
    if (!!document.getElementById('lblmarketing')) {
        document.getElementById('lblmarketing').innerHTML = result.refertext;
    }
    if (!!document.getElementById('divmarketingselect')) {
        document.getElementById('divmarketingselect').innerHTML = result.refererhtml;
    }

    if (!!document.getElementById('divmarketing')) {
        if (result.displayrefer === false) {
            document.getElementById('divmarketing').style.display = 'none';
            if (!!document.getElementById('cmbmarketing')) {
                document.getElementById('cmbmarketing').required = false;
            }
        }
        else {
            document.getElementById('divmarketing').style.display = '';
            if (!!document.getElementById('cmbmarketing')) {
                document.getElementById('cmbmarketing').required = result.referrequired;
            }
        }
    }

    if (result.ceremonytext === '') {
        if (!!document.getElementById('span_same_as_Ceremony')) {
            document.getElementById('span_same_as_Ceremony').style.display = 'none';
        }
        if (!!document.getElementById('chk_same_as_Ceremony')) {
            document.getElementById('chk_same_as_Ceremony').required = false;
        }
    }

    if (result.receptiontext === '') {

        if (!!document.getElementById('span_same_as_Ceremony')) {
            document.getElementById('span_same_as_Ceremony').style.display = 'none';
        }
        if (!!document.getElementById('chk_same_as_Ceremony')) {
            document.getElementById('chk_same_as_Ceremony').required = false;
        }
        if (!!document.getElementById('receptionlocation')) {
            document.getElementById('receptionlocation').style.display = 'none';
        }

    }

    if (result.rtrips === '0') {
        if (!!document.getElementById('rtripdiv')) {
            document.getElementById('rtripdiv').style.display = 'none';
        }
    }
    else {
        var rtlst = document.getElementById('lstroundtrips');
        if (!!rtlst) {
            while (rtlst.childNodes.length > 0) {
                rtlst.removeChild(rtlst.childNodes[0]);
            }
            for (var i = 0; i < (parseInt(result.rtrips) + 1); i++) {
                rtlst.add(new Option(i, i));
            }
            if (!!document.getElementById('rtripdiv')) {
                document.getElementById('rtripdiv').style.display = '';
            }
        }
    }

    var latlong = result.latlng.split(',', 2);
    if (latlong.length === 2) {
        geog = result.latlng;
        if (typeof map !== 'undefined') {
            moveToLocation(latlong[0], latlong[1]);
            map.setZoom(6);
        }
        else {
            centrelat = latlong[0];
            centrelong = latlong[1];
            initzoom = 6;
        }
    }
    var rtlst = document.getElementById('lstduration');
    if (!!rtlst) {
        while (rtlst.childNodes.length > 0) {
            rtlst.removeChild(rtlst.childNodes[0]);
        }
        for (var i = result.minduration; i < result.maxbooking + 1; i += result.step) {
            rtlst.add(new Option(i + ' ' + result.units, i));
        }
    }
    var filterdiv = document.getElementById('divfilter');
    if (!!filterdiv) {
        filterdiv.innerHTML = result.filterhtml;
        if (result.filterhtml === '') {
            filterdiv.style.display = 'none';
        }
        else {
            filterdiv.style.display = '';
        }
    }
    document.getElementById('lstduration').value = result.defaultduration;

    // Add any Services (This is a type of Extra)

    if (typeof result.extras === "object") {
        if (result.extras.length > 0) {
            result.extras.forEach(listExtras)
            document.getElementById('IQoptions').style.display = 'block';
            document.getElementById("IQselectedoptions").required = true;
            if (!!document.getElementById('guests')) {
                document.getElementById('guests').required = true;
            }
        }
    }

    function listExtras(service) {
        let itemId = service.id;
        let itemName = service.item;
        let itemDescription = service.description;
        jQuery("#IQselectedoptions").append(jQuery("<option>", {
            value: itemId,
            text: itemName
        }));
    }

    showintialform();
	setupdatepicker();
    loadcars(dt, ref, geog, pagenum);
}

function clear_data(elem) {
    if (elem.value === '') {
        elem.setAttribute('data-place', '');
        elem.setAttribute('data-address', '');
    }
}
function get_host() {
    var hf = document.getElementById('hfhost');
    if (hf) {
        if (hf.value == "0") {
            hf = document.getElementById('iqhost');
        }
    }
    if (!hf) {
        hf = document.getElementById('iqhost');
    }
    if (!hf) {
        hf = document.getElementById('MainContent_hfhost');
    }
    if (!!hf) {
        return (hf.value);
    }
    else {
        return (0);
    }
}
function showintialform() {

    var dialog = jQuery('#dialog').dialog({
        autoOpen: true,
        resizable: false,
        title: 'Collection Date',
        height: 476,
        modal: true,
        close: function () {
            if (document.getElementById('pickup_clone').value !== '') {
                var addr = document.getElementById('address');
                var clo = document.getElementById('pickup_clone');
                addr.value = clo.value;
                var p = clo.getAttributeNode('data-place').value;
                var a = clo.getAttributeNode('data-address').value;
                addr.setAttribute('data-place', p);
                addr.setAttribute('data-address', a);
                if (a !== '') {
                    addr.style.borderColor = 'green';
                    addr.style.borderWidth = 'thin';
                    addr.className = 'IQlongtextbox';
                }
                else {
                    addr.style.borderColor = 'red';
                    addr.style.borderWidth = 'medium';
                    addr.className = 'IQlongtextbox';
                }
            }
            if (document.getElementById('datepicker-static').value !== '') {
                document.getElementById('eventdate').value = document.getElementById('datepicker-static').value;
            }
            if (!!document.getElementById('chk_same_as_Ceremony')) {
                document.getElementById('chk_same_as_Ceremony').checked = false;
            }
            return false;
        },
        buttons: [{
            text: 'Ok', click: function () {
                jQuery(this).dialog('close');
            }
        }],
        overlay: {
            opacity: 0.5,
            background: 'black'
        }
    });

    // Read and apply the cookie values
    if (!!document.getElementById('pickup_clone')) {
        var clo = document.getElementById('pickup_clone');
        clo.setAttribute('data-place', decodeURIComponent(getCookie('pickupplace')));
        clo.setAttribute('data-address', decodeURIComponent(getCookie('pickupaddr')));
        clo.value = decodeURIComponent(getCookie('pickuptext'));
    }
    if (!!document.getElementById('address')) {
        clo = document.getElementById('address');
        clo.setAttribute('data-place', decodeURIComponent(getCookie('pickupplace')));
        clo.setAttribute('data-address', decodeURIComponent(getCookie('pickupaddr')));
        clo.value = decodeURIComponent(getCookie('pickuptext'));
    }
    if (!!document.getElementById('ceremony')) {
        clo = document.getElementById('ceremony');
        clo.setAttribute('data-place', decodeURIComponent(getCookie('ceremonyplace')));
        clo.setAttribute('data-address', decodeURIComponent(getCookie('ceremonyaddr')));
        clo.value = decodeURIComponent(getCookie('ceremonytext'));
    }
    if (!!document.getElementById('reception')) {
        clo = document.getElementById('reception');
        clo.setAttribute('data-place', decodeURIComponent(getCookie('receptionplace')));
        clo.setAttribute('data-address', decodeURIComponent(getCookie('receptionaddr')));
        clo.value = decodeURIComponent(getCookie('receptiontext'));
    }


    if (!!document.getElementById('first_name')) {
        document.getElementById('first_name').value = decodeURIComponent(getCookie('firstname'));
    }
    if (!!document.getElementById('family_name')) {
        document.getElementById('family_name').value = decodeURIComponent(getCookie('familyname'));
    }
    if (!!document.getElementById('org_name')) {
        document.getElementById('org_name').value = decodeURIComponent(getCookie('companyname'));
    }
    if (!!document.getElementById('emailaddress')) {
        document.getElementById('emailaddress').value = decodeURIComponent(getCookie('email'));
    }
    if (!!document.getElementById('telephone')) {
        document.getElementById('telephone').value = decodeURIComponent(getCookie('telephone'));
    }

    // There are more cookie values to reead and controls to set. - To Do

    // Attempt to move the dialog in front of any top menu
    /// var calendarelement = jQuery('.Zebra_DatePicker', '#dialog');
    //  calendarelement.css({ 'margin-top': '10px' });
    // calendarelement.css({ 'margin-left': '21px' });
}

function setupdatepicker() {
if (jQuery.isFunction(jQuery.fn.Zebra_DatePicker)) {
        var tempgeog = getCookie('geog');
        if (tempgeog != '') {
            geog = tempgeog;
        }

        var tempdate = new Date(getCookie('startdate'));

        if (isNaN(tempdate) == true) {
            tempdate = new Date();
            var formatted = IQformatdate(tempdate);
            jQuery('#datepicker-static').val(formatted);
            jQuery('#eventdate').val(formatted);
            dt = tempdate;
        }
        else {
            var formatted = IQformatdate(tempdate);
            jQuery('#datepicker-static').val(formatted);
            jQuery('#eventdate').val(formatted);
            dt = tempdate;
            dt.setDate(dt.getDate() + 1);
        }

        jQuery('#datepicker-static').val(formatted);
        jQuery('#eventdate').val(formatted);

        jQuery('#datepicker-static').Zebra_DatePicker({

            // execute a function whenever the user changes the view (days/months/years),
            // as well as when the user navigates by clicking on the 'next'/'previous'
            // icons in any of the views
            always_visible: jQuery('#dialog'),
            format: 'M d, Y',
            direction: true,
            default_position: 'below',
            view: 'days',
            show_clear_date: false,
            show_select_today: false,
            onSelect: function (dateformated, datefixedformat, dateobject, dateelement) {
                ref = get_host();
                dt = dateobject;
                pagenum = 0;
                IQisinfinite = 0;
                loadcars(dateobject, ref, geog, pagenum);
            }
        });
    }
    if (jQuery.isFunction(jQuery.fn.Zebra_DatePicker)) {
        jQuery('#eventdate').Zebra_DatePicker({

            // execute a function whenever the user changes the view (days/months/years),
            // as well as when the user navigates by clicking on the 'next'/'previous'
            // icons in any of the views
            format: 'M d, Y',
            direction: true,
            default_position: 'below',
            show_clear_date: false,
            show_select_today: false,
            onSelect: function (dateformated, datefixedformat, dateobject, dateelement) {
                ref = get_host();
                dt = dateobject;
                pagenum = 0;
                IQisinfinite = 0;
                IQassetgroup = 0;
                loadcars(dateobject, ref, geog, pagenum);
            }
        });
    }
	
	 jQuery('#tabs').tabs();
}

function InitFail(result) {
    alert('Page initialisation failed. The service may not be available due to a system update or your browser needs to be updated. Please try again in a few minutes.');
    jQuery('#processing').hide();
    jQuery('#loader').hide();
    hidespinner();
    document.getElementById('progressinfo').innerHTML = '';
}

// /

function durationChanged() {
    if (!!document.getElementById('cmbpickup')) {
        var hrs = document.getElementById('cmbpickup').value.split(":");
        dt.setHours(hrs[0], hrs[1], 0);
    }
    pagenum = 0;
    loadcars(dt, ref, geog, pagenum);
}


function loadcars(datestring, referrer, point, pagenum) {

    if (point.indexOf('undefined') > -1) {
        point = '0,0';
    }

    var lastindex = -1;

    var cfilt = document.getElementById('IQclassfilter');
    if (!!cfilt) {
        IQclassfilter = cfilt.value;
        if (IQclassfilter >= 1) { IQclassfilter = true; }
        else { IQclassfilter = false; }
    }

    var ddl = document.getElementById('ddlpackages');
    if (!!ddl) {
        lastindex = ddl.value;
    }

    var IQduration = 1;
    var ddlduration = document.getElementById('lstduration');
    if (!!ddlduration) {
        IQduration = ddlduration.value;
    }


    jQuery.ajaxPrefilter('json', function (options, orig, jqXHR) {
        if (options.crossDomain && !jQuery.support.cors) {
            return 'jsonp';
        }
    });

    var jsondata = { 'request': datestring, 'referrer': referrer, 'latlng': point, 'filter1': filter1, 'filter2': filter2, 'pagenum': pagenum, 'directory': directory, 'pagecount': pagecount, 'isinfinite': IQisinfinite, 'packages': packages, 'usecheckbox': IQusecheckbox, 'showpackagetabs': IQshowpackagetabs, 'packagesfirst': IQpackagesfirst, 'onlypackages': IQonlypackages, 'filterpackagesonly': IQfilterpackagesonly, 'classfilter': IQclassfilter, 'assetGroup': IQassetgroup, 'donotpage': donotpage, 'duration': IQduration,'assettype': IQassettype};
    jsondata = JSON.stringify(jsondata);

    jQuery.ajax({
        type: 'POST',
        url: 'https://www.instant-quote.co/loadcars.ashx/loadcars/ProcessRequest',
        data: jsondata,
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        dataType: 'json',
        beforeSend: function () {
            showspinner();
            jQuery('#loader').show();
            document.getElementById('progressinfo').innerText = 'Loading available items.';
        },
        complete: function () {
            jQuery('#loader').hide();
            hidespinner();
            document.getElementById('progressinfo').innerText = '';
        },
        success: function (result) {
            if (IQisinfinite == 0) {
                document.getElementById('IQtransport').innerHTML = result.assethtml;
            }
            else {
                jQuery('#IQpage').remove();
                jQuery('#tmppackagespan').remove();
                jQuery('#IQpowered').remove();
                jQuery('#pkgdialog').remove();
                jQuery('#IQtransport').append(result.assethtml);
            }
            if (IQusecheckbox == false) {
                jQuery('.IQquotebuttondiv').remove();
            }

            IQisinfinite = 0;
            var tempoptiondiv;
            var optiondiv = document.getElementById('packagespan');
            if (!!optiondiv) {
                tempoptiondiv = document.getElementById('tmppackagespan');
                if (!!tempoptiondiv) {
                    optiondiv.innerHTML = tempoptiondiv.innerHTML;
                    ddl = document.getElementById('ddlpackages');
                    if (!!ddl) {
                        ddl.value = lastindex;
                    }
                }
                else {
                    optiondiv.innerHTML = '';
                }
            }
            //  jQuery('a[rel^="prettyPhoto"]').prettyPhoto();
            setPrettyPhoto(IQxy);
        },
        error: function (status) {
            IQisinfinite = 0;
            document.getElementById('IQtransport').innerHTML = '<p> Error retrieving available items </p>';
            alert('Error');
            jQuery('#processing').hide();
            jQuery('#loader').hide();
            hidespinner();
            document.getElementById('progressinfo').innerHTML = '';
        }
    });
}

function IQquotesubmit(assetid) {
    IQsingleassetid = assetid;
    // jQuery('#IQform').submit();
}

function hidereception(sender) {

    var elem = document.getElementById('receptionlocation');
    if (sender.checked) {
        elem.style.display = 'none';
        elem = document.getElementById('reception');
        if (!!elem) {
            elem.required = false;
            elem.value = '';
            elem.setAttribute('data-place', '');
            elem.setAttribute('data-address', '');
        }
    }
    else {
        elem.style.display = '';
        elem = document.getElementById('reception');
        if (!!elem) {
            elem.required = true;
        }
    }
}

function showpackages() {
    jQuery('#pkgdialog').dialog({ modal: true });
}
// var modal = jQuery('.selector').dialog('option', 'modal');
jQuery('.selector').dialog('option', 'modal', true);

function IQformatdate(tempdate) {
    var options = { month: 'short', day: '2-digit', year: 'numeric' };
    return tempdate.toLocaleDateString('en-US', options);
}

jQuery(function () {
    
});



function swapimage(img) {

    var img_elem = document.getElementById('main_asset_img');
    if (!!img_elem) {
        img_elem.src = img.src;
    }
};
jQuery('#showAssetInfo').click(function () {

});

function loadassetinfo(asset_id) {

    jQuery.ajaxPrefilter('json', function (options, orig, jqXHR) {
        if (options.crossDomain && !jQuery.support.cors) {
            return 'jsonp';
        }
    });

    var source = get_host();

    var jsondata = { 'IQassetid': parseInt(asset_id), 'IQdate': dt, 'IQhostid': source };

    jQuery.ajax({
        type: 'POST',
        url: 'https://www.instant-quote.co/webservices/assetdatasheet.ashx/assetdatasheet/ProcessRequest',
        data: JSON.stringify(jsondata),
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        dataType: 'json',
        beforeSend: function () {
            jQuery('#processing').show();
            jQuery('#loader').show();
            document.getElementById('progressinfo').innerText = 'Loading Data Sheet.';
        },
        complete: function () {
            jQuery('#processing').hide();
            jQuery('#loader').hide();
            hidespinner();
            document.getElementById('progressinfo').innerText = '';
        },
        success: function (result) {

            document.getElementById('assetinfo').innerHTML = result.assethtml;

            var AssetDialog = jQuery('#assetinfo').dialog({
                autoOpen: false,
                width: jQuery(window).width() > 500 ? 500 : jQuery(window).width(),
                height: 520,
                position: { my: 'right top', at: 'top+150', within: '#IQtransport' },
                maxWidth: 500,
                modal: true,
                buttons: [
                    {
                        text: 'Close',
                        click: function () {
                            jQuery(this).dialog('close');
                        }
                    }],

                open: function () {
                    jQuery('#tabs').tabs();
                    jQuery('.ui-dialog').centerInViewport(false);
                },
                close: function () {

                    document.getElementById('assetinfo').innerHTML = '<img src="https://www.instant-quote.co/images/ajax-loader.gif" alt="Loading images." />';
                }
            });


            jQuery(window).resize(function () {
                AssetDialog.dialog('option', 'position', 'center');
                if (jQuery(window).width() < 500) {
                    var width = AssetDialog.dialog('option', 'width');
                    AssetDialog.dialog('option', 'width', jQuery(window).width());
                }
            });
            // var img_elem = document.getElementById('main_asset_img');
            AssetDialog.dialog('open');
            jQuery('#assetinfo').dialog('option', 'title', result.assettitle);
        },
        error: function (status) {

            document.getElementById('assetinfo').innerHTML = '<p> Error retrieving Data Sheet </p><br /><a href="https://www.instant-quote.co/">Powered by Instant Quote automatic quotation management and booking for small businesses.</a>';
            var AssetDialog = jQuery('#assetinfo').dialog({
                autoOpen: false,
                width: jQuery(window).width() > 500 ? 500 : jQuery(window).width(),
                height: 'auto',
                maxWidth: 500,
                position: 'center',
                modal: true,
                open: function () {
                    jQuery('#tabs').tabs();
                },
                close: function () {
                    //Nothing
                }
            });


            jQuery(window).resize(function () {
                AssetDialog.dialog('option', 'position', 'center');
                if (jQuery(window).width() < 500) {
                    var width = AssetDialog.dialog('option', 'width');
                    AssetDialog.dialog('option', 'width', jQuery(window).width());
                }
            });

            jQuery('#assetinfo').dialog('option', 'title', 'Error');
            jQuery('#processing').hide();
            jQuery('#loader').hide();
            hidespinner();
            document.getElementById('progressinfo').innerHTML = '';
        }
    });
}

function loaddatasheet(info_img) {
    loadassetinfo(info_img.getAttribute('data-assetid'));
}


if (typeof directionsService !== 'undefined') {
    google.maps.event.addDomListener(window, 'load', initialize);
};

// Cookie code

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
/**
 * Vertically center an element (IE: a lightbox) to the viewport
 * If the element is taller than the window height absolute positioning is
 * used so that the element will scroll with the docuemnt
 *
 * @param {boolean} animate     Animate to new position or move immediately
 *520
 * @chainable
 */
jQuery.fn.centerInViewport = function (animate) {
    var POS_ABS = 'absolute',
        POS_FIX = 'fixed',
        jQuerywin = jQuery(window),
        offset = this.offset(),
        docH = jQuery('body').height();
    elH = this.height(),
        elW = this.width(),
        scrollTop = jQuerywin.scrollTop(),
        scrollLeft = jQuerywin.scrollLeft(),
        curTop = offset.top - scrollTop,
        elBottom = offset.top + elH,
        winH = jQuerywin.height(),
        winW = jQuerywin.width(),
        posType = (this.css('position') === POS_FIX) ? POS_FIX : POS_ABS,
        newTop = (winH - elH) / 2,
        newLeft = Math.max((winW - elW) / 2, 0),
        animate = (animate !== false),
        reposition = true;

    // el height is greater that viewport height
    if (newTop < 0) {
        // Make sure the bottom of the element will fit on the page
        // otherwise shift it up til it does
        newTop = Math.min(docH - elBottom, 0);

        // Don't bother repositioning downwards
        if (newTop >= curTop) {
            reposition = false;
        }
        posType = POS_ABS;

        // Allow the element to scroll with the page
        this.css({
            position: POS_ABS,
            top: offset.top + 'px'
        });
    }

    if (!reposition) {
        newTop = curTop;
    }

    if (posType === POS_ABS) {
        newTop += scrollTop;
        newLeft += scrollLeft;
    }

    if (animate) {
        this.animate({
            top: newTop,
            left: newLeft
        });
    } else {
        this.css({
            top: newTop + 'px',
            left: newLeft + 'px'
        });
    }
}
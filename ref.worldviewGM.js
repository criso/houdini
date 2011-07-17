$('#wv_topBar ul#wv_fsCounter').delay(12000).fadeIn(500);

touchMove = function(event) {
  event.preventDefault();
}

if (!window.CS) {
    window.CS = {};
}

CS.WorldView = function () {
    var MAXIMUM_MARKERS = 100,
        REFRESH_INTERVAL = 60000,
        INFO_WINDOW_DISPLAY_TIME = 3000,
        PROGRESS_BAR_WIDTH = 240;
        
    function bringInfoWindowToFront(infoWindow) {
        var maxZIndex = 0;
        $(".wv_infoWindow").each(function (i, e) {
            if ($(this).is(":visible")) {
                var i = parseInt($(this).css("z-index"));
                if (i > maxZIndex) { maxZIndex = i; }
            }
        });
        infoWindow.css("z-index", maxZIndex == 0 ? 999 : (maxZIndex + 1));
    }

    function WorldViewInfoWindow(opts) {
        google.maps.OverlayView.call(this);
        this.latlng_ = opts.latlng;
        this.map_ = opts.map;
        this.content = opts.content;
        // These values are now set correctly when draw is called
        this.offsetVertical_ = 0;
        this.offsetHorizontal_ = 0;
        this.height_ = 0;
        this.width_ = 0;

        var me = this;
        this.boundsChangedListener_ =
            google.maps.event.addListener(
                this.map_,
                "bounds_changed",
                function () {
                    return me.panMap.apply(me);
                }
            );
        // Once the properties of this OverlayView are initialized, set its map so
        // that we can display it.  This will trigger calls to panes_changed and draw.
        this.setMap(this.map_);
    }

    WorldViewInfoWindow.prototype = new google.maps.OverlayView();

    WorldViewInfoWindow.prototype.remove = function () {
        if (this.div_) {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
        }
    };

    WorldViewInfoWindow.prototype.isOpen = function () {
        if ((this.div_) && this.div_.style.visibility == "visible") return true;
        return false;
    };

    WorldViewInfoWindow.prototype.open = function () {
        if (!this.div_) return;
        this.div_.style.visibility = "visible";
        bringInfoWindowToFront($(this.div_));
        $(this.div_).show("drop", { direction: "down" }, 300);
    };

    WorldViewInfoWindow.prototype.close = function () {
        if (!this.div_) return;
        var dropTime = 300;
        $(this.div_).hide("drop", { direction: "up" }, dropTime);
        var zeWindow = this.div_;
        setTimeout(function () { zeWindow.style.visibility = "hidden"; }, dropTime);
    };

    WorldViewInfoWindow.prototype.draw = function () {
        // Creates the element if it doesn't exist already.
        this.createElement();
        if (!this.div_) return;

        var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
        if (!pixPosition) return;

        // Now position our div based on the div coordinates of our bounds
        this.width_ = $(this.div_).width();
        this.height_ = $(this.div_).height();
        this.offsetHorizontal_ = -1 * ((this.width_ + 2) / 2);
        this.offsetVertical_ = (-1 * this.height_) - 30;

        this.div_.style.width = this.width_ + "px";
        this.div_.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
        this.div_.style.height = this.height_ + "px";
        this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";

    };

    WorldViewInfoWindow.prototype.createElement = function () {
        var panes = this.getPanes();
        var div = this.div_;
        if (!div) {
            div = this.div_ = document.createElement("div");
            div.style.position = "absolute";
            div.className = "wv_infoWindow typeTag";

            var pointDiv = document.createElement("div");
            pointDiv.className = "wv_infoWindow_point";
            div.appendChild(pointDiv);
            div.innerHTML += this.content;

            function cl(iw) { return function () { iw.close(); }; }
            var closeButton = $(div).find(".closeInfoWindow").get(0);
            google.maps.event.addDomListener(closeButton, 'click', cl(this));

            var im = $(div).find("img.wv_avatar");
            im.parent().find(".wv_modalContent").css("padding-left", 0);
            im.load(function () {
                $(this).parent().find(".wv_modalContent").css("padding-left", "36px");
            });
            im.error(function () {
                // If we receive a 404 for the image, adjust the modal as required,
                // then get rid of the image itself.
                $(this).parent().find(".wv_modalContent").css("padding-left", 0);
                $(this).remove();
            });

            div.style.display = 'block';
            div.style.visibility = 'hidden';

            panes.floatPane.appendChild(div);
            this.panMap();

        } else if (div.parentNode != panes.floatPane) {
            // The panes have changed. Move the div.
            div.parentNode.removeChild(div);
            panes.floatPane.appendChild(div);
        }
    }

    // Pan the map to fit the WorldViewInfoWindow.
    WorldViewInfoWindow.prototype.panMap = function () {
        // if we go beyond map, pan map
        var map = this.map_;
        var bounds = map.getBounds();
        if (!bounds) return;

        // The position of the infowindow
        var position = this.latlng_;

        // The dimension of the infowindow
        var iwWidth = this.width_;
        var iwHeight = this.height_;

        // The offset position of the infowindow
        var iwOffsetX = this.offsetHorizontal_;
        var iwOffsetY = this.offsetVertical_;

        // Padding on the infowindow
        var padX = 40;
        var padY = 40;

        // The degrees per pixel
        var mapDiv = map.getDiv();
        var mapWidth = mapDiv.offsetWidth;
        var mapHeight = mapDiv.offsetHeight;
        var boundsSpan = bounds.toSpan();
        var longSpan = boundsSpan.lng();
        var latSpan = boundsSpan.lat();
        var degPixelX = longSpan / mapWidth;
        var degPixelY = latSpan / mapHeight;

        // The bounds of the map
        var mapWestLng = bounds.getSouthWest().lng();
        var mapEastLng = bounds.getNorthEast().lng();
        var mapNorthLat = bounds.getNorthEast().lat();
        var mapSouthLat = bounds.getSouthWest().lat();

        // The bounds of the infowindow
        var iwWestLng = position.lng() + (iwOffsetX - padX) * degPixelX;
        var iwEastLng = position.lng() + (iwOffsetX + iwWidth + padX) * degPixelX;
        var iwNorthLat = position.lat() - (iwOffsetY - padY) * degPixelY;
        var iwSouthLat = position.lat() - (iwOffsetY + iwHeight + padY) * degPixelY;

        // calculate center shift
        var shiftLng =
            (iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) +
            (iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
        var shiftLat =
            (iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) +
            (iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);

        // The center of the map
        var center = map.getCenter();

        // The new map center
        var centerX = center.lng() - shiftLng;
        var centerY = center.lat() - shiftLat;

        // We actually don't want this centering behaviour...
        //map.setCenter(new google.maps.LatLng(centerY, centerX));

        // Remove the listener after panning is complete.
        if (this.boundsChangedListener_) { google.maps.event.removeListener(this.boundsChangedListener_); }
        this.boundsChangedListener_ = null;
    };

    var isPublic = false,
        urls,
        map,
        campaignStatus,
        markers,
        infoWindows,
        geocoder = new google.maps.Geocoder();

    function setupCustomControls() {
        var zoomInControl = document.getElementById("zoomIn"),
            zoomOutControl = document.getElementById("zoomOut");
        google.maps.event.addDomListener(zoomInControl, 'click', function () {
            map.setZoom(map.getZoom() + 1);
        });
        google.maps.event.addDomListener(zoomOutControl, 'click', function () {
            map.setZoom(map.getZoom() - 1);
        });
    }

    function setCounts(counts) {
        $("#topBarOpenCount").html(numberWithCommas(counts.Opens));
        $("#topBarClickCount").html(numberWithCommas(counts.Clicks));
        $("#topBarShareCount").html(numberWithCommas(counts.Shares));
    }

    function cleanup() {
        cleanupExcessInfoWindows();
        cleanupExcessMarkers();
    }

    function cleanupExcessInfoWindows() {
        var numWindows = infoWindows.length;
        if (numWindows > MAXIMUM_MARKERS) {
            for (var i = 0; i < (numWindows - MAXIMUM_MARKERS); i++) {
                infoWindows[i].remove();
            }
            infoWindows.splice(0, (numWindows - MAXIMUM_MARKERS));
        }
    }

    function cleanupExcessMarkers() {
        // Ensure that we only show a specified maximum number of markers
        var numMarkers = markers.length;
        if (numMarkers > MAXIMUM_MARKERS) {
            for (var i = 0; i < (numMarkers - MAXIMUM_MARKERS); i++) {
                markers[i].setMap(null);
            }
            markers.splice(0, (numMarkers - MAXIMUM_MARKERS));
        }
    }

    function dropMarker(latitude, longitude, marker_url, infoWindowContent, openInfoWindow) {
        var anim = (openInfoWindow == true) ? google.maps.Animation.DROP : null;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: map,
            animation: anim,
            icon: new google.maps.MarkerImage(
                marker_url,
                new google.maps.Size(8, 18),
                new google.maps.Point(0, 0),
                new google.maps.Point(0, 18)
            ),
            shadow: new google.maps.MarkerImage(
                urls.MarkerShadow,
                new google.maps.Size(17, 12),
                new google.maps.Point(0, 0),
                new google.maps.Point(0, 12)
            )
        });
        var iw = new WorldViewInfoWindow({
            map: map,
            latlng: marker.getPosition(),
            content: infoWindowContent
        });
        google.maps.event.addListener(marker, 'click', function () {
            if (iw.isOpen()) {
                iw.close();
            } else {
                iw.open();
            }
        });
        if (openInfoWindow) {
            setTimeout(function () {
                iw.open();
                setTimeout(function () { iw.close(); }, INFO_WINDOW_DISPLAY_TIME);
            }, 350); // Caters for drop animation time
        }
        markers.push(marker);
        infoWindows.push(iw);
        // If we're opening the info window, it isn't an initial drop of markers,
        // so we want to clean up any excess old ones.
        if (openInfoWindow) {
            cleanup();
        }
    }

    function buildInfoWindowContent(avatarUrl, specificContent) {
        var windowClass = "wv_imageInfoWindow";
        if (isPublic == true) { windowClass = "wv_imagelessInfoWindow"; }
        var content = '<div class="' + windowClass + '">';
        if (isPublic != true) {
            content += '<img class="wv_avatar" src="' + avatarUrl + '" width="32" height="32" />';
        }
        content += '<div class="wv_modalContent">';
        content += specificContent;
        content += '</div>';
        content += '<span class="closeInfoWindow">Close</span>';
        content += '</div>';
        return content;
    }

    function getShareIconClass(shareType) {
        var iconClass = "forwardBadgeIcon";
        if (shareType == "Tweet") {
            iconClass = "twitterBadgeIcon";
        } else if (shareType == "Like") {
            iconClass = "facebookBadgeIcon";
        }
        return iconClass;
    }

    function getShareInfo(shareType) {
        var info = "Forwarded";
        if (isPublic) {
            info += " this email";
        }
        if (shareType == "Tweet") {
            info = "Tweeted"
            if (isPublic) {
                info = "Mentioned on Twitter";
            }
        } else if (shareType == "Like") {
            info = "Liked";
            if (isPublic) {
                info += " on Facebook";
            }
        }
        return info;
    }

    function getLocation(thing, prefix) {
        var loc = "";
        var country = "";
        if (thing.Country) country = thing.Country.replace("United States of America", "USA");
        if (thing.City && thing.Region) {
            loc = prefix + " " + thing.City + ", " + thing.Region;
        } else if (thing.Country) {
            loc = prefix + " " + country;
        }
        return loc;
    }

    function getOpenInfoWindowContent(open) {
        var content = '';
        content += '<span class="openBadge"><span class="openBadgeIcon"></span></span>';
        content += '<span class="wv_name">'
        if (isPublic == true) {
            content += "Opened this campaign";
        } else {
            if (open.Name) {
                content += open.Name;
            } else {
                content += open.EmailAddress;
            }
        }
        content += '</span>';
        content += '<span class="wv_info">';
        if (isPublic == true) {
            content += getLocation(open, "in");
        } else {
            content += "Opened " + getLocation(open, "in");
        }
        content += '</span>';
        return content;
    }

    function getClickInfoWindowContent(click) {
        var content = '';
        content += '<span class="clickBadge"><span class="clickBadgeIcon"></span></span>';
        content += '<span class="wv_name">';
        if (isPublic == true) {
            content += "Clicked a link";
        } else {
            if (click.Name) {
                content += click.Name;
            } else {
                content += click.EmailAddress;
            }
        }
        content += '</span>';
        content += '<span class="wv_info">';
        if (isPublic == true) {
            content += getLocation(click, "in");
        } else {
            content += "Clicked " + getLocation(click, "in");
        }
        content += '</span>';
        return content;
    }

    function getShareInfoWindowContent(share) {
        var content = '';
        content += '<span class="shareBadge"><span class="' + getShareIconClass(share.ShareType) + '"></span></span>';
        content += '<span class="wv_name">';
        if (isPublic == true) {
            content += getShareInfo(share.ShareType);
        } else {
            content += share.Name;
        }
        content += '</span>';
        content += '<span class="wv_info">';
        if (isPublic == true) {
            content += getLocation(share, "from");
        } else {
            content += getShareInfo(share.ShareType) + " " + getLocation(share, "from"); ;
        }
        content += '</span>';
        return content;
    }

    function dropMarkers(data, initialDrop) {
        var index = 0;
        var total = data.Opens.length + data.Clicks.length + data.Shares.length;
        var dropInterval = REFRESH_INTERVAL / total;
        if (initialDrop == true) { dropInterval = 0; }
        
        $.each(data.Opens, function (i, o) { o.Type = "Open" });
        $.each(data.Clicks, function (i, c) { c.Type = "Click" });
        $.each(data.Shares, function (i, s) { s.Type = "Share" });
        var all = $.merge($.merge($.merge([], data.Opens), data.Clicks), data.Shares);
        $.each(all, function(i, e) { e.Index = (Math.random() * (total - 1) + 1) });
        all.sort(function(a, b) { return a.Index - b.Index; });
        
        $.each(all, function (i, e) {
          if (e.Type == "Open") {
            setTimeout(function () {
                var openCount = parseInt($("#topBarOpenCount").html());
                $("#topBarOpenCount").html(numberWithCommas(++openCount))
                dropMarker(e.Lat, e.Long, urls.OpenMarker, buildInfoWindowContent(
                    e.AvatarUrl, getOpenInfoWindowContent(e)), !initialDrop);
            }, dropInterval * index);
          }
          if (e.Type == "Click") {
            setTimeout(function () {
                var clickCount = parseInt($("#topBarClickCount").html());
                $("#topBarClickCount").html(numberWithCommas(++clickCount))
                dropMarker(e.Lat, e.Long, urls.ClickMarker, buildInfoWindowContent(
                    e.AvatarUrl, getClickInfoWindowContent(e)), !initialDrop);
            }, dropInterval * index);
          }
          if (e.Type == "Share") {
            setTimeout(function () {
                var shareCount = parseInt($("#topBarShareCount").html());
                $("#topBarShareCount").html(numberWithCommas(++shareCount))
                dropMarker(e.Lat, e.Long, urls.ShareMarker, buildInfoWindowContent(
                    e.AvatarUrl, getShareInfoWindowContent(e)), !initialDrop);
            }, dropInterval * index);
          }
          index++;
        });
    }

    function onCountdownExpiry() {
        $('#wv_countdown').fadeOut(500);
        $('#wv_queued').delay(500).fadeIn(500);
        setTimeout(function() {
          $('#wv_queued').delay(500).fadeOut(500);
          // Show sending in a few steps
          var sendingData = { Status:"Sent", ScheduledTime:"", ScheduledUTCOffsetMinutes:0, NumberSent:0, TotalRecipients:2068 };
          showSending(sendingData);
          
          $('#wv_progressBar').delay(1500).animate({ width: PROGRESS_BAR_WIDTH }, 2500);
          $('#wv_progressData').hide();
          $('#wv_sentAlert').delay(4000).fadeIn(300);
          $('#wv_sending').delay(4000).fadeOut(800);
          setTimeout(function() {
            getWorldViewData();
          }, 2000);
        }, 600);
    }

    function startCountdown(data) {
        var d = data.ScheduledTime.split(','); // Expected format: "yyyy,MM,dd,hh,mm,ss"
        var sendTime = new Date(d[0], (d[1] - 1), d[2], d[3], d[4], d[5]);
        $('#wv_countdown').countdown({
            until: sendTime,
            timezone: data.ScheduledUTCOffsetMinutes,
            layout: '<h3>Sending in {d<}{dn} {dl}{d>}</h3><div class="wv_counter"><span id="wv_time">{hnn}:{mnn}:{snn}</span><span class="wv_horizontal"></span></div>',
            onExpiry: onCountdownExpiry
        });
        $('#wv_countdown').show();
    }

    function showSending(data) {
        $('#wv_sending').delay(1500).fadeIn(500);
        for (var i = 1; i <= data.TotalRecipients; i += 200) {
          $('#wv_amount').html(numberWithCommas(data.NumberSent));
          $('#wv_totalsent').html(numberWithCommas(data.TotalRecipients));
          var progressInPixels = ((i / data.TotalRecipients) * PROGRESS_BAR_WIDTH);
        }
    }

    function updateStatusData(data) {
        campaignStatus = data.Status;
        if ((data.Status == 'Scheduled' || data.Status == 'ABScheduled') &&
            !$("#wv_countdown").is(":visible") && !$("#wv_queued").is(":visible")) {
            // If we're not already counting down, or queuing, start doing so...
            startCountdown(data);
        } else if (data.Status == 'Sending' || data.Status == 'ABSending') {
            $('#wv_countdown').hide();
            $('#wv_queued').hide();
            showSending(data);
        } else if (data.Status == 'Sent' &&
            ($("#wv_countdown").is(":visible") || $("#wv_queued").is(":visible") || $("#wv_sending").is(":visible"))) {
            $('#wv_countdown').hide();
            $('#wv_queued').hide();
            $('#wv_sending').show();
            $('#wv_progressData').fadeOut(300);
            $('#wv_progressBar').animate({ width: PROGRESS_BAR_WIDTH }, 500);
            $('#wv_sentAlert').fadeIn(300);
            $('#wv_sending').fadeOut(800);
        }
    }

    function getWorldViewData() {
        var data = worldviewData; // Loaded from script element in the page
        var initialDrop = false; // Yes, show modals...
        dropMarkers(data, initialDrop);
    }

    function setupCampaignStatus(data) {
        if (data.Status == 'Scheduled' || data.Status == 'ABScheduled') {
            startCountdown(data);
        } else if (data.Status == 'Sending' || data.Status == 'ABSending') {
            showSending(data);
        }
    }

    return {
        focusOnCountry: function (country) {
            geocoder.geocode({ 'address': country }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.panTo(results[0].geometry.location);
                    map.setZoom(3);
                }
            });
        },
        load: function (publicMode, data) {
            isPublic = publicMode;
            campaignStatus = data.StatusData.Status;
            markers = [];
            infoWindows = [];
            urls = data.Urls;
            urls.MarkerShadow = data.Urls.ImagesDomain + "http://i2.campaignmonitor.com/worldview/demo/img/worldview/pin_shadow.png";
            urls.OpenMarker = data.Urls.ImagesDomain + "http://i2.campaignmonitor.com/worldview/demo/img/worldview/green_pin.png";
            urls.ClickMarker = data.Urls.ImagesDomain + "http://i2.campaignmonitor.com/worldview/demo/img/worldview/blue_pin.png";
            urls.ShareMarker = data.Urls.ImagesDomain + "http://i2.campaignmonitor.com/worldview/demo/img/worldview/orange_pin.png";

            var opts = {
                zoom: 4,
                center: new google.maps.LatLng(37.0902400,-95.7128910),
                mapTypeControl: false,
                zoomControl: false,
                scaleControl: false,
                panControl: false,
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                minZoom: 2
            };
            map = new google.maps.Map(document.getElementById("map"), opts);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById("mapControls"));
            setupCustomControls();
            setupCampaignStatus(data.StatusData);
        }
    };
} ();

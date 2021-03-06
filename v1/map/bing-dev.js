	var map;
	var last_infowindow;
	var last_marker;
	var markers = [];
	
	function createMarker(data) {

		var html = "<img src='"+data.image+"'/>";
		
		if(data.image.indexOf('_end') != -1)
			html += " <b>Received At</b> ("+data.ip+")";
		else if(data.image.indexOf('_start') != -1)
			html += " <b>Sent From</b> ("+data.ip+")";
		else
			html += " <b>Hop #"+data.hopnum+"</b> ("+data.ip+")";
		if(data.lat){
			var marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(data.lat, data.lng),{
		  		text: '1',
				icon: data.image,
				width: 16, 
				height: 16, 
				draggable: false
			});
			if(data.countryName != '' && data.countryCode != '')
				html += "<br/>" + data.countryName + " ("+data.countryCode+") ";
			else if(data.countryName != '')
				html += "<br/>" + data.countryName;
			else if(data.countryCode != '')
				html += "<br/>" + data.countryCode;
			if(data.flag)
				html += "<img src='"+data.flag+"'/>";
				
			if(data.state != '' && data.city != '')
				html += "<br/>" + data.city+", "+data.state;
			else if(data.state != '')
				html += "<br/>" + data.state;	
			else if(data.city != '')
				html += "<br/>" + data.city;	
			
			if(data.host)
				html += "<br/>Received By:<i> " + data.host + "</i>";
			if(showWeather && data.weather){
				var wimage = data.weather.image.split('/');
				if((wimage[5].indexOf('clear') != -1 || wimage[5].indexOf('sun') != -1) && !isDay())
					data.weather.image = data.weather.image.replace(wimage[5],'clear_night.png');
				else if(wimage[5].indexOf('cloudy') != -1 && !isDay())
					data.weather.image = data.weather.image.replace(wimage[5],'cloudy_night.png');

				if(!$('#milage') || $('#milage').data('unit')=='mi')
					html += '<br/>Weather: <img src="'+data.weather.image+'"/> '+data.weather.cond+' '+data.weather.temp.F+'&deg;F';	
				else
					html += '<br/>Weather: <img src="'+data.weather.image+'"/> '+data.weather.cond+' '+data.weather.temp.C+'&deg;C';	
			}
			Microsoft.Maps.Pushpin.prototype.title = null;
	        marker.title = "Hop #"+data.hopnum;
	        Microsoft.Maps.Pushpin.prototype.description = null;
	        marker.description = '<div class="pop">'+html+'</div>';
	        
	        Microsoft.Maps.Events.addHandler(marker, 'mouseover', displayHopInfo);
	        
	        map.entities.push(marker);
	         	  	
		  	markers[data.hopnum]=marker;
	  				
		}
		
	  	//add marker to sidebar
	  	if($('#route').length){
	  		if(data.lat)
			  	$('#route ul').append('<li onclick="ShowWin('+data.hopnum+')">'+html+'</li>');
			 else
			 	$('#route ul').append('<li>'+html+'</li>');
		  }
	  
	}
	
	function ShowWin(hopnum)
	{
		var event = {targetType: 'pushpin', target: markers[hopnum]};
		displayHopInfo(event); 
	}
	
	function displayHopInfo(e) {
		if (e.targetType == "pushpin") {
			var pix = map.tryLocationToPixel(e.target.getLocation(), Microsoft.Maps.PixelReference.control);
			var infoboxTitle = document.getElementById('infoboxTitle');
			infoboxTitle.innerHTML = e.target.title;
			var infoboxDescription = document.getElementById('infoboxDescription');
			infoboxDescription.innerHTML = e.target.description;
			var infobox = document.getElementById('infoBox');
			infobox.style.top = (pix.y - 60) + "px";
			infobox.style.left = (pix.x + 5) + "px";
			infobox.style.visibility = "visible";
			document.getElementById('map').appendChild(infobox);
		}
     }
	
	function closeInfoBox() {
    	var infobox = document.getElementById('infoBox');
        infobox.style.visibility = "hidden";
    }
    
    function addCommas(nStr)
	{
		nStr += '';
		var x = nStr.split('.');
		var x1 = x[0];
		var x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}
	      
	function initMap(data) {
	    var centered = false;
	    var myOptions = {
	      zoom: 4,
	      center: new Microsoft.Maps.Location(0, -180),
	      mapTypeId: Microsoft.Maps.MapTypeId.road,
	      credentials: 'ArC22WZz7G3ZxSbLboja40Too556IsURBiVnPdQXK_7jAUVmd5uoFuNXuBf_ObWh'
	    };
			
	    map = new Microsoft.Maps.Map(document.getElementById("map"), myOptions);
		var emailCoordinates = [];
		 
		if(data.meta.code==200){	
			$(data.response.route).each(function(){
				createMarker(this);
				if(this.lat){
					emailCoordinates.push(new Microsoft.Maps.Location(this.lat, this.lng));	
					//center on first point
					if(!centered){
						centered=true;
						map.setView({center:new Microsoft.Maps.Location(this.lat, this.lng)});
					}
				}
			});
			
			if(emailCoordinates.length>0){
				var mailPath = new Microsoft.Maps.Polyline(emailCoordinates,{strokeColor: new Microsoft.Maps.Color(200,255,0,0),strokeThickness: 2});
			    map.entities.push(mailPath);
			}
			
			if($('#milage').data('unit')=='mi')
				$('#milage').html('This message traveled '+addCommas(Math.round(data.response.distance.miles))+' miles');
			else
				$('#milage').html('This message traveled '+addCommas(Math.round(data.response.distance.kilometers))+' kilometers');
		}
  }
  
   function isDay(){
	var d = new Date();
	if(d.getHours()>7 && d.getHours()<19)
		return true;
	else
		return false;
	}
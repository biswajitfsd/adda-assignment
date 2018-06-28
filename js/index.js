  $(document).ready(function() {

  // global variables
  var scheduled = localStorage.getItem("scheduled") || [];
      localStorage.setItem('scheduled', scheduled);
  var facilities = ['Tennis Court', 'Club House'],
      priceObj = {};
  var bookedList = localStorage.getItem("scheduled");
      if(bookedList !== null && bookedList !== ""){
        scheduled = JSON.parse(bookedList);
        console.log(scheduled);
      }


  // 1. Booking Object creation
  function Booking(obj) {
    this.name = obj.userName;
    this.date = obj.date;
    this.facilitie = obj.facilitie;
    var cost=0, j=obj.startTime, timeInterval = obj.endTime - obj.startTime;
    var priceCall = function() {
      switch (obj.facilitie) {
        case "Tennis Court":
          for (var i = 0; i < timeInterval; i++) {
            if (obj.startTime <= j < obj.endTime) {
              cost += j<16 ? 1000:500;
              j++;

              //Old method
              // if (j<16) {
              //   cost += 1000;
              //   j++;
              // } else {
              //   cost += 500;
              //   j++;
              // }
            }
          }
          return cost;
          break;
        default:
          for (var i = 0; i < timeInterval; i++) {
            if (obj.startTime <= j < obj.endTime) {
              cost += 50;
              j++;
            }
          }
          return cost;
      }
    };
    var timeConversion = function (time) {
      if (time > 12) {
        time = time-12;
        time = "0" + time + ":00 pm";
      } else if (time < 12) {
        time = time + ":00 pm";
      } else {
        time = time + ":00 noon";
      }
      return time;
    };
    var startTime = function() {
      return timeConversion(obj.startTime);
    };
    var endTime = function() {
      return timeConversion(obj.endTime);
    };
    this.price = priceCall();
    this.startTime = startTime();
    this.endTime = endTime();
  }

  //2. Endtime Define Function
  function endTimedropdown(value) {
    var i = ++value;
    var str = [];
    for (i; i <=22; i++){
      if(i>12){
        var textCon = i-12;
        var strlnth = (textCon).toString();
        strlnth = strlnth.length;
        console.log(strlnth);
        if(strlnth <= 1) {
          textCon = "0" + textCon + ":00 pm";
          str.push($("<option></option>").attr("value",i).text(textCon));
        } else {
          textCon = textCon + ":00 pm";
          str.push($("<option></option>").attr("value",i).text(textCon));
        }
      } else if(i<12) {
        var textCon = i;
        textCon = textCon + ":00 am";
        str.push($("<option></option>").attr("value",i).text(textCon));
      } else {
        var textCon = i;
        textCon = textCon + ":00 noon";
        str.push($("<option></option>").attr("value",i).text(textCon));
      }
      // console.log(str);
    }
    return str;
  }

  // 3. convert serializeArray into Object
  function jQFormSerializeArrToJson(formSerializeArr) {
		var jsonObj = {};
		jQuery.map(formSerializeArr, function(n, i) {
			jsonObj[n.name] = n.value;
		});
		return jsonObj;
	}

  // 4. Check null object before Submit
  function checkProperties(obj) {
    for (var key in obj) {
      if (obj[key] !== null && obj[key] != "")
        return false;
    }
    return true;
  }

  //5. To check time slot is available or not
  function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key.forth] === value.facilitie && array[i][key.first] === value.date && array[i][key.second] === value.startTime && array[i][key.third] === value.endTime) {
        return false;
      }
    }
    return true;
  }

  //================== Onload functionalities ==========//
  //1. Appends facilities available
  $.each(facilities, function(index, value) {
    $('.facilitiesOptions').append(
      $("<option></option>").attr("value",value).text(value)
    );
  });

  //2. Datepicker iniciater
  var startDate = 0;
  var endDate = "+3M";
  $( "#datepicker" ).datepicker({
    dateFormat:'mm/dd/yy',
    minDate: startDate,
    maxDate: endDate,
    onSelect: function() {
      $(".time__container").show();
      $('form').trigger('change');
    }
  });

//================== After incialize functionalities ==========//
  //1. Append end Times
  $(document).on('change', '.startTime', function(){
    if($(this).val() !== "") {
      $('.endTime').find('option').remove();
      var res = endTimedropdown($(this).val());
      $('.endTime').append(res);
      // $('.endTime').trigger('change');
      $('.endTime').find('option').eq(0).attr('selected', 'selected');
    } else {
      $('.endTime').find('option').remove();
    }
  });

  // Change userName
  $(document).on('click', '.changeUser', function() {
    $('input[name="userName"]').removeAttr('readonly');
  })

  // 2. Submit button Enable
  $(document).on('click', '.startTime, .endTime', function(){
    var className = $(this)[0].className;
    className = className.split(" ");
    className = className[0];
    if($('.startTime').val() !== "" && $('.endTime').val() !== "") {
      $(".formSubmit").removeAttr('disabled');
    } else {
      $(".formSubmit").attr('disabled', 'disabled');
    }
  });

  //3. Change in end Times
  $(document).on('change', 'form', function(){
    var endTimeVar = $('.endTime').val();
    if(endTimeVar !== "" && endTimeVar !== null) {
      var data = $('form').serializeArray();
      data = jQFormSerializeArrToJson(data);
      console.log(data);
      if (data.facilitie !== "") {
        priceObj = new Booking(data);
        console.log("Full Object is ", priceObj);
        $('form').find(".priceDiv").remove();
        $('form').prepend('<div class="form-group priceDiv"><label for="price">Total Price:</label><div>Rs '+priceObj.price+'</div></div>'
        );
      } else {
        $('form').find(".priceDiv").remove();
        alert("Please select a facilitie");
      }
    }
  });

  //4. Submit formSubmit
  $('form').submit(function(e) {
    e.preventDefault();
    var objCheck = checkProperties(priceObj);
    console.log(objCheck);
    if(!objCheck) {
      var key = {
        first: "date",
        second: "startTime",
        third: "endTime",
        forth: "facilitie"
      }
      var objExistance = findObjectByKey(scheduled, key, priceObj);
      if (objExistance) {
        console.log(priceObj);
        scheduled.push(priceObj);
        // localStorage.setItem("scheduled", scheduled);
        localStorage.setItem("scheduled", JSON.stringify(scheduled));
        console.log(scheduled);
        alert("Booked, Rs. "+priceObj.price+" being charged");
        location.reload();
      } else {
        alert("Booking Failed, Already Booked");
      }
    }
  });

  // History Page for table content
  console.log(scheduled);
  $("#tableHistory tbody").find('tr').remove();
  var content = "";
  var number;
  for (var i = 0; i < scheduled.length; i++) {
    number = i;
    number = ++number;
    content+="<tr>";
    content+="<td>"+number+"</td>";
    content+="<td>"+scheduled[i].name+"</td>";
    content+="<td>"+scheduled[i].facilitie+"</td>";
    content+="<td>"+scheduled[i].date+"</td>";
    content+="<td>"+scheduled[i].startTime+"</td>";
    content+="<td>"+scheduled[i].endTime+"</td>";
    content+="<td>"+scheduled[i].price+"</td>";
    content+="</tr>";
  }
  $("#tableHistory tbody").append(content);
});

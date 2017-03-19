// Открытие/закрытие строки поиска пользователей - кнопка с изображением лупы в правом верхнем углу
// Вызов всплывающего окна - кнопка с pie chart. Нажатие на slice'ы диаграмм - показать численное соотношение, выраженное процентным

var amount = 7, // кол-во пользователей, запрошенных с сервера
	flag = 0, // 0 - открытых для расширенного просмотра юзверей нет, 1 - vice versa
	prev_index = 0; // индекс ранее выбранной строки для просмотра расширенной инфо о юзвере
var UserList = new Array; // массив, куда будут сохранены сгенерированные сервером пользователи + их параметры 

// Main function
$(function(){
	download_users(); 		// получить коллекцию юзверей с сервера
	show_user_list(); 		// сформировать из них таблицу
	activate_list_rows(); 	// сделать некоторые строки таблицы активными для просмотра расширенной инфо о юзвере
	setup_search_field(); 	// настроить поисковое поле. Под частичным вхождением будем понимать наличие подстроки (запроса пользователя) в строке (имени пользователя в структуре данных UserList)
	create_chart_window(); // создать всплывающее окно и разместить в нём чарт.
});

// Get users from the server
function download_users(){
	$.ajax({
			url: 'https://randomuser.me/api/?results='+amount+'&nat=us,dk,fr,gb&noinfo',
			async: false,
			dataType: 'json',
			success: 
				function(data) {
				  	UserList=data.results;
				},
			error: function (request, status, error) {
        			alert("Error!\nDescription: " + request.status + " " + request.responseText);
    			}
			}); 
};

// Show user list on the page
function show_user_list(){
	var first='<td></td>', 
		second='<td>Last</td>', 
		third='<td>First</td>', 
		fourth='<td>Username</td>', 
		fifth='<td>Phone</td>', 
		sixth='<td>Location</td>', 
		seventh='<td></td>',
		tr_class, gender, date,
		p1, p2, p3, p4;
	$('.list').append('<tr class="main">' + first + second + third + fourth + fifth + sixth + seventh + '</tr>');

	for(var i=0; i<amount; i++) {
		first='<td><img src="'+UserList[i].picture.thumbnail+'" class="user_img"/></td>';
		second='<td>'+UserList[i].name.last.substr(0,1).toUpperCase()+UserList[i].name.last.substr(1)+'</td>';
		third='<td>'+UserList[i].name.first.substr(0,1).toUpperCase()+UserList[i].name.first.substr(1)+'</td>';
		fourth='<td>'+UserList[i].login.username+'</td>';
		fifth='<td>'+UserList[i].phone+'</td>';
		sixth='<td>'+UserList[i].location.state+'</td>';
		seventh='<td><div id="button_plus"></div></td>';

		if(i%2===0) tr_class='d6'; // класс, отвечающий за цвет строки = #efefef
		else tr_class='ef'; // #d6d7d8

		$('.list').append('<tr class="main '+tr_class+'">' + first + second + third + fourth + fifth + sixth + seventh + '</tr>');

		gender='<div class="user '+UserList[i].gender+'"></div>';

		date=new Date(UserList[i].registered); // преобразовываем дату, пришедшую с сервера, в адекватный формат. Ниже выбираем оттуда мес/день/год

		$('.list').append('<tr class=" '+tr_class+' name_format">'+'<td></td><td colspan=7>'+UserList[i].name.first.substr(0,1).toUpperCase()+UserList[i].name.first.substr(1)+'  '+gender+'</td>'+'</tr>');

		p2='<p><b>Username</b> '+UserList[i].login.username.toLowerCase()+'</p>';
		p3='<p><b>Registered</b> '+("0" + (date.getMonth() + 1)).slice(-2)+'/'+("0" + date.getDate()).slice(-2)+'/'+date.getFullYear()+'</p>';
		p4='<p><b>Email</b> '+UserList[i].email.toLowerCase()+'</p>';
		first='<td></td><td colspan=2>'+p2+p3+p4+'</td>';

		p1='<p><b>Address</b> '+UserList[i].location.street+'</p>';
		p2='<p><b>City</b> '+UserList[i].location.city.toLowerCase()+'</p>';
		p3='<p><b>Zip Code</b> '+UserList[i].location.postcode+'</p>';
		second='<td>'+p1+p2+p3+'</td>';

		p1='<p><b>Birthday</b> '+UserList[i].location.street.toLowerCase()+'</p>';
		p2='<p><b>Phone</b> '+UserList[i].phone+'</p>';
		p3='<p><b>Cell</b> '+UserList[i].cell+'</p>';
		third='<td>'+p1+p2+p3+'</td>';

		fourth='<td colspan=2><img src="'+UserList[i].picture.large+'" class="user_img user_large"/></td>';

		$('.list').append('<tr class=" '+tr_class+' info_format">'+ first + second + third + fourth + '</tr>');

	}
		$('.list').wrap('<div id="listDiv"></div>');
};

// Make rows clickable
function activate_list_rows(){
	$('.list').find('tr').not('.main').hide(); // прячем строки с расширенной инфо

	$('.list').on('click', 'tr', function(){
		var current_index = $(this).closest('tr').index();

		/* Индексы кликабельных строк вычисляются по формуле: 3n+1. При наведении на них - cursor: pointer 
		   Индексы строк, не являющиеся членами ариф.прогрессии (в которых advanced user info (AdUsIn) находится), кликабельными не д.б. */

		if(current_index>0 && (current_index-1)%3===0) { 
			if(flag>0) {
				if(prev_index===current_index) { // дважды кликнули на одну строку
					flag=0; prev_index=0;
					$('.list').find('tr').eq(current_index+1).hide();
					$('.list').find('tr').eq(current_index+2).hide();
					$(this).closest('tr').find('div').css("background-image","url('../img/plus.png')");
					$(this).closest('tr').find('img').css("border-color","#fff");
				}
				else { // выбран другой пользователь. Предыдущие строки с AdUsIn сворачиваются 
					flag=1;
					$('.list').find('tr').eq(prev_index+1).hide();
					$('.list').find('tr').eq(prev_index+2).hide();	
					$('.list').find('tr').eq(prev_index).find('div').css("background-image","url('../img/plus.png')");
					$('.list').find('tr').eq(prev_index).find('img').css("border-color","#fff");
					prev_index=current_index;
					$('.list').find('tr').eq(current_index+1).show();
					$('.list').find('tr').eq(current_index+2).show();
					$(this).closest('tr').find('div').css("background-image","url('../img/minus.png')");
					$(this).closest('tr').find('img').css("border-color","#83d4b2");
				}
			}

			else { // Ни один пользователь ранее не был выбран для расширенного просмотра
				prev_index=current_index; flag=1;
				$('.list').find('tr').eq(current_index+1).show();
				$('.list').find('tr').eq(current_index+2).show();
				$(this).closest('tr').find('div').css("background-image","url('../img/minus.png')");
				$(this).closest('tr').find('img').css("border-color","#83d4b2");
			}
		}
	});
};

// Configure search parameters
function setup_search_field(){
	$( "#search_field" ).keyup(function() {
    	var request=$(this).val();
    	var index=1;
    	for(var i=0; i<amount; i++){ // Остраиваем таблицу заново: из строки запроса k-ый символ м.б. удалён
    			$('.list').find('tr').eq(index).show();
    			index+=3;
    	}

    	index=1; 
    	var counter=1;
    	for(var i=0; i<amount; i++){ // Отображаем только тех, чьи имена содержат подстроку-запрос
    		if((UserList[i].name.first.toLowerCase()).search(request.toLowerCase())===-1) 
    			$('.list').find('tr').eq(index).hide(); 
    		else {
    			if(counter%2===0) { // чередование цветов
    				$('.list').find('tr').eq(index).css('background','#efefef'); 
    				$('.list').find('tr').eq(index+1).css('background','#efefef'); // если во время поиска будет открыт просмотр пользователя
    				$('.list').find('tr').eq(index+2).css('background','#efefef');
    			}
    			else { 
    				$('.list').find('tr').eq(index).css('background','#d6d7d8');
    				$('.list').find('tr').eq(index+1).css('background','#d6d7d8');
    				$('.list').find('tr').eq(index+2).css('background','#d6d7d8');
    			}
    			counter++;
    		}
    		index+=3;
    		if(flag===1) { // если в момент поиска происходил просмотр пользователя
    			$('.list').find('tr').eq(prev_index+1).hide();
    			$('.list').find('tr').eq(prev_index+2).hide();
    			$('.list').find('tr').eq(prev_index).find('div').css("background-image","url('../img/plus.png')");
				$('.list').find('tr').eq(prev_index).find('img').css("border-color","#fff");
				flag=0;
    		}
    	}
 	});
}; 

// Create popup window and google pie chart as its part 
function create_chart_window(){
	$('body').append('<div id="filler"></div>');
	$('#filler').append('<div id="popup_window"></div>'); // полупрозрачный слой поверх элементов пред. уровня
	$('#popup_window').append('<div id="chart_head"></div>'); // блок с всплывающим окном
	$('#chart_head').append('<div id="p1">Gender of Users</div><div id="p2">&#x2715;</div>'); 
	$('#popup_window').append('<div id="chart"></div>');

	$('#chart_button').click(function() {
		$('#filler').css('visibility','visible');
		$('#popup_window').css('visibility','visible');
	});	
	$('#p2').click(function() {
		$('#filler').css('visibility','hidden');
		$('#popup_window').css('visibility','hidden');
	});

	// Найти существ с gender=male
	var men=0;
	for(var i=0; i<amount; i++) {
		if(UserList[i].gender==='male') men++;
	}

	var women=amount-men;

      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(function() {

	    var data = new google.visualization.DataTable();
	    data.addColumn('string', 'Topping');
	    data.addColumn('number', 'Slices');
	    data.addRows([
	         		 ['Men', men],
	          		 ['Women', amount-men]
	        ]);

        var options = {  
        				title: '',        				
					 	colors: ['#7cb5ec', '#434348'], 
        				backgroundColor: 'transparent',  
        				legend: { 
					   		position: 'bottom', 
					   		textStyle: {
					   			color: '#7cb5ec', 
					   			fontSize: 12
					   		}
					   	},
					   	chartArea:{
					   		width: '100%',
					   		heigth: '100%'
					   	},
					   	pieSliceText: 'none',	
        };

	    var chart = new google.visualization.PieChart($('#chart')[0]);
	    chart.draw(data, options);
      });
};


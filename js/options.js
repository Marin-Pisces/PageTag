let current_id_num = 0;

$(document).ready( function(){
		chrome.storage.local.get('labels', function(result) {
		const value = result.labels || {};
		const sortedKeys = Object.keys(value).sort((a, b) => {
			const idA = Number(value[a].id);
			const idB = Number(value[b].id);
			return idA - idB;
		});
		$.each(sortedKeys, function(_, key) {
			const val = value[key];
			let current_row_id = key;
			let html = labelTextBox(current_row_id, val.Label);
			html += urlTextBox(val.URLRegexpFilter);
			html += posSelectBox(val.Position);
			html += styleSelectBox(val.Style, val.id);
			html += colorPicker(val.Color, val.id);
			html += alphaSlider(val.Alpha, val.id);
			html += colorTester(val.Color, val.Alpha, val.Style);
			html += NowTimerCheck(val.NowTimer);
			html += EnabledCheck(val.Enabled);
			html += delButton(val.id);
			$('#data_table tbody').append(html);

			if (Number(val.id) >= current_id_num) {
				current_id_num = Number(val.id) + 1;
			}
		});
	});
});

$(document).on('click', 'button[id="new_marker"]', function() {
	const row_init = initColumn();
	$('#data_table tbody').append(row_init);
})

$(document).on('click', 'button[id="save"]', function() {
	saveData();
	const toast = '<div class="toast">Save</div>';
	$('.toast_area').append(toast);
	const toast_elem = $('.toast').last();

	setTimeout(function() {
		toast_elem.css('opacity', 1);
	}, 10);

	setTimeout(function() {
		toast_elem.css('opacity', 0);
		setTimeout(function() {
			toast_elem.remove();
		}, 200);
	}, 500);
})

$(document).on('click', 'button[id="import"]', function() {
	document.getElementById("fileInput").click();
})

document.getElementById("fileInput").addEventListener("change", function (event) {
	importData(event);
	window.location.reload();
})

$(document).on('click', 'button[id="export"]', function() {
	exportData();
})

$(document).on('click', 'button[id^="Del_"]', function() {
	const buttonId = $(this).attr('id');
	const pop_id = buttonId.split('_').pop();
	const row_id = 'Data_' + pop_id;

	deleteData(row_id);
	$('#' + row_id).remove();
})

$(document).on('change', 'input[id^="color_"]', function() {
	const color_id = $(this).attr('id');
	const pop_id = color_id.split('_').pop();
	const style_id = 'style_' + pop_id;
	const alpha_id = 'alpha_' + pop_id;
	const tester_id = 'tester_' + pop_id;
	const style_value = $('#' + style_id).val();
	const color_value = $(this).val();
	const alpha_value = $('#' + alpha_id).val();

	const newHTML = colorTesterReright(color_value, alpha_value, style_value, pop_id);
	$('#' + tester_id ).replaceWith(newHTML);
});

$(document).on('change', 'input[id^="alpha_"]', function() {
	const alpha_id = $(this).attr('id');
	const pop_id = alpha_id.split('_').pop();
	const style_id = 'style_' + pop_id;
	const color_id = 'color_' + pop_id;
	const tester_id = 'tester_' + pop_id;
	const style_value = $('#' + style_id).val();
	const color_value = $('#' + color_id).val();
	const alpha_value = $(this).val();

	const newHTML = colorTesterReright(color_value, alpha_value, style_value, pop_id);
	$('#' + tester_id ).replaceWith(newHTML);
});

$(document).on('change', 'select[id^="style_"]', function() {
	const style_id = $(this).attr('id');
	const pop_id = style_id.split('_').pop();
	const color_id = 'color_' + pop_id;
	const alpha_id = 'alpha_' + pop_id;
	const tester_id = 'tester_' + pop_id;
	const style_value = $(this).val();
	const color_value = $('#' + color_id).val();
	const alpha_value = $('#' + alpha_id).val();

	const newHTML = colorTesterReright(color_value, alpha_value, style_value, pop_id);
	$('#' + tester_id ).replaceWith(newHTML);
});

/*conponent*/

function importData(event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	console.log(reader);
	reader.onload = function (e) {
		const data = JSON.parse(e.target.result);
		chrome.storage.local.set(data, function () {
			alert("Import settings");
		});
	}
	reader.readAsText(file);
}

function exportData() {
	chrome.storage.local.get(null, function (data) {
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "PageTag_settings_backup.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	});
}

function saveData() {
	datas = {};
	$('table tbody tr').each(function() {
		const row = $(this).attr('id');
		const row_label = $(this).find('.label').val();
		const row_url = $(this).find('.url').val();
		const row_pos = $(this).find('.pos').val();
		const row_sty = $(this).find('.sty').val();
		const row_col = $(this).find('.col').val();
		const row_alp = $(this).find('.alp').val();
		const row_timer = $(this).find('.timer').prop("checked");
		const row_enable  = $(this).find('.enable').prop("checked");
		const row_id = row.split('_').pop();
		const row_data = {
			id: row_id,
			Label: row_label,
			URLRegexpFilter: row_url,
			Position: row_pos,
			Style: row_sty,
			Color: row_col,
			Alpha: row_alp,
			NowTimer: row_timer,
			Enabled: row_enable
		}
		if(row_label != '' && row_url != '') {
			datas[row] = row_data;
		}
	});
	chrome.storage.local.set({labels: datas});
}

function deleteData(key) {
	chrome.storage.local.get('labels', function(result) {
		let datas = result.labels || {};
		delete datas[key];
		chrome.storage.local.set({labels: datas});
	});
}

function initColumn() {
	const data_num = 'Data_' + String(current_id_num);
	let html = labelTextBox(data_num);
	html += urlTextBox();
	html += posSelectBox();
	html += styleSelectBox();
	html += colorPicker();
	html += alphaSlider();
	html += colorTester();
	html += NowTimerCheck();
	html += EnabledCheck();
	html += delButton();

	current_id_num++;
	return html;
}

// html
function labelTextBox(row_id, value = '') {
	const labels =
	'<tr id="' + row_id + '"><td class="table_line_right" scope="row"><input class="text_box label" type="text" value="' +
	value + '"/></td>';
	return labels;
}

function urlTextBox(value = '') {
	const urls =
	'<td class="table_line_right"><input class="text_box url" type="text" value="' +
	value + '"/></td>';
	return urls;
}

function posSelectBox(init_value = 'top') {
	const top = InitSelectState('top', init_value);
	const bottom = InitSelectState('bottom', init_value);
	const left = InitSelectState('left', init_value);
	const right = InitSelectState('right', init_value);
	const poss =
	'<td class="table_line_right select_box"><select  class="pos" name="pos">' +
	top + bottom + left + right + '</select></td>';
	return poss;
}

function styleSelectBox(init_value = 'simple', current_id = current_id_num) {
	const simple = InitSelectState('simple', init_value);
	const border = InitSelectState('border', init_value);
	const diagonal_stripe = InitSelectState('diagonal_stripe', init_value);
	const plaid = InitSelectState('plaid', init_value);
	const hatching = InitSelectState('hatching', init_value);

	const stys =
	'<td class="table_line_right select_box"><select id="style_' + current_id + '" class="sty" name="sty">' +
		simple + border + diagonal_stripe + plaid + hatching + '</select></td>';
	return stys;
}

function colorPicker(value = "#C2FBFF", current_id = current_id_num) {
	const col = '<td class="table_line_right"><input id="color_' + current_id + '" class="color_picker col" type="color" name="col" value="'
	+ value + '"/></td>';
	return col;
}

function alphaSlider(value = 100, current_id = current_id_num) {
	const alp = '<td class="table_line_right"><input id="alpha_' + current_id + '" class="number alp" type="number" min="0" max="100" value="' + value + '"/></td>';
	return alp;
}

function colorTester(col_value = "#C2FBFF", alp_value = 100, sty_value = 'simple', current_id = current_id_num) {
	var red   = parseInt(col_value.substring(1,3), 16);
	var green = parseInt(col_value.substring(3,5), 16);
	var blue  = parseInt(col_value.substring(5,7), 16);
	const colorRGB = red + ',' + green + ',' + blue;

	const col_tester = '<td class="table_line_right"><div id="tester_' + current_id + '" class="tester bg_' + sty_value + '_pattern" style="background-color:rgba(' + colorRGB + ',' + alp_value/100 + ')";><span class="tester_str">test</span></div></td>';
	return col_tester;

}

function colorTesterReright(col_value = "#C2FBFF", alp_value = 100, sty_value = 'simple', current_id = current_id_num) {
	var red   = parseInt(col_value.substring(1,3), 16);
	var green = parseInt(col_value.substring(3,5), 16);
	var blue  = parseInt(col_value.substring(5,7), 16);
	const colorRGB = red + ',' + green + ',' + blue
	const rewright_tester = '<div id="tester_' + current_id + '" class="tester bg_' + sty_value + '_pattern"style="background-color:rgba(' + colorRGB + ',' + alp_value/100 + ')";><span class="tester_str">test</span></div>';
	return rewright_tester;
}

function NowTimerCheck(value = true) {
	const timer = '<td class="table_line_right bold_line">' + InitCheckState('timer' ,value) + '</td>';
	return timer;
}

function EnabledCheck(value = true) {
	const enable = '<td class="table_line_right">' + InitCheckState('enable', value) + '</td>';
	return enable;
}

function delButton(value = current_id_num) {
	return '<td class="table_last_right_element"><button id="' + 'Del_' + value + '" class="button_desing"><span class="button_icon"><svg version="1.1" id="*x32*" xmlns="[http://www.w3.org/2000/svg"](http://www.w3.org/2000/svg%E2%80%9D) xmlns:xlink="[http://www.w3.org/1999/xlink"](http://www.w3.org/1999/xlink%E2%80%9D) x="0px" y="0px" viewBox="0 0 512 512" style="width: 16px; height: 16px; opacity: 1;" xml:space="preserve"><g><path class="st0" d="M499.453,210.004l-55.851-2.58c-5.102-0.23-9.608-3.395-11.546-8.103l-11.508-27.695c-1.937-4.728-0.997-10.145,2.455-13.914l37.668-41.332c4.718-5.188,4.546-13.205-0.421-18.182l-46.434-46.443c-4.986-4.967-13.003-5.159-18.2-0.412l-41.312,37.668c-3.778,3.443-9.206,4.402-13.924,2.436l-27.694-11.488c-4.718-1.946-7.864-6.454-8.094-11.565l-2.589-55.831C301.675,5.534,295.883,0,288.864,0h-65.708c-7.02,0-12.831,5.534-13.156,12.562l-2.571,55.831c-0.23,5.111-3.376,9.618-8.094,11.565L171.64,91.447c-4.737,1.966-10.165,1.007-13.924-2.436l-41.331-37.668c-5.198-4.746-13.215-4.564-18.201,0.412L51.769,98.198c-4.986,4.977-5.158,12.994-0.422,18.182l37.668,41.332c3.452,3.769,4.373,9.186,2.416,13.914l-11.469,27.695c-1.956,4.708-6.444,7.873-11.564,8.103l-55.832,2.58c-7.019,0.316-12.562,6.118-12.562,13.147v65.699c0,7.019,5.543,12.83,12.562,13.148l55.832,2.579c5.12,0.229,9.608,3.394,11.564,8.103l11.469,27.694c1.957,4.728,1.036,10.146-2.416,13.914l-37.668,41.313c-4.756,5.217-4.564,13.224,0.403,18.201l46.471,46.443c4.967,4.977,12.965,5.15,18.182,0.422l41.312-37.677c3.759-3.443,9.207-4.392,13.924-2.435l27.694,11.478c4.719,1.956,7.864,6.464,8.094,11.575l2.571,55.831c0.325,7.02,6.136,12.562,13.156,12.562h65.708c7.02,0,12.812-5.542,13.138-12.562l2.589-55.831c0.23-5.111,3.376-9.619,8.094-11.575l27.694-11.478c4.718-1.957,10.146-1.008,13.924,2.435l41.312,37.677c5.198,4.728,13.215,4.555,18.2-0.422l46.434-46.443c4.967-4.977,5.139-12.984,0.421-18.201l-37.668-41.313c-3.452-3.768-4.412-9.186-2.455-13.914l11.508-27.694c1.937-4.709,6.444-7.874,11.546-8.103l55.851-2.579c7.019-0.318,12.542-6.129,12.542-13.148v-65.699C511.995,216.122,506.472,210.32,499.453,210.004z M256.01,339.618c-46.164,0-83.622-37.438-83.622-83.612c0-46.184,37.458-83.622,83.622-83.622s83.602,37.438,83.602,83.622C339.612,302.179,302.174,339.618,256.01,339.618z"></path></g></svg></span><span class="button_text">Del</span></button></td></tr>';
}

function InitSelectState(state, value) {
	const selected = (state === value) ? ' selected' : '';
	return '<option value="' + state + '"' + selected + '>' + state + '</option>';
}

function InitCheckState(id_str, value) {
	if(value) {
		return '<input class="checkbox ' + id_str + '" type="checkbox" name="enable" checked/>';
	}
	else {
		return '<input class="checkbox ' + id_str + '" type="checkbox" name="enable"/>';
	}
}
document.getElementById('adbHost').innerHTML = `ADB > ${window.location.host}`;

$(document).ready(function() {
    $.getJSON('/topButton', function(res) {updateBtn(res)});
    $.getJSON('/network', function(res) {updateNetwork(res)});
});

$(document).on('click', '[id="btnMobileData"]', function() {
    const onOff = this.name;
    document.getElementById('btnMobileData').setAttribute('disabled', '');
    $.post('/switchButton', {'name': 'mobileData', 'state': onOff});
});

let shortPress = true;
let timer;

$('#btnWifi').on('mousedown', function() {
    shortPress = true;
    timer = setTimeout(function() {
        shortPress = false;
        $.getJSON('/scanWifi', function(res) {updateWifiList(res)});
    }, 500);
});

$('#btnWifi').on('mouseup', function() {
    clearTimeout(timer);
    if (shortPress == true) {
        document.getElementById('btnWifi').setAttribute('disabled', '');
        const onOff = document.getElementById('btnWifi').getAttribute('name');
        $.post('/switchButton', {'name': 'wifi', 'state': onOff});
    }
});

$(document).on('click', '[id="btnAirplaneMode"]', function() {
    const onOff = this.name;
    document.getElementById('btnAirplaneMode').setAttribute('disabled', '');
    $.post('/switchButton', {'name': 'airplane', 'state': onOff});
});

function updateBtn(res) {
    if (res.status === 'ok') {
        const mobileDataId = res.btnData === 'on' ? 'off' : 'on';
        const mobileDataICon = res.btnData === 'on' ? 'font-size: 48px; color: dodgerblue;' : 'font-size: 48px; color: black;';
        const wifiId = res.btnWifi === 'on' ? 'off' : 'on';
        const wifiICon = res.btnWifi === 'on' ? 'font-size: 48px; color: dodgerblue;' : 'font-size: 48px; color: black;';
        const airplaneId = res.btnAirplane === 'on' ? 'off' : 'on';
        const airplaneICon = res.btnAirplane === 'on' ? 'font-size: 48px; color: dodgerblue;' : 'font-size: 48px; color: black;';

        document.getElementById('battery').innerHTML = `${res.battery} <i class="fa fa-battery-0" style="color: black"></i>`;
        document.getElementById('btnMobileData').setAttribute('name', mobileDataId);
        document.getElementById('mobileData_icon').setAttribute('style', mobileDataICon);
        document.getElementById('btnWifi').setAttribute('name', wifiId);
        document.getElementById('wifi_icon').setAttribute('style', wifiICon);
        document.getElementById('btnAirplaneMode').setAttribute('name', airplaneId);
        document.getElementById('airplaneMode_icon').setAttribute('style', airplaneICon);
    }
}

function updateNetwork(res) {
    if (res.status === 'ok') {
        if (res.priority === 'mobile_data') {
            document.getElementById('networkInfo').innerHTML = `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><b style="float: left;">Network Priority</b><b style="float: right;">Mobile Data</b></span>`;
            document.getElementById('networkInfo').innerHTML += `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><b style="float: left;">Status</b><b style="float: right;">${res.dataState}</b></span>`;
            document.getElementById('networkInfo').innerHTML += `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><b style="float: left;">Operator</b><b style="float: right;">${res.dataOperator}</b></span>`;
        }

        if (res.priority === 'wifi') {
            document.getElementById('networkInfo').innerHTML = `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><b style="float: left;">Network Priority</b><b style="float: right;">Wifi</b></span>`;
            document.getElementById('networkInfo').innerHTML += `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><b style="float: left;">Status</b><b style="float: right;">${res.wifiState}</b></span>`;
            document.getElementById('networkInfo').innerHTML += `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><b style="float: left;">SSID</b><b style="float: right;">${res.wifiSsid}</b></span>`;
        }
    }
}

function updateWifiList(res) {
    $('#mainModal').modal('show');

    if (res.status === 'ok') {
        document.getElementById('modalResult').innerHTML = '';
        for (let i = 0; i < res.wifi.length; i++) {
            document.getElementById('modalResult').innerHTML += `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><b style="float: left;"><i class="fa fa-wifi" id="wifi_icon" style="color: dodgerblue;"></i> ${res.wifi[i].ssid}</b><b style="float: right;">Connect</b></span>`;
        }
    } else {
        document.getElementById('modalResult').innerHTML = `<span type="button" class="btn btn-white w-100 align-items-stretch d-flex" style="width: 358px; background-color: #EBEBEB;"><center><b style="color: red;">Network Priority</b></center></span>`;
    }
}

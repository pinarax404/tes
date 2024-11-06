document.getElementById('adbHost').innerHTML = `ADB > ${window.location.host}`;

$(document).ready(function() {
    $.getJSON('/topButton', function(res) {
        const mobileDataId = res.btnData === 'on' ? 'off' : 'on';
        const mobileDataICon = res.btnData === 'on' ? 'font-size: 48px; color: dodgerblue;' : 'font-size: 48px; color: black;';
        const wifiId = res.btnWifi === 'on' ? 'off' : 'on';
        const wifiICon = res.btnWifi === 'on' ? 'font-size: 48px; color: dodgerblue;' : 'font-size: 48px; color: black;';
        const airplaneId = res.btnAirplane === 'on' ? 'off' : 'on';
        const airplaneICon = res.btnAirplane === 'on' ? 'font-size: 48px; color: dodgerblue;' : 'font-size: 48px; color: black;';

        document.getElementById('battery').innerHTML = `${res.battery}% <i class="fa fa-battery-0" style="color: black"></i>`;
        document.getElementsByName('btnMobileData')[0].setAttribute('id', mobileDataId);
        document.getElementById('mobileData_icon').setAttribute('style', mobileDataICon);
        document.getElementsByName('btnWifi')[0].setAttribute('id', wifiId);
        document.getElementById('wifi_icon').setAttribute('style', wifiICon);
        document.getElementsByName('btnAirplaneMode')[0].setAttribute('id', airplaneId);
        document.getElementById('airplaneMode_icon').setAttribute('style', airplaneICon);
    });

    $.getJSON('/network', function(res) {

    });
});

$(document).on('click', '[name="mobile_data"]', function() {
    const onOff = this.id;
    document.getElementsByName('mobile_data')[0].setAttribute('disabled', '');
    $.post('/mobile_data', {
        'set': onOff
    }, function() {
        btnLoad();
    });
});

$(document).on('click', '[name="wifi"]', function() {
    const onOff = this.id;
    document.getElementsByName('wifi')[0].setAttribute('disabled', '');
    $.post('/wifi', {
        'set': onOff
    }, function() {
        btnLoad();
    });
});

$(document).on('click', '[name="airplane"]', function() {
    const onOff = this.id;
    document.getElementsByName('airplane')[0].setAttribute('disabled', '');
    $.post('/airplane', {
        'set': onOff
    }, function() {
        btnLoad();
    });
});

function updateBtn() {

}

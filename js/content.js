const currentUrl = window.location.href;

let display = '';
let matchFound = false;
let label = '';
let pos = '';
let style = '';
let color = '';
let alpha = '';
let enable = false;
let timer = false;
let now_time = 'yyyy/mm/dd (○) 00:00:00';
var timer_html;
var loading_complete_flag = false;

    $(document).ready( function(){
    chrome.storage.local.get('labels', function(result) {
        const labels = result.labels || {};
        $.each(labels, function(key, val) {
            const urlReg = new RegExp(val.URLRegexpFilter);
            if (urlReg.test(currentUrl)) {
                matchFound = true;
                label = val.Label;
                pos = val.Position;
                style = val.Style;
                color = val.Color;
                alpha = val.Alpha;
                enable = val.Enabled;
                timer = val.NowTimer;
            }
        });
        if(matchFound && enable) {
            chrome.storage.local.get(display, function() {
                markers_html(label, pos, style, color, alpha);
                loading_complete_flag = true;
            });
        }
    });
});

$(function(){
    setInterval(function(){
        if(loading_complete_flag) {
            timer_html = document.getElementById('pageMarker_plusElement_timer');
            showCurrentTime(timer, timer_html);
        }
    }, 1000);
    $(window).on('resize', function() {
        const width = window.innerWidth;
        var css = document.getElementsByClassName('rotated');
        adjustFontSize(width, css);
    });
});

function markers_html(label, pos, style, color, alpha) {
    let page_marker = '<div id="pageMarker_plusElement_div"><span class="rotated">' + label + '<span id="pageMarker_plusElement_timer"></span></span></div>';
    $('body').append(page_marker);
    var div_css = document.getElementById('pageMarker_plusElement_div');
    var text_css = document.getElementsByClassName('rotated');
    timer_html = document.getElementById('pageMarker_plusElement_timer');
    markers_design(div_css, text_css, pos,style, color, alpha);
}

function markers_design(css, text_css, pos, style, color, alpha) {
    const width = window.innerWidth;

    var red   = parseInt(color.substring(1,3), 16);
    var green = parseInt(color.substring(3,5), 16);
    var blue  = parseInt(color.substring(5,7), 16);

    $(css).css({
        "z-index": 2147483647,
        "width": "100%",
        "height": "20px",
        "position": "fixed",
        "border-radius": "0px",
        "padding": "0",
        "margin": "0",
        "background": "rgba(" + red + "," + green + "," + blue + "," + (alpha / 100) + ")",
        "text-align": "center",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "overflow": "hidden",
        "pointer-events": "none"
    });
    $(text_css).css({
        "text-shadow": "0 0 5px rgba(255,255,255,0.9)",
        "background": "linear-gradient(to right,rgba(255, 255, 255, 0), rgb(255, 255, 255, 0.8), rgba(255, 255, 255, 0))",
        "border-radius": "6px",
        "padding": "0px 150px",
        "color": "000000_1",
        "font-family": "arial",
        "font-size": "18px"
    })

    choose_pos(css, pos, text_css);
    choose_style(css, pos, style);
    adjustFontSize(width, text_css);
}

function choose_pos(css, pos, text_css) {
    const thickness = '20px'
    if(pos === 'top') {
        $(css).css({
            "width": '100%',
            "height": thickness,
            "top": '0vh',
            "left": '0vw'
        });
    } else if(pos === 'bottom') {
        $(css).css({
            "width": '100%',
            "height": thickness,
            "bottom": '0vh',
            "left": '0vw'
        });
    } else if(pos === 'left') {
        $(css).css({
            "height": '100%',
            "width": thickness,
            "top": '0vh',
            "left": '0vw',
        });
        $(text_css).css({
            "transform": "rotate(-90deg)",
            "white-space": "nowrap"
        });
    } else if(pos === 'right') {
        $(css).css({
            "height": '100%',
            "width": thickness,
            "top": '0vh',
            "right": '0vw',
        });
        $(text_css).css({
            "transform": "rotate(-90deg)",
            "white-space": "nowrap"
        });
    }
}

function choose_style(css, pos, style) {
    if(style === 'border') {
        if(pos === 'right' || pos === 'left') {
            $(css).css({
                "background-image": 'repeating-linear-gradient(0deg,#ffffff50, #ffffff50 5px,transparent 0, transparent 15px)'
            });
        } else if(pos === 'top' || pos === 'bottom') {
            $(css).css({
                "background-image": 'repeating-linear-gradient(90deg,#ffffff50, #ffffff50 5px,transparent 0, transparent 15px)'
            });
        }
    } else if(style === 'diagonal_stripe') {
        $(css).css({
            "background-image": 'repeating-linear-gradient(45deg,#ffffff50, #ffffff50 5px,transparent 0, transparent 15px)'
        });
    } else if(style === 'plaid') {
        $(css).css({
            "background-image": 'repeating-linear-gradient(90deg, #ffffff50, #ffffff50 5px, transparent 0, transparent 15px), repeating-linear-gradient(0deg, #ffffff50, #ffffff50 5px, transparent 0, transparent 15px)'
        });
    } else if(style === 'hatching') {
        $(css).css({
            "background-image": 'repeating-linear-gradient(45deg, #ffffff50, #ffffff50 5px, transparent 5px, transparent 15px),repeating-linear-gradient(-45deg, #ffffff50, #ffffff50 5px, transparent 5px, transparent 15px)'
        });
    }
}

function adjustFontSize(width ,css) {
    const {font_size, padding_size} = windowSizeSurveillance(width);
    $(css).css({
        "font-size": font_size,
        "padding": padding_size
    });
}

function windowSizeSurveillance(width) {
    const min = 400;
    const small = 500;
    const midium = 700;
    var font_size = '';
    var padding_size = '';
    if(width <= min) {
        font_size = '10px';
        padding_size = '5px 80px';
    } else if(width <= small){
        font_size = '14px';
        padding_size = '2px 100px';
    } else if(width <= midium){
        font_size = '16px';
        padding_size = '1px 120px';
    } else {
        font_size = '18px';
        padding_size = '0px 140px';
    }
    return {font_size, padding_size};
}

function showCurrentTime(timer, timer_html) {
    if (timer) {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const day = (function(now_date) {
            let day_num = now_date.getDay();
            let day_str = '';
            if (day_num == 0) day_str = 'Sun';
            else if (day_num == 1) day_str = 'Mon';
            else if (day_num == 2) day_str = 'Tue';
            else if (day_num == 3) day_str = 'Wed';
            else if (day_num == 4) day_str = 'Thu';
            else if (day_num == 5) day_str = 'Fri';
            else if (day_num == 6) day_str = 'Sat';
            else day_str = '';

            return day_str;
        })(now);
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        const time = '&nbsp;&nbsp;&nbsp;'+year+'/'+month+'/'+date+' ('+day+') '+hour+':'+minute+':'+second;

        timer_html.innerHTML = time;
    }
}
var imgurAPI = '04afc95795235a7';

function calculateRatio(num_1, num_2){
    for(num=num_2; num>1; num--) {
        if((num_1 % num) == 0 && (num_2 % num) == 0) {
            num_1=num_1/num;
            num_2=num_2/num;
        }
    }
    return num_1 + ":" + num_2;
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        return clipboardData.setData("Text", text);
    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

function forceDownload(blob, filename) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function downloadResource(url, filename) {
    if (!filename) filename = url.split('\\').pop().split('/').pop();
    fetch(url, {
        headers: new Headers({
          'Origin': location.origin
        }),
        mode: 'cors'
      })
      .then(response => response.blob())
      .then(blob => {
        let blobUrl = window.URL.createObjectURL(blob);
        forceDownload(blobUrl, filename);
      })
      .catch(e => console.error(e));
}

function downloadImage(url, filename, id) {
    downloadResource(url, filename);
    var fullId = ".downloadLink#" + id
    $(fullId).addClass("highlight");
    setTimeout(function () {
          $(fullId).removeClass('highlight');
    }, 2000);
}

function copyImageUrl(url, id) {
    copyToClipboard(url);
    var fullId = ".urlLink#" + id
    $(fullId).addClass("highlight");
    setTimeout(function () {
          $(fullId).removeClass('highlight');
    }, 2000);
}

function imgurResize(link) {
    return [link.slice(0, 27), "l", link.slice(27)].join('');
}

function showInfoBox(id, inout) {
    var fullId = "#" + id;
    if (inout == 'in') {
        $(fullId).fadeIn(200);
    } else {
        $(fullId).fadeOut(200);
    }
}

function requestAlbumInfo() {
    var request_url = "https://api.imgur.com/3/album/hv7HPxG"
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() { 
        if (req.readyState == 4 && req.status == 200) {
            processRequestAlbum(req.responseText);
        }
    }
    req.open("GET", request_url, true);    
    req.setRequestHeader('Authorization', 'Client-ID ' + imgurAPI);
    req.send(null);
}

function copyLicenseText() {
    copyToClipboard('By <a href="https://git.sebdoe.com/free-to-use" target="_blank">Sebastian Doe</a> - Licensed for reuse under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>.');
}

function processRequestAlbum(response_text) {
    if (response_text == "Not found") {
        console.log("Imgur photo not found.");
    } else {
        var json = JSON.parse(response_text);
        for (let i of json.data.images) {
            var splitInfo = i.description.split(";");
            console.log(splitInfo);
            var description = splitInfo[0];
            var fullName = splitInfo[0].replace(/([A-Z])/g, ' $1').trim();
            var location = splitInfo[1].replace(/([A-Z])/g, ' $1').trim();
            var date = splitInfo[2];
            $(".photoList").append(`
                <div class="imageContainer">
                    <img src="` + imgurResize('https://i.imgur.com/' + i.id + '.jpg') + `" class="listPhoto ` + description + ` ` + i.id + `" alt="` + fullName + `" onmouseover="showInfoBox('`+description+`', 'in');"/>
                    <div class="infoBox" id="` + description + `" style="display: none;" onmouseleave="showInfoBox('`+description+`', 'out');">
                        <span class="infoBoxName">` + fullName + `</span><br><br>
                        <span class="infoHolder"><i class="material-icons imageInfo">insert_drive_file</i> <span class="` + i.id + ` fileName">` + description + `.jpg</span></span><br>
                        <span class="infoHolder"><i class="material-icons imageInfo">photo_size_select_actual</i> <span class="` + i.id + ` widthHeight">` + i.width + 'x' + i.height + `</span></span><br>
                        <span class="infoHolder"><i class="material-icons imageInfo">aspect_ratio</i> <span class="` + i.id + ` aspectRatio">` + calculateRatio(i.width, i.height) + `</span></span><br>
                        <span class="infoHolder"><i class="material-icons imageInfo">place</i> <span class="` + i.id + ` location">` + location + `</span></span><br>
                        <span class="infoHolder"><i class="material-icons imageInfo">event</i> <span class="` + i.id + ` date">` + date + `</span></span><br>
                        <span class="infoHolder"><i class="material-icons imageInfo">visibility</i> <span class="` + i.id + ` views">` + i.views + `</span></span><br>
                        <span class="infoHolder"><i class="material-icons imageInfo">copyright</i> <span class="` + i.id + ` license">By <a href="https://sebastiandoe5.github.io/free-to-use" target="_blank">Sebastian Doe</a> - Licensed for reuse under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a>. <a href="javascript:copyLicenseText();">Copy as HTML</a></span></span><br>
                        <a class="download downloadLink" href="javascript:downloadImage('` + 'https://i.imgur.com/' + i.id + '.jpg' + `', '` + description + `', '` + i.id + `');" id="` + i.id + `"><i class="material-icons download">get_app</i> Download</a>
                        <a class="url urlLink" href="javascript:copyImageUrl('` + 'https://i.imgur.com/' + i.id + '.jpg' + `', '` + i.id + `');" id="` + i.id + `"><i class="material-icons url">link</i> Copy URL</a>
                    </div>
                </div>
            `);
        }
    }
}

function populatePhotoList() {
    requestAlbumInfo();
}

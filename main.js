/**
 * Copyright (c) Mohammad Naghavi <mohamnag@gmail.com>
 *
 * Licenced as stated by LICENSE file under root of this code.
 *
 * * NOTICE:
 *      If your nginx config varies from the default config
 *      provided in this code, you probably need to change
 *      value of filesBaseUrl here too.
 *
 * Created by mohamnag on 11/02/16.
 * modify by rubnet on 08/04/2022.
 */

$(document).ready(function () {
function noop(){};

var ajaxOpts = {
      success: noop,
      error: noop,
      complete: noop,
      type: 'GET',
      async: true
    };

var uid = Date.now();
cash.guid = function(){
  return '_cash'+(uid++).toString(16);
};

cash.ajax = function(url,options) {

  if ( arguments.length === 1 ) {
    options = url;
    url = options.url;
  }

  if ( !url ) { return false; }

  options = cash.extend({},ajaxOpts,options);

  var request,
      queryData,
      callbackName;

  if ( options.dataType === 'jsonp' || options.dataType === 'script' ) {
    request = document.createElement('script');
    callbackName = cash.guid();

    options.data.callback = callbackName;
    window[callbackName] = function(data){
      options.success.call(request, data, null, request);
    };

    request.onload = request.onerror = function(e){ 
      if ( e && e.type === "error" ) {
        options.error.call(this, request);
      }
      options.complete.call(this, request);
      request.remove();
    }

    queryData = '?';
    for (var key in options.data){
      queryData += encodeURIComponent(key) + '=' + encodeURIComponent(options.data[key]) +'&';
    }

    request.src = url + queryData;
    document.head.appendChild(request);

  } else {
    request = new XMLHttpRequest();
    request.open(options.type, url, options.async);

    request.setRequestHeader("X-Requested-With","XMLHttpRequest");

    request.onload = request.onerror = function onload() {
      var text = request.statusText;
      if ( request.status >= 200 && request.status < 400 ) {
        var response = request.responseText;
        if ( options.dataType === 'json' ) { response = JSON.parse(response); }
        options.success.call(this, response, text, request);
      } else {
        options.error.call(this, request, text);
      }
      options.complete.call(this, request, text);
    };

    if ( options.data ) {
      queryData = cash.isString(options.data) ? options.data : JSON.stringify(options.data);
    }

    request.send( queryData );
  }

  return request;
};
    function applyTheme() {
        var theme = $('input[name=theme]:checked').val()

        console.log(`setting theme to '${theme}'`)

        $('body')
            .removeClass()
            .addClass(theme)

        localStorage.setItem("theme", theme)
    }

    function renderFileElement(directory, fileName, fileType, fileSize, fileDate) {

        var fileItemElement = fileItemElementTemplate.clone();

        fileItemElement.addClass(fileType);
        fileItemElement.find(".file-name").text(fileName);

        if (fileDate) {
            fileItemElement.find(".file-date").text(moment(fileDate).fromNow());
        }

        if (fileType === "parent") {
            // navigate to parent dir
            fileItemElement.find(".file-link").on('click', function () {
                navigateTo(directory);
            });

        } else if (fileType === "directory") {
            // navigate to sub dir
            fileItemElement.find(".file-link").on('click', function () {
                navigateTo(directory + fileName + "/");
            });

        } else if (fileType === "other") {
            // nginx returns symlinks as type other,
            // lets try to follow the links
            fileItemElement.find(".file-link").on('click', function () {
                navigateTo(directory + fileName + "/");
            });

        } else {
            // just file dl
            fileItemElement.find(".file-link")
                .attr("href", filesBaseUrl + directory + fileName)
                .attr("target", "_blank");
        }

        if (fileSize) {
            fileItemElement.find(".file-size").text(fileSize);
        }

        return fileItemElement;
    }

    function getParentDir(path) {

        if (path.length <= 1) {
            return null;
        }

        var lastSlashPos = path.lastIndexOf("/", path.length - 2);
        var parentDir = lastSlashPos >= 0 ? path.substr(0, lastSlashPos + 1) : null;

        return parentDir;
    }

    function renderFileList(filesData, path) {

        var sortBy = $('input[name=sort]:checked').val();
        if (sortBy === "date") {
            console.log("sort by date");

            filesData.sort(function (fileA, fileB) {
                return fileB.mtime.getTime() - fileA.mtime.getTime();
            });

        } else if (sortBy === "name") {
            console.log("sort by name");

            filesData.sort(function (fileA, fileB) {
                return fileA.name.toLowerCase().localeCompare(fileB.name.toLowerCase());
            });

        } else if (sortBy === "size") {
            console.log("sort by size");

            filesData.sort(function (fileA, fileB) {
                var sizeA = fileA.rawSize ? fileA.rawSize : Number.MIN_VALUE;
                var sizeB = fileB.rawSize ? fileB.rawSize : Number.MIN_VALUE;
                return sizeA - sizeB;
            });
        }

        fileListElement.empty();

        var parentDir = getParentDir(path);

        if (parentDir) {
            fileListElement.append(renderFileElement(
                parentDir,
                "..",
                "parent"
            ));
        }

        filesData.forEach(function (fileData) {
            fileListElement.append(renderFileElement(
                path,
                fileData.name,
                fileData.type,
                fileData.size,
                fileData.mtime
            ));
        });
    }

    function navigateTo(path) {
        console.log("navigateTo", path);
        isNavigating = true;

        $.ajax({
            url: filesBaseUrl + path,

            dataType: "json",

            success: function (filesData) {

                // fix sizes and dates
                filesData.map(function (fileData) {
                    fileData.mtime = new Date(fileData.mtime);

                    if (fileData.hasOwnProperty("size")) {
                        fileData.rawSize = fileData.size;
                        fileData.size = fileSize(fileData.size);
                    }

                    return fileData;
                });

                renderFileList(filesData, path);

                $('input[name=sort]')
                    .off("change")
                    .on("change", function () {
                        renderFileList(filesData, path);
                        filterEl.value = ''; //reset input search
                    });

                console.log("replaceState", path);
                history.replaceState(null, path, '#' + path);
                document.title = "idx: " + path;
                //document.querySelector('.container>h4').textContent = decodeURIComponent(path); 
                aHtml = '';
                dirs = decodeURIComponent(path).split('/');
                for (let index = 0, depth = dirs.length - 1; index < depth; index++) {
                      redirPath = dirs.slice(0, index + 1).join('/');
                      aHtml += '<a href="#' + redirPath + '/">' + dirs[index] + '</a>/';
                }
                document.querySelector('.container>h4').innerHTML = aHtml;

                filterEl.value = ''; //reset input search
                isNavigating = false;
            },

            error: function (jqxhr, textStatus, errorThrown) {
                console.log(jqxhr, textStatus, errorThrown);

                if(textStatus === "timeout") {
                    alert("Request to server timed out, retry later!");

                } else if(textStatus === "abort") {
                    alert("Connection to server has been aborted, retry later!");

                } else if(textStatus === "parsererror") {
                    alert("Invalid response from server!");

                } else if(jqxhr.status === 404) {
                    alert("Server cant find this file/directory!");

                } else {
                    // also if(textStatus === "error")
                    alert("Something went wrong in communication to server, retry later!");
                }

                history.back();
            }
        });
    }

    function fileSize(bytes) {
        var exp = Math.log(bytes) / Math.log(1024) | 0;
        var value = bytes / Math.pow(1024, exp);

        if (exp == 0) {
            return value.toFixed(0) + ' bytes';

        } else {
            var result = value.toFixed(2);
            return result + ' ' + 'KMGTPEZY'[exp - 1] + 'B';
        }

    }
    
    
    function filter() { //for search file in current directory
        var q = filterEl.value.trim().toLowerCase();
        var elems = document.querySelectorAll('#file-list>li');
        elems.forEach(function(el) {
            if (!q) { //not query,then restore all files display
                el.style.display = ''; 
                return;
            }
            var nameEl = el.querySelector('.file-name');
            var nameVal = nameEl.textContent.trim().toLowerCase();
            if (nameVal.indexOf(q) !== -1) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    function navigateToUrlLocation() {
        var requestedPath = window.location.hash;
        var startPath = requestedPath ? requestedPath.substr(1) : "/";
        navigateTo(startPath);
    }

    var filesBaseUrl = "/m3u8files"; // nginx autodindex json api 
    var isNavigating = false;
    var fileListElement = $("#file-list");
    var fileItemElementTemplate = fileListElement.find("li").detach();

    var filterEl = document.getElementById('filter');
    filterEl.focus({ preventScroll: true });
    filterEl.onkeyup = filter ;

    
    // setup theme switching
    $('input[name=theme]').on("change", applyTheme);

    // apply current theme
    var theme = localStorage.getItem("theme")
    console.log(`theme '${theme}' loaded`)
    $(`input[name=theme][value='${theme}']`).prop('checked', true)
    applyTheme()

    window.onpopstate = function () {
        if (!isNavigating) {
            navigateToUrlLocation();
        }
    };

    navigateToUrlLocation();
});


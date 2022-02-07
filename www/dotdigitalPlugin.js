/**
 * DotdigitalPlugin constructor
 */
function DotdigitalPlugin() {

    // NOTE: ensure this remains in sync with the value in package.json
    var pluginVersion = "1.0.0";


    function get(url) {
        return new Promise(function (resolve, reject) {
            let headers = {};

            headers["Content-Type"] = "application/json";
            headers["Cache-Control"] = "no-cache";
            headers["Pragma"] = "no-cache";
            headers["If-Modified-Since"] = "Mon, 26 Jul 1997 05:00:00 GMT";

            var xhr = new XMLHttpRequest();

            xhr.open("GET", url, true);

            for (var prop in headers) {
                xhr.setRequestHeader(prop, headers[prop]);
            }

            xhr.onload = function () {
                var succeeded = xhr.status >= 200 && xhr.status < 300;
                if (succeeded) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            }

            xhr.onerror = function () {
                console.error(`openDeepLink failed (failed to call tracking URL)`, xhr.responseText);
                reject(xhr.status);
            }

            xhr.onabort = function (evt) {
                console.error(evt);
                reject(xhr);
            }

            xhr.send(null);
        });
    }

    var self = this;

    /**
     * Method to allow integrator to explicitly set the application badge count
     * @param {Callback} successCallback - callback to call if method was successful
     * @param {Callback} errorCallback - callback to call if method failed with the error message
     * @param {Number} count - the count to set to
     */
    DotdigitalPlugin.prototype.setBadgeCount = function (successCallback, errorCallback, count) {
        cordova.exec(successCallback, errorCallback, "dotdigital", "setBadgeCount", [count]);
    }

    /**
     * Method to allow integrator to explicitly set the application badge count
     * @param {Callback} successCallback - callback to call if method was successful
     * @param {Callback} errorCallback - callback to call if method failed with the error message
     */
    DotdigitalPlugin.prototype.getBadgeCount = function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "dotdigital", "getBadgeCount", []);
    }

    /**
     * Method to allow integrator to query the current platform
     * @param {Callback} successCallback - callback to call if method was successful
     * @param {Callback} errorCallback - callback to call if method failed with the error message
     */
    DotdigitalPlugin.prototype.getPlatform = function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "dotdigital", "getPlatform", []);
    }

    /**
     * Method to allow integrator to open a deep link
     * pass the entire payload so we can access the url (and trackingUrl if present)
     * @param {Callback} successCallback - callback to call if method was successful
     * @param {Callback} errorCallback - callback to call if method failed with the error message
     * @param {String} payload - 
     */
    DotdigitalPlugin.prototype.openDeepLink = function (successCallback, errorCallback, payload) {

        if (payload.trackingUrl) {
            get(payload.trackingUrl)
                .then((result) => {
                    cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [payload.url]);
                })
                .catch((error) => {
                    cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [payload.url]);
                });
        } else {
            cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [payload.url]);
        }
    }

    // open if there is one, do nothing otherwise - they can always call this safely
    // lose the above one
    DotdigitalPlugin.prototype.handleLink = function (successCallback, errorCallback, payload) {

        if(payload.dd_deepLink && payload.dd_deepLink.url){
            
            if(payload.dd_deepLink.trackingUrl){
                get(payload.dd_deepLink.trackingUrl)
                    .then((result) => {
                        cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [payload.url]);
                    })
                    .catch((error) => {
                        console.log(`Failed to GET ${payload.dd_deepLink.trackingUrl}`);
                        cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [payload.url]);
                    });
            }

        }else{
            successCallback();
        }
    }

}


module.exports = new DotdigitalPlugin();

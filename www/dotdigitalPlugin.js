/**
 * DotdigitalPlugin constructor
 */
 function DotdigitalPlugin() {

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
                reject(xhr.status);
            }

            xhr.onabort = function (evt) {
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
     * pass the link
     * @param {Callback} successCallback - callback to call if method was successful
     * @param {Callback} errorCallback - callback to call if method failed with the error message
     * @param {String} link - the deep link (or url) to open
     */
    DotdigitalPlugin.prototype.openLink = function (successCallback, errorCallback, link) {
        cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [link]);
    }

    /**
     * Method to allow integrator to handle a deep link - this can be safely called for all incoming push notifications.
     * The code weil determine whether there is a deep link to be opened and automatically handle it.
     * @param {Callback} successCallback - callback to call if method was successful
     * @param {Callback} errorCallback - callback to call if method failed with the error message
     * @param {Object} payload - the push payload
     */

    DotdigitalPlugin.prototype._handleLink = function (successCallback, errorCallback, payload) {

        if (this.containsDeepLink(payload)) {

            if (payload.additionalData.dd_deepLink.trackingUrl) {
                get(payload.additionalData.dd_deepLink.trackingUrl)
                    .then((result) => {
                        console.log(`GET ${payload.additionalData.dd_deepLink.trackingUrl} succeeded`, result);
                    })
                    .catch((error) => {
                        console.error(`Failed to GET ${payload.additionalData.dd_deepLink.trackingUrl}`, error);
                    })
                    .finally(() => {
                        cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [payload.additionalData.dd_deepLink.url]);
                    })

            }else{
                cordova.exec(successCallback, errorCallback, "dotdigital", "openDeepLink", [payload.additionalData.dd_deepLink.url]);
            }

        } else {
            successCallback();
        }
    }

    /**
     * Promisified version of _handleLink
     * 
     * @param {*} payload 
     * @returns Promise
     */
    DotdigitalPlugin.prototype.handleLink = function (payload) {
        
        return new Promise((resolve, reject) => {

            self._handleLink((result) => {
                resolve(result);
            },
                (error) => {
                    reject(error);
                }, payload);
        });
    }

    /**
     * Check whether a push payload contains a deep link 
     * @param { Object } payload 
     * @returns 
     */
    DotdigitalPlugin.prototype.containsDeepLink = function (payload) {
        return payload && payload.additionalData && payload.additionalData.dd_deepLink && payload.additionalData.dd_deepLink.url;
    }

}


module.exports = new DotdigitalPlugin();

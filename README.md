# Introduction
The Cordova plugin is designed to work in conjunction with the existing Javascript SDK. It allows your Cordova or PhoneGap app to open deep links. 

Read through the sections below to discover how to deploy and use the Dotdigital Cordova Plugin to Dotdigital enable your apps:
>**Compatibility**
>
> This plugin supports iOS (7 and above) and Android (4.0 - API level 14 and above). It works with Cordova and PhoneGap frameworks.






# Deep links
You can send a deep link as part of a push message. 
You will need to use another plugin to correctly handle the links in your application (for routing purposes). 
The following 3rd party plugins are recommended

  * [cordova-plugin-customurlscheme](https://github.com/EddyVerbruggen/Custom-URL-scheme)
  * [cordova-universal-links-plugin](https://github.com/nordnet/cordova-universal-links-plugin)
  * [ionic-plugin-deeplinks](https://github.com/driftyco/ionic-plugin-deeplinks)

To correctly handle deep links in your app you will need to tweak the native project files:

## iOS 

You will need to add <a href="https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW14" target="_new">LSApplicationQueriesSchemes</a> key to your info.plist file to allow opening of deep links.

## Android

You will need to modify AndroidManifest.xml 

- **android:launchMode** needs to be set to **singleTask** 

```xml
<activity android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale" 
    android:label="@string/activity_name" 
    **android:launchMode="singleTask" 
    **android:name="MainActivity" 
    android:theme="@android:style/Theme.DeviceDefault.NoActionBar" 
    android:windowSoftInputMode="adjustResize">
```
- add an intent filter for the scheme
```xml
<intent-filter>
  <data android:scheme=">>>YOUR SCHEME NAME<<<"/>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
</intent-filter>
```

A simple way of testing these links is to implement the following function in your app:
This is always called by cordova when the app is launched through a custom scheme url.

```html
<script>
    function handleOpenURL(url) {
        setTimeout(function() {
        alert("received url: " + url);
        console.log(`handleOpenUrl(${url})`);
        }, 0);
    }
</script>
```

The above 3rd party plugins will have a more sophisticated approach and implementing this method may interfere with their behavior.


# Methods


## version()

```javascript
const version = cordova.plugins.dotdigitalPlugin.version();
```
Returns the version of the plugin.

## setBadgeCount()
```javascript
window.cordova.plugins.dotdigitalPlugin.setBadgeCount(() => {
      console.log("setBadgeCount succeeded ;-)");
  }, () => {
      console.error("setBadgeCount failed ;-(");
  }, 0);
```
iOS specific method to explicitly set the Application Badge Count 

## getBadgeCount()
```javascript
window.cordova.plugins.dotdigitalPlugin.getBadgeCount((count) => {
      console.log(`getBadgeCount succeeded: ${count}`);
  }, () => {
      console.error("getBadgeCount failed ;-(");
  });
```
iOS specific method to query the Application Badge Count 

## getPlatform()
```javascript
cordova.plugins.dotdigitalPlugin.getPlatform((platform) => {
      console.log(`getPlatform succeeded: ${platform}`);
  }, () => {
      console.error("getBadgeCount failed ;-(");
  });
```
Method to query the application platform - (returns "android" or "iOS")

## openLink()
```javascript
cordova.plugins.dotdigitalPlugin.openLink(() => {
      console.log("openLink succeeded ;-)");
  }, () => {
      console.error("openLink failed ;-(");
  }, "myapp://products/1");
```

Method to directly open a link. The url is passed rather than the push payload. THis method is only supplied for advanced use cases.

## handleLink()

```javascript

cordova.plugins.dotdigitalPlugin.handleLink(payload)
    .then(() => {
        console.log("👍");
    })
    .catch((error) => {
        console.log("😌", error);
    })


```
Method to perform all the handling associated with a deep link. 
This can be safely called for all notifications received and will do nothing if no link is present. 
If there is a link present, this method will perform a GET request to a tracking analytics endpoint (if specified)
and then open the link. It is up to the Integrator to handle the link (see above).

## containsLink()
```javascript
const containsLink = cordova.plugins.dotdigitalPlugin.containsLink(payload);
```
Method to ascertain whether a notification contains a link. No action is performed other than inspecting the payload.



# Integration strategy

Here is a minimal sample app that uses `phonegap-plugin-push` to manage push notifications.

```javascript

const config = {
  urlBase: "https://api.comapi.com",
  apispaceId: ">>>YOUR APISPACE <<<",
  secret: ">>>YOUR SECRET<<<",
  profileId: ">>>PROFILEID OF DEVICE OWNER<<<",
  email: ">>>EMAIL OF DEVICE OWNER<<<",
  iss: "https://api.comapi.com/defaultauth",
  aud: "https://api.comapi.com",
};

function createJwt(profileId, nonce) {

    // Header
    var oHeader = { alg: 'HS256', typ: 'JWT' };
    // Payload
    var tNow = KJUR.jws.IntDate.get('now');
    var tEnd = KJUR.jws.IntDate.get('now + 1day');
    var oPayload = {
        sub: profileId,
        nonce: nonce,
        iss: config.iss,
        aud: config.aud,
        iat: tNow,
        exp: tEnd,
    };
    var sHeader = JSON.stringify(oHeader);
    var sPayload = JSON.stringify(oPayload);
    var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, { utf8: config.secret });

    return sJWT;
}

function challengeHandler(options, answerAuthenticationChallenge) {
    var jwt = createJwt(config.profileId, options.nonce);
    answerAuthenticationChallenge(jwt);
}

// This should only be called once
function initialiseComapi(data) {

    let pushConfig = {};
    // NOTE: you cannot set both apns and fcm 
    // - identify the platform and set the appropriate device specific config
    // this device object is from cordova-plugin-device
    if (device.platform === 'iOS') {
        pushConfig.apns = {
            "bundleId": "your bundleId",
            // Ensure you set te correct environment - 0 for Sandbox, 1 for production (ur use enum if using TS)
            "environment": 0,
            "token": data.registrationId
        };
    } else if (device.platform === 'Android') {
        pushConfig.fcm = {
            "package": "your packagename",
            "registrationId": data.registrationId
        };
    }

    var comapiConfig = new COMAPI.ComapiConfig()
        .withApiSpace(config.apispaceId)
        .withUrlBase(config.urlBase)
        .withAuthChallenge(challengeHandler)
        .withLogLevel(3)
        .withPushConfiguration(pushConfig)

    let _comapiSDK;

    COMAPI.Foundation.initialise(comapiConfig)
        .then(function (result) {
            _comapiSDK = result;
            console.log("Initialized, starting session ...")
            return _comapiSDK.startSession();
        })
        .then(function (result) {
            console.log("Getting Profile ...")
            return _comapiSDK.services.profile.getMyProfile();
        })
        .then(function (profile) {
            // EC will create a contact off the back of a webhook subscription for this ...
            profile.email = config.email;
            console.log("Updating profile");
            return _comapiSDK.services.profile.updateMyProfile(profile);
        })
        .then(function (result) {
            console.log("Done");
            return _comapiSDK;
        });
}

function onDeviceReady() {

    const push = PushNotification.init({
        ios: {
            alert: "true",
            badge: "true",
            sound: "true"
        },
        android: {
        },
    });

    let hasRegistered = false;
    push.on('registration', (data) => {

        console.log(`push.on("registration") : ${data.registrationId}`);

        // plugin can fire this twice so ignore subsequent calls
        if (!hasRegistered) {
            hasRegistered = true;
            initialiseComapi(data);
        }
    });

    push.on('notification', (data) => {

      let msg = JSON.stringify(data);
      console.log(msg);

      if (cordova && cordova.plugins && cordova.plugins.dotdigitalPlugin) {

        /* You don't need to call containsDeepLink() as handleLink() will simply do nothing if there is no link to process
         */

        if(cordova.plugins.dotdigitalPlugin.containsLink(data)){

            cordova.plugins.dotdigitalPlugin.handleLink(data)
                .then(() => {
                    console.log("👍");
                })
                .catch((error) => {
                    console.log("😌", error);
                })
            }
        }

        let msg = JSON.stringify(data);
        alert(msg);

    });

    push.on('error', (e) => {
        console.log(e.message);
    });


}


```
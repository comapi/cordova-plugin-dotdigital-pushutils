# Introduction
The Cordova plugin is designed to work in conjunction with the existing Javascript SDK. It allows your Cordova or PhoneGap app to open deep links. 

Read through the sections below to discover how to deploy and use the Dotdigital Cordova Plugin to Dotdigital enable your apps:
>**Compatability**
>
> This plugin supports iOS (7 and above) and Android (4.0 - API level 14 and above). It works with Cordova and PhoneGap frameworks.






# Deep links
You can send a deep link as part of a push message. 
You will need to use another plugin to correctly handle the links in your application (for routing purposes). 
The following two 3rd party plugins are recommended (*The ionic sample app uses ionic-plugin-deeplinks*)

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


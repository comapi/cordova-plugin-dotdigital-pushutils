package com.dotdigital.plugin;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.content.Context;
import android.util.Log;
import android.os.Bundle;

import java.util.List;

public class DotdigitalPlugin extends CordovaPlugin{

    public static final String LOG_TAG = "DotdigitalPlugin";

    /**
     * Gets the application context from cordova's main activity.
     * @return the application context
     */
    private Context getApplicationContext() {
        return this.cordova.getActivity().getApplicationContext();
    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param data              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  True if the action was valid, false if not.
     */
    @Override
    public boolean execute(String action, final JSONArray data, final CallbackContext callbackContext) throws JSONException {

        Log.v(LOG_TAG, "execute: action=" + action);

        if(action.equals("openDeepLink")){
            String deepLink = data.getString(0);

            Intent currentIntent = this.cordova.getActivity().getIntent();
            Bundle extras = currentIntent.getExtras();

            if(openDeepLink(getApplicationContext(), extras, deepLink)){
                callbackContext.success();
            } else {
                callbackContext.error("Could not find an intent that matched the link " + deepLink);
            }

            return true;
        }
        else if(action.equals("getPlatform")){
            callbackContext.success("android");
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if there is Activity responding to an Intent.
     *
     * @param context Context
     * @param intent Intent to check if any Activity responds to.
     * @return True if Activity responds to an Intent.
     */
    public static boolean isActivityAvailable(Context context, Intent intent) {

        final PackageManager mgr = context.getPackageManager();

        List<ResolveInfo> list =
                mgr.queryIntentActivities(intent,
                        PackageManager.MATCH_DEFAULT_ONLY);

        return list.size() > 0;
    }

    public static boolean openDeepLink(Context context, Bundle extras, String deepLink) {

        Intent intent = new Intent();

        if(extras!=null){
            intent.putExtras(extras);
        }

        intent.setData(Uri.parse(deepLink));

        intent.setAction(Intent.ACTION_VIEW);
        intent.addCategory(Intent.CATEGORY_DEFAULT);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (isActivityAvailable(context, intent)) {
            context.startActivity(intent);
            return true;
        } else {
            Log.v(LOG_TAG, "Could not find an intent that matched the link " + deepLink);
            return false;
        }
    }
}

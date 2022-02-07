#include <sys/types.h>
#include <sys/sysctl.h>

#import "DotdigitalPlugin.h"


static NSString *const DNDeviceID = @"DeviceID";

#define SYSTEM_VERSION_PLIST    @"/System/Library/CoreServices/SystemVersion.plist"

/* Return the string version of the decimal version */
#define CDV_VERSION [NSString stringWithFormat:@"%d.%d.%d", \
(CORDOVA_VERSION_MIN_REQUIRED / 10000),                 \
(CORDOVA_VERSION_MIN_REQUIRED % 10000) / 100,           \
(CORDOVA_VERSION_MIN_REQUIRED % 10000) % 100]


@implementation DotdigitalPlugin

@synthesize callbackId;
static UIWebView* webView;

- (void) pluginInitialize;
{
    NSLog(@"Dotdigital::pluginInitialize");
    
    if (self.webViewEngine != nil) {
        webView = (UIWebView *)self.webViewEngine.engineWebView;
    }
}

- (NSString*)modelVersion
{
    size_t size;
    
    sysctlbyname("hw.machine", NULL, &size, NULL, 0);
    char* machine = malloc(size);
    sysctlbyname("hw.machine", machine, &size, NULL, 0);
    NSString* platform = [NSString stringWithUTF8String:machine];
    free(machine);
    
    return platform;
}

+(NSString*) getCurrentTimestamp;
{
    NSDateFormatter* dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setLocale:[NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"]];
    [dateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"];
    [dateFormatter setTimeZone:[NSTimeZone timeZoneWithAbbreviation:@"UTC"]];
    return [dateFormatter stringFromDate:[NSDate date]];
}


- (void) setBadgeCount:(CDVInvokedUrlCommand*)command;
{
    NSLog(@"Dotdigital::setBadgeCount");
    NSString* badgeCount = [[command arguments] objectAtIndex:0];
    
    [[UIApplication sharedApplication] setApplicationIconBadgeNumber:[badgeCount intValue]];
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
}

- (void)getBadgeCount:(CDVInvokedUrlCommand *)command
{
    NSLog(@"Dotdigital::getBadgeCount");
 
    NSInteger badge = [UIApplication sharedApplication].applicationIconBadgeNumber;

    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:(int)badge];
    [self.commandDelegate sendPluginResult:commandResult callbackId:command.callbackId];
}

- (void)getPlatform:(CDVInvokedUrlCommand *)command
{
    NSLog(@"Dotdigital::getPlatform");
 
    CDVPluginResult *commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"iOS"];
    [self.commandDelegate sendPluginResult:commandResult callbackId:command.callbackId];
}


- (void)openDeepLink:(CDVInvokedUrlCommand*)command;
{
    NSString* linkValue = [[command arguments] objectAtIndex:0];
    CDVPluginResult* pluginResult = nil;
    
    if(linkValue != nil && ![linkValue isKindOfClass:[NSNull class]])
    {
        NSURL *url = [NSURL URLWithString:linkValue];
        
        Boolean canOpen = [DotdigitalPlugin openDeepLink: url];
        
        pluginResult = canOpen ? [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] : [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    else
    {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

+ (Boolean)openDeepLink:(NSURL*)url;
{
    NSLog(@"handleDeepLink: Opening link: %@", url);
    
    Boolean canOpen = [[UIApplication sharedApplication] canOpenURL:url];
    
    if (canOpen) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [[UIApplication sharedApplication] openURL:url];
        });
    }
    else {
        NSLog(@"Cannot open URL: %@", url);
    }
    
    return canOpen;
}




+ (void) executeJavascript:(NSString *)jsString{
    
    if ([webView respondsToSelector:@selector(stringByEvaluatingJavaScriptFromString:)]) {
        // Cordova-iOS pre-4
        [webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsString waitUntilDone:NO];
    } else {
        // Cordova-iOS 4+
        [webView performSelectorOnMainThread:@selector(evaluateJavaScript:completionHandler:) withObject:jsString waitUntilDone:NO];
    }
    
}

@end
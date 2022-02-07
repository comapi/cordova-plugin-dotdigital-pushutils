#import <Cordova/CDV.h>



@interface DotdigitalPlugin : CDVPlugin

@property (nonatomic, copy) NSString *callbackId;

- (void) setBadgeCount:(CDVInvokedUrlCommand*)command; 
- (void) getBadgeCount:(CDVInvokedUrlCommand *)command;
- (void) getPlatform:(CDVInvokedUrlCommand *)command;
- (void) openDeepLink:(CDVInvokedUrlCommand*)command;
+ (Boolean)openDeepLink:(NSURL*)url;
+ (NSString*) getCurrentTimestamp;


@end
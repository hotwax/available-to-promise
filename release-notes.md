# Release 2.0.4

## What's Changed
* Improved: page name from Threshold management to Create Rule & from Threshold update to Rule Pipeline by @Dhiraj1405 in https://github.com/hotwax/threshold-management/pull/194


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v2.0.3...v2.0.4

# Release 2.0.3

## What's Changed
* Fixed: jobs schedule and update not working after reordering jobs(#85zrnwg91) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/191
* Added: default buttons in dateTime modal by @disha1202 in https://github.com/hotwax/threshold-management/pull/188


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v2.0.2...v2.0.3

# Release 2.0.2

## What's Changed
* Fixed: issue of dateTime modal flicker effect when using trigger, also fixed the styling for dateTime modal by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/185


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v2.0.1...v2.0.2

# Release 2.0.1

## What's Changed
* Fixed: label on schedule threshold page(#179) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/180
* Fixed: permission issue on reorder and schedule job page(#85zrnnfqb) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/181
* Fixed: datetime not working when coming to the schedule threshold page again after scheduling a job successfully and redirect the user to select page when refreshing on schedule threshold page(#85zrnnfqb) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/182
* Fixed: navigation to login failed for token expire (oms-api#61) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/184


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v2.0.0...v2.0.1

# Release 2.0.0

## What's Changed
* Changed "Rule name" to "Rule" and "Rule name" color to "color medium". by @Dhiraj1405 in https://github.com/hotwax/threshold-management/pull/154
* Added hotwax-apps-theme package(#85zrj08rb) by @disha1202 in https://github.com/hotwax/threshold-management/pull/156
* Improved: Updated UI of Settings page(#32j3r6t) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/147
* Implemented: Code to show app version & build information on Settings page(#85zrhn8w8) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/157
* Implemented logger using vue logger plugin(#21uxamh) by @disha1202 in https://github.com/hotwax/threshold-management/pull/160
* Implemented: support for using api and client methods from OMS api package (#85zrm1ktj) by @k2maan in https://github.com/hotwax/threshold-management/pull/166
* Fixed: build and locale warnings in the app(#85zrmg3u1) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/164 and https://github.com/hotwax/threshold-management/pull/165
* Implemented: feature for user authorisation (#159) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/161
* Implemented: functionality to reorder export threshold jobs or change the runTime of jobs in bulk(#2adm0cu) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/167
* Updated: styling for the schedule threshold page(#2dewjnh) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/169
* Updated grid layout of products on select product page(#2cxuh4m) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/92
* Added: support to change the product store from menu footer(#2e5w2hb) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/171
* Fixed: issue of facilitiesByProductStore and ShopifyConfig data not cleared on logout(#85zrn9yfn) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/170
* Updated: icons in menu to use outline icons by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/173
* Implemented: support to reorder pending export jobs from the updates page(#2dmggua) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/172
* Fixed: issue when scheduling/reordering jobs from schedule page by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/175

## New Contributors
* @Dhiraj1405 made their first contribution in https://github.com/hotwax/threshold-management/pull/154

**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.2.0...v2.0.0

# Release 1.2.0

## What's Changed
* Fixed build issue due to eslint version mismatch in dependencies (#85zrhpak3) by @k2maan in https://github.com/hotwax/threshold-management/pull/153

## New Contributors
* @k2maan made their first contribution in https://github.com/hotwax/threshold-management/pull/153

**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.1.0...v1.2.0

# Release 1.1.0

## What's Changed
* Update contribution guideline in Readme file(#2r0kmb3) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/132
* Implemented: Code to check if user has permission to access the app(#2hr41aq) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/131
* Implemented: Modal to display server errors(#2gg32yc) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/130
* Upgraded ionic to 6.1.15(#2uaz29u) by @disha1202 in https://github.com/hotwax/threshold-management/pull/134
* Added support to alias specific instance URL with environment configuration(#30dkjp1) by @disha1202 in https://github.com/hotwax/threshold-management/pull/142
* Upgraded to ionic 6.2(#2w9wz26) by @disha1202 in https://github.com/hotwax/threshold-management/pull/140
* Updated bug report and feature request issue template by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/144
* Implemented: Autodeploy flow for uat(#31ngcmh) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/145

**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.0.6...v1.1.0

# Release 1.0.6

## What's Changed
* Fixed: DateTime component has different hour cycle on different devices(#2dmq8ja) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/101
* Fixed: Service fails when scheduled without facilityId(#2pjpbek) by @disha1202 in https://github.com/hotwax/threshold-management/pull/129
* Implemented: Create a user search preference entry after creating search preference(#2e5ww56) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/128
* Improved: code to create a user search preference entry after creating search preference (#2e5ww56). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/104


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.0.5...v1.0.6

# Release 1.0.5

## What's Changed
* Fixed: AutoCompleteSolrFacet API fails due to invalid characters when using GET method (#2gagqqt) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/127


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.0.4...v1.0.5

# Release 1.0.4

## What's Changed
* Fixed: Error: Something went wrong on successful cancelling of  job (#2ftb67b) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/108
* Fixed: Instance URL should be case insensitive(#2ft61zw) by @rathoreprashant in https://github.com/hotwax/threshold-management/pull/109
* Improved: Show threshold, include and exclude tags for Jobs on Threshold Updates page (#2jufac1) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/110
* Fixed: threshold value 0 not displayed (#2jufac1) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/111
* fixed: ShopifyConfig id is undefined when making api call while scheduling the job(#2kbpaux) by @disha1202 in https://github.com/hotwax/threshold-management/pull/113
* Improved label to "eCom Store" on Settings page (#23tw4yf) by @rathoreprashant in https://github.com/hotwax/threshold-management/pull/116
* Implemented: infinite scroll support to find tag modal(#2juem0v)  by @rathoreprashant in https://github.com/hotwax/threshold-management/pull/118
* Implemented: Added infinite scroll support to find tag modal(#2juem0v) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/112
* Implemented logic to apply threshold rule in threshold management page if jobId is passed in route parameter(#2mky6cn) by @disha1202 in https://github.com/hotwax/threshold-management/pull/117
* Implemented functionality to update threshold rule from threshold update page(#2ngcqdd) by @disha1202 in https://github.com/hotwax/threshold-management/pull/119
* Fixed: threshold rules not updated in state(#2ngcqdd) by @disha1202 in https://github.com/hotwax/threshold-management/pull/120
* Fixed: warning icon should only be displayed if job id is paaed in route(#2ngcqdd) by @disha1202 in https://github.com/hotwax/threshold-management/pull/121
* Fixed: runtime for new job should be same as existing one (#2ngcqdd) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/123
* Fixed: Implemented code to remove threshold rule through mutation(#2ngcqdd) by @disha1202 in https://github.com/hotwax/threshold-management/pull/122
* Fixed: wrong value for isFilterChanged and multiple solr queries on initial load (#2ngcqdd) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/124
* Implemented: Feature to update rule name in JobConfiguration(#2p1epk4) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/125
* Fixed: Code to update pendingJobs ruleName on thresholdUpdate page instantly(#2p1epk4) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/126
* Implemented: Code to show `import threshold jobs` in queued state on running tab(#2hr4mzb) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/114


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.0.3...v1.0.4

# Release 1.0.3

## What's Changed
* Implemented support to store user preference for selected product store(#2f2h90a) by @rathoreprashant in https://github.com/hotwax/threshold-management/pull/105
* Implemented: Schedule job for recurrence and initial export separately (#2fdybra) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/106


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.0.2...v1.0.3

# Release 1.0.2

## What's Changed
* Fixed: issue of temp expr not being set when scheduling a new job(#2dmgzqb) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/96
* Implemented: added support to pass operator to product query (#2dmrnhx) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/99
* Fixed: product filters not updating on reset, logout and store change (#2dmrnhx) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/100
* Fixed: When including a tag, the product count does not update if the tag does not contain any product(#2dmha76) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/98


**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.0.1...v1.0.2


# Release 1.0.1

## What's Changed
* Improved code by updating padding and removing gap above result placeholder and added save threshold method to fab button in mobile view (#2cxuhuy) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/90
* Improved: code to show Shop, Timezone and instance information at Menu bottom (#2d9a4ur). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/93
* Implemented: code to add timezone support on the settings page (#2a7ymej) by @adityasharma7 in https://github.com/hotwax/threshold-management/pull/94
* Implemented: code to add timezone support on the settings page (#2a7ymej). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/68

## New Contributors
* @adityasharma7 made their first contribution in https://github.com/hotwax/threshold-management/pull/94

**Full Changelog**: https://github.com/hotwax/threshold-management/compare/v1.0.0...v1.0.1


# Release 1.0.0

## What's Changed
* Added IonicSDK to Threshold Management App (#1vra01n)  by @Yashi002 in https://github.com/hotwax/threshold-management/pull/1
* Improved: code to prepare loader on app mounted and assign it to null on dismiss (#1x68xu9) by @Yashi002 in https://github.com/hotwax/threshold-management/pull/2
* Implemented code for instance url (#1ym28pz) by @bashu22tiwari in https://github.com/hotwax/threshold-management/pull/6
* Added .env.examplr file (#1ytq0q0) by @bashu22tiwari in https://github.com/hotwax/threshold-management/pull/8
* Fixed the position of input label on login page (#1ym3jwv) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/10
* Added md mode (#1zax3p6) by @bashu22tiwari in https://github.com/hotwax/threshold-management/pull/13
* Added OMS information on settings page#1y2ract by @disha1202 in https://github.com/hotwax/threshold-management/pull/12
* Implemented static UI of select product screen (#1x69ahw) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/3
* Implemented code for static UI of select facility screen (#1x69ajp) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/4
* Improved code by using logo component for light and dark theme on login page(#1zw59ab) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/14
* Upgraded Ionic 5 to Ionic 6 (#1yky3v7) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/9
* Updated the UI of settings page(#1z54hy7) by @disha1202 in https://github.com/hotwax/threshold-management/pull/15
* Added: pull request build check(#20k1511) by @disha1202 in https://github.com/hotwax/threshold-management/pull/18
* Improved: facilityName should be displayed instead of facilityId in store selection along with Store as label ( #21fn6e5 ). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/20
* Removed fullscreen=true from ion-content of all pages(#21aqct8) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/19
* Added slot icon-only to ion-icon in ion-button(#238uwuv) by @Nihu-Sharma in https://github.com/hotwax/threshold-management/pull/24
* Updated color of ion-icon in ion-chip, ion-chip outline and ion-item lines in dark mode(#238p38r) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/23
* Fixed build failure for node's version 16.13.2 ( #1yky3v7 ). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/21
* Updated Readme(#1ytqp4e) by @meet-aniket in https://github.com/hotwax/threshold-management/pull/22
* Updated Readme(#1ytqp4e) by @Yashi002 in https://github.com/hotwax/threshold-management/pull/11
* Improved routing of all the pages(#24wce2b) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/27
* Added PWA Configuration (#226cynn) by @Mayank909 in https://github.com/hotwax/threshold-management/pull/26
* Added firebase auto deployment configuration(#20d6xcu) by @disha1202 in https://github.com/hotwax/threshold-management/pull/16
* Deleted extra home and search page of threshold-management(#23eera9) by @Nihu-Sharma in https://github.com/hotwax/threshold-management/pull/25
* Improved UI for the search products page as per the figma file(#29bdb9f) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/36
* Implemented: functionality to fetch the product attributes information and prepare solr query on selection and unselection of attributes(#29bdb9f) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/37
* Implemented logic to make threshold updates page functional(#295eve6) by @disha1202 in https://github.com/hotwax/threshold-management/pull/35
* Implemented dynamic code of threshold updates page(#295eve6) by @azkyakhan in https://github.com/hotwax/threshold-management/pull/34
* Updated selectProduct page UI(#29pux36) by @disha1202 in https://github.com/hotwax/threshold-management/pull/39
* Implemented logic to make selectProduct page functional(#29pt6c6) by @disha1202 in https://github.com/hotwax/threshold-management/pull/38
* Implemented: logic to create search preference and schedule a service (#29bdb9f) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/40
* Improved: code to fetch facility value for product store and pass facilityId when scheduling a job(#29bdb9f) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/44
* Updated the code to display color and size only if available(#29wgtvt) by @disha1202 in https://github.com/hotwax/threshold-management/pull/46
* Improved: code to hide option to set baseURL if value available in '.env' file (#29wgkkh). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/45
* Improved: code to remove 'None' as shop option from settings page (#29wgty7). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/49
* Reset button and List header label should have space between them(#2a… by @Nihu-Sharma in https://github.com/hotwax/threshold-management/pull/52
* Fixed: Job list is not fetched on initial page load(#2a233bk) by @disha1202 in https://github.com/hotwax/threshold-management/pull/54
* Updated the code to reset threshold value and keyword text on page leave(#2a236fw) by @disha1202 in https://github.com/hotwax/threshold-management/pull/53
* Improved: code to remove unused code for setting and getting facility (#2a233nh). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/51
* Fixed: Product list not updating on login and logout(#29wgthu) by @disha1202 in https://github.com/hotwax/threshold-management/pull/47
* Removed unwanted action for clearing pending jobs(#2a23fur) by @disha1202 in https://github.com/hotwax/threshold-management/pull/55
* Implemented: logic to use filters modal for selecting or removing a filter and removed faceting logic(#29wm19n) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/50
* Fixed: the issue of reset button not clearing filters(#29wm19n) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/57
* Implemented button slot and padding on Select Product page(#2a22y4d) by @Nihu-Sharma in https://github.com/hotwax/threshold-management/pull/56
* Fixed: code to not duplicate the result when searching on the filter lookup modal(#2a2ad3p) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/60
* Updated: the job enum used for scheduling a service(#2a24a29) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/58
* Fixed: the placeholder on the category modal, code to not make solr query when filters are not applied and made the tempExprId static when scheduling the job(#2a2ad3p) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/61
* Updated the position of toast message to bottom throughout the app and display job name on the job card on pipeline page(#2a7udaj) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/64
* Fixed: search keyword is not cleared when filters are applied(#29wgvxk) by @Mayank909 in https://github.com/hotwax/threshold-management/pull/62
* Fixed: search keyword is not cleared when filters are applied(#29wgvxk) by @disha1202 in https://github.com/hotwax/threshold-management/pull/48
* Implemented: functionality to disable the fab button untill the job is scheduling(#2a2ad3p) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/63
* Fixed: the issue of product store id not being supported when making solr query(fix-solr-query) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/65
* Improved: solr query to enable search on parent product name, pass qop when saving the query and remove the action call when changing the product store(fix-solr-query) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/66
* Fixed: issue of tags not working when having special character in them and cleared the filters applied on logout(#2a7yged) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/67
* Removed support to filter products on the basis of category(#2a800kj) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/70
* Fixed: animation not working on initial load on thresholdUpdates page(#1ye5xcw) by @disha1202 in https://github.com/hotwax/threshold-management/pull/76
* Fixed the count being reset when the product is not found on search (#2adgubh) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/75
* Updated: fallback name of job from job enum to partyName when user does not enter rule name(fix-rule-name) by @ymaheshwari1 in https://github.com/hotwax/threshold-management/pull/83
* Added: issue and PR template(threshold-management/#80) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/82
* Changed IncludeTagsModal.vue component name to ProductFilterModal.vue (#79) by @shashwatbangar in https://github.com/hotwax/threshold-management/pull/81
* Improved: position of toast from top to bottom(#2a7ut0j) by @Mayank909 in https://github.com/hotwax/threshold-management/pull/87
* Updated the code to search aside element in threshold updates page instead of whole document(#1ye5xcw) by @disha1202 in https://github.com/hotwax/threshold-management/pull/78
* Improved: code to assign input field to instance variable for searchbar (#2cj8nc4). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/86
* Fixed: code to handle the case when job history modal isn't updating (#2adm63m). by @meet-aniket in https://github.com/hotwax/threshold-management/pull/77
* Fixed build console warnings (threshold-management/#69) by @rathoreprashant in https://github.com/hotwax/threshold-management/pull/71

## New Contributors
* @Yashi002 made their first contribution in https://github.com/hotwax/threshold-management/pull/1
* @bashu22tiwari made their first contribution in https://github.com/hotwax/threshold-management/pull/6
* @azkyakhan made their first contribution in https://github.com/hotwax/threshold-management/pull/10
* @disha1202 made their first contribution in https://github.com/hotwax/threshold-management/pull/12
* @meet-aniket made their first contribution in https://github.com/hotwax/threshold-management/pull/20
* @Nihu-Sharma made their first contribution in https://github.com/hotwax/threshold-management/pull/24
* @Mayank909 made their first contribution in https://github.com/hotwax/threshold-management/pull/26
* @ymaheshwari1 made their first contribution in https://github.com/hotwax/threshold-management/pull/36
* @shashwatbangar made their first contribution in https://github.com/hotwax/threshold-management/pull/82
* @rathoreprashant made their first contribution in https://github.com/hotwax/threshold-management/pull/71

**Full Changelog**: https://github.com/hotwax/threshold-management/commits/v1.0.0
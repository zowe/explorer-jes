# Change Log
All notable changes to the JES-Explorer will be documented in this file.

## <1.0.5>

### New features and enhancements
- Changed packaging and lifecycle start.sh script to support explorer-ui-server keyring support (https://github.com/zowe/zowe-install-packaging/pull/1177), Thanks @stevenhorsman, @js665999, @nakulmanchanda, @jackjia-ibm

### Bug fixes
- Fixed bug where no jobs would show after auth token expired and user logs back in (https://github.com/zowe/zlux/issues/408), Thanks @jordanCain

## <1.0.4>

### New features and enhancements
- Added ability to multi select jobs with cmd/ctrl click and request multiple jobs be purged using this (https://github.com/zowe/zlux/issues/274), Thanks @jordanCain
- Added ability to collapse and resize jobs tree (https://github.com/zowe/zlux/issues/259), Thanks @skurnevich

## <1.0.3>

### New features and enhancements
<!--- - Format: Added support for <xx>. (Issue/PR number) [Doc link if any] [Thanks @contributor] --->
- Added cancel functionality to the job instance context meu (https://github.com/zowe/zlux/issues/443), Thanks @jordanCain

### Bug fixes
<!--- - Format: Fixed <xx>. (Issue/PR number) [Doc link if any] [Thanks @contributor] --->
- Added accessibility improvements to support screen readers notifying users of updates such as job tree loading/loaded, switch between spool files and alert when snackbar notifications are presented (https://github.com/zowe/explorer-jes/pull/189), Thanks @jordanCain
- Fixed bug where user could end up in infinite authorization loop due to z/OSMF Ltps and APIML JWT not expiring at same time (https://github.com/zowe/api-layer/issues/615), Thanks @jordanCain
- Fixed bug where users was unable to open spool files from the same job instance with identical names (https://github.com/zowe/zlux/issues/436), Thanks @jordanCain

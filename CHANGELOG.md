# Change Log
All notable changes to the JES-Explorer will be documented in this file.

## <1.0.2>

### New features and enhancements
<!--- - Format: Added support for <xx>. (Issue/PR number) [Doc link if any] [Thanks @contributor] --->
### Bug fixes
<!--- - Format: Fixed <xx>. (Issue/PR number) [Doc link if any] [Thanks @contributor] --->
- Fixed bug where user could end up in infinite authorization loop due to z/OSMF Ltps and APIML JWT not expiring at same time (https://github.com/zowe/api-layer/issues/615), Thanks @jordanCain
- Fixed bug where users was unable to open spool files from the same job instance with identical names (https://github.com/zowe/zlux/issues/436), Thanks @jordanCain 
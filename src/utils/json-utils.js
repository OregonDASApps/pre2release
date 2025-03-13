'use strict';

import _ from 'lodash';

class JsonUtils {

    constructor(jsonObj) {
        this.jsonObj = jsonObj
    }

    upgradeVersion(version, type, prefix) {
        let versionObject = version.replace(prefix, '').split('.')
        let updatedVersion = ''
        let major, minor, patch = ''
        
        switch(type.toLowerCase()) {
            case 'major': 
                major = parseInt(versionObject[0]) +1
                minor = 0
                patch = 0
                updatedVersion = `${major}.${minor}.${patch}`
                break;
            case 'minor': 
                major = parseInt(versionObject[0])
                minor = parseInt(versionObject[1]) +1
                patch = 0
                updatedVersion = `${major}.${minor}.${patch}`
                break;
            case 'patch': 
                major = parseInt(versionObject[0])
                minor = parseInt(versionObject[1])
                patch = parseInt(versionObject[2]) +1
                updatedVersion = `${major}.${minor}.${patch}`
                break;
        }
        
        return `${prefix}${updatedVersion}`;

    }

    // return first item after sorting tags
    firstItem(keyName, prerelease) {
        let first = ''
        if(prerelease == 'true') {
            let matched = _.filter(this.jsonObj, function(obj) {
                return obj.isPrerelease == true
            })
            if(matched.length > 0) {                
                first = matched[0][keyName]
            }
        } else {
            if(this.jsonObj.length > 0) {
                first = this.jsonObj[0][keyName]
            }
        }        
        return first
    }

    // filter and sort tags based on tag's prefix
    filterByPrefix(prefix) {
        let matched = _.filter(this.jsonObj, function(obj) { 

            if( obj.isPrerelease == true) {
                return obj.tagName.startsWith(prefix)
            }
        })

        let plain = _.map(matched, function(o){
            let version = o.tagName.replace(prefix, '').split('.')
            
            let obj = {
                "name": o.name,
                "createdAt": o.createdAt,
                "tagName": o.tagName,
                "tag": parseInt(o.tagName.replace(prefix, '').replace(/\./g, '')),
                "major": parseInt(version[0]),
                "minor": parseInt(version[1]),
                "patch": parseInt(version[2]),
                "isPrerelease": o.isPrerelease
            }
                        
            return obj
        })
        
        let sorted = _.orderBy(plain, ['major', 'minor', 'patch'], ['desc', 'desc', 'desc'])
        
        if(prefix != '') {
            this.jsonObj = sorted;
        }

        return sorted;
    }

    filterByStartsWith(startsWith) {

        const regex = new RegExp(`^${startsWith.replace(/\./g, '\\.').replace(/\*/g, '.*')}`);

        // Filter the jsonObj based on the parsed startsWith string
        let matched = _.filter(this.jsonObj, function(obj) {
            return regex.test(obj.tagName);
        });        

        let plain = _.map(matched, function(o){
            let version = o.tagName.replace(startsWith, '').split('.')
            
            let obj = {
                "name": o.name,
                "createdAt": o.createdAt,
                "tagName": o.tagName,
                "tag": parseInt(o.tagName.replace(startsWith, '').replace(/\./g, '')),
                "major": parseInt(version[0]),
                "minor": parseInt(version[1]),
                "patch": parseInt(version[2]),
                "isPrerelease": o.isPrerelease
            }
                        
            return obj
        })

        
        let sorted = _.orderBy(plain, ['major', 'minor', 'patch'], ['desc', 'desc', 'desc'])

        this.jsonObj = plain;

        return plain;

        // let matched = _.filter(this.jsonObj, function(obj) { 

        //     if( obj.isPrerelease == true) {
        //         return obj.tagName.startsWith(startsWith)
        //     }
        // })

        // let plain = _.map(matched, function(o){
        //     let version = o.tagName.replace(startsWith, '').split('.')
            
        //     let obj = {
        //         "name": o.name,
        //         "createdAt": o.createdAt,
        //         "tagName": o.tagName,
        //         "tag": parseInt(o.tagName.replace(startsWith, '').replace(/\./g, '')),
        //         "major": parseInt(version[0]),
        //         "minor": parseInt(version[1]),
        //         "patch": parseInt(version[2]),
        //         "isPrerelease": o.isPrerelease
        //     }
                        
        //     return obj
        // })
        
        // let sorted = _.orderBy(plain, ['major', 'minor', 'patch'], ['desc', 'desc', 'desc'])
        
        // if(startsWith != '') {
        //     this.jsonObj = sorted;
        // }

        // return sorted;
    }

    // filter and sort tags when there is no tag's prefix
    filterNoPrefix() {
        let matched = _.filter(this.jsonObj, function(obj) { 
            
            let o = obj.tagName.split('.')
            if(!isNaN(o[0]) && obj.isPrerelease == true){
                obj.major = parseInt(o[0])
                obj.minor = parseInt(o[1])
                obj.patch = parseInt(o[2])
                obj.tag = parseInt(obj.tagName.replace(/\./g, ''))
                return obj
            }
            
        })

        let plain = _.map(matched, function(o){
            
            let obj = {
                "name": o.name,
                "createdAt": o.createdAt,
                "tagName": o.tagName,
                "tag": parseInt(o.tagName.replace(/\./g, '')),
                "isPrerelease": o.isPrerelease
            }
            
            return obj
        })
        let sorted = _.orderBy(matched, ['major', 'minor', 'patch'], ['desc', 'desc', 'desc'])
       
        this.jsonObj = sorted;

        return sorted;
    }
}

export default JsonUtils;
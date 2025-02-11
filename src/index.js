const github = require('@actions/github');
const core = require('@actions/core');
const fs = require('fs');
const { graphql } = require("@octokit/graphql");
const getTags = require('./utils/get-tags.js');
const JsonUtils = require('./utils/json-utils.js');
const Release = require('./utils/release.js');
const { json } = require('stream/consumers');

async function run() {
    // Inputs
    const myToken = core.getInput('token');
    let prefix = core.getInput('prefix');
    const prerelease = core.getInput('prerelease');
    const REQUIRE_PRERELEASE = core.getInput('REQUIRE_PRERELEASE');
    const repoFull = core.getInput('repo').split('/');
    const tags = new getTags();
    let owner = repoFull[0];
    let repo = repoFull[1]
    let startsWith = core.getInput('starts-with');




    // class initializations
    const release = new Release(myToken);    
    
    
    
    const repository = await tags.getAllTags(owner, repo, myToken, prerelease);
    console.log("=====================================")

    console.log("ALL TAGS: ", JSON.stringify(repository, null, 2))


    console.log("=====================================")
    
    let tagsObj = tags.getTags(repository);
    const jsonUtils = new JsonUtils(tagsObj); 

    console.log("TAGS OBJECT: ", JSON.stringify(tagsObj, null, 2))
    console.log("JSON UTILS: ", JSON.stringify(jsonUtils.jsonObj, null, 2))
    console.log("startsWith: '", startsWith, "'")
    
    if(startsWith.trim() ==  '') {       
        if(prefix == '') {
            console.log("no prefix")
            jsonUtils.filterNoPrefix()
        } else {
            console.log("prefix: ", prefix)
            jsonUtils.filterByPrefix(prefix);
        }
    }
    

    let newVersion = '';
    let latestVersion =  ''

    
    
    

    if(startsWith.trim() != '') {
        jsonUtils.filterByStartsWith(startsWith);
        // jsonUtils.filterNoPrefix()
    } 

    

    let prereleaseIsNewest = false

    if(tagsObj.length > 0 && jsonUtils.jsonObj.length > 0) {

        console.log("Condition met: ")
        let prereleaseIsNewest = release.compareReleases(tagsObj[0], jsonUtils.jsonObj[0], prefix)
    } 
        

    console.log("JSON UTILS AFTER FILTER: ", JSON.stringify(jsonUtils.jsonObj.length, null, 2))
    console.log("tagsObj AFTER FILTER: ", JSON.stringify(tagsObj.length, null, 2))
    console.log("prereleaseIsNewest: ", JSON.stringify(jsonUtils.jsonObj, null, 2))
    
    if(jsonUtils.jsonObj.length > 0 && prereleaseIsNewest != true){
        console.log("JSON UTILS FIRST IF : ", JSON.stringify(jsonUtils.jsonObj, null, 2))
        latestVersion = jsonUtils.firstItem('tagName');
        let idObject = await release.getReleaseID(owner, repo, latestVersion)
        let latestRelease = await release.updateReleaseToLatest(owner, repo, idObject)

        // newVersion = jsonUtils.upgradeVersion(latestVersion, type, prefix);


    } else if(REQUIRE_PRERELEASE == 'false' && prereleaseIsNewest == false && jsonUtils.jsonObj.length > 0) {
        console.log("JSON UTILS INSIDE : ", JSON.stringify(jsonUtils.jsonObj, null, 2))
        latestVersion = jsonUtils.firstItem('tagName');
    } else {
        // core.setFailed('Error: No release found');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, "version=" + 'Error: No release found');
        // core.setFailed('Error: No release found');
    }

    console.log(prereleaseIsNewest, latestVersion, REQUIRE_PRERELEASE)

    console.log("ONE TAG AFTER: ", latestVersion)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, "version=" + latestVersion);
    const octokit = github.getOctokit(myToken);
}

run();
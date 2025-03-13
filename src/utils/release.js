'use strict';

import * as github from '@actions/github';

import { Octokit } from "@octokit/rest";
import fs from 'fs';

class Releases {
    constructor(token) {
        this.token = token;
        this.ops = {
            auth: this.token
        }
        this.octokit = new Octokit(this.ops);
    }

    releaseData(data) {
        this.data = data
        this.id = data['data']['id']
    }

    async uploadFiles(owner, repo, assets) {
        let files = assets.split('\n')
        for(let i = 0; i < files.length; i++) {
            await this.uploadAsset(owner, repo, files[i]);
        }
    }

    async uploadAsset(owner, repo, file) {
        return await this.octokit.rest.repos.uploadReleaseAsset({
            owner: owner,
            repo: repo,
            release_id: this.id,
            name: file,
            data: await fs.promises.readFile(file),
          });
    }

    async getReleaseID(owner, repo, tag) {
        return await this.octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
            owner: owner,
            repo: repo,
            tag: tag,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
          });
    }

    async updateReleaseToLatest(owner, repo, release) {
        return await this.octokit.request('PATCH /repos/{owner}/{repo}/releases/{release_id}', {
            owner: owner,
            repo: repo,
            release_id: release.data.id,
            tag_name: release.data.tag_name,
            target_commitish: release.data.target_commitish,
            name: release.data.tag_name,
            body: release.data.body,
            draft: false,
            prerelease: false,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
          });
    }

    async createRelease(owner, repo, tagName, branch, prerelease, body) {
                
        return await this.octokit.rest.repos.createRelease({
            owner: owner,
            repo: repo,
            tag_name: tagName,
            name: tagName,
            target_commitish: branch,
            body: body,
            prerelease: (prerelease == 'no' ? false: true) ,
            body: body,
        })
    }

    convertTagToInt(tagName, prefix) {
        return parseInt(tagName.replace(prefix, '').replace(/\./g, ''))
    }

    compareReleases(first, firstMatched, prefix) {
        let firstTag = this.convertTagToInt(first.tagName, prefix)
        let firstMatchedTag = firstMatched.tag
        return true;        
    }
}

export default Releases;
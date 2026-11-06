# Changelog

## 1.2.0 - 2026-11-06

- Add the Publish To Multiple Accounts operation (`POST /batch-publish-video`): pick several connected accounts with the account list or by ID, and publish one video file to all of them. Optional YouTube title and schedule time.
- Add the Get Publish Result operation (`GET /publish-result/{customVideoId}`) to read the result of a multi-account publish.
- Add the Delete Project operation (`DELETE /delete/{projectId}`). It fails before any request unless the Confirm Delete switch is on, and the switch starts off.
- Add the Clip Model field (`clipModel`, `clip_v1` or `clip_v2`) to Create Clips From Long Video. Model v2 is charged at 1.25 times the Model v1 rate.
- Add Dropbox (13) and Instagram (14) to the Video Source list.
- Keep every existing parameter with the same name and type in versions 1 and 2, so saved workflows keep working.

## 1.1.0 - 2026-11-06

- Add a video list and a social account list in version 2 of the node: Final Video and Social Account become searchable Resource Locators, with a By ID mode. The social operations ask for the Project ID that feeds the video list.
- Keep version 1 of the node unchanged, so saved workflows keep working; new nodes start in version 2.
- Move to @n8n/node-cli 0.55.5, fix the node category to Marketing & Content, raise n8n-workflow to ^2.46.5 and add the funding link.
- Publish through `npm stage publish` with provenance, approved by the owner in the npm Staged Packages tab.

## 1.0.0 - 2026-07-20

- Add guided short-video editing with subtitles, headlines, B-roll, emojis, templates, and silence removal.
- Add long-video clipping and project output retrieval.
- Add AI social caption generation, connected-account retrieval, and video publishing.
- Add Vizard API credential test, AI Agent tool support, and application-level error handling.

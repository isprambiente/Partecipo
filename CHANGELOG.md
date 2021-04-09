# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]
### Added
- Add tickets frequency: in the fact model you can select how often a ticket is bookable 
- Now you can reserve a ticket from the happening list page
- Now you can make many happening at same time
- top menu unified for entire site
- css colors configurable with settings.yml
- devise_lsap_authenticable preconfigured for easy switch
- devise module configured with settings.yml
### changed
- Move to ruby-3.0.0
- Rewrited facts list: less code, more simplicity
- Migrated from turbolinks to hotwire turbo

## [1.0.4] - 2020-09-24
### Changed
- Bump rails from 6.0.3.2 to 6.0.3.3
- Bump Devise from 4.7.2 to 4.7.3

## [1.0.3] - 2020-06-25
### Changed
- Bump rails from 6.0.3.1 to 6.0.3.2 (fix CVE-2020-8185)
- Bump rack from 2.2.2 to 2.2.3
- Bump bulma to 9.0

## [1.0.2] - 2020-06-12
### Added
- new documentation for model, controller, helper
### Changed
- Refactoring from rubocop
- Fix link in editor bar to user view
- Fix link in admin bar to user view
- Fix link in admin bar to editor view
- Fix save on Happening update

## [1.0.1] - 2020-06-11
### Changed
- fix admin group
- fix show events new line
- update *devise* from 4.7.1 to 4.7.2
- update *ffi* from 1.13.0 to 1.13.1
- update *capistrano* from 3.14.0 to 3.14.1
- update *ast* from 2.4.0 to 2.4.1
- update *net-ssh* from 6.0.2 to 6.1.0

## [1.0.0] - 2020-06-09
First release
### Added
- Show events
- Show date
- reservation tickets
- Manage events by editor
- Manage dates by edito
- Manage tickets by editor
- Admin User
- Afmin group

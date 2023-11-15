# SAP CDS Language Support
This Visual Studio Code extension features language support for the core data services (CDS) language as used in the SAP Cloud Application Programming Model (CAP).<br />

## Features
- syntax highlighting

- source code validation

- quick fixes to
    - create using statement for unknown artifacts
    - maintain missing translation
    - convert @cds.doc and @description annotations to doc comments

- where-used navigation to
    - definition
    - references
    - highlight occurrences

- inventory (symbols) for
    - current file
    - workspace incl. query capabilities to select e.g. artifact types, names, also include reuse models

- code completion for
    - keywords
    - identifiers
    - using paths and artifacts incl. showing README.md documentation as details
    - i18n translation IDs
    - turn on/off formatting regions

- snippets for typical CDS language constructs<br/> (with documentation extracts of [capire](https://cap.cloud.sap/docs/cds/cdl) explaining language concepts)<br/> like
    - namespace and context
    - using
    - service
    - type
    - entity and projections, ...
    - element, associations and compositions
    - extend and annotate
    - annotations for documentation

- hover information based on
    - doc comments
    - @title, @description and ~~@cds.doc~~ (deprecated) annotations
    - translations

- code formatting
    - whole document
    - selected range
    - on-the-fly when completing statements via ```;``` or ```}```
    - on save (depending on the IDE)
    - on paste (depending on the IDE)
    - with many options, configurable via
        - settings file
        - command-line switches
        - Config UI with simulation of options for Visual Studio Code and Eclipse
        - JSON schema for textual support
    - also for markdown in doc comments

- translation support
    - properties, JSON and CSV files
    - navigate to translation definitions from translation IDs like ```'{i18n>customerName}'```
    - show translations on hover
    - quickfix to maintain missing translations

- plugin framework for external handlers of annotation domains


## CAP for SAP Busines Technology Platform

CAP for SAP Busines Technology Platform helps you implement data models, services, and UIs to develop your own stand-alone applications or extend other cloud solutions, like SAP S/4HANA or SAP SuccessFactors. The programming model includes languages, libraries, and APIs and focuses on back-end development.

See the [documentation](https://cap.cloud.sap/docs/cds/) for more details.

## How to Obtain Support

In case you find a bug, please report an [incident](https://cap.cloud.sap/docs/resources/#reporting-incidents) on SAP Support Portal.

## License

This plug-in is provided under the terms of the [SAP Developer License Agreement](https://tools.hana.ondemand.com/developer-license-3_1.txt).

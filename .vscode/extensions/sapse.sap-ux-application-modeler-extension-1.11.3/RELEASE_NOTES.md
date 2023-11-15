
# SAP Fiori tools Release Notes

October 18, 2023

Version of extensions in this release: 1.11.3

Latest version of NPM modules:
- [@sap/generator-fiori](https://www.npmjs.com/package/@sap/generator-fiori) 1.11.3
- [@sap/ux-specification](https://www.npmjs.com/package/@sap/ux-specification) 1.108.17
- [@sap/ux-ui5-tooling](https://www.npmjs.com/package/@sap/ux-ui5-tooling) 1.11.3
- [@sap/ux-cds-odata-language-server-extension](https://www.npmjs.com/package/@sap/ux-cds-odata-language-server-extension) 1.11.3

---

**Note**: For SAP Fiori tools the required [NodeJS](https://nodejs.org/en/download) version is updated to 18.14.2 or higher

---

## Release Highlights

### Added
* Application Modeler
  - Enabled adding and maintaining filter fields based on associated properties
  - Added an enhanced visualization of error situations to the Page Map and Page Editor

### Changed
* Guided Development
  - Updated CAP CDS guide variants to automatically select the `Service` parameter if there is only one service available for the project
* Application Generator
  - Updated the generator to automatically select the default value in a dropdown list of options if only one option is available, thereby decreasing the number of clicks the user needs to perform
  - The generator should now warn the user if Node.js is not installed before use
  - Updated the manifest for OData V4 services using UI5 version 1.94 or higher to now use the `contextPath` instead of `entitySet`.

### Fixed
* Guided Development
  - Fixed an issue in the ABAP CDS variant of the _Add and edit table columns_ guide where the `Entity Type` parameter was missing
* Application Modeler
  - Fixed an issue with the warning indicator missing in the application modeler tree view
  - Fixed an issue with dropdown boxes auto-selecting the wrong entry
  - Fixed an issue with extensions being allowed to be anchored on itself on creation
  - Fixed several issues with navigation to source code when working with building blocks (experimental)
  - Fixed an issue with a missing key property for action group building blocks (experimental)
  - Fixed an issue with an incorrect tab key being written to manifest when setting the tab key to empty in the Page Editor property panel
  - Fixed an issue with the Page Map being able to add pages for the same navigation property multiple times
  - Fixed an issue with the Page Editor losing selection focus when refreshing on manual external changes in the source file
  - Fixed an issue with scrolling via touch screen in the Page Editor property panel
  - Fixed several minor UX issues in dropdown boxes 
* Application Generator
  - The SAP Fiori launchpad configuration wizard no longer writes out the value `{{flpSubtitle}}` in the launchpad if the optional subtitle for the SAP Fiori launchpad is not provided

## Change Log History
- [SAP Fiori Tools - Application Modeler](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-application-modeler-extension/changelog)
- [SAP Fiori Tools - Guided Development](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-help-extension/changelog)
- [SAP Fiori Tools - XML Annotation Language Server](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-annotation-modeler-extension/changelog)
- [SAP Fiori Tools - Service Modeler](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-service-modeler-extension/changelog)

## Related Extensions and Modules
- [UI5 Language Assistant](https://marketplace.visualstudio.com/items?itemName=SAPOSS.vscode-ui5-language-assistant)
- [Guided Answers extension by SAP](https://marketplace.visualstudio.com/items?itemName=SAPOSS.sap-guided-answers-extension)

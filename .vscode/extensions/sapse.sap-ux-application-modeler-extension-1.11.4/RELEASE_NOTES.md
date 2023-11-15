
# SAP Fiori tools Release Notes

November 1, 2023

Version of extensions in this release: 1.11.4

Latest version of NPM modules:
- [@sap/generator-fiori](https://www.npmjs.com/package/@sap/generator-fiori) 1.11.4
- [@sap/ux-specification](https://www.npmjs.com/package/@sap/ux-specification) 1.108.18
- [@sap/ux-ui5-tooling](https://www.npmjs.com/package/@sap/ux-ui5-tooling) 1.11.4
- [@sap/ux-cds-odata-language-server-extension](https://www.npmjs.com/package/@sap/ux-cds-odata-language-server-extension) 1.11.4

---

**Note**: For SAP Fiori tools the required [NodeJS](https://nodejs.org/en/download) version is updated to 18.14.2 or higher

---

## Release Highlights

### Added
* Application Modeler
  - Added an information panel to the activity bar item of SAP Fiori tools
* Application Generator
  - Choosing to automatically add table columns to a list page during the generation of an SAP Fiori elements List Report or Worklist application with a CAP data source will now also add basic value helps
* Guided Development
  - Introduced a new warning page for projects with virtual file system errors

### Changed
* Application Generator
  - The ABAP `deploy-test` function has been updated to also validate that the defined package name and transport request are available in the back-end ABAP system
  - Updated the error message for ABAP deployment when a long text message is displayed
  - The console information logged during generation now includes the time taken to generate the application
* Guided Development
  - Updated overview page guides to automatically select the `Model` parameter if there is only one option available for the project
  - Updated chart guides to only display `Dynamic Measures` or `Measures` parameter properties that can be used to successfully create charts for a given project
* Application Modeler
  - Enhanced the validation check for the creation of OData V2-based custom columns ensuring that an existing fragment is reused for further columns
  - Enhanced the performance for the application modeler tree view: in the case of multiple apps in the project, a lazy load mechanism prevents the generation of all page configurations and schemas right from the start

### Fixed
* Application Modeler
  - Fixed an issue with selected item focus in dropdown menus
  - Fixed an issue with touch events outside the menu not closing the dropdown
  - Fixed an issue with error messages shown on Page Map not disappearing after correcting the root cause
  - Fixed an issue with an empty string being considered invalid for `ValueListForValidation` annotation preventing the creation of new pages in the Page Map
  - Fixed an issue with the filter icon becoming invisible when resizing the Page Map
  - Fixed an issue with the Add Custom Column dialog that offered to select existing functions for a newly created handler file
  - Fixed an issue with reuse libraries being wrongly offered for run configurations
  - Fixed an issue with sections being displayed in selection dialogs for anchors showing the i18n key instead of the text
  - Fixed an issue with SAPUI5 flexibility changes created for contact person details on object page subsections of OData V2-based applications
* Application Generator
  - Fixed an issue where building an MTA archive in SAP Business Application Studio would fail in some cases when it contained an SAP Fiori application
  - Fixed an issue where deployment configuration could allow input of an invalid Cloud Foundry destination name
  - Fixed an issue where the manifest id created during generation in the manifest file could be longer than permitted
* Guided Development
  - Fixed an issue with the code snippet inserted from the _Add a stack card to an overview page_ guide that used an incorrect variable type, causing an error
  - Fixed an issue where the guided development window would not scroll up to display inline errors
  - Fixed an issue in the _Add a new visual filter_ guide where selected properties were not displayed in the guide code snippet
  - Fixed an issue in the _Add a table card to an overview page_ guide where the `Entity Type` parameter selected in earlier steps was not retained across all guide steps

## Change Log History
- [SAP Fiori Tools - Application Modeler](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-application-modeler-extension/changelog)
- [SAP Fiori Tools - Guided Development](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-help-extension/changelog)
- [SAP Fiori Tools - XML Annotation Language Server](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-annotation-modeler-extension/changelog)
- [SAP Fiori Tools - Service Modeler](https://marketplace.visualstudio.com/items/SAPSE.sap-ux-service-modeler-extension/changelog)

## Related Extensions and Modules
- [UI5 Language Assistant](https://marketplace.visualstudio.com/items?itemName=SAPOSS.vscode-ui5-language-assistant)
- [Guided Answers extension by SAP](https://marketplace.visualstudio.com/items?itemName=SAPOSS.sap-guided-answers-extension)

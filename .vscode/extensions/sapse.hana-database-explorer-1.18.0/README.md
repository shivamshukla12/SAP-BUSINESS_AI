# SAP HANA Database Explorer for Visual Studio Code

This extension provides functionality for accessing SAP HANA databases, browsing the database catalog, and executing SQL from a [SQL console](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-developer-guide-for-cloud-foundry-multitarget-applications-sap-business-app-studio/use-sql-console-for-sap-hana-to-query-database). Since this extension does not offer the full feature scope of the SAP HANA Database Explorer in the Cloud, links for opening the SAP HANA Database Explorer are provided where appropriate to easily access additional features.

## Prerequisites

To use this extension you need a licensed version or a trial version of SAP HANA Cloud. An SAP HANA Cloud license also allows a user to access the SAP HANA Database Explorer to connect to the SAP HANA Cloud instance.

The [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) is required for accessing the list of databases from SAP HANA Database Explorer on the SAP Business Technology Platform (BTP).

To simplify the connection to Cloud Foundry it is recommended to install the [Cloud Foundry Tools extension](https://github.com/SAP/cloud-foundry-tools). If the extension is installed, the login to Cloud Foundry will be triggered automatically. If the extension is not installed, please make sure you are logged in to Cloud Foundry via the Cloud Foundry CLI.

If you want to manage database connection credentials in the [SAP HANA User Store](https://help.sap.com/viewer/f1b440ded6144a54ada97ff95dac7adf/latest/en-US/708e5fe0e44a4764a1b6b5ea549b88f4.html) you have to [download](https://tools.hana.ondemand.com/#hanatools) and install an SAP HANA client package that contains the SAP HANA User Store executable (hdbuserstore).

## Configuration

There are several ways to configure which SAP HANA Database Explorer SAP BTP URL will be opened:
 * Set the environment variable `HRTT_URL` to a valid SAP HANA Database Explorer URL.
 * If the Cloud Foundry CLI is installed it is used to check for the current Cloud Foundry API URL which is used to construct an SAP HANA Database Explorer URL if possible.
 * This extension adds the preferences section "SAP HANA Database Explorer". In that section, the URL to the SAP HANA Database Explorer can be specified. If set, this URL will be used to open the SAP HANA Database Explorer.

If you do not need to access the database connections from SAP HANA Database Explorer on SAP BTP, you can disable it in the "SAP HANA Database Explorer" extension settings.

You can configure the maximum number of result rows returned by the SQL console as well as the maximum number of kilobytes fetched for large objects (LOBs) in the "SAP HANA Database Explorer" extension settings.

## Usage

The SAP HANA Database Explorer extension offers the following types of connection:
 * Local connections
 * SAP HANA Database Explorer connections

The list of database connections can be filtered by name via a database filter that can be set via the "filter" icon in the database list title bar or the "Select Database" command in the Command Palette.

### Local Connections

> **Note!**   
    Uninstalling the extension does not remove local connections from the vscode secret store. Local connections can be recovered from the secret store if an extension with the same ID is installed at a later point in time. To prevent the recovery of local connections, delete the local connections before uninstalling the extension.

Local connections can be added to a Visual Studio Code installation by specifying the connection data (host, port, user name, password) as well as connection options. Local connections use the SAP HANA database client to directly connect to the database. Local connections can be added in the following variants:

 * **SAP HANA Cloud**

     For connections to an SAP HANA Cloud instance on the SAP BTP. The database connection wizard shows the relevant connection details for SAP HANA Cloud prefilled with the default values where applicable.
 * **SAP HANA**

     For connections to an SAP HANA instance on-premise. The database connection wizard shows the relevant connection details for SAP HANA prefilled with the default values where applicable.
 * **SAP HANA User Store**

     For connections to an SAP HANA or SAP HANA Cloud instance whose database connection credentials are stored in the SAP HANA User Store.

<!--
#### SAP HANA Cloud connections

SAP HANA Cloud connections are intended for connecting to an SAP HANA Cloud instance on the SAP BTP. The database connection wizard shows the relevant connection details for SAP HANA Cloud prefilled with the default values where applicable.

#### SAP HANA connections

SAP HANA connections are intended for connecting to an SAP HANA instance on-premises. The database connection wizard shows the relevant connection details for SAP HANA prefilled with the default values where applicable.
-->

#### SAP HANA User Store Connections

SAP HANA User Store connections are intended for connecting to an SAP HANA Cloud or SAP HANA instance whose database connection credentials are stored in the SAP HANA User Store. The database connection Wizard allows you to select an SAP HANA User Store key and displays the information retrieved from the SAP HANA User Store. Options such as encryption or advanced settings can be specified for each connection.

> **Note!**   
    The information in the SAP HANA User Store cannot be changed with this extension. If a change is required to the credentials stored in the SAP HANA User Store, the change must be performed in the SAP HANA User Store itself, for example, using the appropriate SAP HANA User Store command.

To add a new database connection to Visual Studio Code which uses credentials stored in the SAP HANA User Store, perform the following steps:

1. Add a new database connection

    In the views pane on the left-hand side of Visual Studio Code, choose **SAP HANA Database Explorer** to display a list of connections to local and SAP HANA databases, and in the **DATABASE LIST** pane, choose **[\+]** (*Add database connection*) to display the **Add an SAP HANA Database** dialog.
2. Specify the type of SAP HANA database that you want to add.

    In the drop-down list of options displayed in the **Database Type** field, choose **SAP HANA User Store**.

    > **Note!**  
    The **SAP HANA User Store** option is only displayed if an SAP HANA User Store has been installed and the corresponding executable (*hdbuserstore*) can be found in the expected location in the local environment.
3. Select a database key from the SAP HANA User Store.

    The names of all the database keys stored in the SAP HANA User Store are displayed in a drop-down list. Choose the key required to connect to the specified SAP HANA database.

    > **Tip!**  
    Non-sensitive details of the connection credentials are displayed (read-only) in the appropriate fields, for example: the database name, host, connection port, etc.
4. Configure any additional or advanced options as required.

    For example, you can specify a **Display Name** that is used to identify the new database connection in the **DATABASE LIST** displayed in the SAP HANA Database Explorer.
5. Add the new database to your list of connections.

    Choose **Add Database** to add the new connection to the **Local Connections** node in the **DATABASE LIST**.

    > **Tip!**  
    If you want the **DATABASE LIST** to display only local connections, you can hide the SAP HANA databases displayed in the SAP HANA database explorer by changing the default setting for **Show Database Explorer Connections** in user preferences, for example: **File \> Preferences \> Settings**. 
6. Connect an SQL console to the database specified in the new SAP HANA User Store connection.

    In the **DATABASE LIST** pane, locate the database that you want to explore, and choose **[\>]** (*Open SQL Console*).

    > **Note!**  
    In the SQL console, the database type is shown as **SAP HANA USER STORE**.

### SAP HANA Database Explorer Connections

The SAP HANA Database Explorer extension can access the connections maintained in the SAP HANA Database Explorer on SAP BTP. This enables the reuse of connection data already entered in the Cloud; it is not necessary to enter the data again in the Visual Studio Code extension.

To access the SAP HANA Database Explorer on SAP BTP, an authentication token is required. This extension uses the Cloud Foundry OAuth token from the current machine. For this reason, a prerequisite for using SAP HANA Database Explorer connections is that the Cloud Foundry CLI must already be installed and you must be logged in to the SAP BTP region where the SAP HANA Database Explorer connections are maintained. If the Cloud Foundry CLI is not installed or the OAuth token is missing or invalid, the SAP HANA Database Connections will not be available.

### Catalog Browser

The catalog browser shows database objects for a particular database connection. To see the database objects, expand the "Catalog" folder of a database connection and select a database object type ("Tables", "Views", etc.) After selecting the database object type the catalog browser will load the list of object of that type that are accessible to the current user.

By default the list of database objects is filtered by the current connection's default schema. To see objects from other schemas the schema filter can be adjusted via the "filter" icon in the catalog browser title bar or the "Apply filter" command in the Command Palette.

The list of database objects can be filtered by object via the standard Visual Studio Code [document tree filtering](https://code.visualstudio.com/docs/getstarted/userinterface#_filtering-the-document-tree) functionality or via a database-level filter that can be set via the "filter" icon in the catalog browser title bar.

For more information about the catalog browser please refer to the [SAP HANA Cloud, SAP HANA Database Developer Guide](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-developer-guide-for-cloud-foundry-multitarget-applications-sap-business-app-studio/view-database-objects-with-database-explorer).

#### Database Object Operations

A context menu provides access to operations on individual database objects (not all operations may be available for all objects).
- **Open**: graphically show database metadata information about the selected database object. The exact information shown depends on the type of database object. A left click on a database object will open the same view.
- **Open Data**: generate a SELECT or CALL statement, open it in a new SQL console tab, and execute it to show the data of the database object. This operation is only available on objects that are selectable or callable.
- **Copy Name**: copy the object name of the database object to the clipboard.
- **Copy Full Name**: copy the full name (schema name + object name) of the database object to the clipboard. If the object is a global object without a schema only the object name is copied.
- **Generate CREATE Statement**: generate a CREATE statement for the object and open it in a new SQL console. This operation is only available on schema-local objects.
- **Copy CREATE Statement**: generate a CREATE statement for the object and copy it to the clipboard. This operation is only available on schema-local objects.
- **Generate SELECT Statement**: generate a SELECT or CALL statement for the object and open it in a new SQL console. This operation is only available on objects that are selectable or callable.
- **Open Dependency Viewer**: opens the database object dependency viewer for the selected object. The dependency viewer visualizes all incoming and outgoind object dependencies of the selected object, including transitive dependencies.

### Dependency Viewer

The dependency viewer can visualize database object dependencies across the entire object hierarchy. It can be started either on a database connection in the database connection list or a database object in the catalog browser.

If the dependency viewer is started on a database connection the canvas will be blank initially. You can select an object to visualize by choosing an object in the "Select Object" menu at the top of the canvas.

If the dependency viewer is started on an object in the catalog browser, the canvas will directly visualize the selected object's dependencies.

## Known limitations

### Editor Tabs
When Visual Studio Code is closed with an open SAP HANA SQL Console tab that contains unsaved changes, and the `Hot Exit` setting of Visual Studio Code is set to `onExit`, it is possible that an additional text editor tab will open when Visual Studio Code is restarted.
This is caused by issues in Visual Studio Code [issue1](https://github.com/microsoft/vscode/issues/150257) [issue2](https://github.com/microsoft/vscode/issues/171512).
As a workaround we recommend disabling the `Hot Exit` setting and / or closing any open SAP HANA SQL Console tabs before closing Visual Studio Code.

### Database Connections
The SAP HANA client used by default for local database connections is platform-dependent. On platforms not supported by the SAP HANA client an alternative HANA client is used. However, this client does not support SAP HANA User Store connections which is why SAP HANA User Store connections are not available on these platforms.

## Support

If you would like to report an issue or suggest an improvement, please open a support ticket via the [SAP Support Portal](https://support.sap.com/).

## Usage Tracking

The tool collects non-personally identifiable information about your usage of the tool to improve its services. If you do not want the tool to collect any usage data, you can set the **Enable Sap Web Analytics** option in **User Preferences** to "false". Go to **File > Preferences** (macOS: **Code > Preferences**) **> Settings > Extensions > SAP HANA Database Explorer**, and deselect the **Enable Sap Web Analytics** checkbox.

## License

This extension is provided under the terms of the [SAP Developer License Agreement](https://tools.hana.ondemand.com/developer-license-3_1.txt).

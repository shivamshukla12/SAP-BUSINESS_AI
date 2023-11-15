# Tutorial 2 - Get answers to yout SAP Fiori elements and SAP Fiori tools How-to questions
- In this tutorial, you will experience the new capabilities of SAP Fiori tools powered by AI, to ***query any SAP Fiori elements topic*** ranging from beginner to advanced level, and be provided with the relevant answers to enhance your developer journey.
- You will also experience how easy it is to ***ask any SAP Fiori tools questions*** and be provided documentation on how you can use our tooling to fit your needs.
- Please note that this feature shows you how [Embeddings](https://platform.openai.com/docs/guides/embeddings) based search create with [SAP Fiori tools Help portal docs](https://help.sap.com/docs/SAP_FIORI_tools) and [SAP Fiori elements Help portal documents](https://ui5.sap.com/#/topic/03265b0408e2432c9571d6b3feb6b1fd), can help you find answers to your questions, provide examples, etc from one source of truth.
- You will also notice that the chat responses are integrated with SAP Fiori tools commands. 


## Use Case
You are ***developer*** who is developing SAP Fiori elements application and would like to know how to add certain features in a SAP Fiori elements application or via SAP Fiori tools.

You are a ***functional consultant*** who is answering questions from customers on whether certain requirement can be supported via SAP Fiori elements framework.

## Steps
Please follow the steps to complete this tutorial.

### Set up SAP AI Core for LLM Access
- Please follow the instructions [here](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core) to onboard on LLM access service with SAP AI Core.
- For any issues, please contact SAP AI Core team using component ***CA-ML-AIC***

### Open SAP Fiori tools AI Chat Interface
- From the `Activity Bar`, select the `SAP Fiori tools AI` icon OR press `Ctrl+Shift+P` and select `SAP Fiori tools AI: Open Chat Interface`
- Type `Hi` and hit Enter

### Ask questions regarding SAP Fiori tools - Part 1
- Lets ask a realistic customer question posted here: https://answers.sap.com/questions/13453475/edit-ui-annotations-xml-in-vscode-vs-abap-cds-ui-a.html
- In chat interface type the following question and Hit Enter
`How to refresh backend service metadata and annotation files in VSCode Fiori Tools?`
- Notice that we are used the phrase `Fiori tools` in our prompt to enable embeddings based search with SAP Fiori tools help portal doc as the source.
- Notice the highlighted texts like `Service Manager`. Upon clicking, it will open SAP Fiori tools Service Manager.

### Ask questions regarding SAP Fiori tools - Part 2
- Lets ask another realistic customer question posted here: https://answers.sap.com/questions/13983220/what-is-the-best-possible-way-to-add-a-custom-dial.html
- In the chat interface type the following question and Hit Enter
`What is the best possible way to add a custom dialog with Fiori tools in Object Page footer?`
- See the response and the steps are mentioned which includes using SAP Fiori tools Page Editor.


### Ask questions regarding SAP Fiori elements
- Now, lets ask a question related to SAP Fiori elements as posted here: https://answers.sap.com/questions/13993160/fiori-intent-based-navigation.html
- In chat interface type the following question and Hit Enter
`We want to pass Document Number, Company Code, Fiscal Year values from list report application page to selection screen of fiori tile (created for Custom ABAP Program transaction) with intent based navigation. How can I do it using Fiori elements?`
- Notice that we are used the phrase `Fiori elements` in our prompt to enable embeddings based search with SAP Fiori elements help portal doc as the source.


### Play around
- At this point you have few examples on what problems can be solved using this AI powered feature of SAP Fiori tools. PLease feel free to play around and ask your questions.
- Answering these questions may increase the efficiency of the developers and consultants.

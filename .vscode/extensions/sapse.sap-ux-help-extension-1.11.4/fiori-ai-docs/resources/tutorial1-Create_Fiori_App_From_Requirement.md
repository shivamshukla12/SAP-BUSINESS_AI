# Tutorial 1 - Create SAP Fiori Application from Business Requirements
In this tutorial, you will experience the new capabilities of SAP Fiori tools powered by AI, to create SAP Fiori Elements applications directly from  Business Requirements.

## Use Case
You are a ***Functional Consultant*** who is responsible for gathering Business Requirements from customers and documenting the use case and detailed requirements before SAP Fiori developers (or development partners) do the development work.

As a functional consultant, when I am talking with customers and partners, I would like to have ability to do ***Real-time Demos***, ***Rapid Validation***, ***Quick Iterations***, setting ***Clear Expectations*** and ***Enhanced Collaboration*** with customers and partners. This will help me with efficient requirement gathering and refinement, giving me a competitive advantage as a consultant who can rapidly turn concepts into reality.

## Steps
Please follow the steps to complete this tutorial.

### Set up SAP AI Core for LLM Access
- Please follow the instructions [here](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core) to onboard on LLM access service with SAP AI Core.
- For any issues, please contact SAP AI Core team using component ***CA-ML-AIC***

### Open SAP Fiori tools AI Chat Interface
- From the `Activity Bar`, select the `SAP Fiori tools AI` icon OR press `Ctrl+Shift+P` and select `SAP Fiori tools AI: Focus on Chat View`
- Type `Hi` and hit Enter

### Understand the sample Business Requirement 
- In the role of a functional consultant, your responsibility entails delivering comprehensive details to development teams while concurrently engaging in iterative discussions with the customer to ensure precise capture of their requirements.
- In this tutorial, we will use a sample Business Requirement document to create a SAP Fiori Elements application. Please go throught the sample Business Requirement [here](./tutorial1-BusinessRequirement.md)
- Once you have gone through Business Requirement, please ***copy the entire content*** of the Business Requirement to your clipboard. 

### Generate SAP Fiori elemenets application
- Now, please go back to the SAP Fiori tools AI Chat Interface and ***lets create a brand new SAP Fiori Elements application*** from the Business Requirement. Rememeber, at this point, you are not required to write any code or do any development work. You are also not required to know the details of which SAP Fiori elements floorplan suits the scenario most. ***SAP Fiori tools AI will do all the work for you***.
- In the chat interface, paste the copied Business Requirement and hit Enter
- At this point, SAP Fiori tools AI will utitlize the AI algorithm and create appropriate CAP models, service definitions, annotations and test data. This will take a few minutes to complete.
- You should see a success message `The CAP project data models have been created and they can be reviewed in the Chat Project Explorer. If it looks good, then respond with Generate SAP Fiori application and I can generate the project using SAP Fiori tools.`
- Please respond with `Generate SAP Fiori application` and hit Enter.
- At this point, SAP Fiori tools AI will create a SAP Fiori Elements application using the CAP models created in the previous step. The generated SAP Fiori elements applications will be launched and you should be able to preview your application in the browser.



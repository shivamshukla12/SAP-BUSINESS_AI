I want to create a CAP application that satisfies the requirements from the following user story.

# Description
​
As a contract manager or administrator,
I want to create and manage contracts and customer information in the system,
So that I can effectively track and handle legal agreements and customer interactions.
​
# Customer Description
​
**Contract**: A Contract involves defining a structured representation of a legal agreement or arrangement between two or more parties. Contracts can cover a wide range of agreements, such as sales contracts, service agreements, employment contracts, and more. Common attributes of a contract might include:
1. Contract ID: A unique identifier for the contract.
2. Customer: Information about the customer involved
3. Contract Type: The type of contract (e.g., sales, service, employment).
4. Start Date: The date on which the contract becomes valid.
5. End Date Date: The date on which the contract expires (if applicable).
6. Status: The current status of the contract (draft, active, expired, terminated, etc.).
​
**Customer**: A customer is an individual, organization, or entity that purchases goods, products, or services from another party, typically a business or seller. A typical customer has the following attributes:
1. Name
2. Identification Number
3. Address
4. Contact Information
​
**Identfication Number**: A unique identification number for a customer is a distinct and non-repeating numerical value assigned to each customer record within a database or information system. This number serves as a primary key or identifier that uniquely distinguishes one customer from another.
​
**Name**: a "Name" typically refers to a person's or entity's given name or label by which they are addressed or identified.
​
**Address**: An "address" typically refers to a physical location where an individual, business, or entity is situated or can be reached. 
​
# Acceptance Criteria
​
## Scenario 1: List All Contracts
Given I am logged into the contract management system,
When I launch the SAP Fiori application to maintain contracts,
Then I should be able to view the list of all the contracts in a list.
The list of all the contracts should have : Contract ID, Customer, Contract Type and Start Date
​
## Scenario 2: View Contract Details
Given I am logged into the contract management system,
When I select a specific contract from the list of SAP Fiori application,
Then I should be able to view the contract details.
The contract details will be:
| Field Name    | Tab in app    | Section or Field Group |
|---------------|---------------|------------------------|
| ContractID    | Contract Data | Contract Details       |
| Customer      | Contract Data | Contract Details       |
| Contract Type | Contract Data | Contract Details       |
| Status        | Contract Data | Contract Details       |
| Start Date    | Dates         | Contract Dates         |
| End Date      | Dates         | Contract Dates         |
​
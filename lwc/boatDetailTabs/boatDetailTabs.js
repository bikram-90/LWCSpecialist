import { LightningElement, api, wire } from 'lwc';

import {
    APPLICATION_SCOPE,
    subscribe,
    MessageContext
} from 'lightning/messageService';

import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Custom Labels Imports
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

// Boat__c Schema Imports
import BOAT_OBJECT from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import BOAT_TYPE from '@salesforce/schema/Boat__c.BoatType__c';
import BOAT_LENGTH from '@salesforce/schema/Boat__c.Length__c';
import BOAT_PRICE from '@salesforce/schema/Boat__c.Price__c';
import BOAT_DESCRIPTION from '@salesforce/schema/Boat__c.Description__c';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
const ICON_UTILITY_ANCHOR = 'utility:anchor';


export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    subscription = null;
    @api
    boatId;

    boatObject = BOAT_OBJECT;
    type = BOAT_TYPE;
    length = BOAT_LENGTH;
    price = BOAT_PRICE;
    description = BOAT_DESCRIPTION;

    reviewsTab = 'reviews';
    add_reviewTab = 'add-review';
    detailsTab = 'details';

    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wiredRecord;

    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };

    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return (this.wiredRecord.data != undefined) ? ICON_UTILITY_ANCHOR : null;
    }

    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }

    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        // recordId is populated on Record Pages, and this component
        // should not update when this component is on a record page.
        if (this.subscription || this.recordId) {
            return;
        }
        // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
        this.subscribeMC();


    }

    subscribeMC() {
        this.subscription = subscribe(
            this.messageContext, BOATMC, (message) => {
                this.boatId = message.recordId
            }, {
            scope: APPLICATION_SCOPE
        });
    }

    // Navigates to record page
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                actionName: 'view'
            }
        });
    }

    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() {
        this.template.querySelector('lightning-tabset').activeTabValue = this.reviewsTab;
        this.template.querySelector('c-boat-reviews').refresh();
    }
}
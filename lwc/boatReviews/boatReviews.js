import { LightningElement, api } from 'lwc';

import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatReviews extends NavigationMixin(LightningElement) {

    boatId;
    error;
    boatReviews;
    isLoading;

    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        this.boatId = value;
        this.getReviews();
    }

    // Getter to determine if there are reviews to display
    get reviewsToShow() {
        return (this.boatReviews != null && this.boatReviews != undefined) ? true : false;
    }

    // Public method to force a refresh of the reviews invoking getReviews
    @api refresh() {
        this.getReviews();
    }

    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
        if (this.boatId) {
            this.isLoading = true;
            getAllReviews({
                boatId: this.boatId
            })
                .then(result => {
                    this.boatReviews = result;
                    this.isLoading = false;
                })
                .catch(error => {
                    this.error = error;
                    this.isLoading = false;
                });
        }

    }

    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.dataset.recordId,
                actionName: 'view'
            }
        });
    }
}
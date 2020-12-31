import { LightningElement, track, wire } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

export default class BoatSearchForm extends LightningElement {

    // Private
    error = undefined;
    selectedBoatTypeId;

    //lightning-combobox variables START
    @track
    selectedBoatTypeId = '';

    // Needs explicit track due to nested data
    @track
    searchOptions = [];
    //lightning-combobox variables END

    // Wire a custom Apex method
    @wire(getBoatTypes)
    boatTypes({ error, data }) {
        if (data) {
            console.log('getBoatTypes result : ' + JSON.stringify(data));
            this.searchOptions.push({ label: 'All Types', value: '' });
            // this.searchOptions = data.map(type => {
            //     // TODO: complete the logic
            // });
            for (let option = 0; option < data.length; option++) {
                // this.searchOptions.push(
                //     {
                //         label: String(data[option].Name),
                //         value: String(data[option].Id)
                //     }
                // );
                /*
                    In LWC, generally it is not allowed to modify the existing memory location.
                    push() will modify existing memory location. 
                    This is how all modern libraries like Reactjs works.
                    So, you can create new memory location using spread syntax
                */
                this.searchOptions = [...this.searchOptions, {
                    label: String(data[option].Name),
                    value: String(data[option].Id)
                }];
            }
            console.log('searchOptions : ' + JSON.stringify(this.searchOptions));
            this.selectedBoatTypeId = this.searchOptions[0].value;
            //this.searchOptions.unshift({ label: 'All Types', value: '' });//avoid using unshift for better performance
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
            console.error(error);
            console.error(JSON.stringify(error));
        }
    }

    // Fires event that the search option has changed. lightning-combobox Change Event Handler
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        this.selectedBoatTypeId = event.detail.value;
        // Create the const searchEvent
        // searchEvent must be the new custom event search
        const searchEvent = new CustomEvent('search', {
            detail: {
                boatTypeId: this.selectedBoatTypeId
            }
        });

        // Dispatches the event.
        this.dispatchEvent(searchEvent);
    }
}
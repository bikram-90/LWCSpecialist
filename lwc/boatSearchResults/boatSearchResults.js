import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';


const LOADING_EVENTS = {
    true: new CustomEvent('loading'),
    false: new CustomEvent('doneloading')
};

const TABLE_COLUMNS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true }
];

const ERROR_TITLE = 'Error';
const SUCCESS_TITLE = 'Success';
const ERROR_VARIANT = 'error';
const SUCCESS_VARIANT = 'success';
const MESSAGE_SHIP_IT = 'Ship It!';
const DATATABLE_CMP = 'lightning-datatable';

export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = TABLE_COLUMNS;
    boatTypeId = '';
    boats;
    isLoading = false;

    @wire(MessageContext)
    messageContext;

    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats(result) {
        this.boats = result;
        this.notifyLoading(false);
    }

    @api
    searchBoats(boatTypeId) {
        this.boatTypeId = boatTypeId;
        this.notifyLoading(true);
    }

    @api
    async refresh() {
        this.notifyLoading(true);
        refreshApex(this.boats);
    }

    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    sendMessageService(boatId) {
        const message = { recordId: boatId };
        publish(this.messageContext, BOATMC, message);
    }

    handleSave(event) {
        const recordInputs = event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
        const promises = recordInputs.map(recordInput =>
            updateRecord(recordInput)
        );
        Promise.all(promises)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: SUCCESS_TITLE,
                        message: MESSAGE_SHIP_IT,
                        variant: SUCCESS_VARIANT
                    })
                );
                this.refresh();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: ERROR_TITLE,
                        message: error.body.message,
                        variant: ERROR_VARIANT
                    })
                );
            })
            .finally(() => {
                const table = this.template.querySelector(DATATABLE_CMP);
                table.draftValues = null;
            });
    }

    notifyLoading(isLoading) {
        this.isLoading = isLoading;
        if (this.isLoading) {
            this.dispatchEvent(new CustomEvent("loading"));
        } else {
            this.dispatchEvent(new CustomEvent("doneloading"));
        }
    }

    get hasBoatResults() {
        return this.boats && this.boats.data
            && this.boats.data.length > 0;
    }

}
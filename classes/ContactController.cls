public class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        /*return [
            SELECT FirstName, LastName, EMAIL
            FROM Contact
            WITH SECURITY_ENFORCED
            ORDER BY FirstName
        ];*/
        throw new AuraHandledException('Forced error');
    }
}
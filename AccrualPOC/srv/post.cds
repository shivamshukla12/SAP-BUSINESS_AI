using sp.sam as sp from '../db/schema';

service CatalogService 
//@(requires : 'authenticated-user') 
{
    entity PostDoc as projection on sp.PostDoc;
}
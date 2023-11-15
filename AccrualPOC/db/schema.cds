namespace sp.sam;

using {
    managed,
    cuid,
    User
} from '@sap/cds/common';

entity PostedAccuralsData : managed {
    CCode               : String;
    Plant               : String;
    CostObjectType      : String;
    CostObjectNo        : String;
    Period              : String;
    DocumentNo          : String;
    PostedAccuralAmount : Decimal(23, 2);
    PostingDate         : Date;
}

@cds.persistence.skip: true
entity PostDoc {
    AccountingDocument  : String;
    CCode               : String;
    FiscalYear          : String;
    Plant               : String;
    Period              : String;
    DocumentDate        : Date;
    PostingDate         : Date;
    ReversalReason      : String;
    ReversalPostingDate : Date;
    ReversalHeaderText  : String;
}

const SCHEMA = {
  nested: {
    onChainMetaData: {
      nested: {
        NFTMeta: {
          fields: {
            traits: {
              id: 1,
              rule: 'repeated',
              type: 'NatureCognitaUnit'
            }
          }
        },
        NatureCognitaUnit: {
          options: {
            PROP_1 : `{"en": "This piece of art created by the Nature Cognita unit at the SNI Experimental Zone #1. Digitally pollinated by itself"}`,
            PROP_2 : `{"en" : "This piece of art created by the Nature Cognita unit at the SNI Experimental Zone #1. Digitally pollinated by a human"}`
          },
          values: {
            PROP_1 : 0,
            PROP_2 : 1
          }
        }
      }
    }
  }
}

const SCHEMA_JSON = JSON.stringify(SCHEMA);

module.exports = {
  SCHEMA_JSON
}

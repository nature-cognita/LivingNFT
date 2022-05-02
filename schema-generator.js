const fs = require("fs");
const config = require('./config');

/**
 * Generate protobuf JSON schema
 */
function generateSchema() {
  // Empty schema
  let schema = {
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
              PROP_1 : `{"en": "Dead"}`,
              PROP_2 : `{"en" : "Alive"}`
            },
            values: {
              PROP_1 : 0,
              PROP_2 : 1
            }
          }
        }
      }
    }
  };

  fs.writeFileSync(`./${config.outputSchema}`, JSON.stringify(schema));
}

function main() {
  generateSchema();
}

main();
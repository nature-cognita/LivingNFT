const protobuf = require('protobufjs');

const TRAIT_TYPES = {
  Description: ['This piece of art is created by the Nature Cognita unit at the SNI Experimental Zone #1'],
  Digitally_pollinated_by: ['itself', 'a human']
}

const generateSchema = (traitTypes) => {
  const makeProtobufEnumValuesFromArray = (values) => {
    const obj = {options: {}, values: {}}
    values.forEach((value, index) => {
      const fieldName = `field${index + 1}`
      obj.options[fieldName] = `{"en":"${value}"}`
      obj.values[fieldName] = index
    })
    return obj
  }

  const onChainMetaData = new protobuf.Root().define('onChainMetaData')

  const NFTMeta = new protobuf.Type("NFTMeta")
    .add(new protobuf.Field("Description", 1, "Description", 'required'))
    .add(new protobuf.Field("Digitally_pollinated_by", 2, "Digitally_pollinated_by", 'required'))

  onChainMetaData.add(NFTMeta)

  for (const trait in traitTypes) {
    const {options, values} = makeProtobufEnumValuesFromArray(traitTypes[trait])
    onChainMetaData.add(new protobuf.Enum(trait, values, options))
  }

  const root = new protobuf.Root().add(onChainMetaData);

  return root
}

const schemaObject = generateSchema(TRAIT_TYPES)
const schema = JSON.stringify(schemaObject.toJSON())

module.exports = {
  schemaObject, schema
}

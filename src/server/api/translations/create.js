import TranslationSerializer from '../../serializers/translation_serializer'
import Translation from '../../models/translation'

const route = async (req, res, trx) => {

  const translation = await Translation.forge({
    language_id: req.body.language_id,
    label_id: req.body.label_id,
    user_id: req.user.get('id'),
    text: req.body.text
  }).save(null, {
    transacting: req.trx
  })

  await translation.load(['label','language','user'], {
    transacting: req.trx
  })

  res.status(200).json({
    data: TranslationSerializer(translation)
  })

}

export default route
